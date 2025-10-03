import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 p-3 rounded shadow z-50 ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
      <div className="flex items-center gap-4">
        <div>{message}</div>
        <button onClick={onClose} className="font-bold">✕</button>
      </div>
    </div>
  );
}
