const STATS_DATA = {
  asOf: 'June 2026',
  formats: [
    {
      id: 'tests',
      label: 'Tests',
      status: 'Retired · May 2025',
      stats: [
        { label: 'Matches', value: 123 },
        { label: 'Runs', value: 9230 },
        { label: '100s', value: 30 },
        { label: '50s', value: 28 },
        { label: 'Average', value: 46.85, decimals: 2 },
        { label: 'Highest', value: 254, notOut: true },
      ],
    },
    {
      id: 'odis',
      label: 'ODIs',
      status: 'Active',
      stats: [
        { label: 'Matches', value: 311 },
        { label: 'Runs', value: 14797 },
        { label: '100s', value: 54 },
        { label: '50s', value: 74 },
        { label: 'Average', value: 58.72, decimals: 2 },
        { label: 'Highest', value: 183 },
      ],
    },
    {
      id: 't20s',
      label: 'T20Is',
      status: 'Retired · June 2024',
      stats: [
        { label: 'Matches', value: 125 },
        { label: 'Runs', value: 4188 },
        { label: '100s', value: 1 },
        { label: '50s', value: 38 },
        { label: 'Average', value: 48.7, decimals: 1 },
        { label: 'Highest', value: 122, notOut: true },
      ],
    },
    {
      id: 'ipl',
      label: 'IPL',
      status: 'Active · RCB',
      stats: [
        { label: 'Matches', value: 284 },
        { label: 'Runs', value: 9336 },
        { label: '100s', value: 9 },
        { label: '50s', value: 68 },
        { label: 'Average', value: 39.9, decimals: 1 },
        { label: 'Highest', value: 113, notOut: true },
      ],
    },
  ],
};

const filterButtons = document.querySelectorAll('.filter-chip');
const matchCards = document.querySelectorAll('.match-card');
const galleryCards = document.querySelectorAll('.gallery-card');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCredit = document.getElementById('lightboxCredit');
const closeLightbox = document.getElementById('closeLightbox');

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;


const formatValue = (value, decimals = 0, notOut = false) => {
  const num = decimals ? value.toFixed(decimals) : Math.round(value).toString();
  return notOut ? `${num}*` : num;
};

const buildStatsDashboard = () => {
  const tabsEl = document.getElementById('statsTabs');
  const panelsEl = document.getElementById('statsPanels');
  const asOfEl = document.getElementById('statsAsOf');
  if (!tabsEl || !panelsEl) return;

  STATS_DATA.formats.forEach((format, index) => {
    // Tab button
    const tab = document.createElement('button');
    tab.className = `tab-button${index === 0 ? ' active' : ''}`;
    tab.dataset.tab = format.id;
    tab.textContent = format.label;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tab.setAttribute('aria-controls', format.id);
    tab.id = `${format.id}-tab`;
    tabsEl.appendChild(tab);

    // Panel
    const panel = document.createElement('article');
    panel.className = `tab-panel${index === 0 ? ' active' : ''}`;
    panel.id = format.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `${format.id}-tab`);

    const statusBadge = format.status
      ? `<span class="format-status">${format.status}</span>`
      : '';

    const cards = format.stats
      .map(
        (stat) => `
        <div class="stat-card">
          <span class="stat-label">${stat.label}</span>
          <strong class="counter" data-target="${stat.value}" data-decimals="${
          stat.decimals || 0
        }" data-notout="${stat.notOut ? '1' : '0'}">0</strong>
        </div>`
      )
      .join('');

    panel.innerHTML = `${statusBadge}<div class="stats-grid">${cards}</div>`;
    panelsEl.appendChild(panel);
  });

  if (asOfEl) {
    asOfEl.textContent = `Stats correct as of ${STATS_DATA.asOf}. Tests and T20Is are final career figures; ODI and IPL numbers will rise as Kohli continues to play.`;
  }
};

const animateStats = () => {
  const counters = document.querySelectorAll('.counter');

  const animateValue = (counter) => {
    const target = Number(counter.dataset.target);
    const decimals = Number(counter.dataset.decimals || 0);
    const notOut = counter.dataset.notout === '1';

    if (prefersReducedMotion) {
      counter.textContent = formatValue(target, decimals, notOut);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = progress * target;
      counter.textContent = formatValue(value, decimals, false);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = formatValue(target, decimals, notOut);
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
};

const handleTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tabButtons.forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      panels.forEach((panel) => panel.classList.remove('active'));

      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      document.getElementById(button.dataset.tab).classList.add('active');
    });
  });
};


const handleFilters = () => {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((chip) => {
        chip.classList.remove('active');
        chip.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      const filter = button.dataset.filter;
      matchCards.forEach((card) => {
        const category = card.dataset.category;
        card.style.display = filter === 'all' || filter === category ? 'block' : 'none';
      });
    });
  });
};


const handleLightbox = () => {
  galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const thumbnailImage = card.querySelector('img');
      const imageUrl =
        thumbnailImage?.currentSrc || thumbnailImage?.src || card.dataset.image || '';
      const altText = thumbnailImage?.alt || 'Expanded gallery image';

      lightboxImage.src = imageUrl;
      lightboxImage.alt = altText;
      if (lightboxCredit) {
        lightboxCredit.textContent = card.dataset.credit || '';
      }

      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');

      if (lightbox.requestFullscreen && document.fullscreenElement !== lightbox) {
        lightbox.requestFullscreen().catch(() => {
          // Ignore if fullscreen is unavailable or blocked.
        });
      }
    });
  });

  const closeModal = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');

    if (document.fullscreenElement === lightbox && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {
        // Ignore if fullscreen is unavailable or blocked.
      });
    }
  };

  closeLightbox.addEventListener('click', closeModal);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  buildStatsDashboard();
  handleTabs();
  handleFilters();
  handleLightbox();
  animateStats();
});