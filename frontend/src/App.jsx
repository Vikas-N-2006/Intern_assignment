import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import NotesList from './pages/NotesList';
import Profile from './pages/Profile';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/protectedRoute';
import Header from './components/Header';
import Toast from './components/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { useState } from 'react';

function App(){
  const [toast, setToastState] = useState({ message: '', type: 'success' });
  const setToast = (message, type='success') => {
    setToastState({ message, type });
    setTimeout(()=> setToastState({ message:'', type:'success' }), 3000);
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-all duration-500">
          <Toast message={toast.message} type={toast.type} onClose={() => setToastState({message:''})} />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Header onLogout={logout} />
                  <main className="pt-20">
                    <Dashboard setToast={(m,t)=> setToast(m,t)} />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/notes" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Header onLogout={logout} />
                  <main className="p-4 pt-20">
                    <NotesList setToast={(m,t)=> setToast(m,t)} />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Header onLogout={logout} />
                  <main className="p-4 pt-20">
                    <Profile setToast={(m,t)=> setToast(m,t)} />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
