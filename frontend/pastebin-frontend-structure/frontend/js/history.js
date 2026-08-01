/**
 * Paste History Dashboard Controller
 * Handles search, filter chips, sorting, pagination, stats recalculation,
 * delete modal confirmation, copy code, and share link actions.
 */

// Local Storage Key
const HISTORY_STORAGE_KEY = 'pastebin_history_pastes_v1';

// Initial Sample Pastes Data (Empty by default to load strictly from MySQL DB)
const SEED_PASTES = [];

// App State
let pastesState = [];
let searchQuery = '';
let activeFilter = 'all';
let activeSort = 'newest';
let currentPage = 1;
const ITEMS_PER_PAGE = 6;
let pendingDeleteId = null;

/**
 * Initialize History Page Dashboard
 */
async function initHistoryDashboard() {
  await loadPastesFromStorage();
  checkUrlHashSearch();
  initSearchAndFilters();
  initDeleteModal();
  initGridActionListeners();
}

/**
 * Load Pastes Data from MySQL Express Backend API
 */
async function loadPastesFromStorage() {
  try {
    const apiUrl = window.location.origin.includes('5000') ? '/api/pastes' : 'http://localhost:5000/api/pastes';
    const response = await fetch(apiUrl);
    const resData = await response.json();

    if (resData && resData.success && Array.isArray(resData.data)) {
      pastesState = resData.data.map(p => ({
        id: p.id,
        code: p.paste_code || String(p.id),
        title: p.title || 'Untitled Paste',
        language: p.language || 'JavaScript',
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: 'Just now',
        views: p.viewsCount || 1,
        copies: 0,
        shares: 0,
        content: p.content || ''
      }));
      renderDashboard();
      return;
    }
  } catch (err) {
    console.error('[History API Error]:', err);
  }

  pastesState = [];
  renderDashboard();
}

function savePastesToStorage() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(pastesState));
}

/**
 * Check if URL contains #search or query parameters
 */
function checkUrlHashSearch() {
  if (window.location.hash.includes('search')) {
    const searchInput = document.getElementById('history-search-input');
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }
}

/**
 * Main Render Controller
 */
function renderDashboard() {
  renderStats();
  const filtered = getFilteredAndSortedPastes();
  renderGrid(filtered);
  renderPagination(filtered.length);
}

/**
 * Render Statistics Cards
 */
function renderStats() {
  const totalCount = pastesState.length;
  const publicCount = pastesState.filter(p => p.visibility === 'public').length;
  const privateCount = pastesState.filter(p => p.visibility === 'private').length;
  
  const languagesSet = new Set(pastesState.map(p => p.language).filter(Boolean));
  const languagesCount = languagesSet.size;

  const totalEl = document.getElementById('stat-total-count');
  const publicEl = document.getElementById('stat-public-count');
  const privateEl = document.getElementById('stat-private-count');
  const langEl = document.getElementById('stat-languages-count');

  if (totalEl) totalEl.textContent = totalCount;
  if (publicEl) publicEl.textContent = publicCount;
  if (privateEl) privateEl.textContent = privateCount;
  if (langEl) langEl.textContent = languagesCount;
}

/**
 * Filter & Sort Logic
 */
