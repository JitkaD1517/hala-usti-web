/* Hala Ústí – cookie lišta (Consent Mode v2) + měření kliků do GA4 (G-8C2NLE4P6N).
   Výchozí souhlasy nastavuje inline skript v <head> každé stránky (vše denied).
   Volba návštěvníka: localStorage "hala_cookie_consent" = "granted" | "denied".
   Reklamní souhlasy (ad_storage, ad_user_data, ad_personalization) zůstávají vždy denied. */
(function () {
  var KEY = 'hala_cookie_consent';
  var de = /^de/i.test(document.documentElement.lang || '');
  var T = de ? {
    text: 'Wir verwenden Cookies, um die Besucherzahlen zu messen. Einverstanden?',
    yes: 'Zustimmen', no: 'Nur notwendige', label: 'Cookie-Einstellungen', more: 'Datenschutz'
  } : {
    text: 'Používáme cookies k měření návštěvnosti webu, abychom věděli, co vás zajímá. Souhlasíte?',
    yes: 'Souhlasím', no: 'Jen nezbytné', label: 'Nastavení cookies', more: 'Ochrana osobních údajů'
  };

  function g() { if (typeof window.gtag === 'function') window.gtag.apply(null, arguments); }
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var css = '' +
    '#hala-cc{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#0B1F33;color:#fff;' +
    'border-top:3px solid #37B24D;box-shadow:0 -4px 18px rgba(0,0,0,.25);font-family:Inter,Arial,sans-serif;' +
    'padding:16px 22px;display:none}' +
    '#hala-cc.on{display:block}' +
    '#hala-cc .cc-in{max-width:1080px;margin:0 auto;display:flex;align-items:center;gap:18px;flex-wrap:wrap}' +
    '#hala-cc p{margin:0;flex:1 1 380px;font-size:15px;line-height:1.5;color:#dfe7ef}' +
    '#hala-cc .cc-b{display:flex;gap:10px;flex-wrap:wrap}' +
    '#hala-cc button{font-family:inherit;font-weight:700;font-size:15px;border-radius:10px;padding:11px 22px;cursor:pointer;line-height:1.2}' +
    '#hala-cc .cc-yes{background:#37B24D;color:#fff;border:2px solid #37B24D}' +
    '#hala-cc .cc-yes:hover{background:#2B8A3E;border-color:#2B8A3E}' +
    '#hala-cc .cc-no{background:transparent;color:#7ce08f;border:2px solid #37B24D}' +
    '#hala-cc button:focus-visible{outline:3px solid #7ce08f;outline-offset:2px}' +
    '@media (max-width:820px){#hala-cc{padding:14px 16px}#hala-cc p{font-size:14px;flex-basis:100%}' +
    '#hala-cc .cc-b{width:100%}#hala-cc button{flex:1 1 0;padding:12px 10px}}';

  var bar = null;
  function build() {
    if (bar) return bar;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    bar = document.createElement('div');
    bar.id = 'hala-cc';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', T.label);
    bar.innerHTML = '<div class="cc-in"><p></p><div class="cc-b">' +
      '<button type="button" class="cc-yes"></button><button type="button" class="cc-no"></button></div></div>';
    bar.querySelector('p').textContent = T.text + ' ';
    var ml = document.createElement('a'); ml.href = 'https://nlpacademy.cz/ochrana-osobnich-udaju'; ml.target = '_blank'; ml.rel = 'noopener'; ml.textContent = T.more; ml.style.color = '#7ce08f'; bar.querySelector('p').appendChild(ml);
    bar.querySelector('.cc-yes').textContent = T.yes;
    bar.querySelector('.cc-no').textContent = T.no;
    bar.querySelector('.cc-yes').addEventListener('click', function () { choose('granted'); });
    bar.querySelector('.cc-no').addEventListener('click', function () { choose('denied'); });
    document.body.appendChild(bar);
    return bar;
  }
  function show() { build().className = 'on'; }
  function hide() { if (bar) bar.className = ''; }
  function choose(v) {
    save(v);
    g('consent', 'update', {
      analytics_storage: v === 'granted' ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    hide();
  }

  // Měření kliků: rezervace (Dogres), balíčky (FAPI), kontakt (tel:/mailto:)
  function track(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var name = null, extra = {};
    if (/hala-usti\.dogres\.cz/i.test(href)) name = 'rezervace_klik';
    else if (/fapi/i.test(href)) name = 'balicek_klik';
    else if (/^(tel|mailto):/i.test(href)) { name = 'kontakt_klik'; extra.contact_method = href.split(':')[0].toLowerCase(); }
    if (!name) return;
    var p = {
      link_url: a.href, link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      page_path: location.pathname, transport_type: 'beacon'
    };
    for (var k in extra) p[k] = extra[k];
    g('event', name, p);
  }

  function init() {
    document.addEventListener('click', track, true);
    var links = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) { e.preventDefault(); show(); });
    }
    var v = load();
    if (v !== 'granted' && v !== 'denied') show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
