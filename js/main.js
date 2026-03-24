/* ============================================
   ServiPro - JavaScript principal
   Vanilla JS, sin dependencias
   ============================================ */

(function () {
  'use strict';

  // --- Configuración del negocio ---
  var CONFIG = {
    whatsappNumber: '525512345678',
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

  // Smooth scroll se maneja por CSS (scroll-behavior: smooth + scroll-padding-top)
  // Esto permite que el hash de la URL se actualice correctamente para compartir enlaces

  // --- Indicador "Abierto / Cerrado" ---
  function checkBusinessStatus() {
    // Usar hora de la zona horaria del negocio (CDMX), no la del visitante
    var nowStr = new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City' });
    var now = new Date(nowStr);
    var day = now.getDay();
    var hours = CONFIG.businessHours[day];
    var statusIndicator = document.getElementById('status-indicator');
    var statusText = document.getElementById('status-text');

    if (!statusIndicator || !statusText) return;

    if (!hours) {
      statusIndicator.className = 'horario__status closed';
      statusText.textContent = 'Cerrado ahora — Emergencias 24/7: 55 1234 5678';
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
        statusText.textContent = 'Cerrado ahora — Emergencias 24/7: 55 1234 5678';
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

      // Enviar datos por WhatsApp como alternativa funcional sin backend
      var nombre = document.getElementById('nombre').value.trim();
      var email = document.getElementById('email').value.trim();
      var telefono = document.getElementById('telefono').value.trim();
      var servicio = document.getElementById('servicio').value;
      var mensaje = document.getElementById('mensaje').value.trim();

      var whatsappText = 'Hola, soy ' + nombre + '.%0A';
      whatsappText += 'Correo: ' + email + '%0A';
      if (telefono) whatsappText += 'Tel: ' + telefono + '%0A';
      if (servicio) whatsappText += 'Servicio: ' + servicio + '%0A';
      whatsappText += 'Mensaje: ' + mensaje;

      var whatsappUrl = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(
        'Hola, soy ' + nombre + '.\n' +
        'Correo: ' + email + '\n' +
        (telefono ? 'Tel: ' + telefono + '\n' : '') +
        (servicio ? 'Servicio: ' + servicio + '\n' : '') +
        'Mensaje: ' + mensaje
      );

      // Mostrar mensaje de éxito y abrir WhatsApp
      var submitBtn = document.getElementById('submit-btn');
      var successMsg = document.getElementById('form-success');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      setTimeout(function () {
        window.open(whatsappUrl, '_blank');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Mensaje';
        contactForm.reset();
        if (successMsg) {
          successMsg.hidden = false;
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 500);
    });
  }

})();
