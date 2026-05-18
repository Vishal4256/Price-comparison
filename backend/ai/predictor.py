import sys
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

def predict():
    try:
        # Read data from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return
        
        data = json.loads(input_data)
        history = data.get('history', [])
        
        if len(history) < 3:
            print(json.dumps({"error": "Insufficient data points"}))
            return

        # Prepare DataFrame
        df = pd.DataFrame(history)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Convert timestamp to ordinal for regression
        df['date_ordinal'] = df['timestamp'].apply(lambda x: x.toordinal())
        
        X = df[['date_ordinal']].values
        y = df['price'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict for next 7, 14, 30 days
        last_date = df['timestamp'].max()
        future_days = [7, 14, 30]
        predictions = {}
        
        for days in future_days:
            future_date = last_date + timedelta(days=days)
            pred = model.predict([[future_date.toordinal()]])
            predictions[f'day{days}'] = int(max(0, pred[0]))

        # Calculate metrics
        current_price = int(y[-1])
        expected_drop = max(0, current_price - predictions['day14'])
        
        # Simple confidence based on R^2
        r_squared = model.score(X, y)
        confidence = int(min(95, max(10, r_squared * 100)))
        
        slope = model.coef_[0]
        
        if slope < -50:
            best_time = "Within 7-10 days"
            msg = f"Strong downward trend detected. Expected drop of ₹{expected_drop} soon."
        elif slope < 0:
            best_time = "Within 15-20 days"
            msg = "Price is gradually decreasing. Waiting might save you some money."
        else:
            best_time = "Buy now — price may rise"
            msg = "Price trend is upward. It's unlikely to drop significantly soon."

        result = {
            "currentPrice": current_price,
            "predictedPrice7": predictions['day7'],
            "predictedPrice14": predictions['day14'],
            "predictedPrice30": predictions['day30'],
            "expectedDrop": expected_drop,
            "confidence": confidence,
            "bestTimeToBuy": best_time,
            "dropMessage": msg,
            "trend": "falling" if slope < -10 else "rising" if slope > 10 else "stable"
        }
        
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
