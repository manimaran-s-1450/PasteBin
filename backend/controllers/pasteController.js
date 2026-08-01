const pasteModel = require('../models/pasteModel');

async function createPaste(req, res, next) {
  try {
    const { title, content, language, visibility, expires_in } = req.body;
    const userId = req.user ? req.user.id : null;

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
      userId,
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

async function getPasteByCode(req, res, next) {
  try {
    const { paste_code } = req.params;
    const userId = req.user ? req.user.id : null;

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

    // If logged-in user received this paste (and it's not their own created paste), save to received_pastes
    if (userId && paste.user_id !== userId) {
      await pasteModel.addReceivedPaste(userId, paste.id);
    }

    return res.status(200).json({
      success: true,
      data: paste
    });
  } catch (error) {
    next(error);
  }
}

async function getAllPastes(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const type = req.query.type; // 'my', 'received', or undefined

    let pastes = [];
    if (type === 'received' && userId) {
      pastes = await pasteModel.getReceivedPastes(userId);
    } else if ((type === 'my' || userId) && userId) {
      pastes = await pasteModel.getPastesByUserId(userId);
    } else {
      pastes = await pasteModel.getAllPastes();
    }

    return res.status(200).json({
      success: true,
      count: pastes.length,
      data: pastes
    });
  } catch (error) {
    next(error);
  }
}

async function deletePaste(req, res, next) {
  try {
    const { paste_code } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!paste_code || typeof paste_code !== 'string' || paste_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Paste code parameter is required'
      });
    }

    // Check ownership before deleting if user is logged in
    const existing = await pasteModel.findByCode(paste_code.trim());
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Paste not found' });
    }

    if (userId && existing.user_id && existing.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Permission Denied: You can only delete your own created pastes.' });
    }

    const isDeleted = await pasteModel.deletePasteByCode(paste_code.trim(), userId);

    if (!isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Paste not found or permission denied'
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

async function updatePaste(req, res, next) {
  try {
    const { paste_code } = req.params;
    const { title, content, language } = req.body;
    const userId = req.user ? req.user.id : null;

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

    const existing = await pasteModel.findByCode(paste_code.trim());
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Paste not found' });
    }

    if (userId && existing.user_id && existing.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Permission Denied: You can only edit your own created pastes.' });
    }

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
