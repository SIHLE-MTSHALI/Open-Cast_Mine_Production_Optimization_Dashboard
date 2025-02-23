# Open-Cast Mine Production Optimization Dashboard Requirements

## Implementation Status Legend
✓ - Completed
⚡ - Modified Implementation
⏳ - Pending

## Key Performance Indicators (KPIs)
1. Idle Time ✓
   - Measurement: Percentage of total runtime
   - Target: < 15% idle time per truck
   - Calculation: (Total Idle Time / Total Operating Time) * 100

2. Fuel Cost Efficiency ⚡
   - Measurement: Cost per ton of material moved ($/ton)
   - Target: < $2.50/ton
   - Calculation: Modified to use fuel consumption rate and average load

3. Truck Utilization ✓
   - Measurement: Tons per hour
   - Target: > 85% of rated capacity
   - Calculation: Total Tons Moved / Operating Hours

## System Constraints
1. Operational Limits
   - Maximum trucks per shovel: 4 ✓
   - Maximum queue time: 10 minutes ✓
   - Minimum safety distance between trucks: 50 meters ⏳

2. Resource Specifications
   - Trucks: ✓
     * Capacity range: 80-120 tons
     * Speed range: 30-50 km/h
     * Fuel consumption: 0.4-0.6 L/km
   - Shovels: ✓
     * Loading rate: 8-12 tons/minute
     * Fixed positions with GPS coordinates

## User Stories
1. As a dispatcher, I want to:
   - View real-time positions of all trucks and shovels ✓
   - See current queue lengths at each shovel ✓
   - Receive alerts for excessive idle times ⏳

2. As a mine manager, I want to:
   - View historical performance metrics ⚡
   - Compare actual vs. optimized routes ✓
   - Export performance reports ⏳

3. As a maintenance planner, I want to:
   - Monitor fuel consumption patterns ✓
   - Track equipment utilization rates ✓
   - Identify potential maintenance needs based on performance ⏳

## Potential Improvements

1. Simulation Enhancements
   - Implement dynamic weather conditions affecting operations
   - Add road degradation modeling
   - Include equipment breakdown probability
   - Model tire wear and maintenance cycles

2. Optimization Extensions
   - Multi-objective optimization for balancing cost and productivity
   - Real-time route optimization based on current conditions
   - Dynamic shovel assignment based on material types
   - Queue prediction and proactive truck routing

3. Analytics and Reporting
   - Predictive maintenance alerts based on performance patterns
   - Detailed cost analysis per operation cycle
   - Environmental impact assessment metrics
   - Custom report generator for different stakeholders

4. User Interface Improvements
   - Mobile-responsive design for field operations
   - 3D visualization of mine topology
   - Real-time alert configuration system
   - Customizable dashboard layouts per user role