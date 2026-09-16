/**
 * Suchith Kumar V S - Portfolio Accessible JavaScript
 * Adhering to WAI-ARIA Authoring Practices & WCAG Guidelines
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initContactForm();
  initEditableContactDetails();
});

/**
 * Mobile Navigation Toggle with ARIA State Management
 */
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('#main-nav');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;

    toggleBtn.setAttribute('aria-expanded', String(newState));
    navMenu.classList.toggle('is-open', newState);

    if (newState) {
      const firstLink = navMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      toggleBtn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      navMenu.classList.contains('is-open') &&
      !navMenu.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
    }
  });
}

/**
 * Accessible Contact Form Validation with Dynamic ARIA Attributes
 */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  const statusContainer = document.querySelector('#form-status');

  if (!form || !statusContainer) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasError = false;
    let firstInvalidField = null;

    statusContainer.className = 'form-status';
    statusContainer.textContent = '';

    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach((input) => {
      const errorMsg = document.getElementById(`${input.id}-error`);
      let isValid = true;

      if (input.type === 'checkbox') {
        isValid = input.checked;
      } else if (input.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = input.value.trim() !== '' && emailPattern.test(input.value.trim());
      } else {
        isValid = input.value.trim().length >= (input.minLength || 1);
      }

      if (!isValid) {
        input.setAttribute('aria-invalid', 'true');
        if (errorMsg) {
          errorMsg.classList.add('visible');
        }
        if (!hasError) {
          firstInvalidField = input;
        }
        hasError = true;
      } else {
        input.setAttribute('aria-invalid', 'false');
        if (errorMsg) {
          errorMsg.classList.remove('visible');
        }
      }
    });

    if (hasError) {
      statusContainer.className = 'form-status error';
      statusContainer.textContent = 'Please correct the errors in the form before submitting.';
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
    } else {
      statusContainer.className = 'form-status success';
      statusContainer.textContent = 'Thank you, Suchith Kumar V S has received your message and will respond shortly!';
      form.reset();

      inputs.forEach((input) => {
        input.removeAttribute('aria-invalid');
        const errorMsg = document.getElementById(`${input.id}-error`);
        if (errorMsg) {
          errorMsg.classList.remove('visible');
        }
      });

      statusContainer.setAttribute('tabindex', '-1');
      statusContainer.focus();
    }
  });

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        field.setAttribute('aria-invalid', 'false');
        const errorMsg = document.getElementById(`${field.id}-error`);
        if (errorMsg) {
          errorMsg.classList.remove('visible');
        }
      }
    });
  });
}

/**
 * Editable Contact Details (Email, LinkedIn, GitHub, Location) with LocalStorage persistence
 */
function initEditableContactDetails() {
  const toggleBtn = document.querySelector('#toggle-edit-contact');
  const editPanel = document.querySelector('#contact-edit-panel');
  const saveBtn = document.querySelector('#save-contact-details');
  const resetBtn = document.querySelector('#reset-contact-details');

  const defaultDetails = {
    email: 'suchithkumarvs@gmail.com',
    location: 'Chennai, Tamil Nadu',
    github: 'https://github.com/SuchithKumar2007',
    linkedin: 'https://linkedin.com/in/suchithkumarvs'
  };

  function updateDisplay(details) {
    const emailEl = document.querySelector('#display-email');
    const locationEl = document.querySelector('#display-location');
    const githubEl = document.querySelector('#display-github');
    const linkedinEl = document.querySelector('#display-linkedin');

    if (emailEl) {
      emailEl.textContent = details.email;
      emailEl.href = `mailto:${details.email}`;
    }
    if (locationEl) {
      locationEl.textContent = details.location;
    }
    if (githubEl) {
      githubEl.textContent = details.github;
      githubEl.href = details.github;
    }
    if (linkedinEl) {
      linkedinEl.textContent = details.linkedin;
      linkedinEl.href = details.linkedin;
    }
  }

  // Load from localStorage or use defaults
  let storedDetails = null;
  try {
    const saved = localStorage.getItem('suchith_contact_info');
    if (saved) {
      storedDetails = JSON.parse(saved);
    }
  } catch (e) {
    // Local storage access fallback
  }

  const activeDetails = storedDetails || defaultDetails;
  updateDisplay(activeDetails);

  // Sync inputs with active values
  const inputEmail = document.querySelector('#edit-email');
  const inputLocation = document.querySelector('#edit-location');
  const inputGithub = document.querySelector('#edit-github');
  const inputLinkedin = document.querySelector('#edit-linkedin');

  if (inputEmail) inputEmail.value = activeDetails.email;
  if (inputLocation) inputLocation.value = activeDetails.location;
  if (inputGithub) inputGithub.value = activeDetails.github;
  if (inputLinkedin) inputLinkedin.value = activeDetails.linkedin;

  if (toggleBtn && editPanel) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;
      toggleBtn.setAttribute('aria-expanded', String(newState));
      editPanel.classList.toggle('is-active', newState);
      toggleBtn.textContent = newState ? 'Cancel Editing' : 'Edit Contact Info';
      if (newState && inputEmail) {
        inputEmail.focus();
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const newDetails = {
        email: (inputEmail && inputEmail.value.trim()) || defaultDetails.email,
        location: (inputLocation && inputLocation.value.trim()) || defaultDetails.location,
        github: (inputGithub && inputGithub.value.trim()) || defaultDetails.github,
        linkedin: (inputLinkedin && inputLinkedin.value.trim()) || defaultDetails.linkedin
      };

      try {
        localStorage.setItem('suchith_contact_info', JSON.stringify(newDetails));
      } catch (e) {}

      updateDisplay(newDetails);

      if (toggleBtn && editPanel) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        editPanel.classList.remove('is-active');
        toggleBtn.textContent = 'Edit Contact Info';
        toggleBtn.focus();
      }

      const statusContainer = document.querySelector('#form-status');
      if (statusContainer) {
        statusContainer.className = 'form-status success';
        statusContainer.textContent = 'Contact information successfully updated and saved!';
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem('suchith_contact_info');
      } catch (e) {}

      if (inputEmail) inputEmail.value = defaultDetails.email;
      if (inputLocation) inputLocation.value = defaultDetails.location;
      if (inputGithub) inputGithub.value = defaultDetails.github;
      if (inputLinkedin) inputLinkedin.value = defaultDetails.linkedin;

      updateDisplay(defaultDetails);

      if (toggleBtn && editPanel) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        editPanel.classList.remove('is-active');
        toggleBtn.textContent = 'Edit Contact Info';
      }

      const statusContainer = document.querySelector('#form-status');
      if (statusContainer) {
        statusContainer.className = 'form-status success';
        statusContainer.textContent = 'Contact information reset to default settings.';
      }
    });
  }
}
