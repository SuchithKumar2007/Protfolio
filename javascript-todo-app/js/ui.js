/**
 * Task Manager UI Module
 * Pure dynamic DOM rendering, sanitization, stats and view updates
 */

class TodoUI {
  constructor(store) {
    this.store = store;

    // Cache static DOM elements
    this.todoListEl = document.querySelector('#todo-list');
    this.emptyStateEl = document.querySelector('#empty-state');
    this.emptyTitleEl = document.querySelector('#empty-title');
    this.emptyDescEl = document.querySelector('#empty-desc');
    this.progressBarEl = document.querySelector('#progress-bar');
    this.statsCounterEl = document.querySelector('#stats-counter');
    this.totalStatEl = document.querySelector('#stat-total');
    this.activeStatEl = document.querySelector('#stat-active');
    this.completedStatEl = document.querySelector('#stat-completed');
    this.liveStatusEl = document.querySelector('#live-status');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.categoryPills = document.querySelectorAll('.cat-pill');
    this.themeToggleBtn = document.querySelector('#theme-toggle');

    // Subscribe UI to store state changes
    this.store.subscribe(() => this.render());
  }

  /**
   * Main Render Pipeline
   */
  render() {
    this.renderTasks();
    this.renderStats();
    this.renderFilters();
    this.renderTheme();
  }

  /**
   * Dynamically build and render task items
   */
  renderTasks() {
    const tasks = this.store.getFilteredTasks();
    this.todoListEl.innerHTML = '';

    if (tasks.length === 0) {
      this.emptyStateEl.classList.add('visible');
      if (this.store.state.searchQuery) {
        this.emptyTitleEl.textContent = 'No matching tasks found';
        this.emptyDescEl.textContent = `No tasks matching "${this.store.state.searchQuery}". Try a different keyword.`;
      } else if (this.store.state.filter === 'completed') {
        this.emptyTitleEl.textContent = 'No completed tasks';
        this.emptyDescEl.textContent = 'Complete some active tasks to see them archived here.';
      } else if (this.store.state.filter === 'active') {
        this.emptyTitleEl.textContent = 'All caught up!';
        this.emptyDescEl.textContent = 'No active tasks pending. Add a new task above.';
      } else {
        this.emptyTitleEl.textContent = 'Your task list is empty';
        this.emptyDescEl.textContent = 'Start by adding a task with your desired category and priority.';
      }
      return;
    }

    this.emptyStateEl.classList.remove('visible');

    // Create dynamic DOM elements
    const fragment = document.createDocumentFragment();

    tasks.forEach(task => {
      const li = this.createTaskElement(task);
      fragment.appendChild(li);
    });

    this.todoListEl.appendChild(fragment);
  }

  /**
   * Helper to construct a single task <li> element with DOM methods
   */
  createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    li.setAttribute('role', 'listitem');

    // 1. Completion Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark task "${task.title}" as ${task.completed ? 'active' : 'completed'}`);
    checkbox.dataset.action = 'toggle';

    // 2. Content wrapper
    const content = document.createElement('div');
    content.className = 'todo-content';

    // Title Row
    const titleRow = document.createElement('div');
    titleRow.className = 'todo-title-row';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'todo-text';
    titleSpan.textContent = task.title;
    titleSpan.title = 'Double-click to edit task title';
    titleSpan.dataset.action = 'edit-inline';

    titleRow.appendChild(titleSpan);

    // Badges Row
    const badgesRow = document.createElement('div');
    badgesRow.className = 'todo-meta-badges';

    // Priority badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge-priority ${task.priority}`;
    priorityBadge.textContent = task.priority;

    // Category badge
    const categoryBadge = document.createElement('span');
    categoryBadge.className = `badge-category ${task.category}`;
    categoryBadge.textContent = this.formatCategoryName(task.category);

