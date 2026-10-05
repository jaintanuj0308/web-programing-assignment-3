/* ==========================================================================
   LEFT FRAME: BOOK LIST LOGIC
   Search filtering, category pills, active card indicator, sound triggers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('bookSearchInput');
  const genrePills = document.querySelectorAll('.genre-pill');
  const bookCards = document.querySelectorAll('.book-card');
  const countBadge = document.getElementById('volumeCount');
  const noResults = document.getElementById('noResultsMessage');
  const randomBtn = document.getElementById('randomBookBtn');

  let currentGenre = 'all';
  let searchQuery = '';

  // Theme Sync from master
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_THEME') {
      document.documentElement.setAttribute('data-theme', event.data.theme);
    }
  });

  // Check parent theme on load
  try {
    if (window.parent && window.parent.document.documentElement) {
      const parentTheme = window.parent.document.documentElement.getAttribute('data-theme');
      if (parentTheme) {
        document.documentElement.setAttribute('data-theme', parentTheme);
      }
    }
  } catch (e) {}

  // Filter function
  function applyFilters() {
    let visibleCount = 0;

    bookCards.forEach(card => {
      const title = card.getAttribute('data-title').toLowerCase();
      const author = card.getAttribute('data-author').toLowerCase();
      const genre = card.getAttribute('data-genre').toLowerCase();

      const matchesGenre = (currentGenre === 'all') || (genre.includes(currentGenre));
      const matchesSearch = !searchQuery || 
                            title.includes(searchQuery) || 
                            author.includes(searchQuery) || 
                            genre.includes(searchQuery);

      const linkWrapper = card.closest('.book-card-link');
      if (matchesGenre && matchesSearch) {
        linkWrapper.style.display = 'block';
        visibleCount++;
      } else {
        linkWrapper.style.display = 'none';
      }
    });

    if (countBadge) {
      countBadge.textContent = `${visibleCount} Volume${visibleCount === 1 ? '' : 's'}`;
    }

    if (noResults) {
      if (visibleCount === 0) {
        noResults.classList.add('visible');
      } else {
        noResults.classList.remove('visible');
      }
    }
  }

  // Genre pill clicks
  genrePills.forEach(pill => {
    pill.addEventListener('click', () => {
      genrePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentGenre = pill.getAttribute('data-genre').toLowerCase();
      applyFilters();

      // Trigger chime sound
      try {
        window.parent.postMessage({ type: 'PLAY_SOUND', sound: 'chime' }, '*');
      } catch (e) {}
    });
  });

  // Search input events
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Book Card Selection Handling
  bookCards.forEach(card => {
    const link = card.closest('a');
    if (link) {
      link.addEventListener('click', () => {
        bookCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Notify parent frame
        try {
          window.parent.postMessage({ 
            type: 'BOOK_SELECTED', 
            title: card.getAttribute('data-title') 
          }, '*');
        } catch (e) {}
      });
    }
  });

  // Random Book Picker
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const visibleLinks = Array.from(document.querySelectorAll('.book-card-link'))
        .filter(l => l.style.display !== 'none');
      
      if (visibleLinks.length > 0) {
        const randomLink = visibleLinks[Math.floor(Math.random() * visibleLinks.length)];
        const card = randomLink.querySelector('.book-card');
        
        bookCards.forEach(c => c.classList.remove('active'));
        if (card) card.classList.add('active');

        // Scroll to card
        randomLink.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Trigger navigation
        randomLink.click();

        try {
          window.parent.postMessage({ type: 'PLAY_SOUND', sound: 'chime' }, '*');
        } catch (e) {}
      }
    });
  }
});
