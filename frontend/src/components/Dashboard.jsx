import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Tag, Calendar, TrendingUp, Plus, Search, Star, Clock, BarChart3 } from 'lucide-react';
import { fetchNotes } from '../lib/notesApi';
import { Link } from 'react-router-dom';

export default function Dashboard({ setToast }) {
  const [stats, setStats] = useState({
    totalNotes: 0,
    recentNotes: 0,
    totalTags: 0,
    todayNotes: 0
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await fetchNotes({ limit: 10, sort: 'createdAt:desc' });
      const notes = res.data.notes || [];
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const todayNotes = notes.filter(note => new Date(note.createdAt) >= today).length;
      const recentNotes = notes.filter(note => new Date(note.createdAt) >= weekAgo).length;
      
      const allTags = new Set();
      notes.forEach(note => {
        note.tags?.forEach(tag => allTags.add(tag));
      });

      setStats({
        totalNotes: notes.length,
        recentNotes,
        totalTags: allTags.size,
        todayNotes
      });
      
      setRecentNotes(notes.slice(0, 5));
    } catch (err) {
      setToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffInHours = Math.floor((now - noteDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return formatDate(date);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-modern p-6 space-y-4">
              <div className="skeleton h-12 w-12 rounded-xl" />
              <div className="skeleton h-8 w-16" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
        
        {/* Recent notes skeleton */}
        <div className="card-modern p-6 space-y-4">
          <div className="skeleton h-6 w-32" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto p-6 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div className="text-center space-y-4" variants={itemVariants}>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Dashboard</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Overview of your notes and activity</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
        <motion.div 
          className="card-modern card-hover p-6 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalNotes}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Notes</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            All your notes in one place
          </div>
        </motion.div>
        
        <motion.div 
          className="card-modern card-hover p-6 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.todayNotes}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Notes created today
          </div>
        </motion.div>
        
        <motion.div 
          className="card-modern card-hover p-6 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTags}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tags</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Unique tags used
          </div>
        </motion.div>
        
        <motion.div 
          className="card-modern card-hover p-6 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.recentNotes}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">This Week</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Notes from past 7 days
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={itemVariants}>
        <Link to="/notes">
          <motion.div 
            className="card-modern p-6 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            // onClick={handleCreateNote}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Create New Note
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Start writing your thoughts
                </p>
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to="/notes">
          <motion.div 
            className="card-modern p-6 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  View All Notes
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Browse your existing notes
                </p>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Recent Notes */}
      <motion.div className="card-modern p-6" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Notes</h2>
          </div>
          <motion.button 
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            whileHover={{ scale: 1.05 }}
          >
            <Link
              to="/notes"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              View All
            </Link>
          </motion.button>
        </div>
        
        {recentNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No notes yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first note to get started</p>
            <motion.button 
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Note
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentNotes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {note.title || 'Untitled Note'}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {note.content?.slice(0, 100) || 'No content'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{note.tags.length}</span>
                    </div>
                  )}
                  <span>{getTimeAgo(note.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}