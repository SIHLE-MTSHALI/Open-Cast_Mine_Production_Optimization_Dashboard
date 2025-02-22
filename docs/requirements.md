# Open-Cast Mine Production Optimization Dashboard Requirements

## Key Performance Indicators (KPIs)
1. Idle Time
   - Measurement: Percentage of total runtime
   - Target: < 15% idle time per truck
   - Calculation: (Total Idle Time / Total Operating Time) * 100

2. Fuel Cost Efficiency
   - Measurement: Cost per ton of material moved ($/ton)
   - Target: < $2.50/ton
   - Calculation: (Total Fuel Consumed * Fuel Price) / Total Material Moved

3. Truck Utilization
   - Measurement: Tons per hour
   - Target: > 85% of rated capacity
   - Calculation: Total Tons Moved / Operating Hours

## System Constraints
1. Operational Limits
   - Maximum trucks per shovel: 4
   - Maximum queue time: 10 minutes
   - Minimum safety distance between trucks: 50 meters

2. Resource Specifications
   - Trucks:
     * Capacity range: 80-120 tons
     * Speed range: 30-50 km/h
     * Fuel consumption: 0.4-0.6 L/km
   - Shovels:
     * Loading rate: 8-12 tons/minute
     * Fixed positions with GPS coordinates

## User Stories
1. As a dispatcher, I want to:
   - View real-time positions of all trucks and shovels
   - See current queue lengths at each shovel
   - Receive alerts for excessive idle times

2. As a mine manager, I want to:
   - View historical performance metrics
   - Compare actual vs. optimized routes
   - Export performance reports

3. As a maintenance planner, I want to:
   - Monitor fuel consumption patterns
   - Track equipment utilization rates
   - Identify potential maintenance needs based on performance