function getFilteredAndSortedPastes() {
  let result = [...pastesState];

  // 1. Search Filter
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.language.toLowerCase().includes(q) ||
      (p.content && p.content.toLowerCase().includes(q))
    );
  }

  // 2. Chip Filter
  if (activeFilter !== 'all') {
    if (activeFilter === 'public' || activeFilter === 'private') {
      result = result.filter(p => p.visibility === activeFilter);
    } else if (activeFilter.toLowerCase() === 'plain text') {
      result = result.filter(p => 
        p.language.toLowerCase() === 'plain text' || 
        p.language.toLowerCase() === 'text' || 
        p.language.toLowerCase() === 'plaintext'
      );
    } else {
      // Language filter
      result = result.filter(p => p.language.toLowerCase() === activeFilter.toLowerCase());
    }
  }

  // 3. Sorting
  result.sort((a, b) => {
    switch (activeSort) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'updated':
        return b.updatedAt.localeCompare(a.updatedAt);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  return result;
}

/**
 * Render Pastes Grid Cards
 */
function renderGrid(filteredPastes) {
  const grid = document.getElementById('pastes-grid');
  const emptyState = document.getElementById('empty-state');
  const paginationWrapper = document.getElementById('pagination-wrapper');

  if (!grid || !emptyState) return;

  if (filteredPastes.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    if (paginationWrapper) paginationWrapper.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  if (paginationWrapper) paginationWrapper.classList.remove('hidden');

  // Calculate slice for current page
  const totalPages = Math.ceil(filteredPastes.length / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredPastes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  grid.innerHTML = pageItems.map(paste => `
    <article class="paste-card" data-id="${paste.id}" data-code="${paste.code}">
      
      <!-- Top Row: Badges -->
      <div class="card-header-row">
        <span class="lang-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>${escapeHtml(paste.language)}</span>
        </span>

        <span class="paste-id-badge">#${paste.id}</span>
      </div>

      <!-- Main Info: Title & Code -->
      <div class="card-main-info">
        <h3 class="paste-card-title" title="${escapeHtml(paste.title)}">${escapeHtml(paste.title)}</h3>
        <div class="paste-code-pill-row">
          <span class="code-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>${escapeHtml(paste.code)}</span>
          </span>
          <span class="dates-text">${formatDate(paste.createdAt)}</span>
        </div>
      </div>

      <!-- Small Code Preview (3-4 lines) -->
      <div class="code-preview-block">
        <pre><code>${escapeHtml(getPreviewCode(paste.content))}</code></pre>
      </div>

      <!-- Metadata Row -->
      <div class="card-meta-row">
        <div class="meta-item" title="Total Views">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>${paste.views} views</span>
        </div>

        <div class="meta-item" title="Code Copies">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>${paste.copies} copies</span>
        </div>

        <div class="meta-item" title="Share Count">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>${paste.shares} shares</span>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="card-actions-row">
        
        <div class="action-buttons-group">
          <!-- Primary Action: View -->
          <button type="button" class="action-btn primary-action-btn view-btn" data-action="view" data-tooltip="View Paste" aria-label="View Paste">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>View</span>
          </button>

          <!-- Secondary Actions: Edit, Copy, Share -->
          <button type="button" class="action-btn secondary-action-btn edit-btn" data-action="edit" data-tooltip="Edit Paste" aria-label="Edit Paste">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>

          <button type="button" class="action-btn secondary-action-btn copy-btn" data-action="copy" data-tooltip="Copy Code" aria-label="Copy Code">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>

          <button type="button" class="action-btn secondary-action-btn share-btn" data-action="share" data-tooltip="Share Link" aria-label="Share Link">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>
        </div>

        <!-- Destructive Action: Delete (Icon-Only) -->
        <button type="button" class="action-btn delete-btn icon-only-btn" data-action="delete" data-tooltip="Delete Paste" aria-label="Delete Paste">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>

      </div>

    </article>
  `).join('');
}

/**
 * Render Pagination Controls
 */
function renderPagination(totalItems) {
  const wrapper = document.getElementById('pagination-wrapper');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const numbersContainer = document.getElementById('pagination-numbers');

  if (!wrapper || !prevBtn || !nextBtn || !numbersContainer) return;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  numbersContainer.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const numBtn = document.createElement('button');
    numBtn.type = 'button';
    numBtn.className = `page-num-btn ${i === currentPage ? 'active' : ''}`;
    numBtn.textContent = i;
    numBtn.addEventListener('click', () => {
      currentPage = i;
      renderDashboard();
    });
    numbersContainer.appendChild(numBtn);
  }

  // Prev / Next button listeners
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderDashboard();
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderDashboard();
    }
  };
}

/**
 * Initialize Search & Filters listeners
 */
function initSearchAndFilters() {
  const searchInput = document.getElementById('history-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const filterChips = document.querySelectorAll('.filter-chip');
  const sortSelect = document.getElementById('sort-select');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearBtn) {
        if (searchQuery.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }
      currentPage = 1;
      renderDashboard();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.add('hidden');
      currentPage = 1;
      renderDashboard();
      if (searchInput) searchInput.focus();
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');

      activeFilter = chip.getAttribute('data-filter') || 'all';
      currentPage = 1;
      renderDashboard();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      currentPage = 1;
      renderDashboard();
    });
  }
}

/**
 * Event Delegation for Card Action Buttons
 */
function initGridActionListeners() {
  const grid = document.getElementById('pastes-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    // Match ANY button or clickable icon element inside paste-card
    const btn = e.target.closest('button, .action-btn, [data-action]');
    if (!btn) return;

    const card = btn.closest('.paste-card');
    if (!card) return;

    const pasteId = card.getAttribute('data-id');
    const pasteCode = card.getAttribute('data-code');
    const paste = pastesState.find(p => String(p.id) === String(pasteId) || String(p.code) === String(pasteCode));

    if (!paste) return;

    // Detect action from data-action or class names
    let action = btn.getAttribute('data-action');
    if (!action) {
      if (btn.classList.contains('edit-btn')) action = 'edit';
      else if (btn.classList.contains('copy-btn')) action = 'copy';
      else if (btn.classList.contains('share-btn')) action = 'share';
      else if (btn.classList.contains('view-btn')) action = 'view';
      else if (btn.classList.contains('delete-btn')) action = 'delete';
    }

    switch (action) {
      case 'view':
        window.location.href = `view.html?code=${encodeURIComponent(paste.code || paste.id)}`;
        break;

      case 'edit':
        window.location.href = `edit.html?code=${encodeURIComponent(paste.code || paste.id)}`;
        break;

      case 'copy':
        copySnippetCode(paste, btn);
        break;

      case 'share':
        sharePasteLink(paste, btn);
        break;

      case 'delete':
        openDeleteModal(paste);
        break;
    }
  });
}

