import numpy as np
import pandas as pd
from deap import base, creator, tools, algorithms
import random
import pickle
from simulation import MineSimulation
import simpy

class MineOptimizer:
    def __init__(self, num_trucks=10, num_shovels=3, max_trucks_per_shovel=4):
        self.num_trucks = num_trucks
        self.num_shovels = num_shovels
        self.max_trucks_per_shovel = max_trucks_per_shovel
        self.fuel_price = 25.0  # ZAR/L
        self.idle_cost_per_min = 35.0  # ZAR/min
        
        # Initialize simulation
        self.env = simpy.Environment()
        self.simulation = MineSimulation(self.env, num_trucks, num_shovels, max_trucks_per_shovel)
        
        # Set up genetic algorithm
        creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
        creator.create("Individual", list, fitness=creator.FitnessMin)
        
        self.toolbox = base.Toolbox()
        self.setup_ga()
    
    def setup_ga(self):
        # Attribute generator: random shovel assignment
        self.toolbox.register("attr_shovel", random.randint, 1, self.num_shovels)
        
        # Structure initializers
        self.toolbox.register("individual", tools.initRepeat, creator.Individual, 
                            self.toolbox.attr_shovel, n=self.num_trucks)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)
        
        # Genetic operators
        self.toolbox.register("evaluate", self.evaluate_solution)
        self.toolbox.register("mate", tools.cxTwoPoint)
        self.toolbox.register("mutate", tools.mutUniformInt, low=1, up=self.num_shovels, indpb=0.2)
        self.toolbox.register("select", tools.selTournament, tournsize=3)
    
    def evaluate_solution(self, individual):
        """Evaluate a solution using simulation results."""
        # Check if solution violates max trucks per shovel constraint
        shovel_counts = {i: 0 for i in range(1, self.num_shovels + 1)}
        for shovel_id in individual:
            shovel_counts[shovel_id] += 1
            if shovel_counts[shovel_id] > self.max_trucks_per_shovel:
                return (float('inf'),)  # Return high cost for invalid solutions
        
        # Update truck-shovel assignments
        for i, shovel_id in enumerate(individual):
            self.simulation.trucks_df.at[i, 'assigned_shovel'] = shovel_id
        
        # Run simulation
        logs_df = self.simulation.run(simulation_time=8)  # 8-hour simulation
        
        # Calculate costs
        total_fuel_cost = self.calculate_fuel_cost(logs_df)
        total_idle_cost = self.calculate_idle_cost(logs_df)
        
        return (total_fuel_cost + total_idle_cost,)
    
    def calculate_fuel_cost(self, logs_df):
        """Calculate total fuel cost from simulation logs."""
        travel_events = logs_df[logs_df['event'].isin(['traveling_to_shovel', 'traveling_to_dump'])]
        total_time = travel_events['timestamp'].max() - travel_events['timestamp'].min()
        
        # Assuming average speed and fuel consumption
        avg_speed = self.simulation.trucks_df['speed'].mean()
        avg_fuel_rate = self.simulation.trucks_df['fuel_consumption_rate'].mean()
        
        total_fuel = total_time * avg_speed * avg_fuel_rate
        return total_fuel * self.fuel_price
    
    def calculate_idle_cost(self, logs_df):
        """Calculate total idle cost from simulation logs."""
        idle_events = logs_df[logs_df['event'] == 'queuing_at_shovel']
        total_idle_time = len(idle_events) * 10  # Assuming 10 minutes average queue time
        return total_idle_time * self.idle_cost_per_min
    
    def optimize(self, population_size=50, generations=100):
        """Run genetic algorithm optimization."""
        pop = self.toolbox.population(n=population_size)
        hof = tools.HallOfFame(1)
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean)
        stats.register("min", np.min)
        stats.register("max", np.max)
        
        # Run evolution
        pop, logbook = algorithms.eaSimple(pop, self.toolbox, cxpb=0.7, mutpb=0.2,
                                         ngen=generations, stats=stats, halloffame=hof,
                                         verbose=True)
        
        # Save results
        best_solution = hof[0]
        results = {
            'best_solution': best_solution,
            'best_fitness': best_solution.fitness.values[0],
            'logbook': logbook
        }
        
        with open('../data/optimization_results.pkl', 'wb') as f:
            pickle.dump(results, f)
        
        return results

def main():
    optimizer = MineOptimizer()
    results = optimizer.optimize()
    print("Optimization completed successfully!")
    print(f"Best fitness value: {results['best_fitness']}")

if __name__ == "__main__":
    main()