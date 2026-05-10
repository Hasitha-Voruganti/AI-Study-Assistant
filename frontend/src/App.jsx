import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Documents from './pages/Documents';
import AIChat from './pages/AIChat';
import Quiz from './pages/Quiz';
import Flashcards from './pages/Flashcards';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDocuments from './pages/AdminDocuments';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

const RedirectByRole = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RedirectByRole />} />
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      <Route path="/dashboard"  element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/upload"     element={<PrivateRoute><Layout><Upload /></Layout></PrivateRoute>} />
      <Route path="/documents"  element={<PrivateRoute><Layout><Documents /></Layout></PrivateRoute>} />
      <Route path="/chat"       element={<PrivateRoute><Layout><AIChat /></Layout></PrivateRoute>} />
      <Route path="/chat/:documentId" element={<PrivateRoute><Layout><AIChat /></Layout></PrivateRoute>} />
      <Route path="/quiz"       element={<PrivateRoute><Layout><Quiz /></Layout></PrivateRoute>} />
      <Route path="/flashcards" element={<PrivateRoute><Layout><Flashcards /></Layout></PrivateRoute>} />

      <Route path="/admin"           element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
      <Route path="/admin/users"     element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
      <Route path="/admin/documents" element={<AdminRoute><Layout><AdminDocuments /></Layout></AdminRoute>} />

      <Route path="*" element={<RedirectByRole />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#ffffff', color: '#0f172a',
            border: '1px solid #e0e7ff',
            boxShadow: '0 10px 25px -5px rgba(99,102,241,0.15)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '500'
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } }
        }} />
      </Router>
    </AuthProvider>
  );
}
