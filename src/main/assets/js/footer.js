
  const footerFab = document.getElementById('footerFab');
  const popupFooter = document.getElementById('popupFooter');

  footerFab.addEventListener('click', () => {
    popupFooter.classList.toggle('active');
    footerFab.style.display = 'none';
  });

  // Optional: Close footer when clicking outside
  document.addEventListener('click', (e) => {
    if (!popupFooter.contains(e.target) && !footerFab.contains(e.target)) {
      popupFooter.classList.remove('active');
      footerFab.style.display = 'block';
    }
  });

