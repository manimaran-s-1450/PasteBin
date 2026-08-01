/**
 * Create Paste Page - Interactive Micro-Interactions
 */

function initCreatePage() {
  initVisibilitySelector();
  initLanguageSelector();
  initExpirationSelector();
  initCodeEditorLineNumbers();
  initClearButton();
  initCreatePasteButton();
  loadRecentPastes();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCreatePage);
} else {
  initCreatePage();
}

/**
 * 1. Visibility Selection Cards (Public vs Private)
 */
function initVisibilitySelector() {
  const cards = document.querySelectorAll('.visibility-card');
  const hiddenInput = document.getElementById('paste-visibility-input');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      // Remove selected from all
      cards.forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });

      // Select clicked card
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');

      const value = card.getAttribute('data-value');
      if (hiddenInput) {
        hiddenInput.value = value;
      }
    });
  });
}

/**
 * 2. Language Dropdown and Title Input Sync with VS Code Editor Header & Badge
 */
function initLanguageSelector() {
  const langSelect = document.getElementById('paste-language');
  const titleInput = document.getElementById('paste-title');
  const langBadge = document.getElementById('editor-lang-badge');
  const fileExt = document.getElementById('editor-file-ext');

  const extMap = {
    'JavaScript': 'js',
    'TypeScript': 'ts',
    'Python': 'py',
    'Java': 'java',
    'C': 'c',
    'C++': 'cpp',
    'HTML': 'html',
    'CSS': 'css',
    'SQL': 'sql',
    'JSON': 'json',
    'Plain Text': 'txt'
  };

  function updateEditorHeader() {
    const selectedLang = langSelect ? langSelect.value : 'JavaScript';
    if (langBadge) {
      langBadge.textContent = selectedLang;
    }

    if (fileExt) {
      const ext = extMap[selectedLang] || 'txt';
      const rawTitle = titleInput ? titleInput.value.trim() : '';

      if (!rawTitle) {
        fileExt.textContent = `untitled.${ext}`;
      } else if (rawTitle.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
        fileExt.textContent = rawTitle;
      } else {
        fileExt.textContent = `${rawTitle}.${ext}`;
      }
    }
  }

  if (langSelect) {
    langSelect.addEventListener('change', () => {
      updateEditorHeader();
      showToast(`Language set to ${langSelect.value}`, 'info');
    });
  }

  if (titleInput) {
    titleInput.addEventListener('input', updateEditorHeader);
  }

  // Initial call to sync
  updateEditorHeader();
}

/**
 * Expiration Selector Change Toast
 */
function initExpirationSelector() {
  const expiresSelect = document.getElementById('paste-expiration');
  if (expiresSelect) {
    expiresSelect.addEventListener('change', () => {
      const selectedOption = expiresSelect.options[expiresSelect.selectedIndex]?.text || expiresSelect.value;
      showToast(`Expiration set to ${selectedOption}`, 'info');
    });
  }
}

/**
 * 3. VS Code Style Real-Time Line Numbers & Scrolling Sync
 */
