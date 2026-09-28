(() => {
  const override = new URLSearchParams(location.search).get('robot');
  const requested = override || window.WEEK2_ROBOT_URL;
  try {
    const url = new URL(requested, location.href);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    document.querySelectorAll('a.robot-link').forEach((link) => {
      link.href = url.href;
      link.target = 'robot-lab';
    });
  } catch { /* Keep the working default links if configuration is invalid. */ }
})();
