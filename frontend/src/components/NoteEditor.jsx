import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Save, FileText, Tag, Type, AlignLeft, Sparkles, Hash } from 'lucide-react';
import { createNote, updateNote } from '../lib/notesApi';

export default function NoteEditor({ note, onClose, setToast }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      tags: (note?.tags || []).join(', ')
    }
  });

  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form: 1 = Basic Info, 2 = Tags
  const [isClosing, setIsClosing] = useState(false);

  const watchedFields = watch();
  const [tagInput, setTagInput] = useState((note?.tags || []).join(', '));

  // Refs for form elements
  const titleInputRef = useRef(null);
  const contentTextareaRef = useRef(null);
  const tagsInputRef = useRef(null);
  const formRef = useRef(null);

  // Common tags for suggestions
  const commonTags = ['work', 'personal', 'ideas', 'todo', 'important', 'meeting', 'project', 'research', 'inspiration', 'draft'];

  useEffect(() => {
    setValue('tags', tagInput);
  }, [tagInput, setValue]);

  // Handle Enter key press in step 1
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (step === 1 && e.key === 'Enter') {
        // Check if we're in title or content field and handle accordingly
        const activeElement = document.activeElement;
        
        if (activeElement === titleInputRef.current) {
          e.preventDefault();
          handleContinueToTags();
        } else if (activeElement === contentTextareaRef.current && e.ctrlKey) {
          // Ctrl+Enter in content field also goes to next step
          e.preventDefault();
          handleContinueToTags();
        }
      } else if (step === 2 && e.key === 'Enter' && !showTagSuggestions) {
        // Enter in step 2 submits the form, but only if suggestions aren't open
        const activeElement = document.activeElement;
        
        if (activeElement === tagsInputRef.current || activeElement === formRef.current) {
          e.preventDefault();
          handleSubmit(onSubmit)();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [step, showTagSuggestions, watchedFields.title]);

  // Close tag suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showTagSuggestions && 
          tagsInputRef.current && 
          !tagsInputRef.current.contains(e.target) &&
          !e.target.closest('.tag-suggestions-container')) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagSuggestions]);

  const onSubmit = async (data) => {
    try {
      const payload = { 
        title: data.title, 
        content: data.content, 
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean) 
      };
      
      if (note) {
        await updateNote(note._id, payload);
        setToast('Note updated successfully! ✨', 'success');
      } else {
        await createNote(payload);
        setToast('Note created successfully! 🎉', 'success');
      }
      handleClose();
    } catch (err) {
      setToast(err.response?.data?.error || 'Save failed', 'error');
    }
  };

  const handleContinueToTags = () => {
    if (watchedFields.title?.trim()) {
      setStep(2);
      // Focus on tags input when moving to step 2
      setTimeout(() => {
        if (tagsInputRef.current) {
          tagsInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const addTag = (tag) => {
    const currentTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setTagInput(newTags);
    }
    setShowTagSuggestions(false);
    
    // Refocus on tags input after adding a tag
    setTimeout(() => {
      if (tagsInputRef.current) {
        tagsInputRef.current.focus();
      }
    }, 50);
  };

  const removeTag = (tagToRemove) => {
    const currentTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    const newTags = currentTags.filter(tag => tag !== tagToRemove).join(', ');
    setTagInput(newTags);
  };

  const getCurrentTags = () => {
    return tagInput.split(',').map(t => t.trim()).filter(Boolean);
  };

  const getProgress = () => {
    let progress = 0;
    if (watchedFields.title?.trim()) progress += 33;
    if (watchedFields.content?.trim()) progress += 34;
    if (watchedFields.tags?.trim()) progress += 33;
    return progress;
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
          // Close tag suggestions when clicking anywhere on the overlay in step 2
          if (step === 2 && showTagSuggestions) {
            setShowTagSuggestions(false);
          }
        }}
      >
        <motion.div 
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700"
          variants={modalVariants}
          initial="hidden"
          animate={isClosing ? "exit" : "visible"}
          exit="exit"
        >
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-b border-slate-200 dark:border-slate-700"
            variants={itemVariants}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {note ? 'Edit Note' : 'Create New Note'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Step {step} of 2: {step === 1 ? 'Note Content' : 'Tags & Organization'}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={handleClose}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </motion.div>

          {/* Progress Bar */}
          <motion.div className="px-6 pt-4" variants={itemVariants}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Progress: {Math.round(getProgress())}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgress()}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* Form */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto"
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Title Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Type className="w-4 h-4" />
                      Note Title
                    </label>
                    <div className="relative">
                      <input
                        {...register('title', { 
                          required: 'Title is required',
                          maxLength: {
                            value: 100,
                            message: 'Title must be less than 100 characters'
                          }
                        })}
                        ref={(e) => {
                          titleInputRef.current = e;
                          register('title').ref(e);
                        }}
                        placeholder="Enter a descriptive title for your note... (Press Enter to continue)"
                        className="input-modern w-full"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleContinueToTags();
                          }
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        {watchedFields.title?.length || 0}/100
                      </div>
                    </div>
                    {errors.title && (
                      <motion.p 
                        className="text-red-500 text-sm flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="w-4 h-4 text-red-500">⚠</span>
                        {errors.title.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Content Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <AlignLeft className="w-4 h-4" />
                      Note Content
                    </label>
                    <div className="relative">
                      <textarea
                        {...register('content', {
                          maxLength: {
                            value: 5000,
                            message: 'Content must be less than 5000 characters'
                          }
                        })}
                        ref={(e) => {
                          contentTextareaRef.current = e;
                          register('content').ref(e);
                        }}
                        rows={12}
                        placeholder="Write your note content here... \n\nYou can use this space to jot down ideas, create lists, draft thoughts, or write detailed notes. Organize your content however works best for you! \n\nPress Ctrl+Enter to jump to tags."
                        className="input-modern w-full resize-none"
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-slate-400">
                        {watchedFields.content?.length || 0}/5000
                      </div>
                    </div>
                    {errors.content && (
                      <motion.p 
                        className="text-red-500 text-sm flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <span className="w-4 h-4 text-red-500">⚠</span>
                        {errors.content.message}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Tags Section */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Hash className="w-4 h-4" />
                      Tags
                    </label>
                    
                    {/* Current Tags Display */}
                    {getCurrentTags().length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {getCurrentTags().map((tag, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl text-sm"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-primary-600/70 hover:text-primary-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    )}
                    
                    {/* Tag Input */}
                    <div className="relative">
                      <input
                        value={tagInput}
                        ref={tagsInputRef}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setShowTagSuggestions(false);
                        }}
                        onFocus={() => setShowTagSuggestions(true)}
                        placeholder="Add tags separated by commas (e.g., work, important, meeting)... (Press Enter to save)"
                        className="input-modern w-full"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !showTagSuggestions) {
                            e.preventDefault();
                            handleSubmit(onSubmit)();
                          }
                        }}
                      />
                      
                      {/* Tag Suggestions */}
                      <AnimatePresence>
                        {showTagSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="tag-suggestions-container absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-10"
                          >
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Popular tags:</p>
                            <div className="flex flex-wrap gap-2">
                              {commonTags.filter(tag => !getCurrentTags().includes(tag)).map((tag) => (
                                <motion.button
                                  key={tag}
                                  type="button"
                                  onClick={() => addTag(tag)}
                                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {tag}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tags help you organize and find your notes easily. Separate multiple tags with commas. Press Enter to save.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700"
              variants={itemVariants}
            >
              {step < 2 ? (
                <>
                  <motion.button
                    type="button"
                    onClick={handleContinueToTags}
                    disabled={!watchedFields.title?.trim()}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue to Tags →
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    className="btn-ghost px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !watchedFields.title?.trim()}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        {note ? 'Update Note' : 'Create Note'}
                      </div>
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="btn-ghost px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    className="btn-ghost px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </>
              )}
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}