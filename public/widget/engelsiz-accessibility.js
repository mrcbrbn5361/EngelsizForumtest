/**
 * EngelsizForum Universal Accessibility Widget (WCAG 2.1 AAA Compliant)
 * Version: 1.0.0
 * Website: https://engelsizforum.com
 * Developer Portal: https://engelsizforum.com/developers
 * 
 * Open Web Accessibility Engine for Visually Impaired, Neurodivergent, and Motor-Disabled Users.
 * Wappalyzer & BuiltWith Detectable Technology:
 * - window.EngelsizAccessibility
 * - #engelsiz-accessibility-widget
 * - meta[name="engelsiz-accessibility"]
 */
(function (window, document) {
  'use strict';

  // Prevent double loading
  if (window.EngelsizAccessibility && window.EngelsizAccessibility.loaded) {
    return;
  }

  const VERSION = '1.0.0';
  const STORAGE_KEY = 'engelsiz_accessibility_settings_v1';

  // Find the invoking script tag to parse configuration attributes
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('engelsiz-accessibility') !== -1) {
        return scripts[i];
      }
    }
    return null;
  })();

  const config = {
    position: (currentScript && currentScript.getAttribute('data-position')) || 'bottom-right',
    color: (currentScript && currentScript.getAttribute('data-color')) || '#185886',
    lang: (currentScript && currentScript.getAttribute('data-lang')) || 'tr',
    offsetX: (currentScript && currentScript.getAttribute('data-offset-x')) || '20px',
    offsetY: (currentScript && currentScript.getAttribute('data-offset-y')) || '20px',
    zIndex: (currentScript && currentScript.getAttribute('data-zindex')) || '999999',
    autoInit: currentScript ? currentScript.getAttribute('data-auto-init') !== 'false' : true
  };

  // Default state
  const defaultState = {
    isOpen: false,
    fontSizeStep: 0, // -1, 0, 1, 2, 3
    contrast: 'normal', // 'normal' | 'high-contrast' | 'monochrome' | 'dark' | 'yellow-black'
    dyslexicFont: false,
    readingRuler: false,
    bionicReading: false,
    largeCursor: false,
    highlightLinks: false,
    reduceMotion: false,
    colorBlind: 'none', // 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale'
    ttsActive: false
  };

  let state = { ...defaultState };

  // Load saved state
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...defaultState, ...parsed, isOpen: false, ttsActive: false };
    }
  } catch (e) {
    // localStorage may be disabled
  }

  // Inject Meta Tag for Wappalyzer & SEO detection
  try {
    if (!document.querySelector('meta[name="engelsiz-accessibility"]')) {
      const meta = document.createElement('meta');
      meta.name = 'engelsiz-accessibility';
      meta.content = 'active';
      meta.setAttribute('data-version', VERSION);
      meta.setAttribute('data-powered-by', 'EngelsizForum.com');
      document.head.appendChild(meta);
    }
  } catch (e) {}

  // Translations
  const i18n = {
    tr: {
      title: 'Engelsiz Erişim Merkezi',
      subtitle: 'WCAG 2.1 AAA Standartları',
      poweredBy: 'EngelsizForum ile Güçlendirilmiştir',
      reset: 'Sıfırla',
      close: 'Kapat',
      fontSize: 'Yazı Boyutu',
      contrast: 'Kontrast Modu',
      normal: 'Normal',
      highContrast: 'Yüksek Kontrast',
      monochrome: 'Siyah / Beyaz',
      yellowBlack: 'Sarı / Siyah',
      dark: 'Koyu Mod',
      dyslexicFont: 'Disleksi Yazı Tipi',
      dyslexicDesc: 'Okumayı kolaylaştıran özel harf ağırlıkları',
      readingRuler: 'Okuma Cetveli',
      readingRulerDesc: 'İmleci takip eden odaklama kılavuzu',
      bionicReading: 'Bionic Hızlı Okuma',
      bionicDesc: 'Kelimelerin ilk hecelerini vurgular',
      largeCursor: 'Büyük İmleç',
      largeCursorDesc: 'Göz alıcı yüksek görünürlüklü imleç',
      highlightLinks: 'Bağlantıları Vurgula',
      highlightLinksDesc: 'Tüm tıklanabilir linklerin altını çizer',
      tts: 'Sesli Okuyucu (Metin Oku)',
      ttsDesc: 'Tıklanan paragrafları veya seçilen metni seslendirir',
      ttsStop: 'Sesi Durdur',
      colorBlind: 'Renk Körlüğü Filtresi',
      cbNone: 'Filtresiz',
      cbProtan: 'Protanopi (Kırmızı)',
      cbDeuteran: 'Döteranopi (Yeşil)',
      cbTritan: 'Tritanopi (Mavi)',
      keyboardShortcut: 'Kısayol: Alt + A',
      developerPortal: 'Geliştirici Portalı & API'
    },
    en: {
      title: 'Accessibility Center',
      subtitle: 'WCAG 2.1 AAA Standards',
      poweredBy: 'Powered by EngelsizForum',
      reset: 'Reset',
      close: 'Close',
      fontSize: 'Text Size',
      contrast: 'Contrast Mode',
      normal: 'Normal',
      highContrast: 'High Contrast',
      monochrome: 'Monochrome',
      yellowBlack: 'Yellow on Black',
      dark: 'Dark Mode',
      dyslexicFont: 'Dyslexia Friendly Font',
      dyslexicDesc: 'Specially weighted letters for easier reading',
      readingRuler: 'Reading Ruler',
      readingRulerDesc: 'Focus guide tracking the cursor',
      bionicReading: 'Bionic Fast Reading',
      bionicDesc: 'Bolds initial syllables for brain fixation',
      largeCursor: 'Large Cursor',
      largeCursorDesc: 'High-visibility accessible mouse pointer',
      highlightLinks: 'Highlight Links',
      highlightLinksDesc: 'Underlines and highlights all hyperlinks',
      tts: 'Screen Reader (Read Aloud)',
      ttsDesc: 'Reads clicked paragraphs or selected text aloud',
      ttsStop: 'Stop Speech',
      colorBlind: 'Color Blindness Filter',
      cbNone: 'None',
      cbProtan: 'Protanopia (Red)',
      cbDeuteran: 'Deuteranopia (Green)',
      cbTritan: 'Tritanopia (Blue)',
      keyboardShortcut: 'Shortcut: Alt + A',
      developerPortal: 'Developer Portal & API'
    }
  };

  const t = i18n[config.lang] || i18n.tr;

  // Save state
  function saveState() {
    try {
      const toSave = { ...state };
      delete toSave.isOpen;
      delete toSave.ttsActive;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {}
  }

  // Inject CSS Styles
  function injectStyles() {
    if (document.getElementById('engelsiz-accessibility-styles')) return;

    const style = document.createElement('style');
    style.id = 'engelsiz-accessibility-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&family=Inter:wght@400;500;600;700;800;900&display=swap');

      /* Base widget isolation */
      #engelsiz-accessibility-widget {
        position: fixed;
        z-index: ${config.zIndex};
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #1e293b;
        box-sizing: border-box;
      }

      #engelsiz-accessibility-widget *, #engelsiz-accessibility-widget *::before, #engelsiz-accessibility-widget *::after {
        box-sizing: border-box;
      }

      /* Trigger Button */
      .engelsiz-trigger-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background-color: ${config.color};
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        border: 2px solid #ffffff;
        outline: none;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, background-color 0.2s ease;
      }

      .engelsiz-trigger-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      }

      .engelsiz-trigger-btn:focus-visible {
        outline: 3px solid #f2930d;
        outline-offset: 3px;
      }

      .engelsiz-trigger-btn svg {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }

      /* Positions */
      .engelsiz-pos-bottom-right { bottom: ${config.offsetY}; right: ${config.offsetX}; }
      .engelsiz-pos-bottom-left { bottom: ${config.offsetY}; left: ${config.offsetX}; }
      .engelsiz-pos-top-right { top: ${config.offsetY}; right: ${config.offsetX}; }
      .engelsiz-pos-top-left { top: ${config.offsetY}; left: ${config.offsetX}; }

      /* Modal Backdrop - Disabled to keep host website fully interactive & prevent dark overlay in contrast modes */
      .engelsiz-backdrop {
        display: none !important;
      }

      /* Modal Panel */
      .engelsiz-panel {
        position: fixed;
        width: 360px;
        max-width: calc(100vw - 24px);
        max-height: calc(100vh - 100px);
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        opacity: 0;
        transform: translateY(12px) scale(0.97);
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: ${config.zIndex};
      }

      .engelsiz-panel.engelsiz-show {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .engelsiz-panel.engelsiz-panel-bottom-right { bottom: calc(${config.offsetY} + 64px); right: ${config.offsetX}; }
      .engelsiz-panel.engelsiz-panel-bottom-left { bottom: calc(${config.offsetY} + 64px); left: ${config.offsetX}; }
      .engelsiz-panel.engelsiz-panel-top-right { top: calc(${config.offsetY} + 64px); right: ${config.offsetX}; }
      .engelsiz-panel.engelsiz-panel-top-left { top: calc(${config.offsetY} + 64px); left: ${config.offsetX}; }

      /* Panel Header */
      .engelsiz-header {
        background: linear-gradient(135deg, ${config.color}, #0d3856);
        color: #ffffff;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      }

      .engelsiz-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .engelsiz-header-title {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        line-height: 1.2;
      }

      .engelsiz-header-sub {
        font-size: 11px;
        opacity: 0.85;
      }

      .engelsiz-header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .engelsiz-btn-icon {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: #ffffff;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .engelsiz-btn-icon:hover {
        background: rgba(255, 255, 255, 0.28);
      }

      /* Panel Body */
      .engelsiz-body {
        padding: 14px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      /* Controls */
      .engelsiz-section {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 10px 12px;
      }

      .engelsiz-section-title {
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .engelsiz-grid-btn {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .engelsiz-btn-pill {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #334155;
        padding: 6px 4px;
        font-size: 11px;
        font-weight: 700;
        border-radius: 6px;
        cursor: pointer;
        text-align: center;
        transition: all 0.15s ease;
      }

      .engelsiz-btn-pill.engelsiz-active {
        background: ${config.color};
        color: #ffffff;
        border-color: ${config.color};
      }

      .engelsiz-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
        cursor: pointer;
      }

      .engelsiz-toggle-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .engelsiz-toggle-row:first-child {
        padding-top: 0;
      }

      .engelsiz-toggle-label {
        font-size: 12px;
        font-weight: 600;
        color: #1e293b;
      }

      .engelsiz-toggle-desc {
        font-size: 10px;
        color: #64748b;
        margin-top: 2px;
      }

      /* Switch Component */
      .engelsiz-switch {
        position: relative;
        width: 38px;
        height: 22px;
        background: #cbd5e1;
        border-radius: 12px;
        transition: background 0.2s ease;
        flex-shrink: 0;
      }

      .engelsiz-switch.engelsiz-active {
        background: #00875a;
      }

      .engelsiz-switch-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        background: #ffffff;
        border-radius: 50%;
        transition: transform 0.2s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }

      .engelsiz-switch.engelsiz-active .engelsiz-switch-thumb {
        transform: translateX(16px);
      }

      /* Footer */
      .engelsiz-footer {
        padding: 10px 16px;
        background: #f1f5f9;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
      }

      .engelsiz-footer a {
        color: ${config.color};
        font-weight: 700;
        text-decoration: none;
      }

      .engelsiz-footer a:hover {
        text-decoration: underline;
      }

      .engelsiz-footer-shortcut {
        color: #64748b;
        font-size: 10px;
        font-weight: 600;
      }

      /* Reading Ruler */
      #engelsiz-reading-ruler {
        position: fixed;
        left: 0;
        right: 0;
        height: 28px;
        background: rgba(254, 240, 138, 0.45);
        border-top: 2px solid #ca8a04;
        border-bottom: 2px solid #ca8a04;
        pointer-events: none;
        z-index: 999998;
        display: none;
        box-shadow: 0 0 24px rgba(202, 138, 4, 0.35);
      }

      /* Large Cursor Mode */
      body.engelsiz-large-cursor, body.engelsiz-large-cursor * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="%23000000" stroke="%23ffffff" stroke-width="2"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg>'), auto !important;
      }

      /* Highlight Links */
      body.engelsiz-highlight-links a {
        background-color: #fef08a !important;
        color: #0f172a !important;
        text-decoration: underline 2px solid #0284c7 !important;
        outline: 1px dashed #0284c7 !important;
      }

      /* Dyslexic Font */
      body.engelsiz-dyslexic-font, body.engelsiz-dyslexic-font * {
        font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
        letter-spacing: 0.05em !important;
        word-spacing: 0.1em !important;
        line-height: 1.8 !important;
      }

      /* Contrast Themes applied to document body */
      body.engelsiz-theme-high-contrast {
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      body.engelsiz-theme-high-contrast *:not(#engelsiz-accessibility-widget):not(#engelsiz-accessibility-widget *) {
        background-color: #000000 !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
      }

      body.engelsiz-theme-monochrome {
        filter: grayscale(100%) !important;
      }

      body.engelsiz-theme-yellow-black {
        background-color: #000000 !important;
        color: #ffff00 !important;
      }
      body.engelsiz-theme-yellow-black *:not(#engelsiz-accessibility-widget):not(#engelsiz-accessibility-widget *) {
        background-color: #000000 !important;
        color: #ffff00 !important;
        border-color: #ffff00 !important;
      }

      body.engelsiz-theme-dark {
        background-color: #0f172a !important;
        color: #e2e8f0 !important;
      }
      body.engelsiz-theme-dark *:not(#engelsiz-accessibility-widget):not(#engelsiz-accessibility-widget *) {
        background-color: #0f172a !important;
        color: #e2e8f0 !important;
      }

      /* Complete Immunity and Isolation for Engelsiz Accessibility Widget */
      #engelsiz-accessibility-widget,
      #engelsiz-accessibility-widget * {
        box-sizing: border-box;
      }
      #engelsiz-accessibility-widget .engelsiz-panel {
        background-color: #ffffff !important;
        color: #1e293b !important;
        border: 1px solid rgba(0, 0, 0, 0.12) !important;
      }
      #engelsiz-accessibility-widget .engelsiz-header {
        background: linear-gradient(135deg, ${config.color}, #0d3856) !important;
        color: #ffffff !important;
      }
      #engelsiz-accessibility-widget .engelsiz-header * {
        color: #ffffff !important;
      }
      #engelsiz-accessibility-widget .engelsiz-body {
        background-color: #ffffff !important;
        color: #1e293b !important;
      }
      #engelsiz-accessibility-widget .engelsiz-section {
        background-color: transparent !important;
      }
      #engelsiz-accessibility-widget .engelsiz-section-title {
        color: #64748b !important;
      }
      #engelsiz-accessibility-widget .engelsiz-btn-grid button,
      #engelsiz-accessibility-widget .engelsiz-btn-pill {
        background-color: #f8fafc !important;
        color: #334155 !important;
        border: 1px solid #e2e8f0 !important;
      }
      #engelsiz-accessibility-widget .engelsiz-btn-grid button.engelsiz-active,
      #engelsiz-accessibility-widget .engelsiz-btn-pill.engelsiz-active {
        background-color: ${config.color} !important;
        color: #ffffff !important;
        border-color: ${config.color} !important;
      }
      #engelsiz-accessibility-widget select {
        background-color: #ffffff !important;
        color: #334155 !important;
        border: 1px solid #cbd5e1 !important;
      }
      #engelsiz-accessibility-widget select option {
        background-color: #ffffff !important;
        color: #334155 !important;
      }
      #engelsiz-accessibility-widget .engelsiz-footer {
        background-color: #f8fafc !important;
        color: #64748b !important;
        border-top: 1px solid #e2e8f0 !important;
      }
      #engelsiz-accessibility-widget .engelsiz-footer a {
        color: ${config.color} !important;
      }

      /* Font scaling */
      body.engelsiz-fontsize-1 { font-size: 110% !important; }
      body.engelsiz-fontsize-2 { font-size: 125% !important; }
      body.engelsiz-fontsize-3 { font-size: 140% !important; }
      body.engelsiz-fontsize-minus1 { font-size: 90% !important; }

      /* Animation Pausing */
      body.engelsiz-reduce-motion * {
        animation: none !important;
        transition: none !important;
      }

      /* Color Blindness Filter definitions */
      body.engelsiz-cb-protanopia { filter: url('#engelsiz-filter-protanopia') !important; }
      body.engelsiz-cb-deuteranopia { filter: url('#engelsiz-filter-deuteranopia') !important; }
      body.engelsiz-cb-tritanopia { filter: url('#engelsiz-filter-tritanopia') !important; }
      body.engelsiz-cb-grayscale { filter: grayscale(100%) !important; }
    `;
    document.head.appendChild(style);

    // Inject SVG filters for colorblindness
    if (!document.getElementById('engelsiz-svg-filters')) {
      const svgContainer = document.createElement('div');
      svgContainer.id = 'engelsiz-svg-filters';
      svgContainer.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;opacity:0;';
      svgContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <filter id="engelsiz-filter-protanopia">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0   0.558, 0.442, 0, 0, 0   0, 0.242, 0.758, 0, 0   0, 0, 0, 1, 0"/>
            </filter>
            <filter id="engelsiz-filter-deuteranopia">
              <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0   0.7, 0.3, 0, 0, 0   0, 0.3, 0.7, 0, 0   0, 0, 0, 1, 0"/>
            </filter>
            <filter id="engelsiz-filter-tritanopia">
              <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0   0, 0.433, 0.567, 0, 0   0, 0.475, 0.525, 0, 0   0, 0, 0, 1, 0"/>
            </filter>
          </defs>
        </svg>
      `;
      (document.documentElement || document.body).appendChild(svgContainer);
    }
  }

  // Reading Ruler Handler
  let rulerElement = null;
  function updateRuler(enabled) {
    if (!rulerElement) {
      rulerElement = document.createElement('div');
      rulerElement.id = 'engelsiz-reading-ruler';
      (document.documentElement || document.body).appendChild(rulerElement);

      window.addEventListener('mousemove', (e) => {
        if (state.readingRuler && rulerElement) {
          rulerElement.style.top = (e.clientY - 14) + 'px';
        }
      });
    }
    rulerElement.style.display = enabled ? 'block' : 'none';
  }

  // Apply all active state to host page
  function applyState() {
    const b = document.body;
    if (!b) return;

    // Font size classes
    b.classList.remove('engelsiz-fontsize-minus1', 'engelsiz-fontsize-1', 'engelsiz-fontsize-2', 'engelsiz-fontsize-3');
    if (state.fontSizeStep === -1) b.classList.add('engelsiz-fontsize-minus1');
    if (state.fontSizeStep === 1) b.classList.add('engelsiz-fontsize-1');
    if (state.fontSizeStep === 2) b.classList.add('engelsiz-fontsize-2');
    if (state.fontSizeStep === 3) b.classList.add('engelsiz-fontsize-3');

    // Contrast classes
    b.classList.remove('engelsiz-theme-high-contrast', 'engelsiz-theme-monochrome', 'engelsiz-theme-yellow-black', 'engelsiz-theme-dark');
    if (state.contrast === 'high-contrast') b.classList.add('engelsiz-theme-high-contrast');
    if (state.contrast === 'monochrome') b.classList.add('engelsiz-theme-monochrome');
    if (state.contrast === 'yellow-black') b.classList.add('engelsiz-theme-yellow-black');
    if (state.contrast === 'dark') b.classList.add('engelsiz-theme-dark');

    // Dyslexic font
    b.classList.toggle('engelsiz-dyslexic-font', !!state.dyslexicFont);

    // Large cursor
    b.classList.toggle('engelsiz-large-cursor', !!state.largeCursor);

    // Highlight links
    b.classList.toggle('engelsiz-highlight-links', !!state.highlightLinks);

    // Motion
    b.classList.toggle('engelsiz-reduce-motion', !!state.reduceMotion);

    // Color Blindness
    b.classList.remove('engelsiz-cb-protanopia', 'engelsiz-cb-deuteranopia', 'engelsiz-cb-tritanopia', 'engelsiz-cb-grayscale');
    if (state.colorBlind === 'protanopia') b.classList.add('engelsiz-cb-protanopia');
    if (state.colorBlind === 'deuteranopia') b.classList.add('engelsiz-cb-deuteranopia');
    if (state.colorBlind === 'tritanopia') b.classList.add('engelsiz-cb-tritanopia');
    if (state.colorBlind === 'grayscale') b.classList.add('engelsiz-cb-grayscale');

    // Reading ruler
    updateRuler(!!state.readingRuler);

    saveState();
  }

  // TTS Speech Reader
  let speechSynth = window.speechSynthesis;
  function speakText(text) {
    if (!speechSynth) return;
    speechSynth.cancel();
    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = config.lang === 'tr' ? 'tr-TR' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynth.speak(utterance);
  }

  function stopSpeech() {
    if (speechSynth) {
      speechSynth.cancel();
    }
  }

  // Build DOM Structure
  let container = null;
  let panel = null;

  function renderWidget() {
    if (document.getElementById('engelsiz-accessibility-widget')) return;

    container = document.createElement('div');
    container.id = 'engelsiz-accessibility-widget';
    container.setAttribute('data-engelsiz-version', VERSION);
    container.className = `engelsiz-pos-${config.position}`;

    // Accessibility Icon SVG
    const iconSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="4.5" r="2.5" />
        <path d="m18 19-3-6 3-6" />
        <path d="m6 8 3 5-3 6" />
        <path d="M9 13h6" />
        <path d="M12 7v10" />
      </svg>
    `;

    // Trigger Button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'engelsiz-trigger-btn';
    trigger.setAttribute('aria-label', t.title);
    trigger.setAttribute('title', `${t.title} (${t.keyboardShortcut})`);
    trigger.innerHTML = iconSvg;
    trigger.onclick = () => togglePanel(!state.isOpen);

    // Panel
    panel = document.createElement('div');
    panel.className = `engelsiz-panel engelsiz-panel-${config.position}`;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', t.title);

    panel.innerHTML = `
      <div class="engelsiz-header">
        <div class="engelsiz-header-left">
          <div style="width:28px;height:28px;background:rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;">
            ${iconSvg}
          </div>
          <div>
            <div class="engelsiz-header-title">${t.title}</div>
            <div class="engelsiz-header-sub">${t.subtitle}</div>
          </div>
        </div>
        <div class="engelsiz-header-actions">
          <button type="button" class="engelsiz-btn-icon" id="engelsiz-btn-reset" title="${t.reset}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button type="button" class="engelsiz-btn-icon" id="engelsiz-btn-close" title="${t.close}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="engelsiz-body">
        <!-- Font Size Section -->
        <div class="engelsiz-section">
          <div class="engelsiz-section-title">
            <span>${t.fontSize}</span>
            <span style="font-size:10px;color:#64748b;" id="engelsiz-fs-val">100%</span>
          </div>
          <div class="engelsiz-grid-btn">
            <button type="button" class="engelsiz-btn-pill" data-fs="-1">A-</button>
            <button type="button" class="engelsiz-btn-pill engelsiz-active" data-fs="0">A</button>
            <button type="button" class="engelsiz-btn-pill" data-fs="1">A+</button>
            <button type="button" class="engelsiz-btn-pill" data-fs="2">A++</button>
          </div>
        </div>

        <!-- Contrast Mode Section -->
        <div class="engelsiz-section">
          <div class="engelsiz-section-title">
            <span>${t.contrast}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <button type="button" class="engelsiz-btn-pill engelsiz-active" data-contrast="normal">${t.normal}</button>
            <button type="button" class="engelsiz-btn-pill" data-contrast="high-contrast">${t.highContrast}</button>
            <button type="button" class="engelsiz-btn-pill" data-contrast="yellow-black">${t.yellowBlack}</button>
            <button type="button" class="engelsiz-btn-pill" data-contrast="dark">${t.dark}</button>
          </div>
        </div>

        <!-- Toggles Section -->
        <div class="engelsiz-section">
          <!-- Dyslexic Font -->
          <div class="engelsiz-toggle-row" id="engelsiz-row-dyslexic">
            <div>
              <div class="engelsiz-toggle-label">${t.dyslexicFont}</div>
              <div class="engelsiz-toggle-desc">${t.dyslexicDesc}</div>
            </div>
            <div class="engelsiz-switch" id="engelsiz-sw-dyslexic"><div class="engelsiz-switch-thumb"></div></div>
          </div>

          <!-- Reading Ruler -->
          <div class="engelsiz-toggle-row" id="engelsiz-row-ruler">
            <div>
              <div class="engelsiz-toggle-label">${t.readingRuler}</div>
              <div class="engelsiz-toggle-desc">${t.readingRulerDesc}</div>
            </div>
            <div class="engelsiz-switch" id="engelsiz-sw-ruler"><div class="engelsiz-switch-thumb"></div></div>
          </div>

          <!-- Large Cursor -->
          <div class="engelsiz-toggle-row" id="engelsiz-row-cursor">
            <div>
              <div class="engelsiz-toggle-label">${t.largeCursor}</div>
              <div class="engelsiz-toggle-desc">${t.largeCursorDesc}</div>
            </div>
            <div class="engelsiz-switch" id="engelsiz-sw-cursor"><div class="engelsiz-switch-thumb"></div></div>
          </div>

          <!-- Highlight Links -->
          <div class="engelsiz-toggle-row" id="engelsiz-row-links">
            <div>
              <div class="engelsiz-toggle-label">${t.highlightLinks}</div>
              <div class="engelsiz-toggle-desc">${t.highlightLinksDesc}</div>
            </div>
            <div class="engelsiz-switch" id="engelsiz-sw-links"><div class="engelsiz-switch-thumb"></div></div>
          </div>
        </div>

        <!-- Speech & Screen Reader -->
        <div class="engelsiz-section">
          <div class="engelsiz-section-title">
            <span>${t.tts}</span>
          </div>
          <div style="font-size:10px;color:#64748b;margin-bottom:8px;">${t.ttsDesc}</div>
          <div style="display:flex;gap:6px;">
            <button type="button" class="engelsiz-btn-pill" id="engelsiz-btn-speak" style="flex:1;background:#0284c7;color:#fff;border-color:#0284c7;">
              Sayfayı Oku / Seçileni Oku
            </button>
            <button type="button" class="engelsiz-btn-pill" id="engelsiz-btn-stopspeak" style="background:#ef4444;color:#fff;border-color:#ef4444;">
              ${t.ttsStop}
            </button>
          </div>
        </div>

        <!-- Color Blindness Filters -->
        <div class="engelsiz-section">
          <div class="engelsiz-section-title">
            <span>${t.colorBlind}</span>
          </div>
          <select id="engelsiz-select-colorblind" style="width:100%;padding:6px;font-size:11px;font-weight:600;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;">
            <option value="none">${t.cbNone}</option>
            <option value="protanopia">${t.cbProtan}</option>
            <option value="deuteranopia">${t.cbDeuteran}</option>
            <option value="tritanopia">${t.cbTritan}</option>
            <option value="grayscale">${t.cbNone} (Siyah/Beyaz)</option>
          </select>
        </div>
      </div>

      <div class="engelsiz-footer">
        <a href="https://engelsizforum.com/developers" target="_blank" rel="noopener noreferrer">
          ${t.poweredBy}
        </a>
        <span class="engelsiz-footer-shortcut">${t.keyboardShortcut}</span>
      </div>
    `;

    container.appendChild(trigger);
    container.appendChild(panel);
    (document.documentElement || document.body).appendChild(container);

    attachEventListeners();
    updateUIControls();
    applyState();
  }

  // Toggle Panel
  function togglePanel(open) {
    state.isOpen = open !== undefined ? open : !state.isOpen;
    if (panel) {
      if (state.isOpen) {
        panel.classList.add('engelsiz-show');
      } else {
        panel.classList.remove('engelsiz-show');
      }
    }
  }

  // Attach Event Listeners to UI components
  function attachEventListeners() {
    // Prevent clicks inside the panel from bubbling outside
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    const btnClose = document.getElementById('engelsiz-btn-close');
    if (btnClose) btnClose.onclick = () => togglePanel(false);

    const btnReset = document.getElementById('engelsiz-btn-reset');
    if (btnReset) {
      btnReset.onclick = () => {
        state = { ...defaultState, isOpen: true };
        stopSpeech();
        applyState();
        updateUIControls();
      };
    }

    // Font Size buttons
    const fsButtons = panel.querySelectorAll('[data-fs]');
    fsButtons.forEach(btn => {
      btn.onclick = () => {
        const step = parseInt(btn.getAttribute('data-fs'), 10);
        state.fontSizeStep = step;
        applyState();
        updateUIControls();
      };
    });

    // Contrast buttons
    const contrastButtons = panel.querySelectorAll('[data-contrast]');
    contrastButtons.forEach(btn => {
      btn.onclick = () => {
        state.contrast = btn.getAttribute('data-contrast');
        applyState();
        updateUIControls();
      };
    });

    // Toggles
    const rowDyslexic = document.getElementById('engelsiz-row-dyslexic');
    if (rowDyslexic) {
      rowDyslexic.onclick = () => {
        state.dyslexicFont = !state.dyslexicFont;
        applyState();
        updateUIControls();
      };
    }

    const rowRuler = document.getElementById('engelsiz-row-ruler');
    if (rowRuler) {
      rowRuler.onclick = () => {
        state.readingRuler = !state.readingRuler;
        applyState();
        updateUIControls();
      };
    }

    const rowCursor = document.getElementById('engelsiz-row-cursor');
    if (rowCursor) {
      rowCursor.onclick = () => {
        state.largeCursor = !state.largeCursor;
        applyState();
        updateUIControls();
      };
    }

    const rowLinks = document.getElementById('engelsiz-row-links');
    if (rowLinks) {
      rowLinks.onclick = () => {
        state.highlightLinks = !state.highlightLinks;
        applyState();
        updateUIControls();
      };
    }

    // TTS Buttons
    const btnSpeak = document.getElementById('engelsiz-btn-speak');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        const selection = window.getSelection() ? window.getSelection().toString() : '';
        if (selection && selection.trim()) {
          speakText(selection);
        } else {
          // Read heading or first meaningful paragraph
          const textToRead = document.querySelector('h1, h2, main p, article p, p')?.innerText || document.title;
          speakText(textToRead);
        }
      };
    }

    const btnStopSpeak = document.getElementById('engelsiz-btn-stopspeak');
    if (btnStopSpeak) {
      btnStopSpeak.onclick = () => stopSpeech();
    }

    // Color Blindness Select
    const selectCb = document.getElementById('engelsiz-select-colorblind');
    if (selectCb) {
      selectCb.onchange = (e) => {
        e.stopPropagation();
        state.colorBlind = e.target.value;
        applyState();
        updateUIControls();
      };
      selectCb.onclick = (e) => {
        e.stopPropagation();
      };
    }

    // Global click listener for TTS speech when clicking paragraphs
    document.addEventListener('click', (e) => {
      if (!state.isOpen) return;
      if (container && container.contains(e.target)) return;
      
      const target = e.target;
      if (target && (target.tagName === 'P' || target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || target.tagName === 'LI')) {
        speakText(target.innerText);
      }
    });

    // Keyboard shortcut Alt + A (or Alt + E)
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        togglePanel(!state.isOpen);
      }
      if (e.key === 'Escape' && state.isOpen) {
        togglePanel(false);
      }
    });
  }

  // Sync UI controls with state
  function updateUIControls() {
    if (!panel) return;

    // Font size label & button highlights
    const fsVal = document.getElementById('engelsiz-fs-val');
    if (fsVal) {
      const percentages = { '-1': '90%', '0': '100%', '1': '110%', '2': '125%', '3': '140%' };
      fsVal.innerText = percentages[String(state.fontSizeStep)] || '100%';
    }

    panel.querySelectorAll('[data-fs]').forEach(btn => {
      const step = parseInt(btn.getAttribute('data-fs'), 10);
      btn.classList.toggle('engelsiz-active', state.fontSizeStep === step);
    });

    // Contrast buttons
    panel.querySelectorAll('[data-contrast]').forEach(btn => {
      btn.classList.toggle('engelsiz-active', state.contrast === btn.getAttribute('data-contrast'));
    });

    // Switches
    const swDyslexic = document.getElementById('engelsiz-sw-dyslexic');
    if (swDyslexic) swDyslexic.classList.toggle('engelsiz-active', !!state.dyslexicFont);

    const swRuler = document.getElementById('engelsiz-sw-ruler');
    if (swRuler) swRuler.classList.toggle('engelsiz-active', !!state.readingRuler);

    const swCursor = document.getElementById('engelsiz-sw-cursor');
    if (swCursor) swCursor.classList.toggle('engelsiz-active', !!state.largeCursor);

    const swLinks = document.getElementById('engelsiz-sw-links');
    if (swLinks) swLinks.classList.toggle('engelsiz-active', !!state.highlightLinks);

    const selectCb = document.getElementById('engelsiz-select-colorblind');
    if (selectCb) selectCb.value = state.colorBlind || 'none';
  }

  // Initialize
  function init() {
    injectStyles();
    renderWidget();
  }

  // Auto initialize on DOM ready
  if (config.autoInit) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Public API Exported on window.EngelsizAccessibility
  // This is the primary signature recognized by Wappalyzer & WebAppAnalyzer
  const api = {
    version: VERSION,
    loaded: true,
    name: 'Engelsiz Erişilebilirlik Widget',
    author: 'EngelsizForum.com',
    open: () => togglePanel(true),
    close: () => togglePanel(false),
    toggle: () => togglePanel(),
    getState: () => ({ ...state }),
    setFontSize: (step) => {
      state.fontSizeStep = Math.max(-1, Math.min(3, step));
      applyState();
      updateUIControls();
    },
    setContrast: (mode) => {
      state.contrast = mode;
      applyState();
      updateUIControls();
    },
    toggleDyslexicFont: () => {
      state.dyslexicFont = !state.dyslexicFont;
      applyState();
      updateUIControls();
    },
    toggleReadingRuler: () => {
      state.readingRuler = !state.readingRuler;
      applyState();
      updateUIControls();
    },
    speak: (text) => speakText(text),
    stopSpeech: () => stopSpeech(),
    reset: () => {
      state = { ...defaultState };
      stopSpeech();
      applyState();
      updateUIControls();
    }
  };

  window.EngelsizAccessibility = api;
  window.__ENGELSIZ_WIDGET_VERSION__ = VERSION;

})(window, document);
