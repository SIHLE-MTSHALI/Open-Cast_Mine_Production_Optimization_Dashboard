"""
presence_service.py — Issue #92

Real-time user presence tracking and edit locking:
 - Track which users are viewing/editing which resources
 - Heartbeat-based presence (timeout after 30s)
 - Edit lock acquisition and release
 - Conflict detection for concurrent edits
 - WebSocket broadcast for presence changes
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class PresenceStatus(str, Enum):
    VIEWING = "viewing"
    EDITING = "editing"
    IDLE = "idle"


class LockStatus(str, Enum):
    AVAILABLE = "available"
    LOCKED = "locked"
    EXPIRED = "expired"


@dataclass
class UserPresence:
    user_id: str
    username: str
    resource_type: str  # schedule, site, block_model, report
    resource_id: str
    status: PresenceStatus
    last_heartbeat: datetime = field(default_factory=datetime.utcnow)
    cursor_position: Optional[Dict] = None  # For collaborative editing
    color: str = "#3b82f6"  # Unique user color


@dataclass
class EditLock:
    resource_type: str
    resource_id: str
    locked_by: str
    username: str
    acquired_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: datetime = field(default_factory=lambda: datetime.utcnow() + timedelta(minutes=5))
    auto_renew: bool = True


class PresenceService:
    """Manages real-time user presence and edit locking."""

    HEARTBEAT_TIMEOUT = timedelta(seconds=30)
    LOCK_DURATION = timedelta(minutes=5)
    USER_COLORS = [
        "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
        "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
    ]

    def __init__(self):
        self._presences: Dict[str, UserPresence] = {}  # key: user_id:resource_type:resource_id
        self._locks: Dict[str, EditLock] = {}  # key: resource_type:resource_id
        self._user_color_idx = 0

    def _presence_key(self, user_id: str, resource_type: str, resource_id: str) -> str:
        return f"{user_id}:{resource_type}:{resource_id}"

    def _lock_key(self, resource_type: str, resource_id: str) -> str:
        return f"{resource_type}:{resource_id}"

    def join(self, user_id: str, username: str, resource_type: str, resource_id: str) -> UserPresence:
        """User joins a resource (starts viewing)."""
        key = self._presence_key(user_id, resource_type, resource_id)
        color = self.USER_COLORS[self._user_color_idx % len(self.USER_COLORS)]
        self._user_color_idx += 1

        presence = UserPresence(
            user_id=user_id, username=username,
            resource_type=resource_type, resource_id=resource_id,
            status=PresenceStatus.VIEWING, color=color,
        )
        self._presences[key] = presence
        logger.info(f"User {username} joined {resource_type}/{resource_id}")
        return presence

    def leave(self, user_id: str, resource_type: str, resource_id: str):
        """User leaves a resource."""
        key = self._presence_key(user_id, resource_type, resource_id)
        self._presences.pop(key, None)
        # Release any locks held
        lock_key = self._lock_key(resource_type, resource_id)
        lock = self._locks.get(lock_key)
        if lock and lock.locked_by == user_id:
            self._locks.pop(lock_key)

    def heartbeat(self, user_id: str, resource_type: str, resource_id: str,
                  cursor_position: Dict = None) -> Optional[UserPresence]:
        """Update heartbeat for a user presence."""
        key = self._presence_key(user_id, resource_type, resource_id)
        presence = self._presences.get(key)
        if presence:
            presence.last_heartbeat = datetime.utcnow()
            if cursor_position:
                presence.cursor_position = cursor_position
        return presence

    def get_resource_presences(self, resource_type: str, resource_id: str) -> List[UserPresence]:
        """Get all active presences for a resource."""
        self._cleanup_expired()
        prefix = f":{resource_type}:{resource_id}"
        return [p for k, p in self._presences.items() if k.endswith(prefix)]

    def acquire_lock(self, user_id: str, username: str,
                     resource_type: str, resource_id: str) -> Optional[EditLock]:
        """Try to acquire an edit lock."""
        lock_key = self._lock_key(resource_type, resource_id)
        existing = self._locks.get(lock_key)

        if existing:
            if existing.locked_by == user_id:
                # Renew own lock
                existing.expires_at = datetime.utcnow() + self.LOCK_DURATION
                return existing
            if existing.expires_at > datetime.utcnow():
                return None  # Locked by someone else
            # Expired — can take over

        lock = EditLock(
            resource_type=resource_type, resource_id=resource_id,
            locked_by=user_id, username=username,
        )
        self._locks[lock_key] = lock

        # Update presence to editing
        pkey = self._presence_key(user_id, resource_type, resource_id)
        if pkey in self._presences:
            self._presences[pkey].status = PresenceStatus.EDITING

        return lock

    def release_lock(self, user_id: str, resource_type: str, resource_id: str) -> bool:
        """Release an edit lock."""
        lock_key = self._lock_key(resource_type, resource_id)
        lock = self._locks.get(lock_key)
        if lock and lock.locked_by == user_id:
            self._locks.pop(lock_key)
            pkey = self._presence_key(user_id, resource_type, resource_id)
            if pkey in self._presences:
                self._presences[pkey].status = PresenceStatus.VIEWING
            return True
        return False

    def get_lock_status(self, resource_type: str, resource_id: str) -> Optional[EditLock]:
        """Get current lock status for a resource."""
        lock_key = self._lock_key(resource_type, resource_id)
        lock = self._locks.get(lock_key)
        if lock and lock.expires_at < datetime.utcnow():
            self._locks.pop(lock_key)
            return None
        return lock

    def get_user_locks(self, user_id: str) -> List[EditLock]:
        """Get all locks held by a user."""
        return [l for l in self._locks.values() if l.locked_by == user_id]

    def _cleanup_expired(self):
        """Remove expired presences and locks."""
        now = datetime.utcnow()
        expired_keys = [
            k for k, p in self._presences.items()
            if now - p.last_heartbeat > self.HEARTBEAT_TIMEOUT
        ]
        for k in expired_keys:
            self._presences.pop(k)

        expired_locks = [
            k for k, l in self._locks.items()
            if l.expires_at < now
        ]
        for k in expired_locks:
            self._locks.pop(k)

    def get_all_active_users(self) -> List[Dict]:
        """Get summary of all active users across all resources."""
        self._cleanup_expired()
        users = {}
        for p in self._presences.values():
            if p.user_id not in users:
                users[p.user_id] = {
                    "user_id": p.user_id,
                    "username": p.username,
                    "color": p.color,
                    "resources": [],
                }
            users[p.user_id]["resources"].append({
                "type": p.resource_type,
                "id": p.resource_id,
                "status": p.status.value,
            })
        return list(users.values())


# Singleton
presence_service = PresenceService()
