/* ==========================================================================
   MASTER FRAME CONTROLLER
   Manages frame synchronization, drag resizing, theme broadcasting & audio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const splitter = document.getElementById('frameSplitter');
  const leftWrapper = document.getElementById('frameLeftWrapper');
  const rightIframe = document.getElementById('rightBookFrame');
  const leftIframe = document.getElementById('leftBookListFrame');
  const overlayLoader = document.getElementById('iframeLoader');
  const themeSelect = document.getElementById('themeSelector');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundStatusText = document.getElementById('soundStatusText');
  const currentBookStat = document.getElementById('currentBookStat');

  // Drag-to-Resize Logic
  let isDragging = false;
  let startX = 0;
  let startWidth = 0;
  
  // Invisible drag shield to prevent iframe pointer-events capture during drag
  const dragShield = document.createElement('div');
  dragShield.style.position = 'fixed';
  dragShield.style.inset = '0';
  dragShield.style.zIndex = '9999';
  dragShield.style.cursor = 'col-resize';
  dragShield.style.display = 'none';
  document.body.appendChild(dragShield);

  if (splitter && leftWrapper) {
    splitter.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = leftWrapper.getBoundingClientRect().width;
      dragShield.style.display = 'block';
      splitter.classList.add('active');
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const newWidth = Math.max(280, Math.min(window.innerWidth * 0.6, startWidth + dx));
      leftWrapper.style.width = `${newWidth}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        dragShield.style.display = 'none';
        splitter.classList.remove('active');
        document.body.style.userSelect = '';
      }
    });

    // Touch support for tablets
    splitter.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startWidth = leftWrapper.getBoundingClientRect().width;
        splitter.classList.add('active');
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - startX;
      const newWidth = Math.max(260, Math.min(window.innerWidth * 0.65, startWidth + dx));
      leftWrapper.style.width = `${newWidth}px`;
    });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        splitter.classList.remove('active');
      }
    });
  }

  // Theme Synchronizer
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('alexandria_theme', theme);

    // Broadcast to iframes
    const syncIframeTheme = (iframe) => {
      try {
        if (iframe && iframe.contentDocument && iframe.contentDocument.documentElement) {
          iframe.contentDocument.documentElement.setAttribute('data-theme', theme);
        }
      } catch (e) {
        // Cross-origin fallback (postMessage)
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: theme }, '*');
        }
      }
    };

    syncIframeTheme(leftIframe);
    syncIframeTheme(rightIframe);
  }

  if (themeSelect) {
    const savedTheme = localStorage.getItem('alexandria_theme') || 'dark';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
      if (window.soundEngine) window.soundEngine.playChime();
    });
  }

  // Re-apply theme when iframes finish loading
  if (rightIframe) {
    rightIframe.addEventListener('load', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      try {
        if (rightIframe.contentDocument) {
          rightIframe.contentDocument.documentElement.setAttribute('data-theme', currentTheme);
          // Update status indicator
          const title = rightIframe.contentDocument.title || 'Book Information';
          if (currentBookStat) {
            currentBookStat.textContent = title.replace(' | Alexandria Archive', '');
          }
        }
      } catch (e) {}

      if (overlayLoader) overlayLoader.classList.remove('active');
      if (window.soundEngine) window.soundEngine.playPageTurn();
    });
  }

  if (leftIframe) {
    leftIframe.addEventListener('load', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      try {
        if (leftIframe.contentDocument) {
          leftIframe.contentDocument.documentElement.setAttribute('data-theme', currentTheme);
        }
      } catch (e) {}
    });
  }

  // Sound Engine Mute Toggle
  if (soundToggleBtn && soundStatusText) {
    soundToggleBtn.addEventListener('click', () => {
      if (window.soundEngine) {
        const enabled = window.soundEngine.toggleSound();
        soundStatusText.textContent = enabled ? 'SFX: ON' : 'SFX: MUTED';
        soundToggleBtn.style.opacity = enabled ? '1' : '0.6';
        if (enabled) window.soundEngine.playChime();
      }
    });
  }

  // Listen for iframe events (e.g. book click, sound triggers)
  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'BOOK_SELECTED') {
      if (overlayLoader) overlayLoader.classList.add('active');
      if (window.soundEngine) window.soundEngine.playPageTurn();
    } else if (event.data.type === 'PLAY_SOUND') {
      if (window.soundEngine) {
        if (event.data.sound === 'chime') window.soundEngine.playChime();
        if (event.data.sound === 'page') window.soundEngine.playPageTurn();
      }
    }
  });
});
