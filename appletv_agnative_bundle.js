(function(){
  'use strict';

  if (window.__APPLETV_AGNATIVE_THEME_PATCH__) return;
  window.__APPLETV_AGNATIVE_THEME_PATCH__ = true;

  function waitForTheme() {
    if (!window.Lampa || !Lampa.Storage || !Lampa.SettingsApi) {
      setTimeout(waitForTheme, 300);
      return;
    }

    function enableScene(notify){
      try {
        Lampa.Storage.set('lampac_interface_scene', 'appletv_agnative');
        Lampa.Storage.set('lampac_theme', 'appletv_agnative');
        Lampa.Storage.set('lampac_theme_day', 'appletv_agnative');
        Lampa.Storage.set('lampac_theme_night', 'appletv_agnative');
        if (notify && Lampa.Noty) Lampa.Noty.show('AppleTV AGNative включена');
      } catch(e){}
    }

    var tryApply = function(){
      try {
        var current = Lampa.Storage.get('lampac_interface_scene', 'classic');
        if (current === 'appletv_agnative') {
          Lampa.Storage.set('lampac_theme', 'appletv_agnative');
          Lampa.Storage.set('lampac_theme_day', 'appletv_agnative');
          Lampa.Storage.set('lampac_theme_night', 'appletv_agnative');
        }
      } catch(e){}
    };

    try {
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
          name: 'lampac_interface_scene',
          type: 'select',
          values: { appletv_agnative: 'AppleTV AGNative' },
          default: 'appletv_agnative'
        },
        field: { name: 'AppleTV AGNative', description: 'Дополнительная сцена AGNative' },
        onChange: function(v){
          if (v === 'appletv_agnative') enableScene(false);
        }
      });
    } catch(e) {}

    try {
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'appletv_agnative_enable', type: 'button' },
        field: { name: 'Включить AppleTV AGNative', description: 'Активировать сцену AppleTV AGNative' },
        onChange: function(){ enableScene(true); }
      });
    } catch(e) {}

    tryApply();

    try {
      Lampa.Storage.listener.follow('change', function(e){
        if (e.name === 'lampac_interface_scene') tryApply();
      });
    } catch(e){}
  }

  waitForTheme();
})();

