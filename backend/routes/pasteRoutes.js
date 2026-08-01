const express = require('express');
const router = express.Router();
const pasteController = require('../controllers/pasteController');
const { optionalAuthToken } = require('../middleware/authMiddleware');

// POST /api/pastes - Create a new paste snippet
router.post('/', optionalAuthToken, pasteController.createPaste);

// GET /api/pastes - Retrieve list of all pastes for history dashboard
router.get('/', optionalAuthToken, pasteController.getAllPastes);

// GET /api/pastes/:paste_code - Retrieve a single paste by unique paste_code
router.get('/:paste_code', optionalAuthToken, pasteController.getPasteByCode);

// PUT /api/pastes/:paste_code - Update an existing paste by unique paste_code
router.put('/:paste_code', optionalAuthToken, pasteController.updatePaste);

// DELETE /api/pastes/:paste_code - Delete a paste by unique paste_code
router.delete('/:paste_code', optionalAuthToken, pasteController.deletePaste);

module.exports = router;
