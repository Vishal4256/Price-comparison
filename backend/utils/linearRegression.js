/**
 * Simple Linear Regression utility for price prediction
 * y = a + b*x  (where x = day index, y = price)
 */

function linearRegression(dataPoints) {
  // dataPoints: array of { x: number, y: number }
  const n = dataPoints.length;
  if (n < 2) return null;

  const sumX = dataPoints.reduce((s, p) => s + p.x, 0);
  const sumY = dataPoints.reduce((s, p) => s + p.y, 0);
  const sumXY = dataPoints.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = dataPoints.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const b = (n * sumXY - sumX * sumY) / denom; // slope
  const a = (sumY - b * sumX) / n; // intercept

  // R-squared (goodness of fit)
  const yMean = sumY / n;
  const ssTot = dataPoints.reduce((s, p) => s + Math.pow(p.y - yMean, 2), 0);
  const ssRes = dataPoints.reduce((s, p) => s + Math.pow(p.y - (a + b * p.x), 2), 0);
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope: b, intercept: a, rSquared };
}

function predictPrice(history, futureDays = [7, 14, 30]) {
  if (!history || history.length < 3) return null;

  // Sort by timestamp
  const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const firstDate = new Date(sorted[0].timestamp).getTime();

  const dataPoints = sorted.map((h, i) => ({
    x: i,
    y: h.price,
  }));

  const reg = linearRegression(dataPoints);
  if (!reg) return null;

  const currentPrice = sorted[sorted.length - 1].price;
  const predictions = {};

  for (const days of futureDays) {
    const futureX = dataPoints.length - 1 + days;
    const predictedPrice = reg.intercept + reg.slope * futureX;
    predictions[`day${days}`] = Math.max(0, Math.round(predictedPrice));
  }

  const avgMonthlyDrop = Math.abs(reg.slope) * 30;
  const dropPercent = (avgMonthlyDrop / currentPrice) * 100;
  const confidence = Math.min(95, Math.round(reg.rSquared * 100));

  let bestTimeToBuy;
  let dropMessage;

  if (reg.slope < -50) {
    bestTimeToBuy = 'Within 7-10 days';
    dropMessage = `Expected drop of ₹${Math.round(avgMonthlyDrop / 30 * 10)} in 10 days`;
  } else if (reg.slope < 0) {
    bestTimeToBuy = 'Within 15-20 days';
    dropMessage = `Gradual drop of ₹${Math.round(avgMonthlyDrop)} expected this month`;
  } else {
    bestTimeToBuy = 'Buy now — price may rise';
    dropMessage = 'Price trend is upward, no significant drop expected';
  }

  return {
    currentPrice,
    predictedPrice7: predictions.day7,
    predictedPrice14: predictions.day14,
    predictedPrice30: predictions.day30,
    expectedDrop: Math.max(0, currentPrice - predictions.day14),
    dropPercent: parseFloat(dropPercent.toFixed(1)),
    confidence,
    bestTimeToBuy,
    dropMessage,
    trend: reg.slope < -10 ? 'falling' : reg.slope > 10 ? 'rising' : 'stable',
    rSquared: parseFloat(reg.rSquared.toFixed(3)),
  };
}

module.exports = { linearRegression, predictPrice };
