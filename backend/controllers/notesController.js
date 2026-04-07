const Note = require('../models/Note');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * GET /api/notes?q=&page=&limit=&sort=
 */
exports.getNotes = async (req, res, next) => {
  logger.info('Notes list requested', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null
  });

  try {
    const userId = req.user.id;
    const q = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortQuery = req.query.sort || '-createdAt'; // examples: '-createdAt' or 'createdAt:asc'

    // build sort object
    let sortObj = {};
    if (sortQuery.includes(':')) {
      const [field, order] = sortQuery.split(':');
      sortObj[field] = order === 'asc' ? 1 : -1;
    } else if (sortQuery.startsWith('-')) {
      sortObj[sortQuery.slice(1)] = -1;
    } else {
      sortObj[sortQuery] = 1;
    }

    const filter = { user: userId };
    let query;

    if (q) {
      // use $text if text index exists, fallback to regex
      query = Note.find({ $text: { $search: q }, ...filter }).sort(sortObj);
    } else {
      query = Note.find(filter).sort(sortObj);
    }

    const total = await Note.countDocuments(q ? { $text: { $search: q }, ...filter } : filter);
    const notes = await query.skip((page - 1) * limit).limit(limit).exec();

    logger.info('Notes list fetched', {
      userId,
      query: q || null,
      page,
      limit,
      total
    });

    res.json({ success: true, total, page, limit, notes });
  } catch (err) {
    logger.error('Failed to fetch notes', {
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
};

exports.getNoteById = async (req, res, next) => {
  logger.info('Single note requested', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null,
    noteId: req.params.id
  });

  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      logger.warn('Note not found', {
        userId: req.user?.id || null,
        noteId: req.params.id
      });
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      logger.warn('Authorization denied while reading note', {
        userId: req.user?.id || null,
        noteId: req.params.id
      });
      return res.status(403).json({ success:false, error:'Forbidden' });
    }

    res.json({ success:true, note });
  } catch (err) {
    logger.error('Failed to fetch note by id', {
      userId: req.user?.id || null,
      noteId: req.params.id,
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
};

exports.createNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Invalid payload for create note', {
      method: req.method,
      endpoint: req.originalUrl,
      userId: req.user?.id || null,
      validationErrors: errors.array()
    });
    return res.status(400).json({ success:false, errors: errors.array() });
  }

  logger.info('Creating note', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null,
    bodyKeys: Object.keys(req.body || {})
  });

  try {
    const { title, content, tags } = req.body;
    const note = new Note({
      user: req.user.id,
      title,
      content,
      tags: tags || []
    });
    await note.save();

    logger.info('Note created', {
      userId: req.user?.id || null,
      noteId: note._id.toString()
    });

    res.status(201).json({ success:true, note });
  } catch (err) {
    logger.error('Failed to create note', {
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Invalid payload for update note', {
      method: req.method,
      endpoint: req.originalUrl,
      userId: req.user?.id || null,
      noteId: req.params.id,
      validationErrors: errors.array()
    });
    return res.status(400).json({ success:false, errors: errors.array() });
  }

  logger.info('Updating note', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null,
    noteId: req.params.id,
    bodyKeys: Object.keys(req.body || {})
  });

  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      logger.warn('Note not found during update', {
        userId: req.user?.id || null,
        noteId: req.params.id
      });
      return res.status(404).json({ success:false, error:'Note not found' });
    }

    if (note.user.toString() !== req.user.id) {
      logger.warn('Authorization denied while updating note', {
        userId: req.user?.id || null,
        noteId: req.params.id
      });
      return res.status(403).json({ success:false, error:'Forbidden' });
    }

    const { title, content, tags } = req.body;
    note.title = title ?? note.title;
    note.content = content ?? note.content;
    note.tags = tags ?? note.tags;
    await note.save();

    logger.info('Note updated', {
      userId: req.user?.id || null,
      noteId: note._id.toString()
    });

    res.json({ success:true, note });
  } catch (err) {
    logger.error('Failed to update note', {
      userId: req.user?.id || null,
      noteId: req.params.id,
      error: err.message,
      stack: err.stack
    });
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  logger.info('Deleting note', {
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.user?.id || null,
    noteId: req.params.id
  });

  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!note) {
      logger.warn('Note not found or access denied during delete', {
        userId: req.user?.id || null,
        noteId: req.params.id
      });
      return res.status(404).json({ 
        success: false, 
        error: 'Note not found or access denied' 
      });
    }

    logger.info('Note deleted', {
      userId: req.user?.id || null,
      noteId: note._id.toString()
    });
    
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) { 
    logger.error('Failed to delete note', {
      userId: req.user?.id || null,
      noteId: req.params.id,
      error: err.message,
      stack: err.stack
    });
    next(err); 
  }
};
