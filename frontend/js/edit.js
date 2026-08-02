/**
 * Controller for Editing a Paste (edit.html)
 * Loads existing paste data, enables interactive editing, and updates LocalStorage.
 */

const HISTORY_STORAGE_KEY = 'pastebin_history_pastes_v1';

let pastesState = [];
let currentEditPaste = null;

function initEditPage() {
  loadPastesFromStorage();
  initVisibilitySelector();
  initLanguageSelector();
  initCodeEditorLineNumbers();
  initEditForm();
  processEditUrlParams();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditPage);
} else {
  initEditPage();
}

/**
 * Load Pastes Data
 */
function loadPastesFromStorage() {
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (stored) {
    try {
      pastesState = JSON.parse(stored);
    } catch (e) {
      pastesState = [];
    }
  }
}

/**
 * Save Pastes Data
 */
function savePastesToStorage() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(pastesState));
}

/**
 * Process URL Query Parameters or Fallback to Pre-filled Sample Data
 */
async function processEditUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const codeParam = params.get('code') || params.get('id');

  if (codeParam) {
    const searchKey = codeParam.trim();
    try {
      // Real API GET request to Express + MySQL backend
      const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000/api'
        : 'https://pastebin-production-6477.up.railway.app/api';

      const token = localStorage.getItem('pastebin_jwt_token_v1');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${getApiBaseUrl()}/pastes/${encodeURIComponent(searchKey)}`, { headers });
      const resData = await response.json();

      if (resData && resData.success && resData.data) {
        const pData = resData.data;

        // === OWNERSHIP GUARD ===
        // If a token exists, decode its user_id and compare with the paste's user_id
        if (token) {
          try {
            const userProfile = JSON.parse(localStorage.getItem('pastebin_user_profile_v1') || '{}');
            const myUserId = userProfile.id || userProfile.user_id || userProfile.userId;
            const pasteOwnerId = pData.user_id;

            if (pasteOwnerId && myUserId && String(pasteOwnerId) !== String(myUserId)) {
              showEditAccessDenied(pData.title || 'this paste', searchKey);
              return;
            }
          } catch (jwtErr) {
            console.warn('[Edit Ownership Check]:', jwtErr);
          }
        } else {
          // Guest user: check if they created this paste in session
          try {
            const guestCreated = sessionStorage.getItem('pastebin_guest_created_v1');
            const guestList = guestCreated ? JSON.parse(guestCreated) : [];
            const ownsPaste = guestList.some(p => 
              String(p.code || p.paste_code) === String(searchKey) ||
              String(p.id) === String(searchKey)
            );
            if (!ownsPaste && pData.user_id) {
              // Paste belongs to a registered user; guest can't edit
              showEditAccessDenied(pData.title || 'this paste', searchKey);
              return;
            }
          } catch (e) {}
        }

        currentEditPaste = {
          id: pData.id,
          code: pData.paste_code || searchKey,
          title: pData.title || '',
          language: pData.language || 'JavaScript',
          visibility: pData.visibility || 'public',
          expiresIn: pData.expires_at || 'never',
          content: pData.content || ''
        };
        populateFormFields(currentEditPaste);
        return;
      }
    } catch (err) {
      console.error('[Edit Paste API GET Error]:', err);
    }
  }

  // Fallback to empty inputs if standalone mode
  if (!currentEditPaste) {
    currentEditPaste = {
      id: '',
      code: '',
      title: '',
      language: 'JavaScript',
      visibility: 'public',
      expiresIn: 'never',
      content: ''
    };
  }

  populateFormFields(currentEditPaste);
}

/**
 * Show full-page access-denied warning when a non-owner tries to edit
 */
function showEditAccessDenied(pasteTitle, pasteCode) {
  // Disable the entire form
  const form = document.getElementById('edit-paste-form');
  if (form) {
    form.style.pointerEvents = 'none';
    form.style.opacity = '0.35';
    form.style.filter = 'blur(3px)';
  }

  const existing = document.getElementById('edit-access-denied-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'edit-access-denied-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.82); backdrop-filter: blur(12px);
    padding: 1rem;
  `;
  modal.innerHTML = `
    <div style="
      background: #0F172A;
      border: 1px solid rgba(239,68,68,0.5);
      border-radius: 28px;
      padding: 2.5rem 2rem;
      max-width: 460px;
      width: 100%;
      text-align: center;
      position: relative;
      box-shadow: 0 24px 60px rgba(0,0,0,0.9), 0 0 40px rgba(239,68,68,0.2);
      overflow: hidden;
    ">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #EF4444, #F97316, #EF4444);"></div>

      <div style="
        width: 72px; height: 72px;
        background: rgba(239,68,68,0.12);
        border: 1px solid rgba(239,68,68,0.35);
        border-radius: 20px;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 1.5rem;
        box-shadow: 0 0 30px rgba(239,68,68,0.2);
        font-size: 2rem;
      ">🔒</div>

      <h2 style="font-size: 1.45rem; font-weight: 800; color: #fff; margin: 0 0 0.65rem;">
        Edit Access Denied
      </h2>
      <p style="font-size: 0.875rem; color: #94A3B8; margin: 0 0 0.75rem; line-height: 1.65;">
        You are trying to edit <strong style="color: #C4B5FD;">"${pasteTitle}"</strong>.
      </p>
      <p style="font-size: 0.84rem; color: #64748B; margin: 0 0 2rem; line-height: 1.65;">
        Only the <strong style="color: #A78BFA;">original creator</strong> of this paste can edit or delete it.<br>
        You can <strong style="color: #60A5FA;">view</strong> and <strong style="color: #60A5FA;">copy</strong> this paste, but modifications are not permitted.
      </p>

      <div style="display: flex; gap: 0.75rem; justify-content: center;">
        <a href="view.html?code=${encodeURIComponent(pasteCode)}" style="
          flex: 1;
          padding: 0.75rem 1.25rem;
          border-radius: 14px;
          background: rgba(99,102,241,0.2);
          border: 1px solid rgba(99,102,241,0.4);
          color: #A5B4FC;
          font-weight: 700;
          font-size: 0.875rem;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          transition: all 0.2s;
        " onmouseover="this.style.background='rgba(99,102,241,0.35)'" onmouseout="this.style.background='rgba(99,102,241,0.2)'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Paste
        </a>
        <a href="history.html" style="
          flex: 1;
          padding: 0.75rem 1.25rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          border: none;
          color: #fff;
          font-weight: 700;
          font-size: 0.875rem;
          text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          box-shadow: 0 4px 18px rgba(124,58,237,0.4);
          transition: all 0.2s;
        " onmouseover="this.style.background='linear-gradient(135deg, #8B5CF6, #7C3AED)'" onmouseout="this.style.background='linear-gradient(135deg, #7C3AED, #6D28D9)'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>
          Go to History
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/**
 * Edit Form Submission, Reset, & Cancel Handlers
 */
function initEditForm() {
  const form = document.getElementById('edit-paste-form');
  const cancelBtn = document.getElementById('btn-cancel');
  const resetBtn = document.getElementById('btn-reset');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      showToast('Edit cancelled', 'info');
      setTimeout(() => {
        window.location.href = 'history.html';
      }, 500);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (currentEditPaste) {
        populateFormFields(currentEditPaste);
        showToast('Form reset to original values', 'info');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('paste-title');
      const langSelect = document.getElementById('paste-language');
      const visInput = document.getElementById('paste-visibility-input');
      const expiresSelect = document.getElementById('paste-expiration');
      const textarea = document.getElementById('paste-content');

      if (!titleInput || !textarea) return;

      const title = titleInput.value.trim() || 'Untitled Paste';
      const language = langSelect ? langSelect.value : 'JavaScript';
      const visibility = visInput ? visInput.value : 'public';
      const expiresIn = expiresSelect ? expiresSelect.value : 'never';
      const content = textarea.value;

      if (!content.trim()) {
        showToast('Code content cannot be empty', 'error');
        return;
      }

      if (currentEditPaste) {
        const codeOrId = currentEditPaste.code || currentEditPaste.id;
        const token = localStorage.getItem('pastebin_jwt_token_v1');

        if (!token) {
          // Guest User -> Save edit in sessionStorage
          try {
            const guestStored = sessionStorage.getItem('pastebin_guest_created_v1');
            let list = guestStored ? JSON.parse(guestStored) : [];
            list = list.map(item => {
              if (String(item.id) === String(codeOrId) || String(item.code) === String(codeOrId)) {
                return { ...item, title, language, visibility, expiresIn, content, updatedAt: new Date().toISOString() };
              }
              return item;
            });
            sessionStorage.setItem('pastebin_guest_created_v1', JSON.stringify(list));
            showToast('Paste updated successfully!', 'success');
            setTimeout(() => {
              window.location.href = `view.html?code=${encodeURIComponent(codeOrId)}`;
            }, 800);
            return;
          } catch (e) {
            showToast('Unable to access session storage', 'error');
            return;
          }
        }

        try {
          const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
            ? 'http://localhost:5000/api'
            : 'https://pastebin-production-6477.up.railway.app/api';
          const response = await fetch(`${getApiBaseUrl()}/pastes/${encodeURIComponent(codeOrId)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              title,
              language,
              visibility,
              expires_in: expiresIn,
              content
            })
          });
          const resData = await response.json();
          if (resData && resData.success) {
            showToast('Paste updated successfully!', 'success');
            setTimeout(() => {
              window.location.href = `view.html?code=${encodeURIComponent(codeOrId)}`;
            }, 1000);
            return;
          } else {
            showToast(resData?.message || 'Failed to update paste', 'error');
            return;
          }
        } catch (err) {
          console.error('[Edit Paste API PUT Error]:', err);
          showToast('Failed to update paste', 'error');
          return;
        }
      }

      showToast('Paste updated successfully!', 'success');
    });
  }
}

