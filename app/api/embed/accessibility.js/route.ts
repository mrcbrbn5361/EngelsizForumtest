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
    '#ef-a11y-trigger { position: fixed; bottom: 20px; right: 20px; z-index: 999999; width: 48px; height: 48px; border-radius: 12px; background: #6366f1; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 24px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s; font-family: Segoe UI, system-ui, sans-serif; }',
    '#ef-a11y-trigger:hover { transform: translateY(-4px); background: #818cf8; }',
    '#ef-a11y-trigger:focus-visible { outline: 3px solid #6366f1; outline-offset: 3px; }',
    '#ef-a11y-modal { position: fixed; bottom: 80px; right: 20px; z-index: 999999; width: 320px; max-width: calc(100vw - 40px); background: #111b2e; color: #f8fafc; border: 1px solid #1e293b; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.5); font-family: "Segoe UI", -apple-system, sans-serif; display: none; flex-direction: column; overflow: hidden; backdrop-filter: blur(24px); }',
    '#ef-a11y-modal.open { display: flex; animation: efFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }',
    '@keyframes efFadeIn { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }',
    '.ef-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #18243a; border-bottom: 1px solid #1e293b; }',
    '.ef-title { font-size: 13px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }',
    '.ef-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; padding: 4px; border-radius: 6px; transition: color 0.15s, background 0.15s; }',
    '.ef-close:hover { background: rgba(255,255,255,0.05); color: #ffffff; }',
    '.ef-body { padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 420px; overflow-y: auto; }',
    '.ef-btn { background: #18243a; border: 1px solid #1e293b; color: #cbd5e1; padding: 10px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s ease; text-align: center; }',
    '.ef-btn:hover { background: #1e293b; border-color: #6366f1; color: #ffffff; transform: translateY(-1px); }',
    '.ef-btn.active { background: #6366f1; color: #ffffff; border-color: #818cf8; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }',
    '.ef-footer { padding: 10px 14px; background: #0b1220; border-top: 1px solid #1e293b; font-size: 10px; color: #64748b; text-align: center; font-weight: 500; }',
    '.ef-footer a { color: #818cf8; text-decoration: none; font-weight: 700; }',
    '.ef-footer a:hover { color: #6366f1; text-decoration: underline; }',
    '#ef-reading-ruler { position: fixed; left: 0; width: 100%; height: 32px; background: rgba(99, 102, 241, 0.15); border-top: 2px solid #6366f1; border-bottom: 2px solid #6366f1; pointer-events: none; z-index: 999998; display: none; box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }',
    'html.ef-high-contrast { filter: contrast(160%) !important; background: #000000 !important; }',
    'html.ef-high-contrast * { background-color: #000000 !important; color: #facc15 !important; border-color: #facc15 !important; }',
    'html.ef-dyslexia * { letter-spacing: 0.08em !important; word-spacing: 0.15em !important; line-height: 1.85 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif !important; }',
    'html.ef-large-cursor, html.ef-large-cursor * { cursor: default !important; }'
  ].join('\\n');
  document.head.appendChild(style);

  // Trigger Butonu
  var trigger = document.createElement('button');
  trigger.id = 'ef-a11y-trigger';
  trigger.setAttribute('aria-label', 'Erişilebilirlik Araçlarını Aç');
  trigger.title = 'Erişilebilirlik Menüsü (EngelsizForum)';
  trigger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>';
  document.body.appendChild(trigger);

  // Okuma Cetveli
  var ruler = document.createElement('div');
  ruler.id = 'ef-reading-ruler';
  document.body.appendChild(ruler);

  window.addEventListener('mousemove', function(e) {
    if (isRulerActive) {
      ruler.style.top = (e.clientY - 16) + 'px';
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
    '    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>',
    '    <span>Erişilebilirlik</span>',
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
