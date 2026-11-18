/**
 * Centralized Feature Flags Configuration
 */
const FEATURE_FLAGS = {
  PWA_ENABLED: true,
  PUSH_NOTIFICATIONS_ENABLED: true,
  OFFLINE_MODE_ENABLED: true,
  REALTIME_UPDATES_ENABLED: false, // Set to true when we upgrade to SSE/WebSocket
};

export const isFeatureEnabled = (featureName) => {
  return !!FEATURE_FLAGS[featureName];
};

export default FEATURE_FLAGS;
