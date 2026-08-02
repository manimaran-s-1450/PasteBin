/**
 * Paste History Dashboard Controller
 * Handles search, filter chips, sorting, pagination, stats recalculation,
 * custom glass delete modal, copy code, and share link actions.
 */

// Local Storage Key
const HISTORY_STORAGE_KEY = 'pastebin_history_pastes_v1';

// Initial Sample Pastes Data
const SEED_PASTES = [];

// App State
let pastesState = [];
let searchQuery = '';
let activeFilter = 'all';
let activeCategory = 'all';
let activeSort = 'newest';
let currentPage = 1;
const ITEMS_PER_PAGE = 6;
let pendingDeleteId = null;
let pendingPasteObj = null;

function isUnexpired(p) {
  const raw = p.expires_at || p.expiresAt || p.expires_in || p.expiresIn;
  if (!raw || raw === 'never' || raw === 'Never') return true;
  const expDate = new Date(raw);
  if (isNaN(expDate.getTime())) return true;
  return expDate.getTime() > Date.now();
}

/**
 * Initialize History Page Dashboard
 */
async function initHistoryDashboard() {
  await loadPastesFromStorage();
  checkUrlHashSearch();
  initSearchAndFilters();
  initGridActionListeners();
  initDeleteModal();
}

/**
 * Load Pastes Data from MySQL Express Backend API or Guest LocalStorage
 */
