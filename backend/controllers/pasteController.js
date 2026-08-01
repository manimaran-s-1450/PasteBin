const pasteModel = require('../models/pasteModel');

/**
 * Controller to handle POST /api/pastes
 * Validates request payload and creates a new paste snippet
 */
async function createPaste(req, res, next) {
  try {
    const { title, content, language, visibility, expires_in } = req.body;

    // Validate required content field
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: "content" is required and cannot be empty.'
      });
    }

    // Format optional title and language fields
    const formattedTitle = title && typeof title === 'string' && title.trim() !== ''
      ? title.trim()
      : null;

    const formattedLanguage = language && typeof language === 'string' && language.trim() !== ''
      ? language.trim()
      : 'Plain Text';

    const formattedVisibility = visibility && typeof visibility === 'string' && visibility.trim() !== ''
      ? visibility.trim().toLowerCase()
      : 'public';

    // Call pasteModel to insert record into MySQL database
    const newPaste = await pasteModel.createPaste({
      title: formattedTitle,
      language: formattedLanguage,
      visibility: formattedVisibility,
      expires_in,
      content: content.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Paste created successfully',
      data: newPaste
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to handle GET /api/pastes/:paste_code
 * Retrieves a paste snippet by its unique 8-character paste_code
 */
async function getPasteByCode(req, res, next) {
  try {
    const { paste_code } = req.params;

    if (!paste_code || typeof paste_code !== 'string' || paste_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Paste code parameter is required'
      });
    }

    const paste = await pasteModel.findByCode(paste_code.trim());

    if (!paste) {
      return res.status(404).json({
        success: false,
        message: 'Paste not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: paste
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to handle GET /api/pastes
 * Retrieves list of all pastes ordered by newest first (history)
 */
async function getAllPastes(req, res, next) {
  try {
    const pastes = await pasteModel.getAllPastes();

    return res.status(200).json({
      success: true,
      count: pastes.length,
      data: pastes
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to handle DELETE /api/pastes/:paste_code
 * Deletes a paste snippet by its unique 8-character paste_code
 */
async function deletePaste(req, res, next) {
  try {
    const { paste_code } = req.params;

    if (!paste_code || typeof paste_code !== 'string' || paste_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Paste code parameter is required'
      });
    }

    const isDeleted = await pasteModel.deletePasteByCode(paste_code.trim());

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Paste not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Paste deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to handle PUT /api/pastes/:paste_code
 * Updates an existing paste snippet by its unique 8-character paste_code
 */
async function updatePaste(req, res, next) {
  try {
    const { paste_code } = req.params;
    const { title, content, language } = req.body;

    // Validate paste_code param
    if (!paste_code || typeof paste_code !== 'string' || paste_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Paste code parameter is required'
      });
    }

    // Validate required content field
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: "content" is required and cannot be empty.'
      });
    }

    // Format fields with trimming
    const formattedTitle = title && typeof title === 'string' && title.trim() !== ''
      ? title.trim()
      : null;

    const formattedLanguage = language && typeof language === 'string' && language.trim() !== ''
      ? language.trim()
      : 'Plain Text';

    const updatedPaste = await pasteModel.updatePasteByCode(paste_code.trim(), {
      title: formattedTitle,
      language: formattedLanguage,
      content: content.trim()
    });

    if (!updatedPaste) {
      return res.status(404).json({
        success: false,
        message: 'Paste not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Paste updated successfully',
      data: updatedPaste
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPaste,
  getPasteByCode,
  getAllPastes,
  deletePaste,
  updatePaste
};




