/* ==========================================================================
   RIGHT FRAME: BOOK DETAILS INTERACTION
   3D Tilt physics, Excerpt drawer, Toast alerts, Clipboard copying
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Theme sync from parent
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_THEME') {
      document.documentElement.setAttribute('data-theme', event.data.theme);
    }
  });

  try {
    if (window.parent && window.parent.document.documentElement) {
      const parentTheme = window.parent.document.documentElement.getAttribute('data-theme');
      if (parentTheme) {
        document.documentElement.setAttribute('data-theme', parentTheme);
      }
    }
  } catch (e) {}

  // 3D Tilt Physics for Hardcover Book
  const bookStage = document.getElementById('book3dStage');
  const bookObj = document.getElementById('book3dObject');

  if (bookStage && bookObj) {
    bookStage.addEventListener('mousemove', (e) => {
      const rect = bookStage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 22;
      const rotateX = -((y - centerY) / centerY) * 22;

      bookObj.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    });

    bookStage.addEventListener('mouseleave', () => {
      bookObj.style.transform = 'rotateY(-18deg) rotateX(6deg)';
    });
  }

  // Toast System
  const toast = document.getElementById('toastNotice');
  let toastTimer = null;

  function showToast(message, icon = '✨') {
    if (!toast) return;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Sound Dispatcher to parent
  function playSound(type) {
    try {
      window.parent.postMessage({ type: 'PLAY_SOUND', sound: type }, '*');
    } catch (e) {}
  }

  // Excerpt Modal Controls
  const excerptBtn = document.getElementById('openExcerptBtn');
  const excerptModal = document.getElementById('excerptModal');
  const closeExcerptBtn = document.getElementById('closeExcerptBtn');

  if (excerptBtn && excerptModal) {
    excerptBtn.addEventListener('click', () => {
      excerptModal.classList.add('open');
      playSound('page');
    });

    if (closeExcerptBtn) {
      closeExcerptBtn.addEventListener('click', () => {
        excerptModal.classList.remove('open');
      });
    }

    excerptModal.addEventListener('click', (e) => {
      if (e.target === excerptModal) {
        excerptModal.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && excerptModal.classList.contains('open')) {
        excerptModal.classList.remove('open');
      }
    });
  }

  // Copy Quote Handler
  const copyQuoteBtn = document.getElementById('copyQuoteBtn');
  const quoteText = document.getElementById('quoteContent');

  if (copyQuoteBtn && quoteText) {
    copyQuoteBtn.addEventListener('click', () => {
      const textToCopy = quoteText.innerText.trim();
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Quote copied to clipboard!', '📜');
        playSound('chime');
      }).catch(() => {
        showToast('Quote copied!', '📜');
      });
    });
  }

  // Bookmark / Favorite Button
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  let isBookmarked = false;

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      isBookmarked = !isBookmarked;
      if (isBookmarked) {
        bookmarkBtn.innerHTML = '<span>★</span> <span>Bookmarked</span>';
        bookmarkBtn.style.borderColor = 'var(--accent-gold)';
        bookmarkBtn.style.color = 'var(--accent-gold)';
        showToast('Added to your personal Codex reading list!', '🔖');
        playSound('chime');
      } else {
        bookmarkBtn.innerHTML = '<span>☆</span> <span>Add to Wishlist</span>';
        bookmarkBtn.style.borderColor = '';
        bookmarkBtn.style.color = '';
        showToast('Removed from reading list', '🗑️');
      }
    });
  }

  // Reserve / Borrow Action
  const reserveBtn = document.getElementById('reserveBtn');
  if (reserveBtn) {
    reserveBtn.addEventListener('click', () => {
      showToast('Volume checked out from Alexandria digital repository!', '🏛️');
      playSound('chime');
    });
  }
});
