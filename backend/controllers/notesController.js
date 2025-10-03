const Note = require('../models/Note');
const { validationResult } = require('express-validator');

/**
 * GET /api/notes?q=&page=&limit=&sort=
 */
exports.getNotes = async (req, res, next) => {
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

    res.json({ success: true, total, page, limit, notes });
  } catch (err) {
    next(err);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(403).json({ success:false, error:'Forbidden' });
    res.json({ success:true, note });
  } catch (err) { next(err); }
};

exports.createNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  try {
    const { title, content, tags } = req.body;
    const note = new Note({
      user: req.user.id,
      title,
      content,
      tags: tags || []
    });
    await note.save();
    res.status(201).json({ success:true, note });
  } catch (err) { next(err); }
};

exports.updateNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });

  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success:false, error:'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(403).json({ success:false, error:'Forbidden' });

    const { title, content, tags } = req.body;
    note.title = title ?? note.title;
    note.content = content ?? note.content;
    note.tags = tags ?? note.tags;
    await note.save();

    res.json({ success:true, note });
  } catch (err) { next(err); }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success:false, error:'Note not found' });
    if (note.user.toString() !== req.user.id) return res.status(403).json({ success:false, error:'Forbidden' });

    await note.remove();
    res.json({ success:true, message: 'Note deleted' });
  } catch (err) { next(err); }
};
