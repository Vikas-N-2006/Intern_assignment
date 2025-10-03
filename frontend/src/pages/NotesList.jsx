import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit3, Trash2, Calendar, Tag, Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { fetchNotes, deleteNote } from '../lib/notesApi';
import NoteEditor from '../components/NoteEditor';

export default function NotesList({ setToast }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterTag, setFilterTag] = useState('');

  const debounceRef = useRef();

  const loadNotes = async (q = '', tag = '') => {
    setLoading(true);
    try {
      const res = await fetchNotes({ 
        q, 
        limit: 50, 
        sort: `${sortBy}:${sortOrder}`,
        tag: tag || undefined // Only send tag if it's not empty
      });
      setNotes(res.data.notes || []);
    } catch (err) {
      setToast(err.response?.data?.error || 'Failed to load notes', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    loadNotes();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadNotes(query, filterTag);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, filterTag]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note? This action cannot be undone.')) return;
    try {
      await deleteNote(id);
      setToast('Note deleted successfully', 'success');
      setNotes((s) => s.filter(n => n._id !== id));
    } catch (err) {
      setToast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setOpenEditor(true);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setOpenEditor(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAllTags = () => {
    const tags = new Set();
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const getNotesStats = () => {
    const totalNotes = notes.length;
    const totalTags = getAllTags().length;
    const recentNotes = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return noteDate > weekAgo;
    }).length;
    
    return { totalNotes, totalTags, recentNotes };
  };

  const stats = getNotesStats();
  const allTags = getAllTags();

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

  return (
    <motion.div 
      className="max-w-7xl mx-auto p-6 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div className="text-center space-y-4" variants={itemVariants}>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">My Notes</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Organize your thoughts and ideas</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={itemVariants}>
        <div className="card-modern p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Grid className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalNotes}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Notes</p>
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.recentNotes}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">This Week</p>
            </div>
          </div>
        </div>
        
        <div className="card-modern p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTags}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tags</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Controls */}
      <motion.div className="card-modern p-6" variants={itemVariants}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes by title or content..."
                className="input-modern pl-12 pr-4 w-full"
              />
            </div>
          </div>

          {/* Filter by tags */}
          <div className="flex flex-wrap gap-3 lg:flex-nowrap lg:gap-4">
            <div className="relative">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="input-modern pr-10 min-w-[140px] appearance-none cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {tag}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-modern pr-10 min-w-[120px] appearance-none cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="createdAt" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Date</option>
                <option value="title" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Title</option>
                <option value="updatedAt" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Modified</option>
              </select>
              
              <motion.button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn-ghost px-3 py-2 min-w-[44px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </motion.button>
            </div>

            {/* View mode toggle */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Create note button */}
            <motion.button
              onClick={handleCreateNote}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              New Note
            </motion.button>
          </div>
        </div>

        {/* Active filters display */}
        {(query || filterTag) && (
          <motion.div 
            className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
            
            {query && (
              <motion.span 
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                Search: "{query}"
                <button 
                  onClick={() => setQuery('')}
                  className="text-blue-600/70 hover:text-blue-600 dark:text-blue-400/70 dark:hover:text-blue-400"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.span>
            )}
            
            {filterTag && (
              <motion.span 
                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Tag className="w-3 h-3" />
                Tag: {filterTag}
                <button 
                  onClick={() => setFilterTag('')}
                  className="text-purple-600/70 hover:text-purple-600 dark:text-purple-400/70 dark:hover:text-purple-400"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.span>
            )}
            
            <motion.button
              onClick={() => {
                setQuery('');
                setFilterTag('');
              }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear all
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Notes Grid/List */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-modern p-6 space-y-4">
                <div className="skeleton h-6 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
                <div className="flex gap-2">
                  <div className="skeleton h-8 w-16" />
                  <div className="skeleton h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {query || filterTag ? 'No matching notes found' : 'No notes yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {query || filterTag 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first note to get started organizing your thoughts'
              }
            </p>
            <motion.button
              onClick={handleCreateNote}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Note
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
            layout
          >
            <AnimatePresence>
              {notes.map((note, index) => (
                <motion.div
                  key={note._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className={`card-modern card-hover p-6 group ${
                    viewMode === 'list' ? 'flex items-center gap-6' : ''
                  }`}
                >
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {note.title || 'Untitled Note'}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg whitespace-nowrap ml-2">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                      {note.content?.slice(0, 200) || 'No content'}
                      {note.content?.length > 200 && '...'}
                    </p>
                    
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-lg"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            +{note.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex gap-2 ${
                    viewMode === 'list' ? 'flex-col' : 'justify-end'
                  }`}>
                    <motion.button
                      onClick={() => handleEditNote(note)}
                      className="btn-ghost px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit3 className="w-4 h-4" />
                      {viewMode === 'list' && <span className="ml-2">Edit</span>}
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(note._id)}
                      className="btn-ghost px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      {viewMode === 'list' && <span className="ml-2">Delete</span>}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Note Editor Modal */}
      <AnimatePresence>
        {openEditor && (
          <NoteEditor
            note={editingNote}
            onClose={() => {
              setOpenEditor(false);
              setEditingNote(null);
              loadNotes(query, filterTag);
            }}
            setToast={setToast}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}