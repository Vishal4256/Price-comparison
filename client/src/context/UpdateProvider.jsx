import React, { createContext, useContext, useEffect, useState } from 'react';

const UpdateContext = createContext(null);

export const useUpdates = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useUpdates must be used within an UpdateProvider');
  }
  return context;
};

export const UpdateProvider = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [transport, setTransport] = useState('polling'); // Could be 'sse' or 'websocket' later

  useEffect(() => {
    // Current implementation: Polling (Every 30 seconds)
    // Future roadmap: Upgrade this to SSE or WebSocket without breaking consumer components
    let interval;
    if (transport === 'polling') {
      interval = setInterval(() => {
        // Trigger consumers to refetch or signal that new data might be available
        setLastUpdated(Date.now());
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [transport]);

  const value = {
    lastUpdated,
    transport,
    setTransport
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};
