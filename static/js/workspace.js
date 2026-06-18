document.addEventListener('DOMContentLoaded', function () {
  const drawer = document.querySelector('[data-drawer]');
  const modal = document.querySelector('[data-modal]');

  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove('is-open');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('is-open');
    }
  }

  document.querySelectorAll('[data-open-drawer]').forEach(function (item) {
    item.addEventListener('click', function (event) {
      const interactive = event.target.closest('a, button, input, select, textarea, label');

      if (interactive && interactive !== item) {
        return;
      }

      if (!drawer) {
        return;
      }

      const title = item.dataset.drawerTitle || item.querySelector('strong')?.textContent || 'Details';
      const subtitle = item.dataset.drawerSubtitle || item.dataset.drawerType || 'Selected item';
      const status = item.dataset.drawerStatus || 'Active';
      const owner = item.dataset.drawerOwner || 'Team';
      const due = item.dataset.drawerDue || 'This week';
      const detail = item.dataset.drawerDetail || 'Open the related module when you need a full workflow. Quick edits stay in this drawer.';

      drawer.querySelector('[data-drawer-title]').textContent = title;
      drawer.querySelector('[data-drawer-subtitle]').textContent = subtitle;
      drawer.querySelector('[data-drawer-status]').textContent = status;
      drawer.querySelector('[data-drawer-owner]').textContent = owner;
      drawer.querySelector('[data-drawer-due]').textContent = due;
      drawer.querySelector('[data-drawer-detail]').textContent = detail;
      drawer.classList.add('is-open');
    });
  });

  document.querySelectorAll('[data-close-drawer]').forEach(function (button) {
    button.addEventListener('click', closeDrawer);
  });

  document.querySelectorAll('[data-open-modal]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!modal) {
        return;
      }

      modal.classList.add('is-open');
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (button) {
    button.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeDrawer();
      closeModal();
    }
  });

  const searchInput = document.querySelector('[data-search-input]');
  const searchableItems = Array.from(document.querySelectorAll('[data-search-text]'));

  if (searchInput && searchableItems.length > 0) {
    searchInput.addEventListener('input', function () {
      const query = searchInput.value.trim().toLowerCase();

      searchableItems.forEach(function (item) {
        item.hidden = query.length > 0 && !item.dataset.searchText.toLowerCase().includes(query);
      });
    });
  }

  document.querySelectorAll('[data-settings-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.settingsTab;

      document.querySelectorAll('[data-settings-tab]').forEach(function (item) {
        item.classList.toggle('active', item === tab);
      });

      document.querySelectorAll('[data-settings-panel]').forEach(function (panel) {
        panel.classList.toggle('is-hidden', panel.dataset.settingsPanel !== target);
      });
    });
  });

  document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.dataset.filter;
      const group = button.closest('[data-filter-group]');

      if (group) {
        group.querySelectorAll('[data-filter]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
      }

      document.querySelectorAll('[data-filter-item]').forEach(function (item) {
        item.hidden = filter !== 'all' && item.dataset.filterItem !== filter;
      });
    });
  });
});
