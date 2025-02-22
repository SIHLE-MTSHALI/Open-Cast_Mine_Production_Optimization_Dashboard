import dash
from dash import html, dcc
from dash.dependencies import Input, Output, State
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from datetime import datetime
import pickle
from simulation import MineSimulation
from optimization import MineOptimizer
import simpy

# Initialize the Dash app
app = dash.Dash(__name__)

# Define the layout
app.layout = html.Div([
    html.H1('Open-Cast Mine Production Optimization Dashboard'),
    
    # Control Panel
    html.Div([
        html.H3('Simulation Controls'),
        html.Div([
            html.Label('Number of Trucks:'),
            dcc.Slider(id='num-trucks-slider', min=5, max=20, step=1, value=10,
                      marks={i: str(i) for i in range(5, 21, 5)})
        ]),
        html.Div([
            html.Label('Number of Shovels:'),
            dcc.Slider(id='num-shovels-slider', min=2, max=6, step=1, value=3,
                      marks={i: str(i) for i in range(2, 7)})
        ]),
        html.Div([
            html.Label('Max Trucks per Shovel:'),
            dcc.Slider(id='max-trucks-per-shovel-slider', min=2, max=6, step=1, value=4,
                      marks={i: str(i) for i in range(2, 7)})
        ]),
        html.Button('Run Optimization', id='optimize-button', n_clicks=0)
    ], style={'padding': '20px', 'backgroundColor': '#f8f9fa'}),
    
    # Main Dashboard
    html.Div([
        # Map and Real-time Positions
        html.Div([
            dcc.Graph(id='mine-map')
        ], style={'width': '60%', 'display': 'inline-block'}),
        
        # KPI Cards
        html.Div([
            html.Div([
                html.H4('Idle Time'),
                html.H2(id='idle-time-kpi')
            ], className='kpi-card'),
            html.Div([
                html.H4('Fuel Cost'),
                html.H2(id='fuel-cost-kpi')
            ], className='kpi-card'),
            html.Div([
                html.H4('Truck Utilization'),
                html.H2(id='utilization-kpi')
            ], className='kpi-card')
        ], style={'width': '35%', 'display': 'inline-block', 'verticalAlign': 'top'})
    ]),
    
    # Performance Charts
    html.Div([
        dcc.Graph(id='idle-time-chart'),
        dcc.Graph(id='fuel-cost-chart'),
        dcc.Graph(id='utilization-chart')
    ]),
    
    # Hidden div for storing intermediate data
    html.Div(id='simulation-data', style={'display': 'none'}),
    
    # Update interval
    dcc.Interval(
        id='interval-component',
        interval=5*1000,  # in milliseconds
        n_intervals=0
    )
])

@app.callback(
    [Output('mine-map', 'figure'),
     Output('idle-time-kpi', 'children'),
     Output('fuel-cost-kpi', 'children'),
     Output('utilization-kpi', 'children')],
    [Input('interval-component', 'n_intervals'),
     Input('optimize-button', 'n_clicks')],
    [State('num-trucks-slider', 'value'),
     State('num-shovels-slider', 'value'),
     State('max-trucks-per-shovel-slider', 'value')]
)
def update_dashboard(n_intervals, n_clicks, num_trucks, num_shovels, max_trucks_per_shovel):
    # Initialize simulation environment
    env = simpy.Environment()
    sim = MineSimulation(env, num_trucks, num_shovels, max_trucks_per_shovel)
    
    # Run simulation for a short period
    logs_df = sim.run(simulation_time=1)
    
    # Create map
    trucks_df = sim.trucks_df
    shovels_df = sim.shovels_df
    
    fig = go.Figure()
    
    # Add trucks to map
    fig.add_trace(go.Scattermapbox(
        lat=trucks_df['current_location'].apply(lambda x: x['latitude']),
        lon=trucks_df['current_location'].apply(lambda x: x['longitude']),
        mode='markers+text',
        marker=dict(size=10, color='blue'),
        text=trucks_df['truck_id'],
        name='Trucks'
    ))
    
    # Add shovels to map
    fig.add_trace(go.Scattermapbox(
        lat=shovels_df['location'].apply(lambda x: x['latitude']),
        lon=shovels_df['location'].apply(lambda x: x['longitude']),
        mode='markers+text',
        marker=dict(size=15, color='red'),
        text=shovels_df['shovel_id'],
        name='Shovels'
    ))
    
    fig.update_layout(
        mapbox=dict(
            style='open-street-map',
            center=dict(lat=-26.2041, lon=27.8695),
            zoom=12
        ),
        margin=dict(l=0, r=0, t=0, b=0)
    )
    
    # Calculate KPIs
    idle_time_pct = len(logs_df[logs_df['event'] == 'queuing_at_shovel']) / len(logs_df) * 100
    fuel_cost_per_ton = sim.trucks_df['fuel_consumption_rate'].mean() * 1.5  # $1.5 per liter
    utilization = sim.trucks_df['current_load'].mean() / sim.trucks_df['capacity'].mean() * 100
    
    return fig, f"{idle_time_pct:.1f}%", f"R{fuel_cost_per_ton:.2f}/ton", f"{utilization:.1f}%"

def main():
    app.run_server(debug=True)

if __name__ == '__main__':
    main()