async function loadPastesFromStorage() {
  const token = localStorage.getItem('pastebin_jwt_token_v1');

  try {
    localStorage.removeItem('pastebin_guest_created_v1');
    localStorage.removeItem('pastebin_guest_received_v1');
    localStorage.removeItem('pastebin_local_history_v1');
  } catch (e) {}

  let combined = [];

  if (token) {
    try {
      const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000/api'
        : 'https://pastebin-production-6477.up.railway.app/api';
      
      const headers = { 'Authorization': `Bearer ${token}` };
      const [myRes, recRes] = await Promise.all([
        fetch(`${getApiBaseUrl()}/pastes/my`, { headers }).then(r => r.json()).catch(() => null),
        fetch(`${getApiBaseUrl()}/pastes/received`, { headers }).then(r => r.json()).catch(() => null)
      ]);

      if (myRes && myRes.success && Array.isArray(myRes.data)) {
        myRes.data.forEach(p => {
          combined.push({
            id: p.id,
            code: p.paste_code || String(p.id),
            title: p.title || 'Untitled Paste',
            language: p.language || 'JavaScript',
            category: 'pasted',
            expires_at: p.expires_at,
            createdAt: p.created_at || new Date().toISOString(),
            updatedAt: 'Just now',
            views: p.viewsCount || 1,
            copies: 0,
            shares: 0,
            content: p.content || ''
          });
        });
      }

      if (recRes && recRes.success && Array.isArray(recRes.data)) {
        const myCodes = new Set(combined.map(item => item.code));
        recRes.data.forEach(p => {
          const code = p.paste_code || String(p.id);
          if (!myCodes.has(code)) {
            combined.push({
              id: p.id,
              code: code,
              title: p.title || 'Untitled Paste',
              language: p.language || 'JavaScript',
              category: 'received',
              expires_at: p.expires_at,
              createdAt: p.created_at || new Date().toISOString(),
              updatedAt: 'Just now',
              views: p.viewsCount || 1,
              copies: 0,
              shares: 0,
              content: p.content || ''
            });
          }
        });
      }

      pastesState = combined.filter(isUnexpired);
      renderDashboard();
      return;
    } catch (err) {
      console.error('[History API Error]:', err);
    }
  }

  // Guest User -> Load strictly from sessionStorage history (created & received)
  try {
    const guestCreatedStr = sessionStorage.getItem('pastebin_guest_created_v1');
    const guestRecStr = sessionStorage.getItem('pastebin_guest_received_v1');

    if (guestCreatedStr) {
      const parsed = JSON.parse(guestCreatedStr);
      if (Array.isArray(parsed)) {
        parsed.forEach(p => {
          combined.push({
            id: p.id || Date.now(),
            code: p.code || p.paste_code || String(p.id),
            title: p.title || 'Untitled Paste',
            language: p.language || 'JavaScript',
            category: 'pasted',
            expires_at: p.expires_at || p.expiresAt || p.expiresIn,
            createdAt: p.createdAt || p.created_at || new Date().toISOString(),
            updatedAt: 'Just now',
            views: p.views || 1,
            copies: 0,
            shares: 0,
            content: p.content || ''
          });
        });
      }
    }

    if (guestRecStr) {
      const parsedRec = JSON.parse(guestRecStr);
      if (Array.isArray(parsedRec)) {
        const myCodes = new Set(combined.map(item => item.code));
        parsedRec.forEach(p => {
          const code = p.code || p.paste_code || String(p.id);
          if (!myCodes.has(code)) {
            combined.push({
              id: p.id || Date.now(),
              code: code,
              title: p.title || 'Untitled Paste',
              language: p.language || 'JavaScript',
              category: 'received',
              expires_at: p.expires_at || p.expiresAt || p.expiresIn,
              createdAt: p.createdAt || p.created_at || new Date().toISOString(),
              updatedAt: 'Just now',
              views: p.views || 1,
              copies: 0,
              shares: 0,
              content: p.content || ''
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Guest History Error]', e);
  }

  pastesState = combined.filter(isUnexpired);
  renderDashboard();
}

/**
 * Check if URL contains #search or query parameters
 */
function checkUrlHashSearch() {
  if (window.location.hash.includes('search')) {
    const searchInput = document.getElementById('history-search-input');
    if (searchInput) {
      setTimeout(() => {
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchInput.focus();
      }, 300);
    }
  }
}

/**
 * Render Complete Dashboard (Stats, Filtered Grid & Pagination)
 */
function renderDashboard() {
  updateStats();
  const filtered = filterAndSortPastes();
  renderGrid(filtered);
  renderPagination(filtered.length);
}

/**
 * Recalculate and update top statistics cards
 */
function updateStats() {
  const totalCountEl = document.getElementById('stat-total-count') || document.getElementById('stat-total-pastes');
  const receivedCountEl = document.getElementById('stat-received-count');
  const languagesCountEl = document.getElementById('stat-languages-count');
  const linesCountEl = document.getElementById('stat-lines-count');

  const totalPastes = pastesState.length;
  const uniqueLangs = new Set(pastesState.map(p => (p.language || '').trim()).filter(Boolean)).size;
  const totalLines = pastesState.reduce((sum, p) => {
    if (!p.content) return sum;
    return sum + p.content.split('\n').length;
  }, 0);

  if (totalCountEl) totalCountEl.textContent = totalPastes;
  if (languagesCountEl) languagesCountEl.textContent = uniqueLangs;
  if (linesCountEl) linesCountEl.textContent = totalLines;

  if (receivedCountEl) {
    const token = localStorage.getItem('pastebin_jwt_token_v1');
    if (token) {
      try {
        const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
          ? 'http://localhost:5000/api'
          : 'https://pastebin-production-6477.up.railway.app/api';
        fetch(`${getApiBaseUrl()}/pastes/received`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()).then(resData => {
          if (resData && resData.success && Array.isArray(resData.data)) {
            receivedCountEl.textContent = resData.data.length;
          }
        }).catch(() => {});
      } catch(e) {}
    } else {
      try {
        const guestRec = sessionStorage.getItem('pastebin_guest_received_v1');
        const recList = guestRec ? JSON.parse(guestRec) : [];
        receivedCountEl.textContent = recList.length;
      } catch(e) {
        receivedCountEl.textContent = 0;
      }
    }
  }
}

/**
 * Filter and Sort Pastes based on current state
 */
function filterAndSortPastes() {
  let result = [...pastesState];

  // 0. Expiration Filter
  result = result.filter(isUnexpired);

  // 1. Category Segregation Filter
  if (activeCategory !== 'all') {
    result = result.filter(p => (p.category || 'pasted').toLowerCase() === activeCategory.toLowerCase());
  }

  // 2. Search Query Filter
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(p => 
      (p.title || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q) ||
      (p.language || '').toLowerCase().includes(q) ||
      (p.content || '').toLowerCase().includes(q)
    );
  }

  // 3. Language Filter
  if (activeFilter !== 'all') {
    result = result.filter(p => p.language.toLowerCase() === activeFilter.toLowerCase());
  }

  // 4. Sorting
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

    const token = localStorage.getItem('pastebin_jwt_token_v1');
    const emptyTitleEl = emptyState.querySelector('.empty-title');
    const emptyDescEl = emptyState.querySelector('.empty-desc');

    if (!token) {
      if (emptyTitleEl) emptyTitleEl.textContent = 'No Session History';
      if (emptyDescEl) emptyDescEl.textContent = 'Your temporary paste history will appear here while this browser session is active.';
    } else {
      if (emptyTitleEl) emptyTitleEl.textContent = 'No Pastes Yet';
      if (emptyDescEl) emptyDescEl.textContent = "You haven't created any pastes yet.";
    }

    if (paginationWrapper) paginationWrapper.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  if (paginationWrapper) paginationWrapper.classList.remove('hidden');

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

        <span class="paste-type-badge ${paste.category === 'received' ? 'received-tag' : 'pasted-tag'}">${paste.category === 'received' ? 'Received' : 'Pasted'}</span>
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
          </button>

          <button type="button" class="action-btn secondary-action-btn copy-btn" data-action="copy" data-tooltip="Copy Code" aria-label="Copy Code">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>

          <button type="button" class="action-btn secondary-action-btn share-btn" data-action="share" data-tooltip="Share Link" aria-label="Share Link">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
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
  const numbersContainer = document.getElementById('pagination-numbers');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');

  if (!wrapper || !numbersContainer) return;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    wrapper.classList.add('hidden');
    return;
  }

  wrapper.classList.remove('hidden');

  let numbersHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;
    numbersHtml += `
      <button type="button" class="page-number ${isActive ? 'active' : ''}" data-page="${i}" aria-label="Page ${i}">
        ${i}
      </button>
    `;
  }
  numbersContainer.innerHTML = numbersHtml;

  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;

  numbersContainer.querySelectorAll('.page-number').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.getAttribute('data-page'), 10);
      renderDashboard();
    });
  });

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderDashboard();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderDashboard();
      }
    };
  }
}

