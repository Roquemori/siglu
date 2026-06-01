import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ColaboradoresPage from './pages/ColaboradoresPage';
import ColaboradorDocumentosPage from './pages/ColaboradorDocumentosPage';
import DocumentosPage from './pages/DocumentosPage';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('siglu_token');
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (user || token) ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="colaboradores" element={<ColaboradoresPage />} />
        <Route path="colaboradores/:id/documentos" element={<ColaboradorDocumentosPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
