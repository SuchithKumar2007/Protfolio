/**
 * Task Manager State Management Module
 * Centralized state store, CRUD mutations, and localStorage persistence
 */

const STORAGE_KEY = 'suchith_todo_tasks';
const THEME_KEY = 'suchith_todo_theme';

const DEFAULT_SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Review Data Structures & Graph Algorithms coursework',
    completed: false,
    category: 'college',
    priority: 'high',
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'task-2',
    title: 'Deploy Cloud_Storage application updates on Vercel',
    completed: true,
    category: 'projects',
    priority: 'high',
    createdAt: Date.now() - 3600000 * 18
  },
  {
    id: 'task-3',
    title: 'Implement DOM event delegation for Task 3 application',
    completed: true,
    category: 'projects',
    priority: 'medium',
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: 'task-4',
    title: 'Prepare Computer Networks assignment for SRM Easwari College',
    completed: false,
    category: 'college',
    priority: 'high',
    createdAt: Date.now() - 3600000 * 4
  },
  {
    id: 'task-5',
    title: 'Explore emerging JavaScript state management patterns',
    completed: false,
    category: 'personal',
    priority: 'low',
    createdAt: Date.now() - 3600000 * 1
  }
];

class TodoStore {
  constructor() {
    this.state = {
      tasks: [],
      filter: 'all',          // 'all' | 'active' | 'completed'
      category: 'all',        // 'all' | 'college' | 'projects' | 'personal' | 'work'
      searchQuery: '',
      theme: 'light'
    };

    this.listeners = [];
    this.storage = this.getStorage();
    this.load();
  }

  getStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage;
      }
    } catch (e) {
      // Storage access blocked or restricted
    }
    return null;
  }

  /**
   * Subscribe to state change notifications
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Load tasks from localStorage or initialize with sample defaults
   */
  load() {
    try {
      if (this.storage) {
        const stored = this.storage.getItem(STORAGE_KEY);
        if (stored) {
          this.state.tasks = JSON.parse(stored);
        } else {
          this.state.tasks = [...DEFAULT_SAMPLE_TASKS];
          this.save();
        }

        const storedTheme = this.storage.getItem(THEME_KEY);
        if (storedTheme) {
          this.state.theme = storedTheme;
        } else {
          const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          this.state.theme = prefersDark ? 'dark' : 'light';
        }
      } else {
        this.state.tasks = [...DEFAULT_SAMPLE_TASKS];
      }
    } catch (e) {
      console.warn('LocalStorage error or unavailable, using fallback state:', e);
      this.state.tasks = [...DEFAULT_SAMPLE_TASKS];
    }
  }

  /**
   * Persist tasks to window.localStorage
   */
  save() {
    try {
      if (this.storage) {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state.tasks));
        this.storage.setItem(THEME_KEY, this.state.theme);
      }
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    this.notify();
  }

  /**
   * CRUD: Create
   */
  addTask(title, category = 'college', priority = 'medium') {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return null;

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: trimmedTitle,
      completed: false,
      category: category.toLowerCase(),
      priority: priority.toLowerCase(),
      createdAt: Date.now()
    };

    this.state.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  /**
   * CRUD: Read (Filtered)
   */
  getFilteredTasks() {
    return this.state.tasks.filter(task => {
      // 1. Status Filter
      if (this.state.filter === 'active' && task.completed) return false;
      if (this.state.filter === 'completed' && !task.completed) return false;

      // 2. Category Filter
      if (this.state.category !== 'all' && task.category !== this.state.category) return false;

      // 3. Search Query
      if (this.state.searchQuery) {
        const query = this.state.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory) return false;
      }

      return true;
    });
  }

  /**
   * CRUD: Update (Toggle completion)
   */
  toggleTask(id) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.save();
      return task;
    }
    return null;
  }

  /**
   * CRUD: Update (Edit title inline)
   */
  updateTaskTitle(id, newTitle) {
    const trimmed = newTitle.trim();
    const task = this.state.tasks.find(t => t.id === id);
    if (task && trimmed) {
      task.title = trimmed;
      this.save();
      return task;
    }
    return null;
  }

  /**
   * CRUD: Delete (Remove task)
   */
  deleteTask(id) {
    const initialLen = this.state.tasks.length;
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    if (this.state.tasks.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Bulk Action: Toggle all tasks
   */
  toggleAll(completed) {
    this.state.tasks.forEach(task => {
      task.completed = completed;
    });
    this.save();
  }

  /**
   * Bulk Action: Clear completed tasks
   */
  clearCompleted() {
    const beforeCount = this.state.tasks.length;
    this.state.tasks = this.state.tasks.filter(task => !task.completed);
    const removedCount = beforeCount - this.state.tasks.length;
    if (removedCount > 0) {
      this.save();
    }
    return removedCount;
  }

  /**
   * Filter State Mutators
   */
  setFilter(filter) {
    this.state.filter = filter;
    this.notify();
  }

  setCategory(category) {
    this.state.category = category;
    this.notify();
  }

  setSearchQuery(query) {
    this.state.searchQuery = query.trim();
    this.notify();
  }

  setTheme(theme) {
    this.state.theme = theme;
    this.save();
  }

  /**
   * Computes statistics
   */
  getStats() {
    const total = this.state.tasks.length;
    const completed = this.state.tasks.filter(t => t.completed).length;
    const active = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, active, percentage };
  }
}

// Export singleton instance if window is defined
if (typeof window !== 'undefined') {
  window.todoStore = new TodoStore();
}