/**
 * Populate Edit Form Inputs with Paste Data
 */
function populateFormFields(paste) {
  if (!paste) return;

  const titleInput = document.getElementById('paste-title');
  const langSelect = document.getElementById('paste-language');
  const expSelect = document.getElementById('paste-expiration');
  const visInput = document.getElementById('paste-visibility-input');
  const textarea = document.getElementById('paste-content');

  if (titleInput) titleInput.value = paste.title || '';
  if (langSelect) langSelect.value = paste.language || 'JavaScript';
  if (expSelect) expSelect.value = paste.expiresIn || paste.expires_in || (paste.expires_at ? '1h' : 'never');
  if (textarea) textarea.value = paste.content || '';

  if (visInput) visInput.value = paste.visibility || 'public';

  // Update visibility cards UI
  const cards = document.querySelectorAll('.visibility-card');
  cards.forEach((card) => {
    if (card.getAttribute('data-value') === (paste.visibility || 'public')) {
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
    } else {
      card.classList.remove('selected');
      card.setAttribute('aria-checked', 'false');
    }
  });

  // Update editor header badge & line numbers
  const langBadge = document.getElementById('editor-lang-badge');
  const fileExt = document.getElementById('editor-file-ext');
  const selectedLang = paste.language || 'JavaScript';
  if (langBadge) langBadge.textContent = selectedLang;
  
  if (fileExt) {
    const extMap = { 'JavaScript': 'js', 'TypeScript': 'ts', 'Python': 'py', 'Java': 'java', 'SQL': 'sql', 'C++': 'cpp', 'HTML': 'html', 'CSS': 'css' };
    const ext = extMap[selectedLang] || 'txt';
    fileExt.textContent = `${paste.title || 'untitled'}.${ext}`;
  }

  const lineNumbersCol = document.getElementById('editor-line-numbers');
  if (textarea && lineNumbersCol) {
    const lines = (paste.content || '').split('\n');
    let numbersHtml = '';
    for (let i = 1; i <= Math.max(lines.length, 12); i++) {
      numbersHtml += `<span>${i}</span>`;
    }
    lineNumbersCol.innerHTML = numbersHtml;
  }
}

