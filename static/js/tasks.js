document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('taskSearch');
  const rows = Array.from(document.querySelectorAll('[data-task-row]'));
  const filters = {
    project: document.getElementById('projectFilter'),
    status: document.getElementById('statusFilter'),
    priority: document.getElementById('priorityFilter'),
    assignee: document.getElementById('assigneeFilter'),
    due: document.getElementById('dueFilter'),
  };
  const filterButton = document.querySelector('[data-filter-trigger]');
  const resetButton = document.querySelector('[data-filter-reset]');
  const visibleCount = document.querySelector('[data-visible-count]');
  const visibleRange = document.querySelector('[data-visible-range]');

  if (!searchInput || rows.length === 0) {
    return;
  }

  function getSelectedFilters() {
    return Object.keys(filters).reduce(function (selected, key) {
      selected[key] = filters[key] ? filters[key].value : '';
      return selected;
    }, {});
  }

  function updateCount(count) {
    if (visibleCount) {
      visibleCount.textContent = String(count);
    }

    if (visibleRange) {
      visibleRange.textContent = count === 0 ? '0 to 0' : '1 to ' + count;
    }
  }

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selected = getSelectedFilters();
    let shown = 0;

    rows.forEach(function (row) {
      const rowText = row.dataset.searchText || row.textContent.toLowerCase();
      const matchesSearch = query.length === 0 || rowText.includes(query);
      const matchesFilters = Object.keys(selected).every(function (key) {
        return selected[key] === '' || row.dataset[key] === selected[key];
      });

      row.hidden = !(matchesSearch && matchesFilters);

      if (!row.hidden) {
        shown += 1;
      }
    });

    updateCount(shown);
  }

  searchInput.addEventListener('input', applyFilters);

  Object.keys(filters).forEach(function (key) {
    if (filters[key]) {
      filters[key].addEventListener('change', applyFilters);
    }
  });

  if (filterButton) {
    filterButton.addEventListener('click', applyFilters);
  }

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      searchInput.value = '';

      Object.keys(filters).forEach(function (key) {
        if (filters[key]) {
          filters[key].value = '';
        }
      });

      applyFilters();
    });
  }

  applyFilters();
});
