class EnvironmentalFactors:
    @staticmethod
    def get_weather_factor(weather_condition: str) -> float:
        """Calculate impact factor based on weather conditions."""
        weather_factors = {
            'clear': 1.0,
            'rain': 0.8,  # 20% speed reduction in rain
            'storm': 0.6   # 40% speed reduction in storm
        }
        return weather_factors.get(weather_condition, 1.0)
    
    @staticmethod
    def get_road_condition_factor(condition: float) -> float:
        """Calculate impact factor based on road condition (0.0 to 1.0)."""
        # Linear degradation of speed based on road condition
        # 1.0 means perfect condition, 0.0 means unusable
        return max(0.3, condition)  # Minimum 30% of normal speed
    
    @staticmethod
    def get_gradient_factor(gradient: float) -> float:
        """Calculate impact factor based on road gradient (as decimal)."""
        # Gradient impact is more severe when positive (uphill)
        if gradient > 0:
            return 1.0 / (1 + gradient * 2)  # Uphill reduces speed more
        else:
            return 1.0 / (1 - gradient)  # Downhill reduces speed less
    
    @staticmethod
    def get_combined_factor(weather: str, road_condition: float, gradient: float) -> float:
        """Calculate combined impact of all environmental factors."""
        weather_factor = EnvironmentalFactors.get_weather_factor(weather)
        road_factor = EnvironmentalFactors.get_road_condition_factor(road_condition)
        gradient_factor = EnvironmentalFactors.get_gradient_factor(gradient)
        
        return weather_factor * road_factor * gradient_factor