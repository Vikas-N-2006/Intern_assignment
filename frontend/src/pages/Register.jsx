import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Github, Chrome } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const password = watch('password', '');

  const onSubmit = async data => {
    try {
      setError('');
      const res = await api.post('/auth/register', data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Register failed');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const containerVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary-400/20 to-primary-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tr from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [-360, -180, 0]
          }}
          transition={{ 
            duration: 28,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-secondary-300/10 to-primary-300/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Glass card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-white/10">
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Join Us Today</h1>
            <p className="text-slate-600 dark:text-slate-400">Create your account to get started</p>
          </motion.div>

          <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={itemVariants}>
            {error && (
              <motion.div 
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Name field */}
            <motion.div className="relative" variants={itemVariants}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  placeholder="Enter your full name"
                  className="input-modern pl-12 pr-4"
                />
              </div>
              {errors.name && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.name.message}
                </motion.p>
              )}
            </motion.div>

            {/* Email field */}
            <motion.div className="relative" variants={itemVariants}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  placeholder="Enter your email"
                  className="input-modern pl-12 pr-4"
                />
              </div>
              {errors.email && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password field */}
            <motion.div className="relative" variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="input-modern pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <motion.div 
                  className="mt-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-slate-200 dark:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Password strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
                  </p>
                </motion.div>
              )}
              
              {errors.password && (
                <motion.p 
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </div>
              )}
            </motion.button>
          </motion.form>

          <motion.div className="mt-8 text-center" variants={itemVariants}>
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}