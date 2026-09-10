(() => {
  try {
    const theme = localStorage.getItem('relaybyte-theme');
    if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
  } catch { /* The system appearance also works when browser storage is disabled. */ }
})();
