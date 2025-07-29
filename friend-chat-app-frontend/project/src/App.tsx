import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { DemoAuthProvider } from './context/DemoAuthContext';
import { DemoSocketProvider } from './context/DemoSocketContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Regular Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import ChatRoom from './pages/ChatRoom';
import Friends from './pages/Friends';
import Profile from './pages/Profile';

// Demo Pages
import DemoLogin from './pages/DemoLogin';
import DemoDashboard from './pages/DemoDashboard';
import DemoProfile from './pages/DemoProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Demo Routes */}
        <Route path="/demo-login" element={
          <DemoAuthProvider>
            <DemoLogin />
          </DemoAuthProvider>
        } />
        
        <Route path="/demo/*" element={
          <DemoAuthProvider>
            <DemoSocketProvider>
              <Routes>
                <Route path="/" element={<DemoDashboard />} />
                <Route path="/dashboard" element={<DemoDashboard />} />
                <Route path="/profile" element={<DemoProfile />} />
              </Routes>
            </DemoSocketProvider>
          </DemoAuthProvider>
        } />

        {/* Regular App Routes */}
        <Route path="/app/*" element={
          <AuthProvider>
            <SocketProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:chatId"
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <ProtectedRoute>
                      <Friends />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                
                {/* Redirect to dashboard */}
                <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        } />

        {/* Legacy routes for backward compatibility */}
        <Route path="/login" element={
          <AuthProvider>
            <Login />
          </AuthProvider>
        } />
        <Route path="/register" element={
          <AuthProvider>
            <Register />
          </AuthProvider>
        } />
        <Route path="/verify-otp" element={
          <AuthProvider>
            <VerifyOtp />
          </AuthProvider>
        } />
        <Route path="/dashboard" element={
          <AuthProvider>
            <SocketProvider>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </SocketProvider>
          </AuthProvider>
        } />
        <Route path="/friends" element={
          <AuthProvider>
            <SocketProvider>
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            </SocketProvider>
          </AuthProvider>
        } />
        <Route path="/profile" element={
          <AuthProvider>
            <SocketProvider>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </SocketProvider>
          </AuthProvider>
        } />

        {/* Default redirect to real login */}
        <Route path="/" element={<Navigate to="/app/login" replace />} />
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
    </Router>
  );
}

export default App;