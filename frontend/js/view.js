/**
 * View Paste Page Controller (view.html)
 * Premium GitHub Gist / VS Code inspired read-only code viewer, paste info card,
 * sticky statistics sidebar, action bar, related pastes, and empty state.
 */

const HISTORY_STORAGE_KEY = 'pastebin_history_pastes_v1';

// Initial Seed Pastes (Fallback if localStorage is unseeded)
const SEED_PASTES = [
  {
    id: 'p-1',
    code: 'MANINS',
    title: 'Binary Search Implementation',
    language: 'Java',
    visibility: 'public',
    createdAt: '2026-07-30T14:20:00Z',
    updatedAt: '10 mins ago',
    views: 142,
    copies: 38,
    shares: 12,
    content: `public class BinarySearch {
  /**
   * Performs binary search on a sorted integer array.
   * @param arr   Sorted array of integers
   * @param target Target value to find
   * @return Index of target if found, otherwise -1
   */
  public static int search(int[] arr, int target) {
    int low = 0;
    int high = arr.length - 1;
    
    while (low <= high) {
      int mid = low + (high - low) / 2;
      
      if (arr[mid] == target) {
        return mid; // Element found
      }
      
      if (arr[mid] < target) {
        low = mid + 1; // Search right half
      } else {
        high = mid - 1; // Search left half
      }
    }
    
    return -1; // Element not present
  }

  public static void main(String[] args) {
    int[] numbers = { 2, 5, 8, 12, 16, 23, 38, 56, 72, 91 };
    int target = 23;
    int result = search(numbers, target);
    System.out.println("Target index: " + result);
  }
}`
  },
  {
    id: 'p-2',
    code: 'PY8899',
    title: 'FastAPI User Authentication Router',
    language: 'Python',
    visibility: 'private',
    createdAt: '2026-07-29T09:15:00Z',
    updatedAt: '2 hours ago',
    views: 89,
    copies: 21,
    shares: 5,
    content: `from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    if credentials.username == "admin" and credentials.password == "secret123":
        return TokenResponse(
            access_token="jwt_secure_session_token_xyz987",
            token_type="bearer"
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials provided"
    )`
  },
  {
    id: 'p-3',
    code: 'JS2026',
    title: 'React Custom Theme Hook & Context',
    language: 'JavaScript',
    visibility: 'public',
    createdAt: '2026-07-28T18:40:00Z',
    updatedAt: '1 day ago',
    views: 310,
    copies: 95,
    shares: 28,
    content: `import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}`
  },
  {
    id: 'p-4',
    code: 'SQL772',
    title: 'PostgreSQL Analytics Aggregation Query',
    language: 'SQL',
    visibility: 'public',
    createdAt: '2026-07-27T11:00:00Z',
    updatedAt: '3 days ago',
    views: 175,
    copies: 44,
    shares: 14,
    content: `-- PostgreSQL Daily Paste Usage & Engagement Analytics
SELECT 
  DATE_TRUNC('day', created_at) AS analytics_date,
  COUNT(id) AS total_pastes_created,
  SUM(views_count) AS aggregate_views,
  SUM(copies_count) AS aggregate_copies,
  ROUND(AVG(views_count), 2) AS avg_views_per_paste
FROM pastes_repository
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY analytics_date DESC;`
  }
];

let pastesState = [];
let currentLoadedPaste = null;

function initViewPage() {
  loadPastesFromStorage();
  initFormListeners();
  initSampleChips();
  initModalListeners();
  initGlobalKeyboardShortcuts();
  processUrlParameters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initViewPage);
} else {
  initViewPage();
}

/**
 * Load Pastes Data from LocalStorage
 */
function loadPastesFromStorage() {
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (stored) {
    try {
      pastesState = JSON.parse(stored);
    } catch (e) {
      pastesState = [...SEED_PASTES];
      savePastesToStorage();
    }
  } else {
    pastesState = [...SEED_PASTES];
    savePastesToStorage();
  }
}

/**
 * Save Pastes State back to LocalStorage
 */
function savePastesToStorage() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(pastesState));
}

