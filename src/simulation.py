import simpy
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from data_generator import generate_truck_data, generate_shovel_data

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
        
    def calculate_travel_time(self, start_point, end_point, speed):
        """Calculate travel time between two points based on distance and speed."""
        lat1, lon1 = start_point['latitude'], start_point['longitude']
        lat2, lon2 = end_point['latitude'], end_point['longitude']
        
        # Simple distance calculation (can be enhanced with proper GPS distance formula)
        distance = np.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111  # Rough conversion to km
        return distance / speed  # hours
    
    def truck_process(self, truck_id):
        """Simulate the cycle of a single truck."""
        while True:
            truck = self.trucks_df[self.trucks_df['truck_id'] == truck_id].iloc[0]
            assigned_shovel = truck['assigned_shovel']
            shovel = self.shovels_df[self.shovels_df['shovel_id'] == assigned_shovel].iloc[0]
            
            # Travel to shovel
            start_time = self.env.now
            travel_time = self.calculate_travel_time(
                truck['current_location'],
                shovel['location'],
                truck['speed']
            )
            
            self.log_event(truck_id, 'traveling_to_shovel', start_time)
            yield self.env.timeout(travel_time)
            
            # Queue and loading at shovel
            start_time = self.env.now
            self.log_event(truck_id, 'queuing_at_shovel', start_time)
            
            with self.shovels[assigned_shovel].request() as req:
                yield req
                
                # Loading process
                loading_time = truck['capacity'] / shovel['loading_rate'] / 60  # Convert to hours
                self.log_event(truck_id, 'loading', self.env.now)
                yield self.env.timeout(loading_time)
            
            # Travel to dump site (simulated fixed location)
            dump_site = {'latitude': -25.7461, 'longitude': 28.2314}  # Fixed dump site
            travel_time = self.calculate_travel_time(
                shovel['location'],
                dump_site,
                truck['speed']
            )
            
            self.log_event(truck_id, 'traveling_to_dump', self.env.now)
            yield self.env.timeout(travel_time)
            
            # Dumping process
            self.log_event(truck_id, 'dumping', self.env.now)
            yield self.env.timeout(0.1)  # 6 minutes for dumping
    
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
    
    # Save simulation logs
    logs_df.to_csv('../data/simulation_logs.csv', index=False)
    print("Simulation completed successfully!")
    print(f"Generated {len(logs_df)} event logs")

if __name__ == "__main__":
    main()