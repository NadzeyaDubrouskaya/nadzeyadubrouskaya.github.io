(function () {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');
  const printCv = document.getElementById('print-cv');
  const sidebar = document.querySelector('.sidebar');
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
    let current = 0;
    let target = 0;
    let frameId = null;

    const isEnabled = () => desktopMedia.matches && !reducedMotionMedia.matches;

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

      target = Math.min(window.scrollY * PARALLAX_FACTOR, MAX_SHIFT);

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

  initSidebarParallax();
})();
