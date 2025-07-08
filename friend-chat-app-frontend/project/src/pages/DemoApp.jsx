import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DemoAuthProvider } from '../context/DemoAuthContext';
import { DemoSocketProvider } from '../context/DemoSocketContext';

// Demo Pages
import DemoDashboard from './DemoDashboard';
import DemoProfile from './DemoProfile';
import DemoLogin from './DemoLogin';

function DemoApp() {
  return (
    <DemoAuthProvider>
      <DemoSocketProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Demo Routes */}
              <Route path="/demo" element={<DemoDashboard />} />
              <Route path="/demo-dashboard" element={<DemoDashboard />} />
              <Route path="/demo-profile" element={<DemoProfile />} />
              <Route path="/demo-login" element={<DemoLogin />} />
              
              {/* Redirect to demo */}
              <Route path="/" element={<Navigate to="/demo" replace />} />
            </Routes>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#374151',
                  color: '#fff',
                  border: '1px solid #4b5563',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </DemoSocketProvider>
    </DemoAuthProvider>
  );
}

export default DemoApp;