    // Date
    const dateSpan = document.createElement('span');
    dateSpan.className = 'todo-date';
    dateSpan.textContent = this.formatDate(task.createdAt);

    badgesRow.appendChild(priorityBadge);
    badgesRow.appendChild(categoryBadge);
    badgesRow.appendChild(dateSpan);

    content.appendChild(titleRow);
    content.appendChild(badgesRow);

    // 3. Actions (Edit & Delete buttons)
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-icon edit';
    editBtn.title = 'Edit task title';
    editBtn.setAttribute('aria-label', `Edit task title for: ${task.title}`);
    editBtn.dataset.action = 'edit-btn';
    editBtn.innerHTML = `<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-icon delete';
    deleteBtn.title = 'Delete task';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
    deleteBtn.dataset.action = 'delete';
    deleteBtn.innerHTML = `<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    return li;
  }

  /**
   * Enter inline edit mode on task
   */
  startInlineEditing(taskItemEl) {
    const taskId = taskItemEl.dataset.id;
    const task = this.store.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const titleRow = taskItemEl.querySelector('.todo-title-row');
    const currentSpan = titleRow.querySelector('.todo-text');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-edit-input';
    input.value = task.title;
    input.setAttribute('aria-label', 'Edit task title. Press Enter to save or Escape to cancel');

    titleRow.replaceChild(input, currentSpan);
    input.focus();
    input.select();

    const commitChange = () => {
      const val = input.value.trim();
      if (val && val !== task.title) {
        this.store.updateTaskTitle(taskId, val);
        this.showToast('Task title updated successfully');
      } else {
        this.render(); // Reset view
      }
    };

    const cancelChange = () => {
      this.render();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitChange();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelChange();
      }
    });

    input.addEventListener('blur', () => {
      commitChange();
    }, { once: true });
  }

  /**
   * Render Stats & Progress Bar
   */
  renderStats() {
    const stats = this.store.getStats();

    if (this.progressBarEl) {
      this.progressBarEl.style.width = `${stats.percentage}%`;
      this.progressBarEl.setAttribute('aria-valuenow', stats.percentage);
    }

    if (this.statsCounterEl) {
      this.statsCounterEl.textContent = `${stats.completed} of ${stats.total} completed (${stats.percentage}%)`;
    }

    if (this.totalStatEl) this.totalStatEl.textContent = stats.total;
    if (this.activeStatEl) this.activeStatEl.textContent = stats.active;
    if (this.completedStatEl) this.completedStatEl.textContent = stats.completed;
  }

  /**
   * Render Active Filter Tabs and Category Pills
   */
  renderFilters() {
    const { filter, category } = this.store.state;

    this.filterTabs.forEach(tab => {
      const matches = tab.dataset.filter === filter;
      tab.classList.toggle('active', matches);
      tab.setAttribute('aria-selected', String(matches));
    });

    this.categoryPills.forEach(pill => {
      const matches = pill.dataset.category === category;
      pill.classList.toggle('active', matches);
      pill.setAttribute('aria-pressed', String(matches));
    });
  }

  /**
   * Render Theme
   */
  renderTheme() {
    const theme = this.store.state.theme;
    document.documentElement.setAttribute('data-theme', theme);

    if (this.themeToggleBtn) {
      const isDark = theme === 'dark';
      this.themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      this.themeToggleBtn.innerHTML = isDark
        ? `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
  }

  /**
   * Format helpers
   */
  formatCategoryName(cat) {
    const map = {
      college: 'College / SRM',
      projects: 'Projects',
      work: 'Work',
      personal: 'Personal'
    };
    return map[cat] || cat;
  }

  formatDate(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /**
   * Accessible Transient Status Announcement
   */
  showToast(message) {
    if (!this.liveStatusEl) return;
    this.liveStatusEl.textContent = message;
    this.liveStatusEl.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.liveStatusEl.classList.remove('show');
    }, 2500);
  }
}

window.TodoUI = TodoUI;
