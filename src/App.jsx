import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { View, Text, Flex, IllustratedMessage, Heading, Content } from '@adobe/react-spectrum';
import Auth from './pages/Auth';
import ModelSelection from './pages/ModelSelection';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [user, setUser] = useState(null); // Will hold Firebase user

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <View minHeight="100vh" backgroundColor="transparent">
        {/* Permanent Floating Status Indicator */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '8px 16px',
          borderRadius: '30px',
          background: isOffline ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'inline-block'
          }}></span>
          {isOffline ? 'Offline' : 'Online'}
        </div>

        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth setUser={setUser} />} />
          <Route path="/" element={user ? <ModelSelection user={user} /> : <Navigate to="/auth" />} />
        </Routes>
      </View>
    </Router>
  );
}

export default App;
