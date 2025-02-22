# Open-Cast Mine Production Optimization Dashboard

## Project Overview
The Open-Cast Mine Production Optimization Dashboard is a sophisticated simulation and optimization system designed specifically for open-cast mining operations in South Africa. The system focuses on optimizing truck-shovel operations, considering real-world factors such as weather conditions, road quality, and equipment specifications.

### Key Features
- Real-time simulation of mining operations
- Genetic algorithm-based optimization for truck-shovel assignments
- Environmental factor consideration (weather, road conditions, gradients)
- Interactive dashboard for monitoring operations
- Comprehensive performance metrics and KPIs
- Equipment maintenance tracking

## System Requirements
- Python 3.8 or higher
- Modern web browser for dashboard visualization

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SIHLE-MTHSHALI/open-cast-mine-optimization.git
cd open-cast-mine-optimization
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

## Project Structure
```
├── data/               # Simulation and optimization data
├── docs/               # Project documentation
├── src/                # Source code
│   ├── dashboard.py    # Web dashboard implementation
│   ├── simulation.py   # Mining operation simulation
│   ├── optimization.py # Genetic algorithm optimization
│   └── data_generator.py # Mock data generation
└── tests/              # Unit tests
```

## Usage

1. Generate initial mock data:
```bash
python src/data_generator.py
```

2. Run the simulation:
```bash
python src/simulation.py
```

3. Launch the dashboard:
```bash
python src/dashboard.py
```

4. Access the dashboard at `http://localhost:8050`

## How It Works

### Simulation Engine
The simulation engine models the complete mining operation cycle:
1. Truck dispatch to shovels
2. Loading operations
3. Material transport
4. Dumping procedures

Environmental factors considered:
- Road conditions (excellent to very poor)
- Weather conditions (clear to storm)
- Terrain gradients
- Equipment-specific parameters

### Optimization Algorithm
Utilizes a genetic algorithm to optimize:
- Truck-shovel assignments
- Route selection
- Queue management
- Resource utilization

### Real-time Monitoring
The dashboard provides:
- Interactive map view
- Equipment status tracking
- Performance metrics
- Historical data analysis

## Future Development Plans

### Short-term Additions
1. Machine Learning Integration
   - Predictive maintenance
   - Weather impact forecasting
   - Equipment failure prediction

2. Enhanced Visualization
   - 3D terrain mapping
   - Heat maps for congestion
   - Custom report generation

3. Mobile Application
   - Real-time alerts
   - Mobile dashboard access
   - Field data collection

### Long-term Goals
1. Advanced Analytics
   - Deep learning for pattern recognition
   - Autonomous decision-making
   - Real-time optimization

2. Integration Features
   - ERP system connectivity
   - GPS integration
   - IoT sensor network

3. Sustainability Metrics
   - Carbon footprint tracking
   - Energy efficiency optimization
   - Environmental impact assessment

## Contributing
Contributions are welcome! Please feel free to submit pull requests.

