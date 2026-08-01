const pasteModel = require('../models/pasteModel');

/**
 * Controller to handle POST /api/pastes
 * Validates request payload and creates a new paste snippet associated with user_id
 */
async function createPaste(req, res, next) {
  try {
    const { title, content, language, visibility, expires_in } = req.body;
    const userId = req.user ? (req.user.id || req.user.user_id || req.user.google_id || null) : null;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: "content" is required and cannot be empty.'
      });
    }

    const formattedTitle = title && typeof title === 'string' && title.trim() !== ''
      ? title.trim()
      : null;

    const formattedLanguage = language && typeof language === 'string' && language.trim() !== ''
      ? language.trim()
      : 'Plain Text';

    const formattedVisibility = visibility && typeof visibility === 'string' && visibility.trim() !== ''
      ? visibility.trim().toLowerCase()
      : 'public';

    const newPaste = await pasteModel.createPaste({
      title: formattedTitle,
      language: formattedLanguage,
      visibility: formattedVisibility,
      expires_in,
      content: content.trim(),
      user_id: userId
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
 * Controller to handle GET /api/pastes/my
 * Retrieves ONLY the authenticated user's created pastes
 */
async function getMyPastes(req, res, next) {
  try {
    const userId = req.user ? (req.user.id || req.user.user_id || req.user.google_id) : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const pastes = await pasteModel.getUserPastes(userId);

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
 * Controller to handle GET /api/pastes/received
 * Retrieves history list of pastes received/viewed by the authenticated user
 */
async function getReceivedPastes(req, res, next) {
  try {
    const userId = req.user ? (req.user.id || req.user.user_id || req.user.google_id) : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const pastes = await pasteModel.getReceivedPastes(userId);

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
 * Controller to handle GET /api/pastes/:paste_code
 * Retrieves a paste snippet by code and records view in received_pastes if logged in
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

    // Automatically record in received_pastes if authenticated user is viewing
    const userId = req.user ? (req.user.id || req.user.user_id || req.user.google_id) : null;
    if (userId && paste.paste_code) {
      await pasteModel.recordReceivedPaste(userId, paste.paste_code);
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
 * Retrieves list of all public pastes (history fallback)
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
 * Deletes a paste snippet (verifying ownership)
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

    const result = await pasteModel.deletePasteByCode(paste_code.trim());

    if (!result.found) {
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
 * Updates an existing paste snippet (verifying ownership)
 */
async function updatePaste(req, res, next) {
  try {
    const { paste_code } = req.params;
    const { title, content, language } = req.body;
    const userId = req.user ? (req.user.id || req.user.user_id || req.user.google_id) : null;

    if (!paste_code || typeof paste_code !== 'string' || paste_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Paste code parameter is required'
      });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: "content" is required and cannot be empty.'
      });
    }

    const formattedTitle = title && typeof title === 'string' && title.trim() !== ''
      ? title.trim()
      : null;

    const formattedLanguage = language && typeof language === 'string' && language.trim() !== ''
      ? language.trim()
      : 'Plain Text';

    const result = await pasteModel.updatePasteByCode(paste_code.trim(), {
      title: formattedTitle,
      language: formattedLanguage,
      content: content.trim()
    }, userId);

    if (!result.found) {
      return res.status(404).json({
        success: false,
        message: 'Paste not found'
      });
    }

    if (!result.owner) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not own this paste.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Paste updated successfully',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPaste,
  getMyPastes,
  getReceivedPastes,
  getPasteByCode,
  getAllPastes,
  deletePaste,
  updatePaste
};
