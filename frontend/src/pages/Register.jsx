import { useForm } from 'react-hook-form';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async data => {
    try {
      const res = await api.post('/auth/register', data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md p-6 border rounded">
        <h2 className="text-2xl mb-4">Register</h2>
        <input {...register('name', { required: true })} placeholder="Name" className="block w-full mb-2 p-2 border"/>
        {errors.name && <p className="text-red-500">Name required</p>}

        <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} placeholder="Email" className="block w-full mb-2 p-2 border"/>
        {errors.email && <p className="text-red-500">Valid email required</p>}

        <input type="password" {...register('password', { required: true, minLength: 6 })} placeholder="Password" className="block w-full mb-2 p-2 border"/>
        {errors.password && <p className="text-red-500">Password must be 6+ chars</p>}

        <button className="mt-3 w-full p-2 bg-blue-600 text-white rounded">Register</button>
      </form>
    </div>
  );
}