/**
 * Check URL Query Params (e.g. view.html?code=MANINS)
 */
function processUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code') || urlParams.get('id');

  const inputEl = document.getElementById('receive-code-input');
  const clearBtn = document.getElementById('receive-clear-btn');
  const charCounter = document.getElementById('code-char-counter');

  if (codeParam) {
    const cleanedCode = codeParam.trim();
    if (inputEl) {
      inputEl.value = cleanedCode;
      if (clearBtn) clearBtn.classList.remove('hidden');
      if (charCounter) charCounter.textContent = `${cleanedCode.length}/8`;
    }
    retrieveAndRenderPaste(cleanedCode);
  } else {
    // Start with empty input and initial prompt state (no default pre-fill)
    if (inputEl) {
      inputEl.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
      if (charCounter) charCounter.textContent = '0/8';
    }
    renderInitialState();
  }
}

/**
 * Form Submission & Input Handlers for Instant Lookup
 */
function initFormListeners() {
  const form = document.getElementById('receive-paste-form');
  const inputEl = document.getElementById('receive-code-input');
  const clearBtn = document.getElementById('receive-clear-btn');
  const resetBtn = document.getElementById('btn-reset-lookup');
  const charCounter = document.getElementById('code-char-counter');

  function updateInputState() {
    if (!inputEl) return;
    if (inputEl.value.length > 8) {
      inputEl.value = inputEl.value.slice(0, 8);
    }
    const len = inputEl.value.trim().length;
    if (len > 0) {
      if (clearBtn) clearBtn.classList.remove('hidden');
    } else {
      if (clearBtn) clearBtn.classList.add('hidden');
    }

    if (charCounter) {
      charCounter.textContent = `${len}/8`;
    }
  }

  if (inputEl) {
    inputEl.addEventListener('input', updateInputState);
    updateInputState();
  }

  const clearHandler = () => {
    if (inputEl) {
      inputEl.value = '';
      updateInputState();
      inputEl.focus();
      showToast('Cleared code input', 'info');
    }
  };

  if (clearBtn) clearBtn.addEventListener('click', clearHandler);
  if (resetBtn) resetBtn.addEventListener('click', clearHandler);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawVal = inputEl ? inputEl.value.trim() : '';
      if (!rawVal) {
        showToast('Please enter a paste code or URL', 'error');
        return;
      }

      let targetCode = rawVal;
      if (rawVal.includes('code=')) {
        targetCode = rawVal.split('code=')[1].split('&')[0];
      } else if (rawVal.includes('id=')) {
        targetCode = rawVal.split('id=')[1].split('&')[0];
      }

      const newUrl = `${window.location.pathname}?code=${encodeURIComponent(targetCode)}`;
      window.history.pushState({ code: targetCode }, '', newUrl);

      retrieveAndRenderPaste(targetCode);
    });
  }
}

/**
 * Sample Chips Click Handler
 */
function initSampleChips() {
  const chips = document.querySelectorAll('.sample-chip');
  const inputEl = document.getElementById('receive-code-input');
  const clearBtn = document.getElementById('receive-clear-btn');
  const charCounter = document.getElementById('code-char-counter');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const code = chip.getAttribute('data-code');
      if (inputEl && code) {
        inputEl.value = code;
        if (clearBtn) clearBtn.classList.remove('hidden');
        if (charCounter) charCounter.textContent = `${code.length}/6`;
        
        const newUrl = `${window.location.pathname}?code=${encodeURIComponent(code)}`;
        window.history.pushState({ code }, '', newUrl);

        retrieveAndRenderPaste(code);
      }
    });
  });
}

/**
 * Retrieve Paste from storage by code or ID
 */
