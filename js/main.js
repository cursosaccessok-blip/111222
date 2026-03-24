/* ============================================
   ServiPro - JavaScript principal
   Vanilla JS, sin dependencias
   ============================================ */

(function () {
  'use strict';

  // --- Configuración del negocio ---
  var CONFIG = {
    whatsappNumber: '5215512345678',
    whatsappMessage: 'Hola, me interesa conocer sus servicios',
    businessHours: {
      1: { open: '08:00', close: '18:00' }, // Lunes
      2: { open: '08:00', close: '18:00' }, // Martes
      3: { open: '08:00', close: '18:00' }, // Miércoles
      4: { open: '08:00', close: '18:00' }, // Jueves
      5: { open: '08:00', close: '18:00' }, // Viernes
      6: { open: '09:00', close: '14:00' }, // Sábado
      0: null                                // Domingo - Cerrado
    }
  };

  // --- Elementos del DOM ---
  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menu-btn');
  var navMenu = document.getElementById('nav-menu');
  var overlay = document.getElementById('menu-overlay');
  var navLinks = document.querySelectorAll('.header__nav-link');
  var contactForm = document.getElementById('contact-form');
  var yearEl = document.getElementById('year');

  // --- Año dinámico ---
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Menú móvil ---
  function toggleMenu() {
    var isOpen = menuBtn.classList.contains('active');
    menuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  function closeMenu() {
    menuBtn.classList.remove('active');
    navMenu.classList.remove('active');
    overlay.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // Cerrar menú al hacer clic en un enlace
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  // Cerrar menú con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
      menuBtn.focus();
    }
  });

  // --- Header scroll effect ---
  function handleScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Estado inicial

  // --- Active nav link con IntersectionObserver ---
  var sections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window) {
    var observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // --- Smooth scroll para enlaces internos ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Indicador "Abierto / Cerrado" ---
  function checkBusinessStatus() {
    var now = new Date();
    var day = now.getDay();
    var hours = CONFIG.businessHours[day];
    var statusIndicator = document.getElementById('status-indicator');
    var statusText = document.getElementById('status-text');

    if (!statusIndicator || !statusText) return;

    if (!hours) {
      statusIndicator.className = 'horario__status closed';
      statusText.textContent = 'Cerrado ahora';
    } else {
      var currentMinutes = now.getHours() * 60 + now.getMinutes();
      var openParts = hours.open.split(':');
      var closeParts = hours.close.split(':');
      var openMinutes = parseInt(openParts[0], 10) * 60 + parseInt(openParts[1], 10);
      var closeMinutes = parseInt(closeParts[0], 10) * 60 + parseInt(closeParts[1], 10);

      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        statusIndicator.className = 'horario__status open';
        statusText.textContent = 'Abierto ahora';
      } else {
        statusIndicator.className = 'horario__status closed';
        statusText.textContent = 'Cerrado ahora';
      }
    }

    // Resaltar día actual en la tabla
    var rows = document.querySelectorAll('.horario__table tbody tr');
    rows.forEach(function (row) {
      row.classList.remove('today');
      if (parseInt(row.getAttribute('data-day'), 10) === day) {
        row.classList.add('today');
      }
    });
  }

  checkBusinessStatus();
  setInterval(checkBusinessStatus, 60000); // Actualizar cada minuto

  // --- Validación del formulario de contacto ---
  function showError(inputId, message) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(inputId + '-error');
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(inputId) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(inputId + '-error');
    if (input) input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  function clearAllErrors() {
    ['nombre', 'email', 'telefono', 'mensaje'].forEach(clearError);
  }

  // Validar en tiempo real al perder el foco
  ['nombre', 'email', 'telefono', 'mensaje'].forEach(function (fieldId) {
    var field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', function () {
        validateField(fieldId);
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          validateField(fieldId);
        }
      });
    }
  });

  function validateField(fieldId) {
    var field = document.getElementById(fieldId);
    if (!field) return true;

    var value = field.value.trim();

    switch (fieldId) {
      case 'nombre':
        if (!value) {
          showError('nombre', 'Por favor ingresa tu nombre.');
          return false;
        }
        if (value.length < 2) {
          showError('nombre', 'El nombre debe tener al menos 2 caracteres.');
          return false;
        }
        clearError('nombre');
        return true;

      case 'email':
        if (!value) {
          showError('email', 'Por favor ingresa tu correo electrónico.');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          showError('email', 'Por favor ingresa un correo electrónico válido.');
          return false;
        }
        clearError('email');
        return true;

      case 'telefono':
        if (value && !/^[\d\s\-+()]{8,15}$/.test(value)) {
          showError('telefono', 'Por favor ingresa un número de teléfono válido.');
          return false;
        }
        clearError('telefono');
        return true;

      case 'mensaje':
        if (!value) {
          showError('mensaje', 'Por favor escribe tu mensaje.');
          return false;
        }
        if (value.length < 10) {
          showError('mensaje', 'El mensaje debe tener al menos 10 caracteres.');
          return false;
        }
        clearError('mensaje');
        return true;

      default:
        return true;
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      var isValid = true;
      ['nombre', 'email', 'telefono', 'mensaje'].forEach(function (fieldId) {
        if (!validateField(fieldId)) {
          isValid = false;
        }
      });

      if (!isValid) {
        // Foco en el primer campo con error
        var firstError = contactForm.querySelector('.form__input.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simular envío exitoso (no hay backend)
      var submitBtn = document.getElementById('submit-btn');
      var successMsg = document.getElementById('form-success');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Mensaje';
        contactForm.reset();
        if (successMsg) {
          successMsg.hidden = false;
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Ocultar mensaje después de 5 segundos
        setTimeout(function () {
          if (successMsg) successMsg.hidden = true;
        }, 5000);
      }, 1000);
    });
  }

})();
