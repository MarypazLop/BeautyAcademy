/** PANEL DE ACCESIBILIDAD
 * Funcionalidades:
 * 1. Tamaño de letra (4 niveles) — escala TODO el sitio vía rem
 * 2. Alto contraste (redefine variables CSS de color)
 * 3. Subrayar enlaces
 * 4. Reducir movimiento (apaga animaciones/transiciones)
 * 5. Leer en voz alta cada sección de la página (Web Speech API)
 * 6. Persistencia de preferencias con localStorage
 *
 * Nota: la aplicación INICIAL de las clases guardadas (tamaño de letra,
 * contraste, subrayado, movimiento) ocurre en un script muy pequeño
 * dentro del <head> de index.html, para que no haya parpadeo visual
 * al cargar la página. Este archivo solo maneja la interacción del
 * panel y la lectura en voz alta.
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------------
     Referencias a elementos del panel
  ---------------------------------------------------------------- */
  const fab          = document.getElementById('a11yToggle');
  const panel        = document.getElementById('a11yPanel');
  const btnFontDec   = document.getElementById('a11yFontDec');
  const btnFontReset = document.getElementById('a11yFontReset');
  const btnFontInc   = document.getElementById('a11yFontInc');
  const btnContrast  = document.getElementById('a11yContrast');
  const btnUnderline = document.getElementById('a11yUnderline');
  const btnMotion    = document.getElementById('a11yMotion');
  const btnReadToggle= document.getElementById('a11yReadToggle');
  const btnReadStop  = document.getElementById('a11yReadStop');
  const btnReadPrev  = document.getElementById('a11yReadPrev');
  const btnReadNext  = document.getElementById('a11yReadNext');
  const btnResetAll  = document.getElementById('a11yResetAll');
  const statusEl      = document.getElementById('a11yStatus');
  const html          = document.documentElement;

  if (!fab || !panel) return; // El panel no está en esta página

  /* ----------------------------------------------------------------
     1. Abrir / cerrar el panel
  ---------------------------------------------------------------- */
  fab.addEventListener('click', function () {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    fab.setAttribute('aria-expanded', String(!isOpen));
    if (!panel.hidden) {
      // Mueve el foco al primer control del panel al abrirlo
      btnFontDec.focus();
    }
  });

  // Cerrar el panel con la tecla Escape
  panel.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      panel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
      fab.focus();
    }
  });

  // Cerrar si se hace clic fuera del panel y del botón flotante
  document.addEventListener('click', function (event) {
    if (!panel.hidden && !panel.contains(event.target) && !fab.contains(event.target)) {
      panel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
    }
  });


  /* ----------------------------------------------------------------
     2. TAMAÑO DE LETRA
     Niveles: 0 = normal, 1 = mediano, 2 = grande, 3 = extra grande
  ---------------------------------------------------------------- */
  const fontClasses = ['', 'a11y-font-md', 'a11y-font-lg', 'a11y-font-xl'];
  const fontLabels   = ['Normal', 'Mediano', 'Grande', 'Extra grande'];

  function getFontLevel() {
    const saved = parseInt(localStorage.getItem('a11y-font-level'), 10);
    return Number.isNaN(saved) ? 0 : Math.min(Math.max(saved, 0), 3);
  }

  function applyFontLevel(level) {
    fontClasses.forEach(function (c) { if (c) html.classList.remove(c); });
    if (fontClasses[level]) html.classList.add(fontClasses[level]);
    localStorage.setItem('a11y-font-level', String(level));
    announce('Tamaño de letra: ' + fontLabels[level]);
  }

  if (btnFontDec) {
    btnFontDec.addEventListener('click', function () {
      applyFontLevel(Math.max(getFontLevel() - 1, 0));
    });
  }
  if (btnFontInc) {
    btnFontInc.addEventListener('click', function () {
      applyFontLevel(Math.min(getFontLevel() + 1, 3));
    });
  }
  if (btnFontReset) {
    btnFontReset.addEventListener('click', function () {
      applyFontLevel(0);
    });
  }


  /* ----------------------------------------------------------------
     3. ALTO CONTRASTE / SUBRAYAR ENLACES / REDUCIR MOVIMIENTO
     Mismo patrón para los tres: clase en <html> + localStorage +
     aria-pressed en el botón correspondiente.
  ---------------------------------------------------------------- */
  function setupToggle(button, className, storageKey, onMessage, offMessage, onChange) {
    if (!button) return;

    function isActive() {
      return html.classList.contains(className);
    }

    function syncButton() {
      button.setAttribute('aria-pressed', String(isActive()));
    }

    button.addEventListener('click', function () {
      const next = !isActive();
      html.classList.toggle(className, next);
      localStorage.setItem(storageKey, next ? '1' : '0');
      syncButton();
      announce(next ? onMessage : offMessage);
      if (onChange) onChange(next);
    });

    syncButton(); // Refleja el estado ya aplicado por el script del <head>
  }

  setupToggle(
    btnContrast,
    'a11y-contrast',
    'a11y-contrast',
    'Alto contraste activado',
    'Alto contraste desactivado'
  );

  setupToggle(
    btnUnderline,
    'a11y-underline-links',
    'a11y-underline',
    'Subrayado de enlaces activado',
    'Subrayado de enlaces desactivado'
  );

  setupToggle(
    btnMotion,
    'a11y-reduce-motion',
    'a11y-reduce-motion',
    'Movimiento reducido activado',
    'Movimiento reducido desactivado',
    function (active) {
      // Si se reduce el movimiento, pausamos el video del tour
      // (autoplay/loop) porque también es una forma de animación.
      const video = document.querySelector('.tour-video');
      if (!video) return;
      if (active) {
        video.pause();
      } else {
        video.play().catch(function () { /* el navegador puede bloquear el autoplay; no pasa nada */ });
      }
    }
  );


  /* ----------------------------------------------------------------
     4. RESTABLECER TODO
  ---------------------------------------------------------------- */
  if (btnResetAll) {
    btnResetAll.addEventListener('click', function () {
      applyFontLevel(0);
      ['a11y-contrast', 'a11y-underline-links', 'a11y-reduce-motion'].forEach(function (c) {
        html.classList.remove(c);
      });
      localStorage.setItem('a11y-contrast', '0');
      localStorage.setItem('a11y-underline', '0');
      localStorage.setItem('a11y-reduce-motion', '0');
      [btnContrast, btnUnderline, btnMotion].forEach(function (b) {
        if (b) b.setAttribute('aria-pressed', 'false');
      });
      stopReading();
      announce('Todas las preferencias de accesibilidad fueron restablecidas');
    });
  }


  /* ----------------------------------------------------------------
     5. LEER EN VOZ ALTA CADA SECCIÓN DE LA PÁGINA
     Usa la Web Speech API (speechSynthesis). Recorre en orden cada
     <section> de <main>, leyendo su nombre accesible (aria-label o
     el texto del título que indica aria-labelledby) y su contenido.
  ---------------------------------------------------------------- */
  const speechSupported = 'speechSynthesis' in window;
  const sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  let readingIndex = -1;
  let isPaused = false;
  let activeSectionEl = null;

  function announce(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function getSectionName(section) {
    if (section.hasAttribute('aria-label')) {
      return section.getAttribute('aria-label');
    }
    const labelledBy = section.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent.trim();
    }
    return 'Sección sin título';
  }

  function getSectionText(section) {
    // innerText respeta lo que normalmente se ve en pantalla
    return section.innerText.replace(/\s+/g, ' ').trim();
  }

  function clearHighlight() {
    if (activeSectionEl) {
      activeSectionEl.classList.remove('a11y-reading');
      activeSectionEl = null;
    }
  }

  function highlightAndScroll(section) {
    clearHighlight();
    activeSectionEl = section;
    section.classList.add('a11y-reading');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateReadToggleUI() {
    if (!btnReadToggle) return;
    const reading = readingIndex >= 0 && !isPaused;
    btnReadToggle.setAttribute('aria-pressed', String(reading));
    btnReadToggle.textContent = reading ? '⏸ Pausar lectura' : '▶ Leer la página';
  }

  function speakSection(index) {
    if (!speechSupported) return;
    if (index < 0 || index >= sections.length) {
      stopReading();
      announce('Fin de la lectura de la página');
      return;
    }

    readingIndex = index;
    isPaused = false;
    window.speechSynthesis.cancel(); // limpia cualquier lectura previa

    const section = sections[index];
    const name = getSectionName(section);
    const text = getSectionText(section);

    highlightAndScroll(section);
    announce('Leyendo (' + (index + 1) + '/' + sections.length + '): ' + name);

    const utterance = new SpeechSynthesisUtterance(name + '. ' + text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;

    utterance.onend = function () {
      if (readingIndex === index && !isPaused) {
        speakSection(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
    updateReadToggleUI();
  }

  function stopReading() {
    if (speechSupported) window.speechSynthesis.cancel();
    readingIndex = -1;
    isPaused = false;
    clearHighlight();
    updateReadToggleUI();
    announce('Lectura detenida');
  }

  if (!speechSupported) {
    // Si el navegador no soporta lectura en voz alta, avisamos y
    // deshabilitamos los controles en vez de dejarlos sin función.
    [btnReadToggle, btnReadStop, btnReadPrev, btnReadNext].forEach(function (b) {
      if (b) b.disabled = true;
    });
    announce('Tu navegador no soporta la lectura en voz alta');
  } else {
    if (btnReadToggle) {
      btnReadToggle.addEventListener('click', function () {
        if (readingIndex === -1) {
          // No se ha empezado a leer: arranca desde la sección visible
          speakSection(0);
        } else if (isPaused) {
          // Estaba en pausa: reanuda
          isPaused = false;
          window.speechSynthesis.resume();
          announce('Lectura reanudada');
          updateReadToggleUI();
        } else {
          // Está leyendo: pausa
          isPaused = true;
          window.speechSynthesis.pause();
          announce('Lectura en pausa');
          updateReadToggleUI();
        }
      });
    }

    if (btnReadStop) {
      btnReadStop.addEventListener('click', stopReading);
    }

    if (btnReadPrev) {
      btnReadPrev.addEventListener('click', function () {
        const current = readingIndex === -1 ? 0 : readingIndex;
        speakSection(Math.max(current - 1, 0));
      });
    }

    if (btnReadNext) {
      btnReadNext.addEventListener('click', function () {
        const current = readingIndex === -1 ? -1 : readingIndex;
        speakSection(Math.min(current + 1, sections.length - 1));
      });
    }

    // Si la persona navega fuera de la página (o la cierra), detenemos
    // la síntesis de voz para que no siga sonando de fondo.
    window.addEventListener('beforeunload', function () {
      window.speechSynthesis.cancel();
    });
  }

}); // fin DOMContentLoaded