(function () {
  'use strict';

  if (window.__netflixUILoaded) return;
  window.__netflixUILoaded = true;

  var STYLE_ID = 'netflix-ui-style';
  var HERO_CLASS = 'netflix-hero';
  var N = 'body.netflix--ui';
  var TMDB_KEY = '4ef0d7355d9ffb5151e987764708ce96';

  var logoCache = {};
  var logoPending = {};

  function fetchLogo(id, type, callback) {
    if (!id) return callback(null);
    var cacheKey = type + '/' + id;
    if (cacheKey in logoCache) return callback(logoCache[cacheKey]);
    if (logoPending[cacheKey]) {
      logoPending[cacheKey].push(callback);
      return;
    }
    logoPending[cacheKey] = [callback];

    var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + TMDB_KEY + '&include_image_language=ru,en,null';

    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      var logo = null;
      if (data.logos && data.logos.length) {
        var ru = data.logos.filter(function (l) { return l.iso_639_1 === 'ru'; });
        var en = data.logos.filter(function (l) { return l.iso_639_1 === 'en'; });
        var picked = ru[0] || en[0] || data.logos[0];
        if (picked && picked.file_path) {
          logo = { path: picked.file_path, width: picked.width, height: picked.height };
        }
      }
      logoCache[cacheKey] = logo;
      var cbs = logoPending[cacheKey] || [];
      delete logoPending[cacheKey];
      for (var i = 0; i < cbs.length; i++) cbs[i](logo);
    }).catch(function () {
      logoCache[cacheKey] = null;
      var cbs = logoPending[cacheKey] || [];
      delete logoPending[cacheKey];
      for (var i = 0; i < cbs.length; i++) cbs[i](null);
    });
  }

  function logoImgUrl(logoPath) {
    return Lampa.TMDB.image('t/p/w300' + logoPath);
  }

  function injectStyles() {
    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();

    if (!document.getElementById('netflix-ui-font')) {
      var link = document.createElement('link');
      link.id = 'netflix-ui-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }

    var css = [
      N + ' { background: #141414 !important; color: #e5e5e5 !important; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; }',
      N + ' * { font-family: inherit !important; }',
      N + '.black--style { background: #0a0a0a !important; }',
      N + ' .card { width: 18.5em !important; transition: z-index 0s 0.3s !important; margin-bottom: 0.5em !important; padding-bottom: 0 !important; }',
      N + ' .card.focus,' + N + ' .card.hover { z-index: 12 !important; transition: z-index 0s !important; }',
      N + ' .card__view { padding-bottom: 56.25% !important; margin-bottom: 0 !important; border-radius: 4px !important; overflow: hidden !important; transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease !important; }',
      N + ' .card__img { border-radius: 4px !important; background-color: #2a2a2a !important; object-fit: cover !important; object-position: center 20% !important; }',
      N + ' .card__filter { border-radius: 4px !important; }',
      N + ' .card.focus .card__view { transform: scale(1.15) !important; box-shadow: 0 12px 36px rgba(0,0,0,0.9), 0 0 50px rgba(0,0,0,0.4) !important; overflow: visible !important; }',
      N + ' .card.hover .card__view { transform: scale(1.05) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.6) !important; }',
      N + ' .card.focus .card__view::after { content: "" !important; position: absolute !important; inset: 0 !important; border: 2px solid rgba(255,255,255,0.9) !important; border-radius: 4px !important; pointer-events: none !important; z-index: 5 !important; }',
      N + ' .card.focus::after { display: none !important; }',
      '.nfx-card-overlay { position: absolute; bottom: 0; left: 0; right: 0; z-index: 3; padding: 2.5em 0.6em 0.5em; pointer-events: none; background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 45%, transparent 100%); border-radius: 0 0 4px 4px; }',
      '.nfx-card-overlay__logo { max-width: 80%; max-height: 2.5em; object-fit: contain; object-position: left bottom; display: block; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.8)); margin-bottom: 0.15em; }',
      '.nfx-card-overlay__title { font-size: 0.9em; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }',
      '.nfx-card-overlay__meta { font-size: 0.6em; color: rgba(255,255,255,0.6); margin-top: 0.15em; display: flex; align-items: center; gap: 0.4em; }',
      '.nfx-card-overlay__match { color: #46d369; font-weight: 700; }',
      '.nfx-card-logo { position: absolute; top: 0.4em; left: 0.4em; z-index: 4; font-size: 0.45em; font-weight: 900; letter-spacing: 0.12em; color: rgba(255,255,255,0.85); text-transform: uppercase; background: rgba(229,9,20,0.9); padding: 0.15em 0.4em; border-radius: 2px; line-height: 1; }',
      N + ' .card .card__title { display: none !important; }',
      N + ' .card .card__age { display: none !important; }',
      N + ' .card .card__promo { display: none !important; }',
      N + ' .card .card__description { display: none !important; }'
    ].join('\n');

    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = css;
    document.body.appendChild(el);
  }

  var GENRE_MAP = {
    28:'Боевик',12:'Приключения',16:'Мультфильм',35:'Комедия',80:'Криминал',99:'Документальный',18:'Драма',10751:'Семейный',14:'Фэнтези',36:'История',27:'Ужасы',10402:'Музыка',9648:'Детектив',10749:'Мелодрама',878:'Фантастика',10770:'Телефильм',53:'Триллер',10752:'Военный',37:'Вестерн',10759:'Боевик',10762:'Детский',10765:'Фантастика',10767:'Ток-шоу'
  };

  function getGenreNames(item) {
    var names = [];
    if (item.genres && item.genres.length) {
      for (var i = 0; i < item.genres.length; i++) if (item.genres[i].name) names.push(item.genres[i].name);
    } else if (item.genre_ids && item.genre_ids.length) {
      for (var j = 0; j < item.genre_ids.length; j++) if (GENRE_MAP[item.genre_ids[j]]) names.push(GENRE_MAP[item.genre_ids[j]]);
    }
    return names;
  }

  function extractCardData(cardEl) {
    if (cardEl.card_data && cardEl.card_data.id) return cardEl.card_data;
    try {
      var $card = $(cardEl);
      var d = $card.data('card') || $card.data('json');
      if (d && d.id) return d;
    } catch (err) {}
    return null;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  function switchCardToBackdrop(cardEl) {
    if (cardEl.getAttribute('data-nfx-switched')) return;
    cardEl.setAttribute('data-nfx-switched', '1');

    var data = extractCardData(cardEl);
    if (!data) return;

    var imgEl = cardEl.querySelector('.card__img');
    if (imgEl && data.backdrop_path) {
      var backdropUrl = Lampa.TMDB.image('t/p/w500' + data.backdrop_path);
      if (imgEl.tagName === 'IMG') {
        imgEl.src = backdropUrl;
        imgEl.style.objectFit = 'cover';
        imgEl.style.objectPosition = 'center';
      } else {
        imgEl.style.backgroundImage = 'url(' + backdropUrl + ')';
        imgEl.style.backgroundSize = 'cover';
        imgEl.style.backgroundPosition = 'center';
      }
    }

    var view = cardEl.querySelector('.card__view');
    if (!view || view.querySelector('.nfx-card-overlay')) return;

    var title = data.title || data.name || '';
    if (!title) {
      var titleEl = cardEl.querySelector('.card__title');
      if (titleEl) title = titleEl.textContent.trim();
    }

    var vote = data.vote_average ? parseFloat(data.vote_average) : 0;
    var year = '';
    if (data.release_date) year = data.release_date.substring(0, 4);
    else if (data.first_air_date) year = data.first_air_date.substring(0, 4);

    var overlay = document.createElement('div');
    overlay.className = 'nfx-card-overlay';

    var metaParts = [];
    if (vote > 0) metaParts.push('<span class="nfx-card-overlay__match">' + Math.round(vote * 10) + '%</span>');
    if (year) metaParts.push('<span>' + year + '</span>');
    var genreNames = getGenreNames(data);
    if (genreNames.length) metaParts.push('<span>' + escapeHtml(genreNames.slice(0, 2).join(', ')) + '</span>');
    var metaHtml = metaParts.length ? '<div class="nfx-card-overlay__meta">' + metaParts.join('<span style="opacity:0.4"> · </span>') + '</div>' : '';

    var titleHtml = title ? '<div class="nfx-card-overlay__title">' + escapeHtml(title) + '</div>' : '';
    overlay.innerHTML = titleHtml + metaHtml;
    view.appendChild(overlay);

    var tmdbType = data.name ? 'tv' : 'movie';
    fetchLogo(data.id, tmdbType, function (logo) {
      if (!logo) return;
      var titleDiv = overlay.querySelector('.nfx-card-overlay__title');
      if (titleDiv) {
        var img = document.createElement('img');
        img.className = 'nfx-card-overlay__logo';
        img.src = logoImgUrl(logo.path);
        img.alt = title;
        img.loading = 'lazy';
        img.onerror = function () { img.style.display = 'none'; };
        titleDiv.replaceWith(img);
      }
    });

    var logo = document.createElement('div');
    logo.className = 'nfx-card-logo';
    logo.textContent = 'ALCOPAC';
    view.appendChild(logo);
  }

  function processCards(container) {
    if (!container) return;
    var cards = container.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) switchCardToBackdrop(cards[i]);
  }

  function observeCards() {
    if (!window.MutationObserver) return;
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('card')) {
            switchCardToBackdrop(node);
          } else if (node.querySelectorAll) {
            var cards = node.querySelectorAll('.card');
            for (var k = 0; k < cards.length; k++) switchCardToBackdrop(cards[k]);
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  function startPlugin() {
    var theme = Lampa.Storage.get('lampac_theme', 'classic');
    var scene = Lampa.Storage.get('lampac_interface_scene', 'classic');
    var active = theme === 'netflix' || scene === 'appletv_agnative';
    if (!active) return;
    document.body.classList.add('netflix--ui');
    injectStyles();
    setTimeout(function () { injectStyles(); }, 1000);
    setTimeout(function () { injectStyles(); }, 3000);
    observeCards();
    processCards(document.body);
    setTimeout(function () {
      var actBody = document.querySelector('.activity--active .activity__body') || document.querySelector('.activity__body');
      if (actBody) processCards(actBody);
    }, 600);
    Lampa.Storage.listener.follow('change', function (e) {
      if (e.name === 'lampac_theme' || e.name === 'lampac_interface_scene') {
        var nextTheme = Lampa.Storage.get('lampac_theme', 'classic');
        var nextScene = Lampa.Storage.get('lampac_interface_scene', 'classic');
        var activeNow = nextTheme === 'netflix' || nextScene === 'appletv_agnative';
        if (activeNow) {
          document.body.classList.add('netflix--ui');
          injectStyles();
          processCards(document.body);
        } else {
          document.body.classList.remove('netflix--ui');
          var s = document.getElementById(STYLE_ID);
          if (s) s.remove();
        }
      }
    });
  }

  if (window.appready) startPlugin();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }
})();

