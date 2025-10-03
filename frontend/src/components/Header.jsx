import React from 'react';
export default function Header({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="text-xl font-semibold">Scalable App</div>
      <div className="flex items-center gap-4">
        <div>{user?.name}</div>
        <button onClick={onLogout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
      </div>
    </header>
  );
}