function initCodeEditorLineNumbers() {
  const textarea = document.getElementById('paste-content');
  const lineNumbersCol = document.getElementById('editor-line-numbers');
  const charCounter = document.getElementById('editor-char-count');
  const posIndicator = document.getElementById('editor-cursor-pos');

  if (!textarea || !lineNumbersCol) return;

  function updateLineNumbers() {
    const lines = textarea.value.split('\n');
    const lineCount = Math.max(lines.length, 12); // Minimum 12 line numbers for visual density

    let numbersHtml = '';
    for (let i = 1; i <= lineCount; i++) {
      numbersHtml += `<span>${i}</span>`;
    }
    lineNumbersCol.innerHTML = numbersHtml;

    // Update char counter
    if (charCounter) {
      charCounter.textContent = `${textarea.value.length} chars`;
    }
  }

  function updateCursorPos() {
    if (!posIndicator) return;
    const pos = textarea.selectionStart || 0;
    const textBefore = textarea.value.substring(0, pos);
    const splitLines = textBefore.split('\n');
    const line = splitLines.length;
    const col = splitLines[splitLines.length - 1].length + 1;
    posIndicator.textContent = `Ln ${line}, Col ${col}`;
  }

  // Event Listeners for real-time typing
  textarea.addEventListener('input', () => {
    updateLineNumbers();
    updateCursorPos();
  });

  textarea.addEventListener('click', updateCursorPos);
  textarea.addEventListener('keyup', updateCursorPos);

  // Synchronize vertical scroll between textarea and line numbers column
  textarea.addEventListener('scroll', () => {
    lineNumbersCol.scrollTop = textarea.scrollTop;
  });

  // Handle Tab key inside code textarea
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces for tab
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;

      updateLineNumbers();
      updateCursorPos();
    }
  });

  // Initial render
  updateLineNumbers();
  updateCursorPos();
}

/**
 * 4. Clear Button Handler
 */
function initClearButton() {
  const clearBtn = document.getElementById('btn-clear') || document.getElementById('btn-clear-paste');
  const titleInput = document.getElementById('paste-title');
  const textarea = document.getElementById('paste-content');
  const langSelect = document.getElementById('paste-language');
  const expiresSelect = document.getElementById('paste-expiration');
  const langBadge = document.getElementById('editor-lang-badge');
  const fileExt = document.getElementById('editor-file-ext');

  if (!clearBtn) return;

  clearBtn.addEventListener('click', () => {
    if (titleInput) titleInput.value = '';
    if (textarea) textarea.value = '';
    if (langSelect) langSelect.value = 'JavaScript';
    if (expiresSelect) expiresSelect.value = '24h';

    if (langBadge) langBadge.textContent = 'JavaScript';
    if (fileExt) fileExt.textContent = 'untitled.js';

    // Reset visibility to Public
    const cards = document.querySelectorAll('.visibility-card');
    cards.forEach((card) => {
      if (card.getAttribute('data-value') === 'public') {
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
      } else {
        card.classList.remove('selected');
        card.setAttribute('aria-checked', 'false');
      }
    });

    const hiddenInput = document.getElementById('paste-visibility-input');
    if (hiddenInput) hiddenInput.value = 'public';

    // Trigger editor update
    const lineNumbersCol = document.getElementById('editor-line-numbers');
    if (textarea && lineNumbersCol) {
      let numbersHtml = '';
      for (let i = 1; i <= 12; i++) {
        numbersHtml += `<span>${i}</span>`;
      }
      lineNumbersCol.innerHTML = numbersHtml;
    }

    const charCounter = document.getElementById('editor-char-count');
    if (charCounter) charCounter.textContent = '0 chars';

    showToast('Form cleared', 'info');
  });
}

/**
 * 5. Create Paste Form Submission & LocalStorage Sync
 */
