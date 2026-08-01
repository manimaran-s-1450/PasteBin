const express = require('express');
const router = express.Router();
const pasteController = require('../controllers/pasteController');
const { authenticateToken, optionalAuthToken } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/pastes:
 *   post:
 *     summary: Create a new paste
 *     description: Creates a new paste snippet associated with the authenticated user.
 *     tags:
 *       - Pastes
 */
router.post('/', optionalAuthToken, pasteController.createPaste);

/**
 * @openapi
 * /api/pastes/my:
 *   get:
 *     summary: Get user's own pastes
 *     description: Returns only the authenticated user's created pastes.
 *     tags:
 *       - Pastes
 */
router.get('/my', authenticateToken, pasteController.getMyPastes);

/**
 * @openapi
 * /api/pastes/received:
 *   get:
 *     summary: Get user's received pastes
 *     description: Returns history of pastes viewed/received by the authenticated user.
 *     tags:
 *       - Pastes
 */
router.get('/received', authenticateToken, pasteController.getReceivedPastes);

/**
 * @openapi
 * /api/pastes:
 *   get:
 *     summary: Get all public pastes (history)
 *     tags:
 *       - Pastes
 */
router.get('/', optionalAuthToken, pasteController.getAllPastes);

/**
 * @openapi
 * /api/pastes/{paste_code}:
 *   get:
 *     summary: Get paste by code
 *     tags:
 *       - Pastes
 */
router.get('/:paste_code', optionalAuthToken, pasteController.getPasteByCode);

/**
 * @openapi
 * /api/pastes/{paste_code}:
 *   put:
 *     summary: Update paste by code (Owner Only)
 *     tags:
 *       - Pastes
 */
router.put('/:paste_code', authenticateToken, pasteController.updatePaste);

/**
 * @openapi
 * /api/pastes/{paste_code}:
 *   delete:
 *     summary: Delete paste by code (Owner Only)
 *     tags:
 *       - Pastes
 */
router.delete('/:paste_code', authenticateToken, pasteController.deletePaste);

module.exports = router;