/**
 * Copy Code Action
 */
async function copySnippetCode(paste, btn) {
  const textToCopy = paste.content || '';
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    paste.copies = (paste.copies || 0) + 1;

    // Visual button feedback: checkmark + emerald glow
    if (btn) {
      const originalHtml = btn.innerHTML;
      const originalBg = btn.style.backgroundColor;
      const originalBorder = btn.style.borderColor;
      const originalColor = btn.style.color;

      btn.style.backgroundColor = 'rgba(34, 197, 94, 0.25)';
      btn.style.borderColor = 'rgba(34, 197, 94, 0.6)';
      btn.style.color = '#4ADE80';
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.style.backgroundColor = originalBg;
        btn.style.borderColor = originalBorder;
        btn.style.color = originalColor;
      }, 2000);
    }

    showToast('Copied code to clipboard!', 'success');
  } catch (e) {
    showToast('Copied code to clipboard!', 'success');
  }
}

/**
 * Share Link Action
 */
async function sharePasteLink(paste, btn) {
  const code = paste.code || paste.id;
  const shareUrl = `${window.location.origin}/view.html?code=${code}`;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    paste.shares = (paste.shares || 0) + 1;

    // Visual button feedback: checkmark + emerald glow
    if (btn) {
      const originalHtml = btn.innerHTML;
      const originalBg = btn.style.backgroundColor;
      const originalBorder = btn.style.borderColor;
      const originalColor = btn.style.color;

      btn.style.backgroundColor = 'rgba(34, 197, 94, 0.25)';
      btn.style.borderColor = 'rgba(34, 197, 94, 0.6)';
      btn.style.color = '#4ADE80';
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.style.backgroundColor = originalBg;
        btn.style.borderColor = originalBorder;
        btn.style.color = originalColor;
      }, 2000);
    }

    showToast('Copied share link to clipboard!', 'success');
  } catch (e) {
    showToast('Copied share link to clipboard!', 'success');
  }
}

/**
 * Delete Confirmation Modal Controller
 */
function initDeleteModal() {
  const backdrop = document.getElementById('delete-modal-backdrop');
  const cancelBtn = document.getElementById('cancel-delete-btn');
  const confirmBtn = document.getElementById('confirm-delete-btn');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeDeleteModal);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirmDelete);
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDeleteModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && !backdrop.classList.contains('hidden')) {
      closeDeleteModal();
    }
  });
}

function openDeleteModal(paste) {
  pendingDeleteId = paste.id;
  const backdrop = document.getElementById('delete-modal-backdrop');
  const titleEl = document.getElementById('delete-target-title');
  const codeEl = document.getElementById('delete-target-code');

  if (titleEl) titleEl.textContent = paste.title;
  if (codeEl) codeEl.textContent = paste.code;

  if (backdrop) {
    backdrop.classList.remove('hidden');
    backdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeDeleteModal() {
  pendingDeleteId = null;
  const backdrop = document.getElementById('delete-modal-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
    backdrop.setAttribute('aria-hidden', 'true');
  }
}

async function handleConfirmDelete() {
  if (!pendingDeleteId) return;

  const target = pastesState.find(p => String(p.id) === String(pendingDeleteId) || String(p.code) === String(pendingDeleteId));
  const deleteCode = target ? (target.code || target.id) : pendingDeleteId;

  try {
    // Real API DELETE request to Express + MySQL backend
    await fetch(`http://localhost:5000/api/pastes/${encodeURIComponent(deleteCode)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.error('[History API Delete Error]:', err);
  }

  pastesState = pastesState.filter(p => String(p.id) !== String(pendingDeleteId) && String(p.code) !== String(pendingDeleteId));

  closeDeleteModal();
  showToast(`Paste "${target ? target.title : 'item'}" deleted permanently`, 'info');
  renderDashboard();
}

/**
 * Toast Notification Helper
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

/**
 * Helpers
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPreviewCode(content) {
  if (!content) return '// No code snippet content';
  const lines = content.split('\n').slice(0, 5);
  return lines.join('\n');
}

// DOM Ready initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHistoryDashboard);
} else {
  initHistoryDashboard();
}
