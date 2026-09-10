(() => {
  const select = document.getElementById('theme-select');
  if (!select) return;
  select.closest('label').hidden = false;
  select.value = document.documentElement.dataset.theme || 'system';
  select.addEventListener('change', () => {
    const theme = select.value;
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    try {
      if (theme === 'system') localStorage.removeItem('relaybyte-theme');
      else localStorage.setItem('relaybyte-theme', theme);
    } catch { /* Appearance remains usable for the current page. */ }
  });
})();

(() => {
  const card = document.querySelector('.brand-art');
  if (!card) return;

  const spinner = card.querySelector('.brand-art-spinner');
  const action = card.querySelector('.art-cta');
  const actionText = card.querySelector('.art-action-text');
  const actionIcon = card.querySelector('.art-action-icon');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pointerFrame = 0;
  let spin = null;
  let glowTimer = 0;

  function resetTilt() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
    card.style.removeProperty('--shine-x');
    card.style.removeProperty('--shine-y');
  }

  function stopSpin() {
    if (spin) spin.cancel();
    spin = null;
    card.classList.remove('is-spinning');
  }

  function syncMotionPreference() {
    resetTilt();
    stopSpin();
    clearTimeout(glowTimer);
    card.classList.remove('is-lit');
    actionText.textContent = reducedMotion.matches ? 'Light it up' : 'Give it a spin';
    actionIcon.textContent = reducedMotion.matches ? '✧' : '↻';
  }

  card.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      // Measure the stationary button so the moving face cannot shift its own target.
      const bounds = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      card.style.setProperty('--tilt-x', `${(0.5 - y) * 16}deg`);
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 20}deg`);
      card.style.setProperty('--shine-x', `${x * 100}%`);
      card.style.setProperty('--shine-y', `${y * 100}%`);
      pointerFrame = 0;
    });
  });
  for (const event of ['pointerleave', 'pointercancel', 'blur']) {
    card.addEventListener(event, resetTilt);
  }

  card.addEventListener('click', () => {
    if (reducedMotion.matches) {
      clearTimeout(glowTimer);
      card.classList.add('is-lit');
      glowTimer = setTimeout(() => card.classList.remove('is-lit'), 700);
      return;
    }
    // A rapid second click does not stack or interrupt the current turn.
    if (spin) return;
    card.classList.add('is-spinning');
    spin = spinner.animate(
      [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(360deg)' }],
      { duration: 1100, easing: 'cubic-bezier(.22,.8,.24,1)' }
    );
    spin.onfinish = () => {
      spin = null;
      card.classList.remove('is-spinning');
    };
  });

  reducedMotion.addEventListener('change', syncMotionPreference);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resetTilt();
      stopSpin();
    }
  });
  syncMotionPreference();
  card.disabled = false;
  card.removeAttribute('aria-label');
  card.setAttribute('aria-labelledby', action.id);
  action.hidden = false;
})();
