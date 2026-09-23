/**
 * Task Manager Application Controller
 * Handles delegated events, form submissions, filters, and keyboard actions
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.todoStore;
  const ui = new window.TodoUI(store);

  // Initial render
  ui.render();

  // Cache static elements
  const taskForm = document.querySelector('#task-form');
  const taskInput = document.querySelector('#task-input');
  const taskCategorySelect = document.querySelector('#task-category');
  const taskPrioritySelect = document.querySelector('#task-priority');
  const todoList = document.querySelector('#todo-list');
  const searchInput = document.querySelector('#search-input');
  const filterTabsContainer = document.querySelector('#filter-tabs');
  const categoryPillsContainer = document.querySelector('#category-pills');
  const clearCompletedBtn = document.querySelector('#clear-completed-btn');
  const toggleAllBtn = document.querySelector('#toggle-all-btn');
  const themeToggleBtn = document.querySelector('#theme-toggle');

  /* ------------------------------------------------------------------------
     1. CRUD: Create Task
     ------------------------------------------------------------------------ */
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    const category = taskCategorySelect.value;
    const priority = taskPrioritySelect.value;

    const created = store.addTask(title, category, priority);
    if (created) {
      taskInput.value = '';
      taskInput.focus();
      ui.showToast(`Task added: "${created.title}"`);
    }
  });

  /* ------------------------------------------------------------------------
     2. Delegated Event Listener on #todo-list (CRUD: Toggle, Edit, Delete)
     Single delegated listener capturing all actions without memory leaks
     ------------------------------------------------------------------------ */
  todoList.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    const taskItem = actionEl.closest('.todo-item');
    if (!taskItem) return;

    const taskId = taskItem.dataset.id;
    const action = actionEl.dataset.action;

    if (action === 'toggle') {
      const updated = store.toggleTask(taskId);
      if (updated) {
        ui.showToast(updated.completed ? 'Task marked completed' : 'Task marked active');
      }
    } else if (action === 'delete') {
      const removed = store.deleteTask(taskId);
      if (removed) {
        ui.showToast('Task deleted');
      }
    } else if (action === 'edit-btn') {
      ui.startInlineEditing(taskItem);
    }
  });

  // Double-click to inline edit task
  todoList.addEventListener('dblclick', (e) => {
    const textSpan = e.target.closest('.todo-text');
    if (!textSpan) return;

    const taskItem = textSpan.closest('.todo-item');
    if (taskItem) {
      ui.startInlineEditing(taskItem);
    }
  });

  /* ------------------------------------------------------------------------
     3. Advanced Filtering & Real-Time Search
     ------------------------------------------------------------------------ */
  // Status Filter Tabs (All, Active, Completed)
  if (filterTabsContainer) {
    filterTabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      const filter = tab.dataset.filter;
      store.setFilter(filter);
    });
  }

  // Category Filter Pills
  if (categoryPillsContainer) {
    categoryPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.cat-pill');
      if (!pill) return;
      const cat = pill.dataset.category;
      store.setCategory(cat);
    });
  }

  // Real-time Search Input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      store.setSearchQuery(searchInput.value);
    });

    // Clear search on Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchInput.value) {
        searchInput.value = '';
        store.setSearchQuery('');
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Bulk Actions
     ------------------------------------------------------------------------ */
  // Clear completed tasks
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const count = store.clearCompleted();
      if (count > 0) {
        ui.showToast(`Cleared ${count} completed task${count > 1 ? 's' : ''}`);
      } else {
        ui.showToast('No completed tasks to clear');
      }
    });
  }

  // Toggle all tasks
  let allDone = false;
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      allDone = !allDone;
      store.toggleAll(allDone);
      ui.showToast(allDone ? 'All tasks marked completed' : 'All tasks marked active');
    });
  }

  /* ------------------------------------------------------------------------
     5. Dynamic Theme Switcher
     ------------------------------------------------------------------------ */
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = store.state.theme;
      const next = current === 'dark' ? 'light' : 'dark';
      store.setTheme(next);
      ui.showToast(`Switched to ${next} mode`);
    });
  }
});