(function () {
  'use strict';

  if (window.__APPLETV_AGNATIVE_UI__) return;
  window.__APPLETV_AGNATIVE_UI__ = true;

  var STYLE_ID = 'appletv-agnative-ui-style';
  var BODY_CLASS = 'appletv-agnative-ui';
  var relabelTimer = null;

  function active() {
    try {
      return Lampa.Storage.get('lampac_interface_scene', 'classic') === 'appletv_agnative';
    } catch (e) {
      return false;
    }
  }

  function applyBodyClass() {
    if (!document.body) return;
    document.body.classList.toggle(BODY_CLASS, active());
  }

  function injectStyles() {
    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '@keyframes agnative-card-sheen { 0% { opacity: 0; } 100% { opacity: 0; } }',
      '@keyframes agnative-pill-sheen { 0% { transform: translateX(-150%); opacity: 0; } 35% { opacity: .16; } 100% { transform: translateX(170%); opacity: 0; } }',
      '@keyframes agnative-ambient-breathe { 0%,100% { opacity: .72; } 50% { opacity: .92; } }',
      'body.' + BODY_CLASS + ' .card { border-radius: 1.7em !important; overflow: visible !important; transform-style: preserve-3d; perspective: 1200px; }',
      'body.' + BODY_CLASS + ' .card__view { position: relative !important; border-radius: 1.7em !important; overflow: hidden !important; transform: translateZ(0); clip-path: inset(0 round 1.7em); -webkit-clip-path: inset(0 round 1.7em); transition: transform .34s cubic-bezier(.22,.61,.36,1), box-shadow .34s cubic-bezier(.22,.61,.36,1), filter .28s ease; will-change: transform, box-shadow; }',
      'body.' + BODY_CLASS + ' .card__view > *, body.' + BODY_CLASS + ' .card__view img, body.' + BODY_CLASS + ' .card__view .card__img, body.' + BODY_CLASS + ' .card__view .card__image, body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image, body.' + BODY_CLASS + ' .card__filter, body.' + BODY_CLASS + ' .card__filter::before, body.' + BODY_CLASS + ' .card__filter::after, body.' + BODY_CLASS + ' .card__view::before, body.' + BODY_CLASS + ' .card__view::after { border-radius: 1.7em !important; }',
      'body.' + BODY_CLASS + ' .card__img, body.' + BODY_CLASS + ' .card__image { border: none !important; box-shadow: none !important; background-clip: padding-box !important; }',
      'body.' + BODY_CLASS + ' .card__view::before { content:none !important; display:none !important; }',
      'body.' + BODY_CLASS + ' .card__view::after { content:none !important; display:none !important; }',
      'body.' + BODY_CLASS + ' .card.focus::after, body.' + BODY_CLASS + ' .card.hover::after { display:none !important; }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay { border-radius: 0 0 1.7em 1.7em !important; background: linear-gradient(0deg, rgba(6,8,14,.80) 0%, rgba(6,8,14,.42) 34%, rgba(6,8,14,.10) 62%, rgba(6,8,14,0) 100%) !important; padding: 2.05em .95em .82em !important; transform: translateZ(22px); transition: transform .34s cubic-bezier(.22,.61,.36,1), opacity .28s ease; }',
      'body.' + BODY_CLASS + ' .card.focus .card__view { transform: translateY(-.12em) scale(1.06) !important; box-shadow: 0 22px 48px rgba(0,0,0,.26), 0 10px 22px rgba(0,0,0,.12) !important; filter: saturate(1.03) brightness(1.01); }',
      'body.' + BODY_CLASS + ' .card.hover .card__view { transform: translateY(-.06em) scale(1.028) !important; box-shadow: 0 12px 28px rgba(0,0,0,.18) !important; }',
      'body.' + BODY_CLASS + ' .card.focus .nfx-card-overlay { transform: translateZ(30px) translateY(-.02em); }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay__logo, body.' + BODY_CLASS + ' img.nfx-card-overlay__logo { max-height: 2.2em !important; margin-bottom: .24em !important; border-radius: 0 !important; clip-path: none !important; -webkit-clip-path: none !important; mask-image: none !important; -webkit-mask-image: none !important; overflow: visible !important; }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay__title { font-size: .82em !important; line-height: 1.2 !important; }',
      'body.' + BODY_CLASS + ' .nfx-card-overlay__meta { font-size: .56em !important; margin-top: .12em !important; }',
      'body.' + BODY_CLASS + ' .nfx-card-logo { top: .86em !important; left: 1.08em !important; background: rgba(12,14,20,.42) !important; border: 1px solid rgba(255,255,255,.08) !important; color: rgba(255,255,255,.88) !important; border-radius: .75em !important; padding: .2em .5em !important; font-size: .48em !important; letter-spacing: .08em !important; backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%); }',
      'body.' + BODY_CLASS + ' .card__vote, body.' + BODY_CLASS + ' .card__quality, body.' + BODY_CLASS + ' .card__type, body.' + BODY_CLASS + ' .nfx-card-overlay__match { display:none !important; }',

      'body.' + BODY_CLASS + ' .head__body { background: transparent !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; padding-top: .5em !important; padding-bottom: .2em !important; min-height: auto !important; position: relative !important; }',
      'body.' + BODY_CLASS + ' .head__actions { display:none !important; }',
      'body.' + BODY_CLASS + ' .head__menu-icon { display:none !important; }',
      'body.' + BODY_CLASS + ' .head__backward { display:inline-flex !important; align-items:center; justify-content:center; position:absolute !important; left:1.2em !important; top:.46em !important; width:2.45em !important; height:2.45em !important; margin:0 !important; border-radius:999px !important; background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04)) !important; border:1px solid rgba(255,255,255,.09) !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 8px 18px rgba(0,0,0,.12) !important; z-index:5 !important; font-size:.88em !important; overflow:hidden !important; }',
      'body.' + BODY_CLASS + ' .head__backward svg { width:1em !important; height:1em !important; }',
      'body.' + BODY_CLASS + ' .head__logo, body.' + BODY_CLASS + ' .head__left .logo, body.' + BODY_CLASS + ' .head__left .head__logo, body.' + BODY_CLASS + ' .head__left > a, body.' + BODY_CLASS + ' .head__split, body.' + BODY_CLASS + ' .head__action:not(.open--search):not(.selector), body.' + BODY_CLASS + ' .head__button:not(.open--search), body.' + BODY_CLASS + ' .head__history, body.' + BODY_CLASS + ' .head__source, body.' + BODY_CLASS + ' .head__settings, body.' + BODY_CLASS + ' .head__markers { display:none !important; }',
      'body.' + BODY_CLASS + ' .head__time { display:inline-flex !important; align-items:center; justify-content:center; width:4.2em; height:2.45em; min-width:4.2em; padding:0 .55em !important; border-radius:999px; background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04)); border:1px solid rgba(255,255,255,.09); color:rgba(255,255,255,.92) !important; font-weight:500; letter-spacing:0 !important; font-size:.96em !important; line-height:1 !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 8px 18px rgba(0,0,0,.12); backdrop-filter:blur(16px) saturate(140%); -webkit-backdrop-filter:blur(16px) saturate(140%); position:absolute !important; right:1.2em !important; top:.46em !important; margin:0 !important; z-index:5 !important; text-align:center !important; overflow:hidden !important; animation: agnative-ambient-breathe 7.2s ease-in-out infinite; }',
      'body.' + BODY_CLASS + ' .head__time *:not(.head__time-now) { display:none !important; }',
      'body.' + BODY_CLASS + ' .head__time .head__time-now, body.' + BODY_CLASS + ' .head__time-now { display:inline-flex !important; align-items:center; justify-content:center; width:100%; height:100%; font-size:.84em !important; line-height:1 !important; letter-spacing:0 !important; transform: none !important; padding:0 !important; margin:0 !important; }',
      'body.' + BODY_CLASS + ' .head__title { position:absolute !important; left:50% !important; transform:translateX(-50%) !important; top:.46em !important; height:2.45em !important; display:flex !important; align-items:center !important; justify-content:center !important; margin:0 !important; width:auto !important; max-width:48vw !important; text-align:center !important; font-size:.88em !important; line-height:1 !important; font-weight:600 !important; letter-spacing:.02em !important; text-shadow: 0 1px 10px rgba(0,0,0,.18); }',
      'body.' + BODY_CLASS + ' .open--search, body.' + BODY_CLASS + ' .open--search.focus, body.' + BODY_CLASS + ' .open--search.hover, body.' + BODY_CLASS + ' .head__action.selector, body.' + BODY_CLASS + ' .head__action.selector.focus, body.' + BODY_CLASS + ' .head__action.selector.hover { display:inline-flex !important; align-items:center; justify-content:center; width:2.45em; height:2.45em; border-radius:999px !important; background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04)) !important; border:1px solid rgba(255,255,255,.09) !important; box-shadow:inset 0 1px 0 rgba(255,255,255,.14), 0 8px 18px rgba(0,0,0,.12) !important; overflow:hidden !important; position:relative !important; transition: transform .24s ease, box-shadow .24s ease, background .24s ease !important; }',
      'body.' + BODY_CLASS + ' .open--search::before, body.' + BODY_CLASS + ' .head__action.selector::before, body.' + BODY_CLASS + ' .head__backward::before, body.' + BODY_CLASS + ' .head__time::before { content:""; position:absolute; inset:0; background: linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.08) 34%, rgba(255,255,255,.20) 50%, rgba(255,255,255,.06) 64%, rgba(255,255,255,0) 100%); transform: translateX(-150%); pointer-events:none; }',
      'body.' + BODY_CLASS + ' .open--search.focus::before, body.' + BODY_CLASS + ' .open--search.hover::before, body.' + BODY_CLASS + ' .head__action.selector.focus::before, body.' + BODY_CLASS + ' .head__action.selector.hover::before, body.' + BODY_CLASS + ' .head__backward.focus::before, body.' + BODY_CLASS + ' .head__backward.hover::before { animation: agnative-pill-sheen .8s ease 1; }',
      'body.' + BODY_CLASS + ' .open--search.focus, body.' + BODY_CLASS + ' .open--search.hover, body.' + BODY_CLASS + ' .head__action.selector.focus, body.' + BODY_CLASS + ' .head__action.selector.hover, body.' + BODY_CLASS + ' .head__backward.focus, body.' + BODY_CLASS + ' .head__backward.hover { transform: translateY(-.05em) scale(1.035) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 12px 22px rgba(0,0,0,.18) !important; }',
      'body.' + BODY_CLASS + ' .open--search svg, body.' + BODY_CLASS + ' .head__action.selector svg, body.' + BODY_CLASS + ' .head__action.selector [stroke], body.' + BODY_CLASS + ' .head__action.selector [fill], body.' + BODY_CLASS + ' .open--search [stroke], body.' + BODY_CLASS + ' .open--search [fill] { color:rgba(255,255,255,.92) !important; stroke:rgba(255,255,255,.92) !important; fill:rgba(255,255,255,.92) !important; }',
      'body.' + BODY_CLASS + '.menu--open .wrap__left { width: 21.5em !important; max-width: 21.5em !important; background: linear-gradient(90deg, rgba(255,255,255,.035), rgba(255,255,255,.012) 52%, rgba(255,255,255,0) 100%) !important; border-right:none !important; box-shadow:none !important; position:relative; }',
      'body.' + BODY_CLASS + '.menu--open .wrap__left::after { content:""; position:absolute; top:0; right:-10vw; bottom:0; width:20vw; background:linear-gradient(90deg, rgba(255,255,255,.045), rgba(255,255,255,.015) 22%, rgba(255,255,255,0) 76%); filter:blur(42px); opacity:.72; pointer-events:none; }',
      'body.' + BODY_CLASS + ' .menu__item { position:relative; overflow:hidden; margin-right:.55em !important; transform-origin:left center; transition: transform .28s cubic-bezier(.22,.61,.36,1), background .24s ease, box-shadow .24s ease; }',
      'body.' + BODY_CLASS + ' .menu__item::before { content:""; position:absolute; inset:0; background:linear-gradient(90deg, rgba(255,255,255,.16), rgba(255,255,255,.04) 34%, rgba(255,255,255,0) 62%); opacity:0; transition:opacity .32s ease; pointer-events:none; }',
      'body.' + BODY_CLASS + ' .menu__item::after { content:""; position:absolute; top:0; left:-38%; width:34%; height:100%; background:linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.14) 50%, rgba(255,255,255,0) 100%); opacity:0; pointer-events:none; }',
      'body.' + BODY_CLASS + ' .menu__item.focus::before, body.' + BODY_CLASS + ' .menu__item.hover::before { opacity:1; }',
      'body.' + BODY_CLASS + ' .menu__item.focus, body.' + BODY_CLASS + ' .menu__item.hover { transform: translateX(.14em) scale(1.03); box-shadow: 0 10px 24px rgba(0,0,0,.14); }',
      'body.' + BODY_CLASS + ' .menu__item.focus::after, body.' + BODY_CLASS + ' .menu__item.hover::after { opacity:1; animation: agnative-pill-sheen .72s ease 1; }',
      'body.' + BODY_CLASS + ' .menu__item[data-action="search"].focus, body.' + BODY_CLASS + ' .menu__item[data-action="search"].hover { transform: none !important; box-shadow: none !important; }',
      'body.' + BODY_CLASS + ' .menu__item[data-action="search"].focus::after, body.' + BODY_CLASS + ' .menu__item[data-action="search"].hover::after { opacity:0 !important; animation:none !important; }',
      'body.' + BODY_CLASS + ' .agnative-menu-search-separator { height:1px; margin:.42em .85em .55em .85em; background:linear-gradient(90deg, rgba(255,255,255,.14), rgba(255,255,255,.03)); border-radius:999px; opacity:.9; }',
      'body.' + BODY_CLASS + ' .agnative-menu-search .menu__ico, body.' + BODY_CLASS + ' .agnative-menu-search .menu__icon { display:inline-flex !important; align-items:center; justify-content:center; min-width:1.7em; width:1.7em; height:1.7em; margin-right:.72em; opacity:.94; }',
      'body.' + BODY_CLASS + ' .agnative-menu-search .menu__ico svg, body.' + BODY_CLASS + ' .agnative-menu-search .menu__icon svg { width:1.28em !important; height:1.28em !important; }',
      'body.' + BODY_CLASS + ' .items-line--type-default { min-height: auto !important; padding-top: .45em !important; padding-bottom: .12em !important; margin-bottom: .35em !important; }',
      'body.' + BODY_CLASS + ' .items-line--type-default .items-line__head { margin-bottom: .58em !important; min-height: auto !important; }',
      'body.' + BODY_CLASS + ' .items-line--type-default .items-cards { padding-top: 0 !important; }',
      'body.' + BODY_CLASS + ' .items-line__title { font-size: .8em !important; }',
      'body.' + BODY_CLASS + ' .scroll__body .mapping--line, body.' + BODY_CLASS + ' .scroll__body.mapping--line, body.' + BODY_CLASS + ' .mapping--line { gap: .72em !important; }',
      'body.' + BODY_CLASS + ' .full-person__photo { display: none !important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function relabelCards() {
    if (!active()) return;
    var labels = document.querySelectorAll('.nfx-card-logo');
    for (var i = 0; i < labels.length; i++) {
      var card = labels[i].closest('.card');
      var type = 'ФИЛЬМ';
      try {
        var data = card && (card.card_data || ($(card).data('card')) || ($(card).data('json')) || ($(card).data('data')));
        if (!data && card) {
          var raw = card.getAttribute('data-card') || card.getAttribute('data-json') || card.getAttribute('data-data');
          if (raw) data = JSON.parse(raw);
        }
        if (data && (data.name || data.first_air_date || data.media_type === 'tv' || data.method === 'tv' || data.type === 'tv')) type = 'СЕРИАЛ';
      } catch (e) {}
      labels[i].textContent = type;
    }
  }

  function patchMenuSearch() {
    if (!active()) return;
    var menuBody = document.querySelector('.menu .menu__list');
    if (!menuBody && window.$) {
      var jqMenu = $('.menu .menu__list').eq(0);
      if (jqMenu.length) menuBody = jqMenu[0];
    }
    if (!menuBody) return;

    var searchItem = menuBody.querySelector(':scope > .menu__item[data-action="search"]');
    var separator = menuBody.querySelector(':scope > .agnative-menu-search-separator');
    var firstItem = menuBody.querySelector(':scope > .menu__item:not([data-action="search"])');
    if (!firstItem) firstItem = menuBody.querySelector('.menu__item:not([data-action="search"])');
    if (!firstItem) return;

    if (!searchItem) {
      searchItem = document.createElement('li');
      searchItem.className = 'menu__item selector';
      searchItem.setAttribute('data-action', 'search');
      searchItem.innerHTML = '<div class="menu__ico"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"></circle><path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg></div><div class="menu__text">Поиск</div>';

      function triggerSearch(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try {
          var nativeSearch = $('.head__action.selector.open--search').first();
          if (nativeSearch.length) {
            nativeSearch.trigger('hover:enter');
            return;
          }
        } catch (err0) {}
        try {
          if (window.Lampa && Lampa.Search && typeof Lampa.Search.open === 'function') {
            Lampa.Search.open();
            return;
          }
        } catch (err1) {}
      }

      $(searchItem).off('.agnativeSearch').on('hover:enter.agnativeSearch', triggerSearch);
    }

    if (!separator) {
      separator = document.createElement('div');
      separator.className = 'agnative-menu-search-separator';
    }

    if (window.$) {
      var jqMenuBody = $('.menu .menu__list').eq(0);
      if (jqMenuBody.length) {
        var firstReal = jqMenuBody.children('.menu__item').not('[data-action="search"]').first();
        if (firstReal.length) {
          $(searchItem).insertBefore(firstReal);
          $(separator).insertAfter(searchItem);
        } else {
          jqMenuBody.prepend(searchItem);
          $(separator).insertAfter(searchItem);
        }
        return;
      }
    }

    menuBody.insertBefore(searchItem, firstItem);
    if (searchItem.nextSibling !== separator) {
      menuBody.insertBefore(separator, firstItem);
    }
  }

  function boot() {
    applyBodyClass();
    if (!active()) return;
    injectStyles();
    relabelCards();
    patchMenuSearch();
    setTimeout(relabelCards, 300);
    setTimeout(relabelCards, 900);
    setTimeout(relabelCards, 1800);
    setTimeout(relabelCards, 3200);
    setTimeout(relabelCards, 5200);
    setTimeout(patchMenuSearch, 400);
    setTimeout(patchMenuSearch, 1200);
    setTimeout(patchMenuSearch, 2600);
    try { if (relabelTimer) clearInterval(relabelTimer); } catch (e) {}
    relabelTimer = setInterval(function(){ try { relabelCards(); } catch(e){} }, 2000);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(boot, 0);
  else document.addEventListener('DOMContentLoaded', boot);

  if (window.Lampa && Lampa.Storage && Lampa.Storage.listener) {
    Lampa.Storage.listener.follow('change', function (e) {
      if (e.name === 'lampac_interface_scene') {
        applyBodyClass();
        if (active()) {
          injectStyles();
          relabelCards();
          patchMenuSearch();
          setTimeout(patchMenuSearch, 400);
          setTimeout(patchMenuSearch, 1200);
          setTimeout(patchMenuSearch, 2600);
          try { if (relabelTimer) clearInterval(relabelTimer); } catch (e2) {}
          relabelTimer = setInterval(function(){ try { relabelCards(); } catch(e3){} }, 2000);
        } else {
          var s = document.getElementById(STYLE_ID);
          if (s) s.remove();
          var customSearch = document.querySelector('.menu__item[data-action="search"]');
          if (customSearch && customSearch.parentNode) customSearch.parentNode.removeChild(customSearch);
          var separator = document.querySelector('.agnative-menu-search-separator');
          if (separator && separator.parentNode) separator.parentNode.removeChild(separator);
          try { if (relabelTimer) clearInterval(relabelTimer); relabelTimer = null; } catch (e4) {}
        }
      }
    });
  }
})();
