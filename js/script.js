/**
 * script.js — Beauty Academy Daniela Quesada
 * Laboratorio #1 — ISW-521 Programación en Ambiente Web I
 *
 * FUNCIONALIDADES:
 * 1. Menú hamburguesa (abrir/cerrar en móvil)
 * 2. Scroll suave a las secciones (smooth scroll)
 * 3. Header con sombra al hacer scroll
 * 4. Animaciones al entrar en viewport (IntersectionObserver)
 * 5. Cambio de tema claro/oscuro + persistencia con localStorage
 * 6. Recordar nombre del formulario de contacto con localStorage
 * 7. Simulación de envío del formulario
 */


/* ================================================================
   ESPERAR A QUE EL DOM ESTÉ LISTO
   DOMContentLoaded se dispara cuando el HTML fue parseado completamente.
   Es buena práctica envolver todo el código en este evento.
================================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     1. MENÚ HAMBURGUESA
     Al hacer clic en el botón, se alternan las clases 'open'
     tanto en el botón como en el menú, lo que activa la animación CSS.
  ============================================================ */
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  // Verificamos que los elementos existan antes de usarlos
  if (navToggle && navMenu) {

    navToggle.addEventListener('click', function () {
      // classList.toggle añade la clase si no existe, la quita si existe
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');

      // Actualiza aria-expanded para lectores de pantalla (accesibilidad)
      const isOpen = navMenu.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar el menú al hacer clic en cualquier enlace
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar el menú si el usuario hace clic fuera de él
    document.addEventListener('click', function (event) {
      // Si el clic NO fue dentro del menú ni en el botón de toggle
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

  } // fin if navToggle


  /* ============================================================
     2. SCROLL SUAVE (Smooth Scroll)
     Intercepta los clics en enlaces con href="#seccion" y hace
     un desplazamiento animado hasta el destino.
  ============================================================ */
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');

  allAnchorLinks.forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const href = anchor.getAttribute('href');

      // Solo actúa si el href apunta a un ID real (no solo '#')
      if (href && href.length > 1) {
        const targetElement = document.querySelector(href);

        if (targetElement) {
          event.preventDefault(); // Evita el salto brusco por defecto

          // scrollIntoView con behavior: 'smooth' hace el scroll animado
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Mueve el foco al elemento destino para accesibilidad con teclado
          // tabIndex -1 lo hace enfocable sin añadirlo al orden de Tab
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
        }
      }
    });
  });


  /* ============================================================
     3. HEADER CON SOMBRA AL HACER SCROLL
     Añade la clase 'scrolled' al header cuando el usuario baja.
  ============================================================ */
  const siteHeader = document.getElementById('site-header');

  if (siteHeader) {
    // La función se llama cada vez que el usuario hace scroll
    window.addEventListener('scroll', function () {
      // scrollY es la cantidad de píxeles que se ha desplazado verticalmente
      if (window.scrollY > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    });
  }


  /* ============================================================
     4. ANIMACIONES AL ENTRAR EN EL VIEWPORT (Reveal)
     IntersectionObserver "observa" elementos con clase 'reveal'.
     Cuando un elemento entra en pantalla, se le añade 'visible',
     lo que activa la transición CSS definida en style.css.
  ============================================================ */

  // Seleccionamos todos los elementos que queremos animar
  const revealElements = document.querySelectorAll('.reveal');

  // Opciones del observer:
  // - root: null significa que usa el viewport del navegador
  // - threshold: el elemento debe ser 10% visible para activarse
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  // Creamos el observer con una función callback
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // entry.isIntersecting es true cuando el elemento está en pantalla
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Una vez visible, dejamos de observar ese elemento (optimización)
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Le decimos al observer qué elementos debe vigilar
  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });


  /* ============================================================
     5. CAMBIO DE TEMA CLARO / OSCURO — Slider Toggle
     
     El botón #themeToggle tiene un slider visual (track + thumb).
     El CSS mueve el thumb automáticamente cuando body tiene
     la clase 'dark-mode' — no necesitamos cambiar íconos.
     
     Solo manejamos:
     - Añadir/quitar clase 'dark-mode' en el <body>
     - Guardar/leer la preferencia en localStorage
  ============================================================ */
  const themeToggle = document.getElementById('themeToggle');

  /* Activa modo oscuro: añade clase + guarda en localStorage */
  function activateDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('beauty-theme', 'dark');
  }

  /* Activa modo claro: quita clase + guarda en localStorage */
  function activateLightMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('beauty-theme', 'light');
  }

  /* Al cargar la página, aplicamos el tema guardado (si existe) */
  const savedTheme = localStorage.getItem('beauty-theme');
  if (savedTheme === 'dark') {
    activateDarkMode();
  }

  /* Al hacer clic en el toggle, alternamos entre claro y oscuro */
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      if (document.body.classList.contains('dark-mode')) {
        activateLightMode();
      } else {
        activateDarkMode();
      }
    });
  }


  /* ============================================================
     6. RECORDAR NOMBRE EN EL FORMULARIO (localStorage)
     Cuando el usuario escribe su nombre en el campo de contacto,
     lo guardamos. Al recargar la página, el campo ya tiene el nombre.
     Esto demuestra persistencia de datos con Web Storage.
  ============================================================ */
  const nameInput = document.getElementById('contactName');

  if (nameInput) {
    // Al cargar, recuperamos el nombre guardado (si existe)
    const savedName = localStorage.getItem('beauty-contact-name');
    if (savedName) {
      nameInput.value = savedName;  // Rellenamos el campo automáticamente
    }

    // Cada vez que el usuario escribe en el campo, guardamos el valor
    // El evento 'input' se dispara en cada tecla presionada
    nameInput.addEventListener('input', function () {
      // Solo guardamos si hay texto (no guardamos cadenas vacías)
      if (nameInput.value.trim() !== '') {
        localStorage.setItem('beauty-contact-name', nameInput.value.trim());
      } else {
        // Si borró todo, eliminamos el dato guardado
        localStorage.removeItem('beauty-contact-name');
      }
    });
  }


  /* ============================================================
     7. SIMULACIÓN DE ENVÍO DEL FORMULARIO
     Como no hay backend, simplemente mostramos un mensaje de éxito.
     En un proyecto real, aquí iría un fetch() a una API.
  ============================================================ */
  const submitBtn    = document.getElementById('submitContact');
  const formSuccess  = document.getElementById('formSuccess');
  const emailInput   = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      // Validación básica: verificamos que los campos requeridos no estén vacíos
      const name    = nameInput  ? nameInput.value.trim()    : '';
      const email   = emailInput ? emailInput.value.trim()   : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (name === '' || email === '' || message === '') {
        // Alerta sencilla si faltan campos (en un proyecto real usaríamos algo más elegante)
        alert('Por favor completa tu nombre, correo y mensaje antes de enviar.');
        return; // Detenemos la ejecución aquí
      }

      // Simulamos un envío exitoso mostrando el mensaje de confirmación
      if (formSuccess) {
        formSuccess.style.display = 'block';

        // Limpiamos el formulario (excepto el nombre, que está en localStorage)
        if (emailInput)   emailInput.value   = '';
        if (messageInput) messageInput.value = '';

        // Ocultamos el mensaje de éxito después de 5 segundos
        setTimeout(function () {
          formSuccess.style.display = 'none';
        }, 5000);
      }

      // Hacemos scroll hacia el mensaje de confirmación
      if (formSuccess) {
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }


  /* ============================================================
     NOTA PARA LA DEFENSA:
     
     ¿Cuál es la diferencia entre localStorage y sessionStorage?
     
     - localStorage: los datos PERSISTEN aunque se cierre el navegador.
       Se borran solo con localStorage.removeItem() o limpieza manual.
       Usamos este para el tema y el nombre del formulario.
     
     - sessionStorage: los datos se borran al CERRAR la pestaña/navegador.
       Útil para información temporal de sesión.
     
     Elegimos localStorage porque queremos que la preferencia de tema
     y el nombre del usuario se recuerden entre visitas.
  ============================================================ */


}); // fin DOMContentLoaded