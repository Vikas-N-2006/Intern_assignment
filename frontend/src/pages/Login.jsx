import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async data => {
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md p-6 border rounded">
        <h2 className="text-2xl mb-4">Login</h2>
        <input {...register('email', { required: true })} placeholder="Email" className="block w-full mb-2 p-2 border"/>
        <input type="password" {...register('password', { required: true })} placeholder="Password" className="block w-full mb-2 p-2 border"/>
        <button className="mt-3 w-full p-2 bg-green-600 text-white rounded">Login</button>
      </form>
    </div>
  );
}