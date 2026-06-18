document.addEventListener('DOMContentLoaded', function () {
  const settingsTabs = Array.from(document.querySelectorAll('[data-settings-tab]'));
  const settingsPanels = Array.from(document.querySelectorAll('[data-settings-panel]'));

  settingsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.settingsTab;

      settingsTabs.forEach(function (item) {
        item.classList.toggle('active', item === tab);
      });

      settingsPanels.forEach(function (panel) {
        panel.classList.toggle('is-hidden', panel.dataset.settingsPanel !== target);
      });
    });
  });

  const notificationTabs = Array.from(document.querySelectorAll('[data-notification-filter]'));
  const notificationItems = Array.from(document.querySelectorAll('[data-notification-item]'));
  const notificationCount = document.querySelector('[data-notification-count]');

  function updateNotificationCount() {
    if (!notificationCount) {
      return;
    }

    const visibleItems = notificationItems.filter(function (item) {
      return !item.hidden;
    });

    notificationCount.textContent = String(visibleItems.length);
  }

  notificationTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const filter = tab.dataset.notificationFilter;

      notificationTabs.forEach(function (item) {
        item.classList.toggle('active', item === tab);
      });

      notificationItems.forEach(function (item) {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
      });

      updateNotificationCount();
    });
  });

  const markReadButton = document.querySelector('[data-mark-read]');

  if (markReadButton) {
    markReadButton.addEventListener('click', function () {
      document.querySelectorAll('.unread-dot').forEach(function (dot) {
        dot.hidden = true;
      });
    });
  }

  const searchInput = document.querySelector('.module-topbar input[type="search"]');

  if (searchInput && notificationItems.length > 0) {
    searchInput.addEventListener('input', function () {
      const query = searchInput.value.trim().toLowerCase();

      notificationItems.forEach(function (item) {
        item.hidden = query.length > 0 && !item.textContent.toLowerCase().includes(query);
      });

      updateNotificationCount();
    });
  }

  updateNotificationCount();
});
