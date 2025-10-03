import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getProfile, updateProfile } from '../lib/profileApi';

export default function Profile({ setToast }) {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getProfile();
        reset(res.data.user);
      } catch (err) {
        setToast('Failed to load profile', 'error');
      } finally { setLoading(false); }
    })();
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await updateProfile(data);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToast('Profile updated', 'success');
    } catch (err) {
      setToast(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl mb-3">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('name')} placeholder="Name" className="w-full mb-2 p-2 border" />
        <input {...register('email')} placeholder="Email" className="w-full mb-2 p-2 border" />
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
