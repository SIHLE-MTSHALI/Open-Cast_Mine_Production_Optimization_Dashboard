import simpy
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from data_generator import generate_truck_data, generate_shovel_data
from equipment_config import EnvironmentalFactors

class MineSimulation:
    def __init__(self, env, num_trucks=10, num_shovels=3, max_trucks_per_shovel=4):
        self.env = env
        self.trucks_df = generate_truck_data(num_trucks)
        self.shovels_df = generate_shovel_data(num_shovels)
        self.max_trucks_per_shovel = max_trucks_per_shovel
        
        # Create SimPy resources for shovels
        self.shovels = {}
        for _, shovel in self.shovels_df.iterrows():
            self.shovels[shovel['shovel_id']] = simpy.Resource(env, capacity=max_trucks_per_shovel)
        
        # Initialize logs
        self.logs = []
        
        # Initialize environmental conditions
        self.weather_conditions = ['clear', 'rain', 'storm']
        self.current_weather = 'clear'
        self.weather_change_time = 4  # Hours between weather changes
        
        # Initialize road conditions
        self.road_conditions = pd.DataFrame({
            'segment_id': range(1, num_shovels + 1),
            'condition': 1.0,  # 1.0 is perfect, 0.0 is unusable
            'last_maintenance': 0
        })
        
        # Equipment breakdown parameters
        self.breakdown_probability = 0.01  # 1% chance per hour
        self.repair_time_range = (1, 4)  # Hours
        
        # Start environmental processes
        self.env.process(self.weather_update_process())
        self.env.process(self.road_degradation_process())
        
    def calculate_travel_time(self, start_point, end_point, truck, route_data=None):
        """Calculate travel time between two points considering environmental factors."""
        lat1, lon1 = start_point['latitude'], start_point['longitude']
        lat2, lon2 = end_point['latitude'], end_point['longitude']
        
        # Calculate base distance in km
        distance = np.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111
        
        # Get road segment for this route
        segment_id = hash((lat1, lon1, lat2, lon2)) % len(self.road_conditions) + 1
        road_condition = self.road_conditions.loc[
            self.road_conditions['segment_id'] == segment_id, 'condition'].iloc[0]
        
        # Calculate environmental factors
        road_factor = EnvironmentalFactors.get_road_condition_factor(road_condition)
        weather_factor = EnvironmentalFactors.get_weather_factor(self.current_weather)
        gradient_factor = EnvironmentalFactors.get_gradient_factor(0.05)  # Assume 5% gradient
        
        # Calculate effective speed based on truck load and environmental factors
        is_loaded = truck['current_load'] > 0
        base_speed = truck['max_speed_loaded'] if is_loaded else truck['max_speed_empty']
        effective_speed = base_speed * road_factor * weather_factor * gradient_factor
        
        return distance / effective_speed  # hours
    
    def weather_update_process(self):
        """Periodically update weather conditions."""
        while True:
            yield self.env.timeout(self.weather_change_time)
            self.current_weather = np.random.choice(self.weather_conditions)
            self.log_event('system', f'weather_changed_{self.current_weather}', self.env.now)
    
    def road_degradation_process(self):
        """Simulate road degradation over time."""
        while True:
            yield self.env.timeout(1)  # Check every hour
            # Degrade road conditions based on usage and weather
            weather_impact = 1.5 if self.current_weather == 'rain' else 2.0 if self.current_weather == 'storm' else 1.0
            self.road_conditions['condition'] -= 0.01 * weather_impact
            self.road_conditions.loc[self.road_conditions['condition'] < 0, 'condition'] = 0
    
    def check_breakdown(self, equipment_id, equipment_type):
        """Check if equipment breaks down and handle repairs."""
        if np.random.random() < self.breakdown_probability:
            repair_time = np.random.uniform(*self.repair_time_range)
            self.log_event(equipment_id, f'{equipment_type}_breakdown', self.env.now)
            yield self.env.timeout(repair_time)
            self.log_event(equipment_id, f'{equipment_type}_repaired', self.env.now)
            return True
        return False
    
    def truck_process(self, truck_id):
        """Simulate the cycle of a single truck."""
        while True:
            # Check for breakdown at the start of each cycle
            if (yield self.env.process(self.check_breakdown(truck_id, 'truck'))):
                continue
                
            truck = self.trucks_df[self.trucks_df['truck_id'] == truck_id].iloc[0]
            assigned_shovel = truck['assigned_shovel']
            shovel = self.shovels_df[self.shovels_df['shovel_id'] == assigned_shovel].iloc[0]
            
            # Travel to shovel
            start_time = self.env.now
            travel_time = self.calculate_travel_time(
                truck['current_location'],
                shovel['location'],
                truck
            )
            
            self.log_event(truck_id, 'traveling_to_shovel', start_time)
            yield self.env.timeout(travel_time)
            
            # Queue and loading at shovel
            start_time = self.env.now
            self.log_event(truck_id, 'queuing_at_shovel', start_time)
            
            with self.shovels[assigned_shovel].request() as req:
                yield req
                
                # Loading process - consider shovel bucket capacity and cycle time
                num_cycles = np.ceil(truck['capacity'] / shovel['bucket_capacity'])
                loading_time = num_cycles * (shovel['cycle_time'] / 3600)  # Convert to hours
                self.log_event(truck_id, 'loading', self.env.now)
                yield self.env.timeout(loading_time)
                
                # Update truck load
                self.trucks_df.loc[self.trucks_df['truck_id'] == truck_id, 'current_load'] = truck['capacity']
            
            # Travel to dump site (simulated fixed location)
            dump_site = {'latitude': -25.7461, 'longitude': 28.2314}  # Fixed dump site
            travel_time = self.calculate_travel_time(
                shovel['location'],
                dump_site,
                truck
            )
            
            self.log_event(truck_id, 'traveling_to_dump', self.env.now)
            yield self.env.timeout(travel_time)
            
            # Dumping process
            self.log_event(truck_id, 'dumping', self.env.now)
            yield self.env.timeout(0.1)  # 6 minutes for dumping
            
            # Reset truck load
            self.trucks_df.loc[self.trucks_df['truck_id'] == truck_id, 'current_load'] = 0
    
    def log_event(self, truck_id, event, timestamp):
        """Log events for analysis."""
        self.logs.append({
            'truck_id': truck_id,
            'event': event,
            'timestamp': timestamp
        })
    
    def run(self, simulation_time=24):
        """Run the simulation for specified hours."""
        # Start truck processes
        for truck_id in self.trucks_df['truck_id']:
            self.env.process(self.truck_process(truck_id))
        
        # Run simulation
        self.env.run(until=simulation_time)
        
        # Convert logs to DataFrame
        logs_df = pd.DataFrame(self.logs)
        return logs_df

def main():
    # Initialize SimPy environment
    env = simpy.Environment()
    
    # Create and run simulation
    sim = MineSimulation(env)
    logs_df = sim.run()
    
    # Ensure data directory exists and save simulation logs
    import os
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)
    logs_df.to_csv(os.path.join(data_dir, 'simulation_logs.csv'), index=False)
    print("Simulation completed successfully!")
    print(f"Generated {len(logs_df)} event logs")

if __name__ == "__main__":
    main()