/**
 * Visibility Card Click Selector
 */
function initVisibilitySelector() {
  const cards = document.querySelectorAll('.visibility-card');
  const visInput = document.getElementById('paste-visibility-input');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      const val = card.getAttribute('data-value') || 'public';
      if (visInput) visInput.value = val;
    });
  });
}

/**
 * Language Dropdown Selection Sync
 */
function initLanguageSelector() {
  const langSelect = document.getElementById('paste-language');
  const langBadge = document.getElementById('editor-lang-badge');
  const fileExt = document.getElementById('editor-file-ext');
  const titleInput = document.getElementById('paste-title');

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      if (langBadge) langBadge.textContent = selectedLang;
      if (fileExt) {
        const title = (titleInput ? titleInput.value : '').trim() || 'untitled';
        const extMap = { 'JavaScript': 'js', 'TypeScript': 'ts', 'Python': 'py', 'Java': 'java', 'SQL': 'sql', 'C++': 'cpp', 'HTML': 'html', 'CSS': 'css' };
        const ext = extMap[selectedLang] || 'txt';
        fileExt.textContent = `${title}.${ext}`;
      }
    });
  }
}

/**
 * Code Editor Line Numbers & Character Counter
 */
function initCodeEditorLineNumbers() {
  const textarea = document.getElementById('paste-content');
  const lineNumbersCol = document.getElementById('editor-line-numbers');
  const cursorPosSpan = document.getElementById('editor-cursor-pos');
  const charCountSpan = document.getElementById('editor-char-count');

  if (!textarea) return;

  function updateEditor() {
    const text = textarea.value || '';
    const lines = text.split('\n');

    if (lineNumbersCol) {
      let numbersHtml = '';
      for (let i = 1; i <= Math.max(lines.length, 12); i++) {
        numbersHtml += `<span>${i}</span>`;
      }
      lineNumbersCol.innerHTML = numbersHtml;
    }

    if (charCountSpan) {
      charCountSpan.textContent = `${text.length} chars`;
    }

    if (cursorPosSpan) {
      const pos = textarea.selectionStart || 0;
      const textBefore = text.substring(0, pos);
      const splitLines = textBefore.split('\n');
      const line = splitLines.length;
      const col = splitLines[splitLines.length - 1].length + 1;
      cursorPosSpan.textContent = `Ln ${line}, Col ${col}`;
    }
  }

  textarea.addEventListener('input', updateEditor);
  textarea.addEventListener('keyup', updateEditor);
  textarea.addEventListener('click', updateEditor);
  updateEditor();
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  if (type === 'success') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