async function retrieveAndRenderPaste(codeOrId) {
  const searchKey = codeOrId.trim();
  if (!searchKey) return;

  try {
    // Real API GET request to Express.js + MySQL backend
    const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
      ? 'http://localhost:5000/api'
      : 'https://pastebin-production-6477.up.railway.app/api';
    const token = localStorage.getItem('pastebin_jwt_token_v1');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${getApiBaseUrl()}/pastes/${encodeURIComponent(searchKey)}`, { headers });
    const resData = await response.json();

    if (resData && resData.success && resData.data) {
      const pData = resData.data;
      const pasteObj = {
        id: pData.id,
        code: pData.paste_code || searchKey,
        title: pData.title || 'Untitled Paste',
        language: pData.language || 'JavaScript',
        visibility: pData.visibility || 'public',
        expires_at: pData.expires_at || pData.expiresAt,
        expiresIn: pData.expiresIn || pData.expires_in,
        createdAt: pData.created_at || new Date().toISOString(),
        updatedAt: 'Just now',
        views: pData.viewsCount || 1,
        copies: 0,
        shares: 0,
        content: pData.content || ''
      };
      currentLoadedPaste = pasteObj;
      if (!token) {
        try {
          const guestRecStr = sessionStorage.getItem('pastebin_guest_received_v1');
          let list = guestRecStr ? JSON.parse(guestRecStr) : [];
          list = list.filter(item => (item.code || item.paste_code) !== pasteObj.code);
          list.unshift(pasteObj);
          sessionStorage.setItem('pastebin_guest_received_v1', JSON.stringify(list));
        } catch(e) {}
      }
      renderPasteViewerPage(pasteObj);
      showToast('Paste retrieved successfully!', 'success');
      return;
    }
  } catch (err) {
    console.error('[View Paste API Error]:', err);
  }

  // Fallback to local storage lookup if backend API fails
  const paste = pastesState.find(
    (p) => p.code.toUpperCase() === searchKey.toUpperCase() || String(p.id).toUpperCase() === searchKey.toUpperCase()
  );

  if (!paste) {
    renderEmptyState('Paste Not Found', 'The requested paste does not exist or has been removed.');
    showToast('Paste not found. Please check the code.', 'error');
    return;
  }

  currentLoadedPaste = paste;
  renderPasteViewerPage(paste);
  showToast('Paste retrieved successfully!', 'success');
}

/**
 * Render complete View Paste page:
 * Left: Info Card, Monaco Code Viewer, Actions Section, Related Pastes
 * Right: Sticky Sidebar with Statistics
 */
function renderPasteViewerPage(paste) {
  const container = document.getElementById('paste-viewer-container');
  if (!container) return;

  const contentStr = paste.content || '';
  const lines = contentStr.split('\n');
  const lineCount = lines.length;
  const charCount = contentStr.length;
  const wordCount = countWords(contentStr);
  const codeSizeStr = calculateCodeSize(contentStr);
  const readingTimeStr = calculateReadingTime(wordCount);
  const formattedCreated = formatDate(paste.createdAt);

  let formattedExpires = 'Never';
  const rawExpires = paste.expires_at || paste.expiresAt || paste.expiresIn;
  if (rawExpires && rawExpires !== 'never' && rawExpires !== 'Never') {
    const expDate = new Date(rawExpires);
    if (!isNaN(expDate.getTime())) {
      formattedExpires = expDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } else {
      formattedExpires = String(rawExpires);
    }
  }

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

  const ext = extMap[paste.language] || 'txt';
  const fileName = paste.title ? `${paste.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}` : `paste_${paste.code}.${ext}`;

  // Build Line numbers HTML
  let lineNumbersHtml = '';
  for (let i = 1; i <= Math.max(lineCount, 12); i++) {
    lineNumbersHtml += `<span>${i}</span>\n`;
  }

  const highlightedCode = highlightSyntax(contentStr, paste.language);

  // Filter 3 related pastes (excluding current)
  const relatedPastes = pastesState
    .filter((p) => p.code !== paste.code)
    .slice(0, 3);

  container.innerHTML = `
    <div class="view-page-layout-grid">
      
      <!-- LEFT COLUMN: Main Paste Content -->
      <div class="paste-main-column">
        
        <!-- 1. PASTE INFORMATION CARD -->
        <article class="paste-info-card glass-card">
          <div class="paste-info-header">
            <div class="paste-title-wrapper">
              <div class="paste-title-heading-row">
                <h2 class="paste-main-title">${escapeHtml(paste.title)}</h2>
                <span class="paste-code-badge" title="Unique Paste Code">#${escapeHtml(paste.code)}</span>
              </div>

              <!-- Badges Row -->
              <div class="paste-badges-row">
                <span class="badge-item lang-badge" title="Language">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  ${escapeHtml(paste.language)}
                </span>

                ${paste.visibility === 'private' ? `
                  <span class="badge-item private-badge" title="Visibility">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Private
                  </span>
                ` : ''}

                <span class="badge-item date-badge" title="Created Date">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  ${escapeHtml(formattedCreated)}
                </span>

                <span class="badge-item updated-badge" title="Last Updated">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Updated ${escapeHtml(paste.updatedAt || 'Recently')}
                </span>

                <span class="badge-item expiration-badge" title="Expiration Status" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: #A78BFA;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Expires: ${escapeHtml(formattedExpires)}
                </span>
              </div>
            </div>

            <!-- Stats Metrics Bar -->
            <div class="paste-stats-bar">
              <div class="stat-pill" title="Views Count">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span><strong>${paste.views}</strong> views</span>
              </div>
              <div class="stat-pill" title="Copies Count">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span><strong>${paste.copies || 0}</strong> copies</span>
              </div>
              <div class="stat-pill" title="Shares Count">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                <span><strong>${paste.shares || 0}</strong> shares</span>
              </div>
            </div>
          </div>
        </article>

        <!-- 2. CODE VIEWER (Monaco Editor inspired) -->
        <div id="monaco-code-editor" class="code-display-window monaco-theme">
          
          <!-- Sticky Toolbar -->
          <div class="viewer-toolbar">
            <div class="toolbar-left">
              <span class="toolbar-lang-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>${escapeHtml(fileName)}</span>
              </span>
              <span class="editor-mode-pill">READ ONLY</span>
            </div>

            <div class="toolbar-right">
              <button type="button" id="btn-toolbar-copy" class="tool-btn" title="Copy code" data-tooltip="Copy code">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy</span>
              </button>

              <button type="button" id="btn-toolbar-download" class="tool-btn" title="Download code file" data-tooltip="Download file">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download</span>
              </button>

              <button type="button" id="btn-toolbar-share" class="tool-btn" title="Share paste link" data-tooltip="Share link">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Share</span>
              </button>

              <button type="button" id="btn-toolbar-fullscreen" class="tool-btn icon-only-btn" title="Toggle Fullscreen" data-tooltip="Fullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Editor Body (Min height 600px, scrollable, dark theme) -->
          <div class="code-display-body">
            <div class="code-line-numbers">${lineNumbersHtml}</div>
            <pre class="code-pre-content"><code>${highlightedCode}</code></pre>
          </div>

          <!-- Bottom Editor Status Bar -->
          <div class="editor-status-footer">
            <div class="status-left">
              <span>UTF-8</span>
              <span>${escapeHtml(paste.language)}</span>
            </div>
            <div class="status-right">
              <span>${lineCount} Lines</span>
              <span>${charCount} Chars</span>
              <span>${codeSizeStr}</span>
            </div>
          </div>
        </div>

        <!-- 3. ACTION SECTION (Below Editor) -->
        <div class="paste-actions-section">
          <!-- Primary Button: Back to History -->
          <a href="history.html" class="btn btn-primary action-btn-filled">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to History</span>
          </a>

          <!-- Secondary Outline Buttons -->
          <button type="button" id="btn-action-copy" class="btn btn-outline action-btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy Code</span>
          </button>

          <button type="button" id="btn-action-download" class="btn btn-outline action-btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download</span>
          </button>

          <button type="button" id="btn-action-share" class="btn btn-outline action-btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>

          <a href="edit.html?code=${paste.code}" class="btn btn-outline action-btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </a>
        </div>

        <!-- 4. RELATED PASTES SECTION -->
        <section class="related-pastes-section">
          <div class="related-header">
            <h3 class="related-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Related Pastes</span>
            </h3>
            <span class="related-subtitle">Explore recently viewed code snippets</span>
          </div>

          <div class="related-pastes-grid">
            ${relatedPastes.map((rp) => `
              <div class="related-paste-card glass-card">
                <div class="related-card-top">
                  <span class="badge-item lang-badge">${escapeHtml(rp.language)}</span>
                  <span class="related-date">${escapeHtml(formatDate(rp.createdAt))}</span>
                </div>
                <h4 class="related-card-title">${escapeHtml(rp.title)}</h4>
                <div class="related-card-footer">
                  <span class="related-code-tag">#${escapeHtml(rp.code)}</span>
                  <button type="button" class="btn btn-outline open-related-btn" data-code="${rp.code}">
                    <span>Open</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

      </div>

      <!-- RIGHT SIDEBAR: Paste Statistics (Desktop Only, Sticky) -->
      <aside class="paste-sidebar-sticky hide-on-mobile">
        <div class="sidebar-stats-card glass-card">
          <div class="sidebar-card-header">
            <div class="sidebar-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3 class="sidebar-title">Paste Statistics</h3>
          </div>

          <div class="sidebar-divider"></div>

          <ul class="stats-list">
            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                Lines
              </span>
              <strong class="stat-value">${lineCount}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                Words
              </span>
              <strong class="stat-value">${wordCount}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                Characters
              </span>
              <strong class="stat-value">${charCount}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                Code Size
              </span>
              <strong class="stat-value">${codeSizeStr}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Est. Read Time
              </span>
              <strong class="stat-value">${readingTimeStr}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                Language
              </span>
              <strong class="stat-value lang-highlight">${escapeHtml(paste.language)}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line></svg>
                Visibility
              </span>
              <strong class="stat-value capital">${escapeHtml(paste.visibility)}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Created
              </span>
              <strong class="stat-value muted">${escapeHtml(formattedCreated)}</strong>
            </li>

            <li class="stat-item">
              <span class="stat-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"></path><path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                Updated
              </span>
              <strong class="stat-value muted">${escapeHtml(paste.updatedAt || 'Just now')}</strong>
            </li>
          </ul>

          <div class="sidebar-divider"></div>

          <div class="sidebar-quick-actions">
            <button type="button" id="btn-sidebar-copy" class="btn btn-outline full-width-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Quick Copy</span>
            </button>
          </div>
        </div>
      </aside>

    </div>
  `;

  // Attach all interaction event listeners
  attachActionListeners(paste, fileName);
}

/**
 * Attach Action Event Listeners for Toolbar, Action Bar, Sidebar & Related
 */
function attachActionListeners(paste, fileName) {
  const copyBtnToolbar = document.getElementById('btn-toolbar-copy');
  const copyBtnAction = document.getElementById('btn-action-copy');
  const copyBtnSidebar = document.getElementById('btn-sidebar-copy');

  const downloadBtnToolbar = document.getElementById('btn-toolbar-download');
  const downloadBtnAction = document.getElementById('btn-action-download');

  const shareBtnToolbar = document.getElementById('btn-toolbar-share');
  const shareBtnAction = document.getElementById('btn-action-share');

  const fullscreenBtn = document.getElementById('btn-toolbar-fullscreen');

  // Copy handler
  const executeCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(paste.content);
      }
      paste.copies = (paste.copies || 0) + 1;
      savePastesToStorage();

      showToast('Code copied to clipboard!', 'success');

      // Update button text temporarily
      [copyBtnToolbar, copyBtnAction, copyBtnSidebar].forEach((btn) => {
        if (!btn) return;
        const span = btn.querySelector('span');
        if (span) {
          const originalText = span.textContent;
          span.textContent = 'Copied!';
          setTimeout(() => span.textContent = originalText, 2000);
        }
      });
    } catch (e) {
      showToast('Failed to copy code', 'error');
    }
  };

  if (copyBtnToolbar) copyBtnToolbar.addEventListener('click', executeCopy);
  if (copyBtnAction) copyBtnAction.addEventListener('click', executeCopy);
  if (copyBtnSidebar) copyBtnSidebar.addEventListener('click', executeCopy);

  // Download handler
  const executeDownload = () => {
    try {
      const blob = new Blob([paste.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Downloaded ${fileName}`, 'success');
    } catch (e) {
      showToast('Failed to download file', 'error');
    }
  };

  if (downloadBtnToolbar) downloadBtnToolbar.addEventListener('click', executeDownload);
  if (downloadBtnAction) downloadBtnAction.addEventListener('click', executeDownload);

  // Share handler
  const executeShare = async () => {
    const shareUrl = `${window.location.origin}/view.html?code=${paste.code}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      paste.shares = (paste.shares || 0) + 1;
      savePastesToStorage();

      showToast(`Share link copied: ${shareUrl}`, 'success');
    } catch (e) {
      showToast('Failed to copy share link', 'error');
    }
  };

  if (shareBtnToolbar) shareBtnToolbar.addEventListener('click', executeShare);
  if (shareBtnAction) shareBtnAction.addEventListener('click', executeShare);

  // Fullscreen toggle handler
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      toggleEditorFullscreen();
    });
  }

  // Related pastes open buttons
  const relatedBtns = document.querySelectorAll('.open-related-btn');
  relatedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      if (code) {
        const newUrl = `${window.location.pathname}?code=${encodeURIComponent(code)}`;
        window.history.pushState({ code }, '', newUrl);
        retrieveAndRenderPaste(code);

        // Scroll to top smooth
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/**
 * Toggle Fullscreen mode for Code Editor Window
 */
function toggleEditorFullscreen() {
  const editor = document.getElementById('monaco-code-editor');
  if (!editor) return;

  editor.classList.toggle('is-fullscreen');
  const isFull = editor.classList.contains('is-fullscreen');

  if (isFull) {
    document.body.style.overflow = 'hidden';
    showToast('Press ESC to exit Fullscreen mode', 'info');
  } else {
    document.body.style.overflow = '';
  }
}

/**
 * Global Keyboard Shortcuts (e.g. ESC exits fullscreen)
 */
function initGlobalKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const editor = document.getElementById('monaco-code-editor');
      if (editor && editor.classList.contains('is-fullscreen')) {
        editor.classList.remove('is-fullscreen');
        document.body.style.overflow = '';
      }
    }
  });
}

