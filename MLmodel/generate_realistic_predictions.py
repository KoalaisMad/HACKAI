"""
Generate realistic oil price predictions CSV
Generates percentage changes that align with geopolitical risk scenarios
"""

import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Number of prediction scenarios
num_scenarios = 3000

# Generate realistic 7-day percentage change predictions
def generate_realistic_prediction():
    """
    Generate a realistic 7-day oil price prediction scenario
    Returns percentage changes that are realistic based on market volatility
    """
    # Determine market sentiment for this scenario
    sentiment = np.random.choice(['bullish', 'bearish', 'neutral'], p=[0.3, 0.25, 0.45])
    
    # Base volatility (higher for geopolitical risks)
    volatility = np.random.uniform(0.3, 1.2)
    
    predictions = []
    cumulative_change = 0
    
    for day in range(7):
        # Day 1 has highest volatility, decreasing over time
        day_volatility = volatility * (1 - day * 0.08)
        
        if sentiment == 'bullish':
            base_change = np.random.uniform(0.5, 4.0) * day_volatility
        elif sentiment == 'bearish':
            base_change = np.random.uniform(-3.5, -0.3) * day_volatility
        else:
            base_change = np.random.uniform(-1.5, 1.8) * day_volatility
        
        # Add momentum from previous days
        momentum = cumulative_change * 0.12
        
        # Calculate final percentage change
        pct_change = base_change + momentum
        
        # Clamp to realistic bounds (-10% to +15%)
        pct_change = np.clip(pct_change, -10.0, 15.0)
        
        predictions.append(round(pct_change, 2))
        cumulative_change = cumulative_change * 0.7 + pct_change * 0.3
    
    return predictions

# Generate all scenarios
data = []
for _ in range(num_scenarios):
    scenario = generate_realistic_prediction()
    data.append(scenario)

# Create DataFrame
columns = ['oil_1d_pred', 'oil_2d_pred', 'oil_3d_pred', 'oil_4d_pred', 
           'oil_5d_pred', 'oil_6d_pred', 'oil_7d_pred']
df = pd.DataFrame(data, columns=columns)

# Save to CSV
output_path = '../oil_price_predictions.csv'
df.to_csv(output_path, index=False)

print(f"Generated {num_scenarios} realistic oil price prediction scenarios")
print(f"Saved to: {output_path}")
print("\nSample predictions (first 5 rows):")
print(df.head())
print("\nStatistics:")
print(df.describe())
