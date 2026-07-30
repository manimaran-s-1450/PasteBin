const express = require('express');
const router = express.Router();
const pasteController = require('../controllers/pasteController');

/**
 * @openapi
 * components:
 *   schemas:
 *     Paste:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 6
 *         paste_code:
 *           type: string
 *           example: gt5wAqfI
 *         title:
 *           type: string
 *           nullable: true
 *           example: SQL Notes
 *         language:
 *           type: string
 *           example: SQL
 *         content:
 *           type: string
 *           example: SELECT * FROM users;
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2026-07-30T18:16:43.000Z
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Paste not found
 */

/**
 * @openapi
 * /api/pastes:
 *   post:
 *     summary: Create a new paste
 *     description: Creates a new text or code snippet in the database and generates a unique 8-character paste code.
 *     tags:
 *       - Pastes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: SQL Notes
 *               language:
 *                 type: string
 *                 example: SQL
 *               content:
 *                 type: string
 *                 example: SELECT * FROM users;
 *     responses:
 *       201:
 *         description: Paste created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Paste created successfully
 *               data:
 *                 id: 6
 *                 paste_code: gt5wAqfI
 *                 title: SQL Notes
 *                 language: SQL
 *                 content: SELECT * FROM users;
 *                 created_at: "2026-07-30T18:16:43.000Z"
 *       400:
 *         description: Validation error - missing or empty content
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation Error - "content" is required and cannot be empty.
 */
router.post('/', pasteController.createPaste);

/**
 * @openapi
 * /api/pastes:
 *   get:
 *     summary: Get all pastes (history)
 *     description: Returns a history list of all pastes ordered by newest first (excluding content column).
 *     tags:
 *       - Pastes
 *     responses:
 *       200:
 *         description: History list retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: 6
 *                   paste_code: gt5wAqfI
 *                   title: SQL Notes
 *                   language: SQL
 *                   created_at: "2026-07-30T18:16:43.000Z"
 *                 - id: 5
 *                   paste_code: AbX12Klm
 *                   title: HTML Basics
 *                   language: HTML
 *                   created_at: "2026-07-30T18:10:00.000Z"
 */
router.get('/', pasteController.getAllPastes);

/**
 * @openapi
 * /api/pastes/{paste_code}:
 *   get:
 *     summary: Get paste by code
 *     description: Retrieves complete details of a paste snippet by its unique 8-character paste_code.
 *     tags:
 *       - Pastes
 *     parameters:
 *       - in: path
 *         name: paste_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique 8-character paste code
 *         example: gt5wAqfI
 *     responses:
 *       200:
 *         description: Paste retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 6
 *                 paste_code: gt5wAqfI
 *                 title: SQL Notes
 *                 language: SQL
 *                 content: SELECT * FROM users;
 *                 created_at: "2026-07-30T18:16:43.000Z"
 *       404:
 *         description: Paste not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Paste not found
 */
router.get('/:paste_code', pasteController.getPasteByCode);

/**
 * @openapi
 * /api/pastes/{paste_code}:
 *   put:
 *     summary: Update paste by code
 *     description: Updates title, language, and content of an existing paste by its unique 8-character paste_code.
 *     tags:
 *       - Pastes
 *     parameters:
 *       - in: path
 *         name: paste_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique 8-character paste code
 *         example: gt5wAqfI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated SQL Notes
 *               language:
 *                 type: string
 *                 example: SQL
 *               content:
 *                 type: string
 *                 example: SELECT name FROM users;
 *     responses:
 *       200:
 *         description: Paste updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Paste updated successfully
 *               data:
 *                 id: 6
 *                 paste_code: gt5wAqfI
 *                 title: Updated SQL Notes
 *                 language: SQL
 *                 content: SELECT name FROM users;
 *                 created_at: "2026-07-30T18:16:43.000Z"
 *       400:
 *         description: Validation error - missing or empty content
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation Error - "content" is required and cannot be empty.
 *       404:
 *         description: Paste not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Paste not found
 */
router.put('/:paste_code', pasteController.updatePaste);

/**
 * @openapi
 * /api/pastes/{paste_code}:
 *   delete:
 *     summary: Delete paste by code
 *     description: Deletes an existing paste from the database by its unique 8-character paste_code.
 *     tags:
 *       - Pastes
 *     parameters:
 *       - in: path
 *         name: paste_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique 8-character paste code
 *         example: gt5wAqfI
 *     responses:
 *       200:
 *         description: Paste deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Paste deleted successfully
 *       404:
 *         description: Paste not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Paste not found
 */
router.delete('/:paste_code', pasteController.deletePaste);

module.exports = router;