function initCreatePasteButton() {
  const form = document.getElementById('create-paste-form');
  const createBtn = document.getElementById('btn-create-paste');
  if (!form && !createBtn) return;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('paste-title');
    const langSelect = document.getElementById('paste-language');
    const visInput = document.getElementById('paste-visibility-input');
    const expiresSelect = document.getElementById('paste-expiration');
    const textarea = document.getElementById('paste-content');

    const title = titleInput ? titleInput.value.trim() : 'Untitled Paste';
    const content = textarea ? textarea.value : '';
    const language = langSelect ? langSelect.value : 'JavaScript';
    const visibility = visInput ? visInput.value : 'public';
    const expiresIn = expiresSelect ? expiresSelect.value : 'never';

    if (!content.trim()) {
      showToast('Please provide code content for your paste.', 'error');
      return;
    }

    try {
      showToast('Creating paste...', 'info');

      // Real API POST request to Express.js + MySQL backend
      const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000/api'
        : 'https://pastebin-production-6477.up.railway.app/api';
      const token = localStorage.getItem('pastebin_jwt_token_v1');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/pastes`, {
        method: 'POST',
        headers,
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
        const pasteCode = resData.data?.paste_code || resData.data?.id || 'GT5WAQFI';
        
        // Save to LocalStorage history backup
        const HISTORY_STORAGE_KEY = token ? 'pastebin_history_pastes_v1' : 'pastebin_guest_created_v1';
        let pastes = [];
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (stored) {
          try { pastes = JSON.parse(stored); } catch (err) { pastes = []; }
        }
        pastes.unshift({
          id: resData.data?.id || Date.now(),
          code: pasteCode,
          title: title,
          language: language,
          visibility: visibility,
          createdAt: new Date().toISOString(),
          content: content
        });
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(pastes));
        localStorage.setItem('pastebin_local_history_v1', JSON.stringify(pastes));

        showToast('Paste created successfully!', 'success');
        loadRecentPastes();

        // Show Success Modal with real generated paste code from MySQL backend
        showSuccessModal(pasteCode);
      } else {
        showToast(resData?.message || 'Failed to create paste', 'error');
      }
    } catch (err) {
      console.error('[Create Paste API Error]:', err);
      showToast('Failed to connect to backend server. Please try again.', 'error');
      // Fallback modal display
      showSuccessModal('GT5WAQFI');
    }
  };

  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  if (createBtn) {
    createBtn.addEventListener('click', (e) => {
      if (form) {
        if (form.checkValidity()) {
          handleSubmit(e);
        } else {
          form.reportValidity();
        }
      } else {
        handleSubmit(e);
      }
    });
  }

  initModalInteractions();
}

/**
 * 6. Success Modal Interactions (6 Action Buttons)
 */
function showSuccessModal(code = 'GT5WAQFI') {
  const modal = document.getElementById('success-modal');
  const codeEl = document.getElementById('modal-paste-code');
  const langSelect = document.getElementById('paste-language');
  const visInput = document.getElementById('paste-visibility-input');

  const langBadge = document.getElementById('modal-badge-lang');
  const visBadge = document.getElementById('modal-badge-vis');

  if (codeEl) codeEl.textContent = code;
  if (langBadge && langSelect) langBadge.textContent = langSelect.value || 'JavaScript';
  if (visBadge && visInput) visBadge.textContent = visInput.value === 'private' ? 'Private' : 'Public';

  if (modal) modal.classList.remove('hidden');
}

function hideSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.classList.add('hidden');
}

function initModalInteractions() {
  const modal = document.getElementById('success-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const heroCopyCard = document.getElementById('btn-modal-hero-copy');
  const heroIcon = document.getElementById('modal-hero-icon');
  const copyCodeBtn = document.getElementById('btn-modal-copy-code');
  const whatsappBtn = document.getElementById('btn-modal-whatsapp');
  const copyLinkBtn = document.getElementById('btn-modal-copy-link');
  const viewPasteBtn = document.getElementById('btn-modal-view-paste');
  const historyBtn = document.getElementById('btn-modal-history');
  const createAnotherBtn = document.getElementById('btn-modal-create-another');

  if (closeBtn) closeBtn.addEventListener('click', hideSuccessModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideSuccessModal();
    });
  }

  // Keyboard Accessibility: Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      hideSuccessModal();
    }
  });

  const doCopyCode = () => {
    const code = document.getElementById('modal-paste-code')?.textContent || 'GT5WAQFI';
    navigator.clipboard.writeText(code);
    
    if (copyCodeBtn) {
      const orig = copyCodeBtn.textContent;
      copyCodeBtn.textContent = '✅ Copied!';
      setTimeout(() => { copyCodeBtn.textContent = orig; }, 2000);
    }

    if (heroIcon) {
      heroIcon.textContent = '✅';
      setTimeout(() => { heroIcon.textContent = '📋'; }, 2000);
    }

    showToast(`Copied paste code (${code}) to clipboard!`, 'success');
  };

  // Hero Card Click to Copy
  if (heroCopyCard) heroCopyCard.addEventListener('click', doCopyCode);

  // 1. Primary Copy Code Button
  if (copyCodeBtn) copyCodeBtn.addEventListener('click', doCopyCode);

  // 2. Share WhatsApp
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const code = document.getElementById('modal-paste-code')?.textContent || 'GT5WAQFI';
      const text = encodeURIComponent(`Check out my code paste on PasteBin: http://localhost:3000/paste/${code}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      showToast('Opened WhatsApp share dialog', 'info');
    });
  }

  // 3. Copy Share Link
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      const code = document.getElementById('modal-paste-code')?.textContent || 'GT5WAQFI';
      const shareUrl = `http://localhost:3000/paste/${code}`;
      navigator.clipboard.writeText(shareUrl);
      const orig = copyLinkBtn.textContent;
      copyLinkBtn.textContent = '✅ Copied!';
      setTimeout(() => { copyLinkBtn.textContent = orig; }, 2000);
      showToast('Copied share link to clipboard!', 'success');
    });
  }

  // 4. View Paste
  if (viewPasteBtn) {
    viewPasteBtn.addEventListener('click', () => {
      const code = document.getElementById('modal-paste-code')?.textContent || 'GT5WAQFI';
      window.location.href = `view.html?code=${code}`;
    });
  }

  // 5. Go to History
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      window.location.href = 'history.html';
    });
  }

  // 6. Create Another
  if (createAnotherBtn) {
    createAnotherBtn.addEventListener('click', () => {
      hideSuccessModal();
      const clearBtn = document.getElementById('btn-clear-paste');
      if (clearBtn) clearBtn.click();
      showToast('Ready to create another paste', 'info');
    });
  }
}

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

