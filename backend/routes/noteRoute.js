const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const auth = require('../middlewares/authMiddleware'); 
const notesController = require('../controllers/notesController');

router.get('/', auth, notesController.getNotes);
router.post('/', auth, [ check('title', 'Title is required').notEmpty() ], notesController.createNote);
router.get('/:id', auth, notesController.getNoteById);
router.put('/:id', auth, [ check('title', 'Title is required').notEmpty() ], notesController.updateNote);
router.delete('/:id', auth, notesController.deleteNote);

module.exports = router;