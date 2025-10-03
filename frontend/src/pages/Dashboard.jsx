export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div>
      <header className="p-4 border-b flex justify-between">
        <h1>Dashboard</h1>
        <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
      </header>
      <main className="p-4">
        <h2>Welcome, {user?.name || 'User'}</h2>
        <p>This is your dashboard — notes/tasks CRUD will go here.</p>
      </main>
    </div>
  );
}