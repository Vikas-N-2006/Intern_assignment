import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, LogOut, User, FileText, Settings, Bell, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  // Refs for dropdowns
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicked outside
      if (
        isProfileOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      // Close mobile menu if clicked outside
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isMenuOpen]);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href) => location.pathname === href;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">NotesApp</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Professional Edition</p>
            </div>
          </motion.div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link key={item.href} to={item.href}>
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      active 
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Profile dropdown */}
            <div className="relative">
              <motion.button
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-md">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </div>
                </div>
              </motion.button>

              {/* Profile dropdown menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    ref={profileDropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {getInitials(user?.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {user?.name || 'User'}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)}>
                        <motion.div
                          className="flex items-center gap-3 p-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </motion.div>
                      </Link>
                      
                      <motion.button
                        className="flex items-center gap-3 p-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors w-full text-left"
                        whileHover={{ x: 4 }}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </motion.button>
                      
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                      
                      <motion.button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full text-left"
                        whileHover={{ x: 4 }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <motion.button
              ref={mobileMenuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-700 py-4"
            >
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link key={item.href} to={item.href} onClick={() => setIsMenuOpen(false)}>
                      <motion.div
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          active 
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}