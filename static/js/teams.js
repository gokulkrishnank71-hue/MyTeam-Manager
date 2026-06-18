document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('teamSearch');
  const rows = Array.from(document.querySelectorAll('[data-member-row]'));

  if (!searchInput || rows.length === 0) {
    return;
  }

  searchInput.addEventListener('input', function () {
    const query = searchInput.value.trim().toLowerCase();

    rows.forEach(function (row) {
      const text = row.dataset.searchText || row.textContent.toLowerCase();
      row.hidden = query.length > 0 && !text.includes(query);
    });
  });
});