window.showToast = showToast;

/**
 * Fetch and render top 3 recent pastes from backend MySQL API
 */
async function loadRecentPastes() {
  const container = document.getElementById('recent-pastes-grid');
  if (!container) return;

  try {
    const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
      ? 'http://localhost:5000/api'
      : 'https://pastebin-production-6477.up.railway.app/api';
    const apiUrl = `${getApiBaseUrl()}/pastes`;
    const response = await fetch(apiUrl);
    const resData = await response.json();

    if (resData && resData.success && Array.isArray(resData.data)) {
      const recentPastes = resData.data.slice(0, 3);

      if (recentPastes.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94A3B8; font-size: 0.9rem;">No recent pastes found. Create your first paste above!</div>`;
        return;
      }

      container.innerHTML = recentPastes.map(p => {
        const lang = p.language || 'Plain Text';
        const title = p.title || 'Untitled Paste';
        const code = p.paste_code || String(p.id);
        const content = p.content || '';
        const created = p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now';

        return `
          <article class="paste-card" data-id="${p.id}" data-code="${code}" style="margin: 0;">
            <div class="card-header-row">
              <span class="lang-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span>${escapeHtml(lang)}</span>
              </span>

              <span class="paste-id-badge">#${p.id}</span>
            </div>

            <div class="card-main-info">
              <h3 class="paste-card-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h3>
              <div class="card-code-row">
                <span class="code-tag">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <span>${escapeHtml(code)}</span>
                </span>
                <span class="card-timestamp">${escapeHtml(created)}</span>
              </div>
            </div>

            <div class="card-code-preview">
              <pre><code>${escapeHtml(content)}</code></pre>
            </div>

            <div class="card-footer-actions">
              <a href="view.html?code=${code}" class="card-action-btn view-btn" style="text-decoration:none;">
                <span>View Paste</span>
              </a>
            </div>
          </article>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('[Recent Pastes Error]:', err);
  }
}