/**
 * Modal Listeners (Raw Modal if used)
 */
function initModalListeners() {
  const modal = document.getElementById('raw-code-modal');
  const closeBtn = document.getElementById('raw-modal-close');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }
}

/**
 * Render Initial Blank Prompt State when entering Receive Paste without a code
 */
function renderInitialState() {
  const container = document.getElementById('paste-viewer-container');
  if (!container) return;

  container.innerHTML = `
    <div class="view-empty-state glass-card" style="padding: 3.5rem 2rem; text-align: center;">
      <div class="empty-state-illustration" style="margin: 0 auto 1.25rem; width: 64px; height: 64px; border-radius: 20px; background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.3); color: #A78BFA; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </div>

      <h3 class="empty-state-heading" style="font-size: 1.35rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.5rem;">
        Enter a Paste Code Above
      </h3>
      <p class="empty-state-description" style="font-size: 0.95rem; color: #94A3B8; max-width: 460px; margin: 0 auto 1.5rem; line-height: 1.6;">
        Type an 8-character unique paste code into the box above and click <strong style="color: #C084FC;">Receive Paste →</strong> to retrieve and view code snippet details.
      </p>
    </div>
  `;
}

/**
 * Render Empty State when Paste is Not Found
 */
function renderEmptyState(title, description) {
  const container = document.getElementById('paste-viewer-container');
  if (!container) return;

  container.innerHTML = `
    <div class="view-empty-state glass-card">
      <div class="empty-state-illustration">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>

      <h3 class="empty-state-heading">${escapeHtml(title || 'Paste Not Found')}</h3>
      <p class="empty-state-description">${escapeHtml(description || 'The requested paste does not exist or has been removed.')}</p>

      <div class="empty-state-buttons">
        <a href="index.html" class="btn btn-primary empty-btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Back Home</span>
        </a>

        <a href="history.html" class="btn btn-outline empty-btn-outline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Go to History</span>
        </a>
      </div>
    </div>
  `;
}

