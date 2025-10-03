import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Mail, Save, Edit3, Camera, Shield, Bell, Globe, Calendar, MapPin } from 'lucide-react';
import { getProfile, updateProfile } from '../lib/profileApi';

export default function Profile({ setToast }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);

  const watchedEmail = watch('email', '');
  const watchedName = watch('name', '');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      const userData = res.data.user;
      setProfileData(userData);
      reset(userData);
    } catch (err) {
      setToast('Failed to load profile', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await updateProfile(data);
      const updatedUser = res.data.user;
      setProfileData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setToast('Profile updated successfully! ✨', 'success');
      setIsEditing(false);
    } catch (err) {
      setToast(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile card skeleton */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6 space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="skeleton w-24 h-24 rounded-2xl" />
                <div className="skeleton h-6 w-32" />
                <div className="skeleton h-4 w-48" />
              </div>
            </div>
          </div>
          
          {/* Form skeleton */}
          <div className="lg:col-span-2">
            <div className="card-modern p-6 space-y-6">
              <div className="skeleton h-8 w-48" />
              <div className="space-y-4">
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-6xl mx-auto p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="text-center space-y-4" variants={itemVariants}>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Profile Settings</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage your account preferences</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Card */}
        <motion.div className="lg:col-span-1" variants={itemVariants}>
          <div className="card-modern p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {getInitials(profileData?.name)}
                </div>
                <motion.button
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {profileData?.name || 'User'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {profileData?.email}
                </p>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatJoinDate(profileData?.createdAt || new Date())}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Globe className="w-4 h-4" />
                <span>Active User</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>Location not set</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full ${isEditing ? 'btn-ghost' : 'btn-primary'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div className="lg:col-span-3 space-y-6" variants={itemVariants}>
          {/* Tabs */}
          <div className="card-modern p-2">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <div className="card-modern p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Profile Information</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Update your personal details and information</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    placeholder="Enter your full name"
                    className={`input-modern ${!isEditing ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed' : ''}`}
                    disabled={!isEditing}
                  />
                  {errors.name && (
                    <motion.p 
                      className="text-red-500 text-sm flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    placeholder="Enter your email address"
                    className={`input-modern ${!isEditing ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed' : ''}`}
                    disabled={!isEditing}
                  />
                  {errors.email && (
                    <motion.p 
                      className="text-red-500 text-sm flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <motion.div 
                    className="flex gap-3 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !watchedName?.trim() || !watchedEmail?.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Changes
                        </div>
                      )}
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        reset(profileData);
                      }}
                      className="btn-ghost"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card-modern p-6">
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Security Settings</h3>
                <p className="text-slate-600 dark:text-slate-400">Security features will be available in a future update</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card-modern p-6">
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Notification Preferences</h3>
                <p className="text-slate-600 dark:text-slate-400">Notification settings will be available in a future update</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
