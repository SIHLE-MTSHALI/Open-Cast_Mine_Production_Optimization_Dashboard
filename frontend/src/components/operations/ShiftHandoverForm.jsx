import React, { useEffect, useState } from 'react';
import { operationsAPI } from '../../services/api';

const ShiftHandoverForm = ({ shiftId, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    shift_id: shiftId,
    outgoing_supervisor_name: '',
    incoming_supervisor_name: '',
    production_notes: '',
    safety_notes: '',
    equipment_notes: '',
    tasks_incomplete: []
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, shift_id: shiftId }));
  }, [shiftId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First create the handover record
      await operationsAPI.createHandover(formData);
      // Then end the shift
      await operationsAPI.endShift(shiftId);
      onComplete();
    } catch (error) {
      alert('Failed to complete handover: ' + error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h3>Shift Handover</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Outgoing Supervisor</label>
            <input
              required
              value={formData.outgoing_supervisor_name}
              onChange={e => setFormData({ ...formData, outgoing_supervisor_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Incoming Supervisor</label>
            <input
              required
              value={formData.incoming_supervisor_name}
              onChange={e => setFormData({ ...formData, incoming_supervisor_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Production Notes</label>
            <textarea
              rows="4"
              value={formData.production_notes}
              onChange={e => setFormData({ ...formData, production_notes: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Safety Notes</label>
            <textarea
              rows="2"
              value={formData.safety_notes}
              onChange={e => setFormData({ ...formData, safety_notes: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Equipment Notes</label>
            <textarea
              rows="2"
              value={formData.equipment_notes}
              onChange={e => setFormData({ ...formData, equipment_notes: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" className="primary-btn">Complete Shift</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftHandoverForm;
