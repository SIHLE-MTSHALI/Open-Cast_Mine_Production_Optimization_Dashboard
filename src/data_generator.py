import pandas as pd
import numpy as np
from faker import Faker
import json

fake = Faker()

def generate_gps_coordinates():
    # Generating coordinates within a reasonable mining area
    # Centered around -25.7461° S, 28.2314° E (example mining region)
    base_lat = -25.7461
    base_lon = 28.2314
    
    lat = base_lat + np.random.uniform(-0.05, 0.05)
    lon = base_lon + np.random.uniform(-0.05, 0.05)
    return lat, lon

def generate_truck_data(num_trucks=10):
    trucks = []
    for i in range(num_trucks):
        lat, lon = generate_gps_coordinates()
        truck = {
            'truck_id': i + 1,
            'capacity': np.random.uniform(80, 120),  # tons
            'speed': np.random.uniform(30, 50),      # km/h
            'fuel_consumption_rate': np.random.uniform(0.4, 0.6),  # L/km
            'current_load': 0,
            'status': np.random.choice(['idle', 'loading', 'hauling', 'dumping']),
            'current_location': {
                'latitude': lat,
                'longitude': lon
            },
            'assigned_shovel': np.random.randint(1, 4),
            'maintenance_status': np.random.choice(['operational', 'maintenance_due', 'in_maintenance'], 
                                                 p=[0.8, 0.15, 0.05])
        }
        trucks.append(truck)
    return pd.DataFrame(trucks)

def generate_shovel_data(num_shovels=3):
    shovels = []
    for i in range(num_shovels):
        lat, lon = generate_gps_coordinates()
        shovel = {
            'shovel_id': i + 1,
            'loading_rate': np.random.uniform(8, 12),  # tons/minute
            'location': {
                'latitude': lat,
                'longitude': lon
            },
            'status': np.random.choice(['operational', 'maintenance'], p=[0.9, 0.1]),
            'current_queue': np.random.randint(0, 4)
        }
        shovels.append(shovel)
    return pd.DataFrame(shovels)

def main():
    # Generate data
    trucks_df = generate_truck_data()
    shovels_df = generate_shovel_data()
    
    # Save to CSV files
    trucks_df.to_csv('../data/trucks.csv', index=False)
    shovels_df.to_csv('../data/shovels.csv', index=False)
    
    print("Mock data generated successfully!")
    print(f"Generated {len(trucks_df)} trucks and {len(shovels_df)} shovels")

if __name__ == "__main__":
    main()