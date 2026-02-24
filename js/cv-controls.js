(function () {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  const printCv = document.getElementById('print-cv');
  const sidebar = document.querySelector('.sidebar');
  const page = document.querySelector('.page');
  const earlierCareerToggle = document.getElementById('earlier-career-toggle');
  const earlierCareerContent = document.getElementById('earlier-career-content');
  const icon = toggle.querySelector('.theme-toggle__icon');
  const label = toggle.querySelector('.theme-toggle__label');
  const storageKey = 'preferred-theme';
  const THEMES = {
    DARK: 'theme-dark',
    LIGHT: 'theme-light'
  };

  const safeStorage = {
    get() {
      try {
        return localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    set(value) {
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        /* ignore */
      }
    }
  };

  const applyTheme = (theme) => {
    body.classList.remove(THEMES.DARK, THEMES.LIGHT);
    body.classList.add(theme);
    safeStorage.set(theme);
    const isDark = theme === THEMES.DARK;
    icon.textContent = isDark ? '🌙' : '☀️';
    label.textContent = isDark ? 'Night' : 'Day';
  };

  const stored = safeStorage.get();
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
    applyTheme(stored);
  } else {
    applyTheme(THEMES.DARK);
  }

  toggle.addEventListener('click', () => {
    const nextTheme = body.classList.contains(THEMES.DARK) ? THEMES.LIGHT : THEMES.DARK;
    applyTheme(nextTheme);
  });

  if (printCv) {
    printCv.addEventListener('click', () => {
      window.print();
    });
  }

  const initSidebarParallax = () => {
    if (!sidebar) {
      return;
    }

    const desktopMedia = window.matchMedia('(min-width: 901px)');
    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const PARALLAX_FACTOR = 0.08;
    const EASE_FACTOR = 0.14;
    const MAX_SHIFT = 42;
    const VIEWPORT_GAP = 12;
    let current = 0;
    let target = 0;
    let frameId = null;

    const isEnabled = () => desktopMedia.matches && !reducedMotionMedia.matches;

    const getTopOffset = () => {
      const parsed = Number.parseFloat(window.getComputedStyle(sidebar).top);
      return Number.isFinite(parsed) ? parsed : 24;
    };

    const getShiftLimit = () => {
      const topOffset = getTopOffset();
      const sidebarHeight = sidebar.getBoundingClientRect().height;
      const viewportRoom = window.innerHeight - topOffset - sidebarHeight - VIEWPORT_GAP;
      const viewportLimit = Math.max(0, viewportRoom);

      if (!page) {
        return Math.min(MAX_SHIFT, viewportLimit);
      }

      const pageBottom = page.getBoundingClientRect().bottom;
      const sidebarBottomAtTopOffset = topOffset + sidebarHeight;
      const containerLimit = Math.max(0, pageBottom - sidebarBottomAtTopOffset);
      return Math.min(MAX_SHIFT, viewportLimit, containerLimit);
    };

    const applyShift = (value) => {
      sidebar.style.setProperty('--sidebar-parallax-shift', `${value.toFixed(2)}px`);
    };

    const animate = () => {
      current += (target - current) * EASE_FACTOR;

      if (Math.abs(target - current) < 0.1) {
        current = target;
      }

      applyShift(current);

      if (Math.abs(target - current) >= 0.1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        frameId = null;
      }
    };

    const updateTarget = () => {
      if (!isEnabled()) {
        target = 0;
        current = 0;
        applyShift(0);

        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
          frameId = null;
        }

        return;
      }

      target = Math.min(window.scrollY * PARALLAX_FACTOR, getShiftLimit());

      if (frameId === null) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget);
    desktopMedia.addEventListener('change', updateTarget);
    reducedMotionMedia.addEventListener('change', updateTarget);
    updateTarget();
  };

  const initExpandableCareerSection = () => {
    if (!earlierCareerToggle || !earlierCareerContent) {
      return;
    }

    const applyExpandedState = (expanded) => {
      earlierCareerToggle.setAttribute('aria-expanded', String(expanded));
      const actionLabel = expanded ? 'Collapse Earlier Career' : 'Expand Earlier Career';
      earlierCareerToggle.setAttribute('aria-label', actionLabel);
      earlierCareerToggle.setAttribute('title', actionLabel);
      earlierCareerContent.classList.toggle('is-collapsed', !expanded);
    };

    applyExpandedState(false);

    earlierCareerToggle.addEventListener('click', () => {
      const isExpanded = earlierCareerToggle.getAttribute('aria-expanded') === 'true';
      applyExpandedState(!isExpanded);
    });
  };

  initExpandableCareerSection();
  initSidebarParallax();
})();