/**
 * Filter Chips and Search Input Event Listeners
 */
function initSearchAndFilters() {
  const searchInput = document.getElementById('history-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const categoryTabs = document.querySelectorAll('.category-tab');
  const filterChips = document.querySelectorAll('.filter-chip');
  const sortSelect = document.getElementById('sort-select');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category') || 'all';
      currentPage = 1;
      renderDashboard();
    });
  });

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
    const btn = e.target.closest('button, .action-btn, [data-action]');
    if (!btn) return;

    const card = btn.closest('.paste-card');
    if (!card) return;

    const pasteId = card.getAttribute('data-id');
    const pasteCode = card.getAttribute('data-code');
    const paste = pastesState.find(p => String(p.id) === String(pasteId) || String(p.code) === String(pasteCode));

    if (!paste) return;

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
        if ((paste.category || 'pasted') === 'received') {
          showOwnerOnlyWarning('edit');
          return;
        }
        window.location.href = `edit.html?code=${encodeURIComponent(paste.code || paste.id)}`;
        break;

      case 'copy':
        copySnippetCode(paste, btn);
        break;

      case 'share':
        sharePasteLink(paste, btn);
        break;

      case 'delete':
        if ((paste.category || 'pasted') === 'received') {
          showOwnerOnlyWarning('delete');
          return;
        }
        openDeleteModal(paste);
        break;
    }
  });
}

/**
 * Show owner-only warning modal for non-owner edit/delete attempts
 */