/**
 * Syntax Highlighter Helper (Tokenizes keywords, strings, comments, numbers, functions)
 */
function highlightSyntax(code, language) {
  if (!code) return '';
  let escaped = escapeHtml(code);

  const keywordsMap = {
    'JavaScript': ['const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'if', 'else', 'for', 'while', 'class', 'extends', 'async', 'await', 'try', 'catch', 'new', 'null', 'undefined', 'true', 'false'],
    'TypeScript': ['const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'extends', 'async', 'await', 'try', 'catch', 'new', 'null', 'undefined', 'true', 'false'],
    'Python': ['def', 'return', 'from', 'import', 'if', 'else', 'elif', 'for', 'while', 'class', 'try', 'except', 'with', 'as', 'None', 'True', 'False', 'in', 'is', 'not', 'and', 'or', 'lambda', 'async', 'await'],
    'Java': ['public', 'private', 'protected', 'class', 'static', 'void', 'int', 'double', 'float', 'boolean', 'String', 'return', 'if', 'else', 'while', 'for', 'new', 'this', 'super', 'import', 'package'],
    'C': ['include', 'define', 'int', 'char', 'float', 'double', 'void', 'struct', 'return', 'if', 'else', 'for', 'while', 'sizeof', 'typedef', 'const', 'static'],
    'C++': ['include', 'define', 'int', 'char', 'float', 'double', 'void', 'struct', 'class', 'public', 'private', 'protected', 'return', 'if', 'else', 'for', 'while', 'sizeof', 'typedef', 'const', 'static', 'using', 'namespace', 'std', 'vector', 'string', 'bool'],
    'SQL': ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'COUNT', 'SUM', 'AVG', 'INSERT', 'INTO', 'UPDATE', 'SET', 'DELETE', 'AS', 'DESC', 'ASC', 'AND', 'OR'],
    'HTML': ['doctype', 'html', 'head', 'body', 'div', 'span', 'header', 'footer', 'main', 'section', 'article', 'script', 'link', 'meta', 'title', 'id', 'href', 'src'],
    'CSS': ['display', 'position', 'flex', 'grid', 'color', 'background', 'border', 'margin', 'padding', 'width', 'height', 'font-family', 'box-shadow', 'root']
  };

  const keywords = keywordsMap[language] || keywordsMap['JavaScript'];

  const tokens = [];
  function addTok(cls, content) {
    tokens.push({ cls, content });
    return `___TOK_${tokens.length - 1}___`;
  }

  // 1. Match Comments
  escaped = escaped.replace(/(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/g, (m) => addTok('tok-comment', m));

  // 2. Match Strings
  escaped = escaped.replace(/(&quot;[\s\S]*?&quot;|&#039;[\s\S]*?&#039;|`[\s\S]*?`)/g, (m) => addTok('tok-string', m));

  // 3. Match Numbers
  escaped = escaped.replace(/\b(\d+)\b/g, (m) => addTok('tok-number', m));

  // 4. Match Keywords
  keywords.forEach(kw => {
    const re = new RegExp(`\\b(${kw})\\b`, 'g');
    escaped = escaped.replace(re, (m) => addTok('tok-keyword', m));
  });

  // 5. Match Functions
  escaped = escaped.replace(/\b([a-zA-Z_]\w*)(?=\()/g, (m) => addTok('tok-function', m));

  // Restore tokens safely without corrupting HTML tags
  escaped = escaped.replace(/___TOK_(\d+)___/g, (_, idx) => {
    const t = tokens[parseInt(idx, 10)];
    return t ? `<span class="${t.cls}">${t.content}</span>` : '';
  });

  return escaped;
}

/**
 * Statistics Helpers
 */
function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function calculateCodeSize(str) {
  if (!str) return '0 B';
  const bytes = new Blob([str]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function calculateReadingTime(wordCount) {
  if (!wordCount || wordCount < 50) return '< 1 min read';
  const mins = Math.ceil(wordCount / 200);
  return `${mins} min read`;
}

function formatDate(isoStr) {
  if (!isoStr) return 'Recently';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return isoStr;
  }
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
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
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
 * Utility: HTML Escape
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
