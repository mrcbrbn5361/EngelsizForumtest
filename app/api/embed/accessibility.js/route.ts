import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const scriptContent = `
/**
 * EngelsizForum Evrensel Erişilebilirlik Widget'ı (0 TL Sınırsız Lisans)
 * WCAG 2.1 AAA Standartlarında Bağımsız JavaScript Çözümü
 * Destekleyen: EngelsizForum.com & Microsoft Fluent Erişilebilirlik İlkeleri
 */
(function() {
  if (window.__EF_A11Y_WIDGET_LOADED__) return;
  window.__EF_A11Y_WIDGET_LOADED__ = true;

  var currentSpeech = null;
  var isSpeechActive = false;
  var fontSizeLevel = 0; // -1, 0, 1, 2, 3
  var isHighContrast = false;
  var isDyslexiaFont = false;
  var isRulerActive = false;
  var isLargeCursor = false;

  // Enjekte edilen stiller
  var style = document.createElement('style');
  style.id = 'ef-a11y-styles';
  style.textContent = [
    '#ef-a11y-trigger { position: fixed; bottom: 20px; right: 20px; z-index: 999999; width: 48px; height: 48px; border-radius: 50%; background: #0078D4; color: #ffffff; border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s; font-family: Segoe UI, system-ui, sans-serif; }',
    '#ef-a11y-trigger:hover { transform: scale(1.08); background: #106EBE; }',
    '#ef-a11y-trigger:focus-visible { outline: 3px solid #ffaa00; outline-offset: 3px; }',
    '#ef-a11y-modal { position: fixed; bottom: 80px; right: 20px; z-index: 999999; width: 320px; max-width: calc(100vw - 40px); background: #1f1f1f; color: #f3f3f3; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; box-shadow: 0 12px 32px rgba(0,0,0,0.45); font-family: "Segoe UI", -apple-system, sans-serif; display: none; flex-direction: column; overflow: hidden; backdrop-filter: blur(20px); }',
    '#ef-a11y-modal.open { display: flex; animation: efFadeIn 0.2s ease-out; }',
    '@keyframes efFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',
    '.ef-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #2b2b2b; border-bottom: 1px solid rgba(255,255,255,0.1); }',
    '.ef-title { font-size: 13px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 6px; }',
    '.ef-close { background: none; border: none; color: #cccccc; cursor: pointer; font-size: 16px; padding: 2px 6px; border-radius: 4px; }',
    '.ef-close:hover { background: rgba(255,255,255,0.1); color: #ffffff; }',
    '.ef-body { padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 420px; overflow-y: auto; }',
    '.ef-btn { background: #2d2d2d; border: 1px solid rgba(255,255,255,0.12); color: #e1e1e1; padding: 8px 6px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: background 0.15s, border-color 0.15s; text-align: center; }',
    '.ef-btn:hover { background: #383838; border-color: #0078D4; color: #ffffff; }',
    '.ef-btn.active { background: #0078D4; color: #ffffff; border-color: #005a9e; }',
    '.ef-footer { padding: 8px 12px; background: #181818; border-top: 1px solid rgba(255,255,255,0.08); font-size: 10px; color: #888888; text-align: center; }',
    '.ef-footer a { color: #60a5fa; text-decoration: none; font-weight: 600; }',
    '.ef-footer a:hover { text-decoration: underline; }',
    '#ef-reading-ruler { position: fixed; left: 0; width: 100%; height: 28px; background: rgba(255, 235, 59, 0.25); border-top: 2px solid #fbc02d; border-bottom: 2px solid #fbc02d; pointer-events: none; z-index: 999998; display: none; }',
    'html.ef-high-contrast { filter: contrast(160%) !important; background: #000000 !important; }',
    'html.ef-high-contrast * { background-color: #000000 !important; color: #ffff00 !important; border-color: #ffff00 !important; }',
    'html.ef-dyslexia * { letter-spacing: 0.08em !important; word-spacing: 0.15em !important; line-height: 1.85 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important; }',
    'html.ef-large-cursor, html.ef-large-cursor * { cursor: default !important; }'
  ].join('\\n');
  document.head.appendChild(style);

  // Trigger Butonu
  var trigger = document.createElement('button');
  trigger.id = 'ef-a11y-trigger';
  trigger.setAttribute('aria-label', 'Erişilebilirlik Araçlarını Aç');
  trigger.title = 'Erişilebilirlik Menüsü (EngelsizForum 0 TL Widget)';
  trigger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>';
  document.body.appendChild(trigger);

  // Okuma Cetveli
  var ruler = document.createElement('div');
  ruler.id = 'ef-reading-ruler';
  document.body.appendChild(ruler);

  window.addEventListener('mousemove', function(e) {
    if (isRulerActive) {
      ruler.style.top = (e.clientY - 14) + 'px';
    }
  });

  // Modal Panel
  var modal = document.createElement('div');
  modal.id = 'ef-a11y-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Erişilebilirlik Ayarları');
  modal.innerHTML = [
    '<div class="ef-header">',
    '  <div class="ef-title">',
    '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0078D4" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    '    <span>Erişilebilirlik Asistanı</span>',
    '  </div>',
    '  <button class="ef-close" id="ef-close-btn" aria-label="Kapat">✕</button>',
    '</div>',
    '<div class="ef-body">',
    '  <button class="ef-btn" id="ef-btn-tts"><span>🔊</span><span>Metni Seslendir</span></button>',
    '  <button class="ef-btn" id="ef-btn-font-plus"><span>🔍+</span><span>Yazıyı Büyüt</span></button>',
    '  <button class="ef-btn" id="ef-btn-font-minus"><span>🔍-</span><span>Yazıyı Küçült</span></button>',
    '  <button class="ef-btn" id="ef-btn-contrast"><span>🌓</span><span>Yüksek Kontrast</span></button>',
    '  <button class="ef-btn" id="ef-btn-dyslexia"><span>📖</span><span>Disleksi Yazı Tipi</span></button>',
    '  <button class="ef-btn" id="ef-btn-ruler"><span>📏</span><span>Okuma Cetveli</span></button>',
    '  <button class="ef-btn" id="ef-btn-links"><span>🔗</span><span>Linkleri Belirginleştir</span></button>',
    '  <button class="ef-btn" id="ef-btn-reset"><span>🔄</span><span>Ayarları Sıfırla</span></button>',
    '</div>',
    '<div class="ef-footer">',
    '  0 TL Açık Kaynak Widget · <a href="https://engelsizforum.com" target="_blank" rel="noopener">EngelsizForum</a>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);

  // Olay Dinleyicileri
  trigger.addEventListener('click', function() {
    modal.classList.toggle('open');
  });

  document.getElementById('ef-close-btn').addEventListener('click', function() {
    modal.classList.remove('open');
  });

  // Metni Seslendir (TTS)
  document.getElementById('ef-btn-tts').addEventListener('click', function() {
    var btn = this;
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız sesli okumayı desteklemiyor.');
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      btn.classList.remove('active');
      return;
    }

    var selectedText = window.getSelection().toString().trim();
    var textToRead = selectedText || document.querySelector('article, main, body').innerText.substring(0, 500);

    if (!textToRead) return;

    var utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'tr-TR';
    utterance.onend = function() { btn.classList.remove('active'); };
    utterance.onerror = function() { btn.classList.remove('active'); };
    window.speechSynthesis.speak(utterance);
    btn.classList.add('active');
  });

  // Yazıyı Büyüt / Küçült
  document.getElementById('ef-btn-font-plus').addEventListener('click', function() {
    if (fontSizeLevel < 3) {
      fontSizeLevel++;
      applyFontScale();
    }
  });

  document.getElementById('ef-btn-font-minus').addEventListener('click', function() {
    if (fontSizeLevel > -1) {
      fontSizeLevel--;
      applyFontScale();
    }
  });

  function applyFontScale() {
    var scales = { '-1': '90%', '0': '100%', '1': '115%', '2': '130%', '3': '150%' };
    document.documentElement.style.fontSize = scales[fontSizeLevel] || '100%';
  }

  // Yüksek Kontrast
  document.getElementById('ef-btn-contrast').addEventListener('click', function() {
    isHighContrast = !isHighContrast;
    document.documentElement.classList.toggle('ef-high-contrast', isHighContrast);
    this.classList.toggle('active', isHighContrast);
  });

  // Disleksi Yazı Tipi
  document.getElementById('ef-btn-dyslexia').addEventListener('click', function() {
    isDyslexiaFont = !isDyslexiaFont;
    document.documentElement.classList.toggle('ef-dyslexia', isDyslexiaFont);
    this.classList.toggle('active', isDyslexiaFont);
  });

  // Okuma Cetveli
  document.getElementById('ef-btn-ruler').addEventListener('click', function() {
    isRulerActive = !isRulerActive;
    ruler.style.display = isRulerActive ? 'block' : 'none';
    this.classList.toggle('active', isRulerActive);
  });

  // Linkleri Belirginleştir
  var linksHighlighted = false;
  document.getElementById('ef-btn-links').addEventListener('click', function() {
    linksHighlighted = !linksHighlighted;
    var allLinks = document.querySelectorAll('a');
    for (var i = 0; i < allLinks.length; i++) {
      if (linksHighlighted) {
        allLinks[i].style.outline = '2px dashed #f59e0b';
        allLinks[i].style.textDecoration = 'underline';
      } else {
        allLinks[i].style.outline = '';
        allLinks[i].style.textDecoration = '';
      }
    }
    this.classList.toggle('active', linksHighlighted);
  });

  // Sıfırla
  document.getElementById('ef-btn-reset').addEventListener('click', function() {
    fontSizeLevel = 0;
    applyFontScale();
    isHighContrast = false;
    document.documentElement.classList.remove('ef-high-contrast');
    isDyslexiaFont = false;
    document.documentElement.classList.remove('ef-dyslexia');
    isRulerActive = false;
    ruler.style.display = 'none';
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    var btns = modal.querySelectorAll('.ef-btn');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  });
})();
  `;

  return new NextResponse(scriptContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