function showOwnerOnlyWarning(action) {
  const actionLabel = action === 'edit' ? 'Edit' : 'Delete';
  const actionIcon = action === 'edit'
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

  // Remove any existing warning modal
  const existing = document.getElementById('owner-only-warning-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'owner-only-warning-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(10px);
    padding: 1rem;
  `;
  modal.innerHTML = `
    <div style="
      background: #111827;
      border: 1px solid rgba(239, 68, 68, 0.45);
      border-radius: 24px;
      padding: 2rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      position: relative;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(239,68,68,0.2);
      overflow: hidden;
    ">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #EF4444, #F97316, #EF4444);"></div>

      <div style="
        width: 56px; height: 56px;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 16px;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 1.25rem;
        box-shadow: 0 0 20px rgba(239,68,68,0.15);
      ">${actionIcon}</div>

      <h3 style="font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0 0 0.5rem;">
        ${actionLabel} Access Denied
      </h3>
      <p style="font-size: 0.83rem; color: #9CA3AF; margin: 0 0 1.5rem; line-height: 1.6;">
        You cannot <strong style="color: #F87171;">${actionLabel.toLowerCase()}</strong> this paste.<br>
        Only the <strong style="color: #C4B5FD;">original owner</strong> who created this paste has permission to ${actionLabel.toLowerCase()} or delete it.<br><br>
        You received this paste — you can view and copy it, but modifications are restricted to the creator.
      </p>

      <button id="owner-warn-ok-btn" style="
        width: 100%;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        background: linear-gradient(135deg, #7C3AED, #6D28D9);
        color: #fff;
        font-weight: 700;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(124,58,237,0.4);
        transition: all 0.2s;
      ">Got it</button>
    </div>
  `;

  document.body.appendChild(modal);

  const okBtn = document.getElementById('owner-warn-ok-btn');
  if (okBtn) {
    okBtn.addEventListener('click', () => modal.remove());
    okBtn.addEventListener('mouseenter', () => {
      okBtn.style.background = 'linear-gradient(135deg, #8B5CF6, #7C3AED)';
      okBtn.style.transform = 'translateY(-1px)';
    });
    okBtn.addEventListener('mouseleave', () => {
      okBtn.style.background = 'linear-gradient(135deg, #7C3AED, #6D28D9)';
      okBtn.style.transform = '';
    });
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  document.addEventListener('keydown', function escClose(e) {
    if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', escClose); }
  });
}

/**
 * Custom Premium Light Red Glass Modal Controller
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
  pendingDeleteId = paste.id || paste.code;
  pendingPasteObj = paste;

  const backdrop = document.getElementById('delete-modal-backdrop');
  const titleEl = document.getElementById('delete-target-title');
  const codeEl = document.getElementById('delete-target-code');

  if (titleEl) titleEl.textContent = paste.title || 'Untitled Paste';
  if (codeEl) codeEl.textContent = `#${paste.code || paste.id}`;

  if (backdrop) {
    backdrop.classList.remove('hidden');
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeDeleteModal() {
  pendingDeleteId = null;
  pendingPasteObj = null;

  const backdrop = document.getElementById('delete-modal-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Confirmed Delete Handler: Deletes paste & instantly updates History Page!
 */
async function handleConfirmDelete() {
  if (!pendingPasteObj && !pendingDeleteId) {
    closeDeleteModal();
    return;
  }

  const paste = pendingPasteObj || pastesState.find(p => String(p.id) === String(pendingDeleteId) || String(p.code) === String(pendingDeleteId));
  const deleteCode = paste ? (paste.code || paste.id) : pendingDeleteId;
  const token = localStorage.getItem('pastebin_jwt_token_v1');

  if (!token) {
    // Guest User -> Delete from sessionStorage ONLY
    pastesState = pastesState.filter(p => {
      const matchId = String(p.id) === String(deleteCode);
      const matchCode = String(p.code) === String(deleteCode);
      return !matchId && !matchCode;
    });
    try {
      sessionStorage.setItem('pastebin_guest_created_v1', JSON.stringify(pastesState));
    } catch (e) {}
  } else {
    // Authenticated User -> Delete from Railway MySQL backend
    try {
      const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000/api'
        : 'https://pastebin-production-6477.up.railway.app/api';
      
      const headers = { 'Authorization': `Bearer ${token}` };
      await fetch(`${getApiBaseUrl()}/pastes/${encodeURIComponent(deleteCode)}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.error('[History API Delete Error]:', err);
    }

    pastesState = pastesState.filter(p => {
      const matchId = String(p.id) === String(deleteCode);
      const matchCode = String(p.code) === String(deleteCode) || String(p.paste_code) === String(deleteCode);
      return !matchId && !matchCode;
    });
  }

  // Close modal, notify user & instantly re-render History page!
  closeDeleteModal();
  showToast(`Paste "${paste ? paste.title : 'item'}" deleted successfully`, 'success');
  renderDashboard();
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

    showToast('Copied share link to clipboard!', 'success');
  } catch (e) {
    showToast('Copied share link to clipboard!', 'success');
  }
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
