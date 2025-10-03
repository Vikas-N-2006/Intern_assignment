import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import NotesList from './pages/NotesList';
import Profile from './pages/Profile';
import ProtectedRoute from './components/protectedRoute';
import Header from './components/Header';
import Toast from './components/Toast';
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
    <BrowserRouter>
      <Toast message={toast.message} type={toast.type} onClose={() => setToastState({message:''})} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
              <Header onLogout={logout} />
              <main className="p-4">
                <NotesList setToast={(m,t)=> setToast(m,t)} />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
              <Header onLogout={logout} />
              <main className="p-4">
                <Profile setToast={(m,t)=> setToast(m,t)} />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
