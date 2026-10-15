/* ==========================================================================
   NOOR — Gamified Islamic Learning Platform
   app.js — Vanilla ES6+ application layer
   --------------------------------------------------------------------------
   Handles:
     • Icon hydration (inline SVG, zero external image requests)
     • Persistent game state in localStorage (gems, streak, hearts, XP)
     • Shared chrome (stat pills, active nav, toasts)
     • Landing page (mobile menu, smooth scroll, playable demo quiz)
     • Quest map rendering + node locking
     • Lesson engine (choice & match exercises, hearts, rewards, modals)
     • Profile dashboard (stats, badges, activity heatmap, weekly XP chart)
   ========================================================================== */
(function () {
  "use strict";

  /* ==========================================================================
     1. ICON LIBRARY — inline SVG paths (no external assets => no 404s)
     ========================================================================== */
  const svg = (inner, filled) =>
    `<svg viewBox="0 0 24 24" ${
      filled
        ? 'fill="currentColor" stroke="none"'
        : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
    }>${inner}</svg>`;

  const ICONS = {
    "moon-star": svg('<path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a6.5 6.5 0 0 0 10.5 10.5Z"/><path d="M17 3l.8 2.2L20 6l-2.2.8L17 9l-.8-2.2L14 6l2.2-.8Z" fill="currentColor" stroke="none"/>'),
    home: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>'),
    map: svg('<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15"/><path d="M15 6v15"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    book: svg('<path d="M4 4a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2Z"/><path d="M4 20V4"/>'),
    "book-open": svg('<path d="M12 7v14"/><path d="M3 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H3Z"/><path d="M21 5a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7Z"/>'),
    flame: svg('<path d="M12 3c1.5 3.5 5 5 5 9a5 5 0 0 1-10 0c0-1.5.6-2.7 1.4-3.8C9 10 9.5 11 10.4 11.6 10.8 9 10.5 6 12 3Z"/>', true),
    gem: svg('<path d="M6 3h12l3 6-9 12L3 9Z"/><path d="M3 9h18"/><path d="m9 3 3 6 3-6"/>'),
    heart: svg('<path d="M12 20S4.5 15.5 4.5 10.3A3.8 3.8 0 0 1 12 7.9a3.8 3.8 0 0 1 7.5 2.4C19.5 15.5 12 20 12 20Z"/>', true),
    star: svg('<path d="m12 3 2.7 5.5 6 .9-4.35 4.2 1.05 6L12 16.8 6.6 19.6l1.05-6L3.3 9.4l6-.9Z"/>', true),
    lock: svg('<rect x="4" y="10.5" width="16" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'),
    check: svg('<path d="m5 13 4.5 4.5L19 7"/>'),
    x: svg('<path d="M6 6l12 12"/><path d="M18 6 6 18"/>'),
    play: svg('<path d="M7 4v16l13-8Z"/>', true),
    "arrow-right": svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
    "arrow-left": svg('<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>'),
    "chevron-right": svg('<path d="m9 6 6 6-6 6"/>'),
    trophy: svg('<path d="M8 4h8v4a4 4 0 0 1-8 0Z"/><path d="M8 6H5.5A2.5 2.5 0 0 0 8 10.5"/><path d="M16 6h2.5A2.5 2.5 0 0 1 16 10.5"/><path d="M12 12v4"/><path d="M9 20h6"/><path d="M9.5 16h5l1 4h-7Z"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>'),
    volume: svg('<path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>'),
    sparkles: svg('<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z"/><path d="M18 14l.7 2.1L21 17l-2.3.9L18 20l-.7-2.1L15 17l2.3-.9Z"/>'),
    shield: svg('<path d="M12 3 5 6v6c0 4.2 3 7.4 7 9 4-1.6 7-4.8 7-9V6Z"/>'),
    "badge-check": svg('<path d="m9 12 2 2 4-4"/><path d="M12 3 5 6v6c0 4.2 3 7.4 7 9 4-1.6 7-4.8 7-9V6Z"/>'),
    calendar: svg('<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18"/><path d="M8 2.5v4"/><path d="M16 2.5v4"/>'),
    zap: svg('<path d="M13 2 4 14h6l-1 8 9-12h-6Z"/>', true),
    gift: svg('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M3 12h18"/><path d="M12 8v12"/><path d="M8 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4-5a2.5 2.5 0 0 1 0 5Z"/>'),
    moon: svg('<path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a6.5 6.5 0 0 0 10.5 10.5Z"/>'),
    compass: svg('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    menu: svg('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>'),
    refresh: svg('<path d="M3 12a9 9 0 0 1 15-6.4L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15 6.4L3 16"/><path d="M3 20v-4h4"/>'),
    crown: svg('<path d="M3 7l4 4 5-7 5 7 4-4-1.5 11h-15Z"/>'),
    target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.5" fill="currentColor"/>'),
    graduation: svg('<path d="M2 8.5 12 4l10 4.5-10 4.5Z"/><path d="M6 10.5V15c0 1.3 2.7 2.5 6 2.5s6-1.2 6-2.5v-4.5"/>'),
    water: svg('<path d="M12 3s6 6.4 6 10.8a6 6 0 0 1-12 0C6 9.4 12 3 12 3Z"/>'),
    hands: svg('<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10"/><path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V10"/><path d="M13 10V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M16 12V8.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-3"/>'),
    logout: svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h12"/>'),
    card: svg('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>'),
    mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>'),
    printer: svg('<path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/>'),
    pause: svg('<rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/>', true),
    download: svg('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'),
    leaf: svg('<path d="M20 4S8 5 4 12c-2 3.5 0 8 0 8s4.5 2 8 0c7-4 8-16 8-16Z"/><path d="M4 20c4-5 8-8 14-11"/>'),
    mosque: svg('<path d="M12 3s3 3 3 5a3 3 0 0 1-6 0c0-2 3-5 3-5Z"/><path d="M4 21v-7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7"/><path d="M3 21h18"/><path d="M9.5 21v-4a2.5 2.5 0 0 1 5 0v4"/>'),
    medal: svg('<circle cx="12" cy="14.5" r="5"/><path d="m9 10.5-3-6.5h12l-3 6.5"/><path d="m12 12.5.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 14.6l2-.3Z" fill="currentColor" stroke="none"/>'),
    utensils: svg('<path d="M7 3v8a2 2 0 0 0 4 0V3"/><path d="M9 11v10"/><path d="M17 3c-1.5 1-2.5 2.2-2.5 4.5S15.5 11 17 11"/><path d="M17 3v18"/>'),
    "hand-heart": svg('<path d="M12 13.5 9.2 10.7a2.1 2.1 0 0 1 3-3l.6.6.6-.6a2.1 2.1 0 0 1 3 3Z"/><path d="M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6"/><path d="M4 14.5h3"/><path d="M20 14.5h-3"/>'),
  };

  /** Replace every `[data-icon]` placeholder with its inline SVG. */
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach((el) => {
      const name = el.getAttribute("data-icon");
      if (!ICONS[name]) return;
      if (el.dataset.iconLabel) {
        el.setAttribute("role", "img");
        el.setAttribute("aria-label", el.dataset.iconLabel);
      } else {
        el.setAttribute("aria-hidden", "true");
      }
      el.innerHTML = ICONS[name];
    });
  }

  /* ==========================================================================
     2. PERSISTENT GAME STATE (localStorage)
     ========================================================================== */
  const STORE_KEY = "noor.state.v1";
  const HEART_REFILL_COST = 40;

  const DEFAULT_STATE = {
    name: "Explorer",
    pet: "🦉",
    coins: 120,
    streak: 7,
    hearts: 5,
    maxHearts: 5,
    xp: 340,
    completed: [],
    history: {},     // { 'YYYY-MM-DD': xpEarned }
    lastActive: null,
    dailyLessons: { date: null, count: 0 }, // free-plan daily lesson counter
    badges: [],      // earned badge ids (persisted so they survive sign-out)
    challenges: {},  // { occasionId: { completed: [ids], notes: {}, date } }
    stories: [],     // completed story ids
    duas: [],        // memorized dua ids
    prefs: { screenTime: 20, speed: 1 },
  };

  /** A clean, deeply-copied state (so nested arrays/objects are never shared). */
  function freshState() {
    return {
      ...DEFAULT_STATE,
      prefs: { ...DEFAULT_STATE.prefs },
      dailyLessons: { date: null, count: 0 },
      history: {},
      completed: [],
      badges: [],
      challenges: {},
      stories: [],
      duas: [],
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return freshState();
      const s = Object.assign(freshState(), JSON.parse(raw));
      /* Guard against older saved shapes */
      if (!Array.isArray(s.completed)) s.completed = [];
      if (!Array.isArray(s.badges)) s.badges = [];
      if (!Array.isArray(s.stories)) s.stories = [];
      if (!Array.isArray(s.duas)) s.duas = [];
      if (!s.challenges || typeof s.challenges !== "object") s.challenges = {};
      s.prefs = Object.assign({ screenTime: 20, speed: 1 }, s.prefs || {});
      return s;
    } catch (e) {
      return freshState();
    }
  }

  let state = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage may be unavailable (private mode) — fail silently */
    }
  }

  function resetState() {
    state = freshState();
    saveState();
  }

  /* Date helpers ---------------------------------------------------------- */
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const dayOffsetKey = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  };

  /* Player level derived from total XP (100 XP per level, starts at 1). */
  const playerLevel = () => Math.max(1, Math.floor(state.xp / 100) + 1);
  const LEVEL_TITLES = [
    "Little Explorer", "Arabic Adventurer", "Wudu Wanderer", "Tajweed Seeker",
    "Salah Star", "Quran Companion", "Noor Champion", "Deen Guardian",
  ];
  const levelTitle = () => LEVEL_TITLES[Math.min(playerLevel() - 1, LEVEL_TITLES.length - 1)];

  /* ==========================================================================
     2b. SESSION & AUTHENTICATION (kept separate from game progress)
     ========================================================================== */
  const SESSION_KEY = "noor.session.v1";
  let session = loadSession();

  function loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function saveSession() {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
  }
  function clearSession() {
    session = null;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  const isSignedIn = () => !!session;
  const isPro = () => !!session && session.plan === "pro";
  const userName = () => (session && session.name) || "Explorer";

  /** Create a session (used by both Sign In and Sign Up in this demo). */
  function startSession(email, name) {
    session = {
      name: name || (email ? email.split("@")[0] : "Explorer"),
      email: email || "",
      plan: "free",
      since: Date.now(),
    };
    saveSession();
    /* Keep the local profile name in step with the signed-in user. */
    if (state.name !== session.name) {
      state.name = session.name;
      saveState();
    }
  }

  function signOut() {
    clearSession();
    window.location.href = "index.html"; // immediate redirect to landing page
  }

  /* Plan rules ------------------------------------------------------------ */
  const FREE_UNITS = ["arabic"];             // units available on the free plan
  const FREE_DAILY_LESSON_LIMIT = 3;         // lessons/day for free members

  const unitIsFree = (unitId) => FREE_UNITS.indexOf(unitId) !== -1;
  /** True when a quest belongs to a Pro-only unit and the user is not Pro. */
  const questNeedsPro = (quest) => !isPro() && !unitIsFree(quest.unitId);

  function lessonsToday() {
    const t = todayKey();
    if (!state.dailyLessons || state.dailyLessons.date !== t) return 0;
    return state.dailyLessons.count || 0;
  }
  function bumpDailyLessons() {
    state.dailyLessons = { date: todayKey(), count: lessonsToday() + 1 };
    saveState();
  }

  /* ==========================================================================
     2c. AVATAR CUSTOMIZATION
     --------------------------------------------------------------------------
     A lightweight, dependency-free avatar system. A vector character is
     composed on the fly from small parts (base, skin, outfit, headwear,
     accessory, backdrop) — or the learner can pick one of the bundled
     illustration PNGs. The selection is persisted in localStorage under
     `noor_avatar_data` and rendered on every authenticated page.
     ========================================================================== */
  const AVATAR_KEY = "noor_avatar_data";        /* full component config */
  const AVATAR_IMG_KEY = "noor_user_avatar";    /* portable avatar ID / image URL */

  const AVATAR_SKINS = [
    { id: "Porcelain", hex: "#F8D9BA", shade: "#E9BE95", hair: "#3B2A20" },
    { id: "Peach",     hex: "#F0C08A", shade: "#DDA86E", hair: "#2E2018" },
    { id: "Amber",     hex: "#D69A66", shade: "#C07F4C", hair: "#231610" },
    { id: "Umber",     hex: "#9A6238", shade: "#82502E", hair: "#1C110B" },
  ];
  const AVATAR_OUTFITS = [
    { id: "Emerald", hex: "#10B981", dark: "#047857" },
    { id: "Gold",    hex: "#F59E0B", dark: "#B45309" },
    { id: "Sky",     hex: "#3B82F6", dark: "#1D4ED8" },
    { id: "Rose",    hex: "#F43F5E", dark: "#BE123C" },
    { id: "Violet",  hex: "#8B5CF6", dark: "#6D28D9" },
  ];
  const AVATAR_BACKDROPS = [
    { id: "Mint",  from: "#d1fae5", to: "#ecfdf5" },
    { id: "Sun",   from: "#fef3c7", to: "#fffbeb" },
    { id: "Sky",   from: "#dbeafe", to: "#eff6ff" },
    { id: "Blush", from: "#ffe4e6", to: "#fff1f2" },
    { id: "Lilac", from: "#ede9fe", to: "#f5f3ff" },
    { id: "Cloud", from: "#e2e8f0", to: "#f8fafc" },
  ];
  const AVATAR_HEADWEAR = [
    { id: "none",   label: "None" },
    { id: "kufi",   label: "Kufi" },
    { id: "hijab",  label: "Hijab" },
    { id: "cap",    label: "Cap" },
    { id: "beanie", label: "Beanie" },
    { id: "crown",  label: "Crown" },
  ];
  const AVATAR_ACCESSORIES = [
    { id: "none",     label: "None" },
    { id: "glasses",  label: "Glasses" },
    { id: "star",     label: "Star" },
    { id: "flower",   label: "Flower" },
    { id: "freckles", label: "Freckles" },
  ];
  const AVATAR_ILLUSTRATIONS = [
    { id: "boy-1",  label: "Boy 1",  src: "Aessits/Avatar Assts/Boy 1.png" },
    { id: "boy-2",  label: "Boy 2",  src: "Aessits/Avatar Assts/Boy 2.png" },
    { id: "boy-3",  label: "Boy 3",  src: "Aessits/Avatar Assts/Boy 3.png" },
    { id: "girl-1", label: "Girl 1", src: "Aessits/Avatar Assts/Girl 1.png" },
    { id: "girl-2", label: "Girl 2", src: "Aessits/Avatar Assts/Girl 2.png" },
    { id: "girl-3", label: "Girl 3", src: "Aessits/Avatar Assts/Girl 3.png" },
  ];
  const AVATAR_DEFAULT = { base: "boy", skin: 1, outfit: 0, headwear: "none", accessory: "none", bg: 0 };

  let avatar = loadAvatar();

  const clampIndex = (v, len, fallback) => {
    const n = parseInt(v, 10);
    return n >= 0 && n < len ? n : fallback;
  };
  const optionExists = (list, id) => list.some((o) => o.id === id);
  const isIllustration = (base) => typeof base === "string" && base.indexOf("img:") === 0;
  const illustrationById = (base) => AVATAR_ILLUSTRATIONS.find((x) => x.id === String(base).slice(4));

  function normalizeAvatar(raw) {
    const a = raw && typeof raw === "object" ? raw : {};
    const vectorBase = a.base === "boy" || a.base === "girl";
    const imgBase = isIllustration(a.base) && !!illustrationById(a.base);
    return {
      base: vectorBase || imgBase ? a.base : AVATAR_DEFAULT.base,
      skin: clampIndex(a.skin, AVATAR_SKINS.length, AVATAR_DEFAULT.skin),
      outfit: clampIndex(a.outfit, AVATAR_OUTFITS.length, AVATAR_DEFAULT.outfit),
      headwear: optionExists(AVATAR_HEADWEAR, a.headwear) ? a.headwear : AVATAR_DEFAULT.headwear,
      accessory: optionExists(AVATAR_ACCESSORIES, a.accessory) ? a.accessory : AVATAR_DEFAULT.accessory,
      bg: clampIndex(a.bg, AVATAR_BACKDROPS.length, AVATAR_DEFAULT.bg),
    };
  }

  function loadAvatar() {
    try {
      const raw = localStorage.getItem(AVATAR_KEY);
      if (raw) return normalizeAvatar(JSON.parse(raw));
      /* Fallback: rebuild an illustrated avatar from a stored image URL. */
      const url = localStorage.getItem(AVATAR_IMG_KEY);
      const match = url && AVATAR_ILLUSTRATIONS.find((x) => x.src === url);
      if (match) return normalizeAvatar(Object.assign({}, AVATAR_DEFAULT, { base: "img:" + match.id }));
      return Object.assign({}, AVATAR_DEFAULT);
    } catch (e) {
      return Object.assign({}, AVATAR_DEFAULT);
    }
  }
  function saveAvatar() {
    try {
      localStorage.setItem(AVATAR_KEY, JSON.stringify(avatar));
      /* Mirror a portable avatar ID / image URL under a clear key. */
      localStorage.setItem(AVATAR_IMG_KEY, avatarImageURL(avatar));
    } catch (e) {}
  }

  /** Headwear layer drawn on top of the head. */
  function avatarHeadwear(id, outfit) {
    switch (id) {
      case "kufi":
        return '<path d="M31 42a19 15 0 0 1 38 0Z" fill="#fffdf6" stroke="#e2d5b8" stroke-width="1"/>' +
          '<rect x="31" y="39.5" width="38" height="4" rx="2" fill="#f0e2c0"/>';
      case "hijab":
        return '<path d="M29 44a21 22 0 0 1 42 0c-6-4-12-6-21-6s-15 2-21 6Z" fill="' + outfit.hex + '"/>' +
          '<path d="M29 44c-7-2-10-7-10-12 0 0 7-2 10 4Z" fill="' + outfit.dark + '"/>';
      case "cap":
        return '<path d="M28 40a22 20 0 0 1 44 0Z" fill="' + outfit.hex + '"/>' +
          '<rect x="23" y="38" width="54" height="6" rx="3" fill="' + outfit.dark + '"/>';
      case "beanie":
        return '<path d="M30 42a20 20 0 0 1 40 0Z" fill="#fb7185"/>' +
          '<rect x="29" y="39" width="42" height="7" rx="3.5" fill="#f43f5e"/>' +
          '<circle cx="50" cy="21" r="3.2" fill="#fff1f2"/>';
      case "crown":
        return '<path d="M30 35l5-11 6 7 5-12 5 12 6-7 5 11Z" fill="#FBBF24" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round"/>' +
          '<circle cx="50" cy="22" r="2" fill="#F59E0B"/>';
      default:
        return "";
    }
  }

  /** Accessory layer drawn on top of the face. */
  function avatarAccessory(id) {
    switch (id) {
      case "glasses":
        return '<g fill="#cfe9ff" fill-opacity="0.28" stroke="#243447" stroke-width="2">' +
          '<circle cx="42.5" cy="44" r="6.6"/><circle cx="57.5" cy="44" r="6.6"/>' +
          '<path d="M49 44h2" fill="none"/><path d="M35.9 43.2l-6-1.4" fill="none"/>' +
          '<path d="M64.1 43.2l6-1.4" fill="none"/></g>';
      case "star":
        return '<path d="M67 28l1.7 3.5 3.8.5-2.7 2.7.6 3.8-3.4-1.8-3.4 1.8.6-3.8-2.7-2.7 3.8-.5Z" fill="#F59E0B"/>';
      case "flower":
        return '<g transform="translate(33 30)"><g fill="#F472B6">' +
          '<circle cy="-3.2" r="2.6"/><circle cx="3" cy="-1" r="2.6"/><circle cx="1.9" cy="2.6" r="2.6"/>' +
          '<circle cx="-1.9" cy="2.6" r="2.6"/><circle cx="-3" cy="-1" r="2.6"/></g>' +
          '<circle r="1.8" fill="#FBBF24"/></g>';
      case "freckles":
        return '<g fill="#C0724A" opacity="0.7"><circle cx="40" cy="48" r="0.8"/><circle cx="43.5" cy="49.5" r="0.8"/>' +
          '<circle cx="37" cy="49.5" r="0.8"/><circle cx="60" cy="48" r="0.8"/><circle cx="56.5" cy="49.5" r="0.8"/>' +
          '<circle cx="63" cy="49.5" r="0.8"/></g>';
      default:
        return "";
    }
  }

  /** Compose the vector character markup (without the outer <svg>). */
  function buildAvatarLayers(a) {
    const skin = AVATAR_SKINS[a.skin];
    const outfit = AVATAR_OUTFITS[a.outfit];
    const girl = a.base === "girl";
    const hijab = a.headwear === "hijab";
    const hair = skin.hair;
    const p = [];

    /* Behind-head layers: hijab fabric or long hair */
    if (hijab) {
      p.push('<path d="M50 11C27 11 19 30 19 47c0 15 4 26 11 34l11-6c-5-9-8-18-8-27 0-15 8-24 17-24s17 9 17 24c0 9-3 18-8 27l11 6c7-8 11-19 11-34C81 30 73 11 50 11Z" fill="' + outfit.hex + '"/>');
    } else if (girl) {
      p.push('<path d="M23 47c0-23 12-34 27-34s27 11 27 34c0 13-2 24-7 33H60c4-10 6-20 6-31 0-15-8-23-16-23s-16 8-16 23c0 11 2 21 6 31H30c-5-9-7-20-7-33Z" fill="' + hair + '"/>');
    }

    /* Neck */
    p.push('<rect x="44" y="57" width="12" height="13" rx="4" fill="' + skin.shade + '"/>');

    /* Shoulders / outfit */
    p.push('<path d="M50 62c-11 0-20 6-24 14-4 8-6 16-6 24h60c0-8-2-16-6-24-4-8-13-14-24-14Z" fill="' + outfit.hex + '"/>');
    p.push('<path d="M50 69l-7-7h14Z" fill="' + outfit.dark + '" opacity="0.85"/>');

    /* Ears */
    p.push('<circle cx="29" cy="47" r="4.5" fill="' + skin.shade + '"/><circle cx="71" cy="47" r="4.5" fill="' + skin.shade + '"/>');

    /* Head */
    p.push('<ellipse cx="50" cy="44" rx="21" ry="23" fill="' + skin.hex + '"/>');

    /* Fringe (hidden beneath a hijab) */
    if (!hijab) {
      if (girl) {
        p.push('<path d="M29 45c0-15 9-25 21-25s21 10 21 25c-2-7-6-11-10-13-3 4-9 5-13 2-4 5-11 6-15 3-2 2-4 5-4 8Z" fill="' + hair + '"/>');
      } else {
        p.push('<path d="M29 45c0-15 9-25 21-25s21 10 21 25c-2-8-7-13-14-14-3 3-10 4-14 1-4 3-11 4-14 4Z" fill="' + hair + '"/>');
      }
    }

    /* Face: cheeks, eyes, highlights, smile */
    p.push('<circle cx="37.5" cy="50.5" r="3.4" fill="#F87171" opacity="0.35"/><circle cx="62.5" cy="50.5" r="3.4" fill="#F87171" opacity="0.35"/>');
    p.push('<ellipse cx="42.5" cy="44" rx="2.6" ry="3.7" fill="#26323F"/><ellipse cx="57.5" cy="44" rx="2.6" ry="3.7" fill="#26323F"/>');
    p.push('<circle cx="43.4" cy="42.7" r="0.9" fill="#ffffff"/><circle cx="58.4" cy="42.7" r="0.9" fill="#ffffff"/>');
    p.push('<path d="M44 50.5q6 5.5 12 0" fill="none" stroke="#26323F" stroke-width="2" stroke-linecap="round"/>');

    p.push(avatarHeadwear(a.headwear, outfit));
    p.push(avatarAccessory(a.accessory));
    return p.join("");
  }

  /** Full avatar markup for any container. */
  function avatarHTML(a, cls) {
    const cfg = normalizeAvatar(a);
    const bg = AVATAR_BACKDROPS[cfg.bg];
    const style = "background:linear-gradient(160deg," + bg.from + "," + bg.to + ")";
    if (isIllustration(cfg.base)) {
      const ill = illustrationById(cfg.base);
      if (ill) {
        return '<span class="avatar-art avatar-art--img ' + (cls || "") + '" style="' + style + '">' +
          '<img src="' + ill.src + '" alt="Your avatar" loading="lazy" /></span>';
      }
    }
    return '<span class="avatar-art ' + (cls || "") + '" style="' + style + '">' +
      '<svg viewBox="0 0 100 100" role="img" aria-label="Your avatar">' + buildAvatarLayers(cfg) + "</svg></span>";
  }

  /** Fill every [data-avatar-slot] with the current avatar. */
  function hydrateAvatars(root) {
    (root || document).querySelectorAll("[data-avatar-slot]").forEach((el) => {
      el.innerHTML = avatarHTML(avatar);
    });
  }

  /** A self-contained data-URI SVG of a vector avatar (for <img> use). */
  function avatarToDataURI(a) {
    const cfg = normalizeAvatar(a);
    const bg = AVATAR_BACKDROPS[cfg.bg];
    const svgStr =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + bg.from + '"/><stop offset="1" stop-color="' + bg.to + '"/>' +
        "</linearGradient></defs>" +
        '<rect width="100" height="100" fill="url(#g)"/>' +
        buildAvatarLayers(cfg) +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
  }

  /** Resolve the current avatar to a portable image URL (PNG or SVG data-URI). */
  function avatarImageURL(a) {
    const cfg = normalizeAvatar(a);
    if (isIllustration(cfg.base)) {
      const ill = illustrationById(cfg.base);
      if (ill) return ill.src;
    }
    return avatarToDataURI(cfg);
  }

  /**
   * Global avatar loader — restores the saved avatar from localStorage and
   * paints it into every avatar container on the page. Safe to call on any
   * page (map, profile, lesson, …); a no-op when no slots are present.
   */
  function loadUserAvatar() {
    avatar = loadAvatar();
    hydrateAvatars(document);
    const url = avatarImageURL(avatar);
    document.querySelectorAll("img[data-user-avatar]").forEach((img) => {
      img.src = url;
    });
  }

  const AVATAR_CATEGORIES = [
    { id: "character", label: "Character", icon: "user" },
    { id: "skin",      label: "Skin",      icon: "sparkles" },
    { id: "outfit",    label: "Outfit",    icon: "gift" },
    { id: "headwear",  label: "Headwear",  icon: "crown" },
    { id: "accessory", label: "Extras",    icon: "star" },
    { id: "bg",        label: "Backdrop",  icon: "moon" },
  ];
  const AVATAR_VECTOR_ONLY = ["skin", "outfit", "headwear", "accessory"];

  /** The interactive "Avatar Studio" modal. */
  function openAvatarStudio() {
    let draft = normalizeAvatar(Object.assign({}, avatar));
    let activeCat = "character";

    const overlay = document.createElement("div");
    overlay.className = "modal modal--studio";
    overlay.innerHTML =
      '<div class="modal__panel avatar-studio" role="dialog" aria-modal="true" aria-label="Customise your avatar">' +
        '<div class="avatar-studio__head">' +
          '<div>' +
            '<h2 class="avatar-studio__title"><span class="icon" data-icon="sparkles"></span> Customise your avatar</h2>' +
            '<div class="text-sm muted">Design your Noor character, then save it to your profile.</div>' +
          "</div>" +
          '<button class="icon-btn" type="button" data-close aria-label="Close"><span class="icon" data-icon="x"></span></button>' +
        "</div>" +
        '<div class="avatar-studio__grid">' +
          '<div class="avatar-preview">' +
            '<div class="avatar-preview__frame" data-preview></div>' +
            '<button class="btn btn--soft btn--sm" type="button" data-random><span class="icon" data-icon="refresh"></span> Surprise me</button>' +
          "</div>" +
          '<div class="avatar-controls">' +
            '<div class="avatar-tabs" role="tablist" data-tabs></div>' +
            '<div class="avatar-options" data-options></div>' +
          "</div>" +
        "</div>" +
        '<div class="avatar-studio__foot">' +
          '<span class="text-xs muted">Saved on this device</span>' +
          '<div class="row" style="gap:.5rem">' +
            '<button class="btn btn--soft" type="button" data-cancel>Cancel</button>' +
            '<button class="btn btn--primary" type="button" data-save><span class="icon" data-icon="check"></span> Save customization</button>' +
          "</div>" +
        "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    hydrateIcons(overlay);

    const previewEl = overlay.querySelector("[data-preview]");
    const tabsEl = overlay.querySelector("[data-tabs]");
    const optionsEl = overlay.querySelector("[data-options]");
    const vectorLocked = () => isIllustration(draft.base);

    const paintPreview = () => { previewEl.innerHTML = avatarHTML(draft); };
    const thumb = (cfg, label) =>
      '<span class="avatar-opt__thumb">' + avatarHTML(cfg) + "</span>" +
      (label ? '<span class="avatar-opt__label">' + label + "</span>" : "");

    function optionButton(inner, active, onPick) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "avatar-opt" + (active ? " is-active" : "");
      b.setAttribute("aria-pressed", String(active));
      b.innerHTML = inner;
      b.addEventListener("click", onPick);
      return b;
    }

    function paintTabs() {
      tabsEl.innerHTML = "";
      AVATAR_CATEGORIES.forEach((cat) => {
        const locked = vectorLocked() && AVATAR_VECTOR_ONLY.indexOf(cat.id) !== -1;
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", String(cat.id === activeCat));
        b.className = "avatar-tab" + (cat.id === activeCat ? " is-active" : "") + (locked ? " is-locked" : "");
        b.innerHTML = '<span class="icon" data-icon="' + (locked ? "lock" : cat.icon) + '"></span> ' + cat.label;
        b.addEventListener("click", () => { activeCat = cat.id; paintTabs(); paintOptions(); });
        tabsEl.appendChild(b);
      });
      hydrateIcons(tabsEl);
    }

    function paintOptions() {
      optionsEl.innerHTML = "";
      if (vectorLocked() && AVATAR_VECTOR_ONLY.indexOf(activeCat) !== -1) {
        optionsEl.innerHTML =
          '<div class="avatar-note"><span class="icon" data-icon="user"></span><div>' +
            "<b>Illustration selected</b>" +
            '<div class="text-sm muted">Skins, outfits and extras apply to vector characters. Switch to a vector character to unlock them.</div>' +
            '<button class="btn btn--primary btn--sm mt-2" type="button" data-to-vector><span class="icon" data-icon="sparkles"></span> Use vector character</button>' +
          "</div></div>";
        hydrateIcons(optionsEl);
        optionsEl.querySelector("[data-to-vector]").addEventListener("click", () => {
          draft.base = "boy"; activeCat = "skin"; paintPreview(); paintTabs(); paintOptions();
        });
        return;
      }

      const pick = (mutate) => () => { mutate(); paintPreview(); paintTabs(); paintOptions(); };

      if (activeCat === "character") {
        ["boy", "girl"].forEach((base) => {
          optionsEl.appendChild(optionButton(
            thumb(Object.assign({}, draft, { base: base }), base === "boy" ? "Boy" : "Girl"),
            draft.base === base, pick(() => { draft.base = base; })
          ));
        });
        AVATAR_ILLUSTRATIONS.forEach((ill) => {
          const id = "img:" + ill.id;
          const inner = '<span class="avatar-opt__thumb avatar-opt__thumb--img"><img src="' + ill.src + '" alt="" loading="lazy" /></span>' +
            '<span class="avatar-opt__label">' + ill.label + "</span>";
          optionsEl.appendChild(optionButton(inner, draft.base === id, pick(() => { draft.base = id; })));
        });
      }
      if (activeCat === "skin") {
        AVATAR_SKINS.forEach((s, i) =>
          optionsEl.appendChild(optionButton(thumb(Object.assign({}, draft, { skin: i }), s.id), draft.skin === i, pick(() => { draft.skin = i; })))
        );
      }
      if (activeCat === "outfit") {
        AVATAR_OUTFITS.forEach((s, i) =>
          optionsEl.appendChild(optionButton(thumb(Object.assign({}, draft, { outfit: i }), s.id), draft.outfit === i, pick(() => { draft.outfit = i; })))
        );
      }
      if (activeCat === "headwear") {
        AVATAR_HEADWEAR.forEach((h) =>
          optionsEl.appendChild(optionButton(thumb(Object.assign({}, draft, { headwear: h.id }), h.label), draft.headwear === h.id, pick(() => { draft.headwear = h.id; })))
        );
      }
      if (activeCat === "accessory") {
        AVATAR_ACCESSORIES.forEach((h) =>
          optionsEl.appendChild(optionButton(thumb(Object.assign({}, draft, { accessory: h.id }), h.label), draft.accessory === h.id, pick(() => { draft.accessory = h.id; })))
        );
      }
      if (activeCat === "bg") {
        AVATAR_BACKDROPS.forEach((s, i) =>
          optionsEl.appendChild(optionButton(thumb(Object.assign({}, draft, { bg: i }), s.id), draft.bg === i, pick(() => { draft.bg = i; })))
        );
      }
    }

    function close() { overlay.remove(); }

    overlay.querySelector("[data-random]").addEventListener("click", () => {
      const rnd = (n) => Math.floor(Math.random() * n);
      draft = normalizeAvatar({
        base: Math.random() < 0.72 ? (Math.random() < 0.5 ? "boy" : "girl") : "img:" + AVATAR_ILLUSTRATIONS[rnd(AVATAR_ILLUSTRATIONS.length)].id,
        skin: rnd(AVATAR_SKINS.length),
        outfit: rnd(AVATAR_OUTFITS.length),
        headwear: AVATAR_HEADWEAR[rnd(AVATAR_HEADWEAR.length)].id,
        accessory: AVATAR_ACCESSORIES[rnd(AVATAR_ACCESSORIES.length)].id,
        bg: rnd(AVATAR_BACKDROPS.length),
      });
      activeCat = "character";
      paintPreview(); paintTabs(); paintOptions();
    });

    overlay.querySelector("[data-save]").addEventListener("click", () => {
      avatar = normalizeAvatar(draft);
      saveAvatar();
      loadUserAvatar();
      close();
      toast("Avatar saved — looking great!", "sparkles", 5000);
    });
    overlay.querySelector("[data-cancel]").addEventListener("click", close);
    overlay.querySelector("[data-close]").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape" && document.body.contains(overlay)) {
        close();
        document.removeEventListener("keydown", esc);
      }
    });

    paintPreview();
    paintTabs();
    paintOptions();
  }

  /* ==========================================================================
     3. CURRICULUM — units contain ordered quests, quests contain lesson steps
        Step types: 'choice' | 'match'
     ========================================================================== */
  const CURRICULUM = [
    {
      id: "arabic",
      title: "Arabic Island",
      titleAr: "جزيرة الحروف",
      icon: "book",
      theme: "emerald",
      desc: "Meet the Arabic alphabet, one friendly letter at a time.",
      quests: [
        {
          id: "alif-baa", title: "Alif & Baa", icon: "book", xp: 20, gems: 10,
          lesson: [
            { type: "choice", prompt: 'Which letter makes the sound "Baa"?', options: [
              { glyph: "ا", label: "Alif" }, { glyph: "ب", label: "Baa", correct: true },
              { glyph: "ت", label: "Taa" }, { glyph: "ث", label: "Thaa" } ],
              explain: "Baa (ب) has one dot underneath." },
            { type: "choice", prompt: "Which letter is written as a simple vertical stroke?", options: [
              { glyph: "ا", label: "Alif", correct: true }, { glyph: "ب", label: "Baa" },
              { glyph: "ج", label: "Jeem" }, { glyph: "د", label: "Daal" } ],
              explain: "Alif (ا) is a straight vertical line." },
            { type: "match", prompt: "Match each letter to its name.", pairs: [
              { glyph: "ا", label: "Alif" }, { glyph: "ب", label: "Baa" }, { glyph: "ت", label: "Taa" } ] },
          ],
        },
        {
          id: "taa-thaa", title: "Taa & Thaa", icon: "book", xp: 20, gems: 10,
          lesson: [
            { type: "choice", prompt: 'Which letter is "Thaa"?', options: [
              { glyph: "ت", label: "Taa" }, { glyph: "ث", label: "Thaa", correct: true },
              { glyph: "ب", label: "Baa" }, { glyph: "ن", label: "Noon" } ],
              explain: "Thaa (ث) has three dots on top." },
            { type: "choice", prompt: "How many dots does Taa (ت) have on top?", options: [
              { glyph: "٢", label: "Two", correct: true }, { glyph: "١", label: "One" },
              { glyph: "٣", label: "Three" }, { glyph: "٠", label: "None" } ],
              explain: "Taa (ت) has exactly two dots on top." },
            { type: "match", prompt: "Match the letters.", pairs: [
              { glyph: "ت", label: "Taa" }, { glyph: "ث", label: "Thaa" }, { glyph: "ب", label: "Baa" } ] },
          ],
        },
        {
          id: "jeem-family", title: "Jeem Family", icon: "book", xp: 25, gems: 12,
          lesson: [
            { type: "choice", prompt: "Which letter has a dot inside its loop?", options: [
              { glyph: "ج", label: "Jeem", correct: true }, { glyph: "ح", label: "Haa" },
              { glyph: "خ", label: "Khaa" }, { glyph: "ع", label: "Ayn" } ],
              explain: "Jeem (ج) has one dot inside its belly." },
            { type: "choice", prompt: "Which letter has a dot above its loop?", options: [
              { glyph: "خ", label: "Khaa", correct: true }, { glyph: "ج", label: "Jeem" },
              { glyph: "ح", label: "Haa" }, { glyph: "غ", label: "Ghayn" } ],
              explain: "Khaa (خ) has a dot above." },
            { type: "match", prompt: "Match the letters.", pairs: [
              { glyph: "ج", label: "Jeem" }, { glyph: "ح", label: "Haa" }, { glyph: "خ", label: "Khaa" } ] },
          ],
        },
      ],
    },
    {
      id: "wudu",
      title: "Wudu Waterfall",
      titleAr: "وادي الوضوء",
      icon: "water",
      theme: "sky",
      desc: "Learn how to purify yourself beautifully before salah.",
      quests: [
        {
          id: "wudu-intro", title: "Why We Make Wudu", icon: "water", xp: 20, gems: 10,
          lesson: [
            { type: "choice", prompt: "What do we say before making Wudu?", options: [
              { glyph: "بِسْمِ اللّٰه", label: "Bismillah", correct: true },
              { glyph: "الْحَمْدُ لِلّٰه", label: "Alhamdulillah" },
              { glyph: "سُبْحَانَ اللّٰه", label: "SubhanAllah" },
              { glyph: "اَللّٰهُ أَكْبَر", label: "Allahu Akbar" } ],
              explain: "We begin every good action with Bismillah." },
            { type: "choice", prompt: "Wudu helps us become…", options: [
              { glyph: "طَاهِر", label: "Clean & pure", correct: true },
              { glyph: "نَاعِس", label: "Sleepy" }, { glyph: "جَائِع", label: "Hungry" },
              { glyph: "لَاهٍ", label: "Busy" } ],
              explain: "Wudu is a special way to become pure for prayer." },
          ],
        },
        {
          id: "wudu-hands", title: "Wash the Hands", icon: "hands", xp: 20, gems: 10,
          lesson: [
            { type: "choice", prompt: "How many times do we wash each part in Wudu?", options: [
              { glyph: "٣", label: "Three times", correct: true }, { glyph: "١", label: "Once" },
              { glyph: "٥", label: "Five times" }, { glyph: "٧", label: "Seven times" } ],
              explain: "We wash three times, just like the Prophet ﷺ." },
            { type: "choice", prompt: "Which comes right after washing the hands?", options: [
              { glyph: "المَضْمَضَة", label: "Rinse the mouth", correct: true },
              { glyph: "القَدَمَان", label: "Wash the feet" }, { glyph: "الرَّأْس", label: "Wipe the head" },
              { glyph: "الوَجْه", label: "Wash the face" } ],
              explain: "After hands we rinse the mouth, then nose, then face." },
          ],
        },
        {
          id: "wudu-final", title: "Face, Arms & Feet", icon: "water", xp: 25, gems: 12,
          lesson: [
            { type: "choice", prompt: "What do we wipe with wet hands?", options: [
              { glyph: "الرَّأْس", label: "The head", correct: true }, { glyph: "الظَّهْر", label: "The back" },
              { glyph: "الصَّدْر", label: "The chest" }, { glyph: "الرُّكْبَة", label: "The knee" } ],
              explain: "We wipe the whole head once, then the ears." },
            { type: "choice", prompt: "Which parts are washed last in Wudu?", options: [
              { glyph: "الرِّجْلَان", label: "Both feet", correct: true }, { glyph: "الذِّرَاعَان", label: "Both arms" },
              { glyph: "الوَجْه", label: "The face" }, { glyph: "الكَفَّان", label: "The hands" } ],
              explain: "We finish by washing the right foot, then the left." },
          ],
        },
      ],
    },
    {
      id: "salah",
      title: "Salah Sanctuary",
      titleAr: "الحرم الصلاة",
      icon: "compass",
      theme: "gold",
      desc: "Stand, bow and prostrate — learn the prayer step by step.",
      quests: [
        {
          id: "salah-takbir", title: "Takbir: Allahu Akbar", icon: "compass", xp: 25, gems: 12,
          lesson: [
            { type: "choice", prompt: "What do we say to begin the prayer?", options: [
              { glyph: "اَللّٰهُ أَكْبَر", label: "Allahu Akbar", correct: true },
              { glyph: "سُبْحَانَ رَبِّيَ الْعَظِيم", label: "Subhana Rabbiyal Adheem" },
              { glyph: "اَلسَّلَامُ عَلَيْكُم", label: "Assalamu Alaikum" },
              { glyph: "رَبَّنَا لَكَ الْحَمْد", label: "Rabbana Lakal Hamd" } ],
              explain: "The prayer opens with the Takbir." },
            { type: "match", prompt: "Match the prayer positions to their names.", pairs: [
              { glyph: "🧍", label: "Qiyam" }, { glyph: "🙇", label: "Ruku" }, { glyph: "🧎", label: "Sujud" } ] },
          ],
        },
        {
          id: "salah-rukuh", title: "Ruku & Sujood", icon: "compass", xp: 25, gems: 12,
          lesson: [
            { type: "choice", prompt: "In Ruku we say…", options: [
              { glyph: "سُبْحَانَ رَبِّيَ الْعَظِيم", label: "Subhana Rabbiyal Adheem", correct: true },
              { glyph: "اَللّٰهُ أَكْبَر", label: "Allahu Akbar" },
              { glyph: "سُبْحَانَ رَبِّيَ الْأَعْلَى", label: "Subhana Rabbiyal A'la" },
              { glyph: "اَلسَّلَامُ عَلَيْكُم", label: "Assalamu Alaikum" } ],
              explain: "In Ruku we glorify Allah, the Most Great." },
            { type: "choice", prompt: "How many body parts touch the ground in Sujood?", options: [
              { glyph: "٧", label: "Seven", correct: true }, { glyph: "٣", label: "Three" },
              { glyph: "٩", label: "Nine" }, { glyph: "٥", label: "Five" } ],
              explain: "Seven points: forehead, two hands, two knees, two feet." },
          ],
        },
        {
          id: "salah-fatiha", title: "Surah Al-Fatiha", icon: "book-open", xp: 30, gems: 15,
          lesson: [
            { type: "choice", prompt: "What is the first word of Surah Al-Fatiha?", options: [
              { glyph: "الْحَمْدُ", label: "Al-Hamd", correct: true }, { glyph: "قُلْ", label: "Qul" },
              { glyph: "إِنَّا", label: "Inna" }, { glyph: "تَبَارَكَ", label: "Tabaraka" } ],
              explain: "Al-Fatiha begins: 'Alhamdulillahi Rabbil Aalameen'." },
            { type: "choice", prompt: "How many verses (ayah) are in Al-Fatiha?", options: [
              { glyph: "٧", label: "Seven", correct: true }, { glyph: "٥", label: "Five" },
              { glyph: "٤", label: "Four" }, { glyph: "١٠", label: "Ten" } ],
              explain: "Al-Fatiha has seven beautiful verses." },
          ],
        },
      ],
    },
    {
      id: "quran",
      title: "Quran Cove",
      titleAr: "خليج القرآن",
      icon: "book-open",
      theme: "rose",
      desc: "Memorise short, powerful surahs of the Noble Quran.",
      quests: [
        {
          id: "quran-ikhlas", title: "Surah Al-Ikhlas", icon: "book-open", xp: 30, gems: 15,
          lesson: [
            { type: "choice", prompt: "Al-Ikhlas teaches that Allah is…", options: [
              { glyph: "أَحَد", label: "One", correct: true }, { glyph: "ثَلَاثَة", label: "Three" },
              { glyph: "كَثِير", label: "Many" }, { glyph: "اِثْنَان", label: "Two" } ],
              explain: "Al-Ikhlas is all about the oneness of Allah." },
            { type: "choice", prompt: "Complete: 'Qul huwallahu …'", options: [
              { glyph: "أَحَد", label: "Ahad", correct: true }, { glyph: "أَكْبَر", label: "Akbar" },
              { glyph: "رَحِيم", label: "Raheem" }, { glyph: "كَرِيم", label: "Kareem" } ],
              explain: "Allahu Ahad — Allah is One." },
          ],
        },
        {
          id: "quran-falaq", title: "Surah Al-Falaq", icon: "book-open", xp: 30, gems: 15,
          lesson: [
            { type: "choice", prompt: "Al-Falaq means…", options: [
              { glyph: "الفَلَق", label: "The Daybreak", correct: true }, { glyph: "النَّاس", label: "Mankind" },
              { glyph: "الفِيل", label: "The Elephant" }, { glyph: "العَصْر", label: "Time" } ],
              explain: "Al-Falaq means the daybreak or dawn." },
            { type: "choice", prompt: "This surah asks Allah for…", options: [
              { glyph: "الْحِمَايَة", label: "Protection", correct: true }, { glyph: "الطَّعَام", label: "Food" },
              { glyph: "الْمَال", label: "Wealth" }, { glyph: "النَّوْم", label: "Sleep" } ],
              explain: "We seek Allah's protection from all harm." },
          ],
        },
        {
          id: "quran-nas", title: "Surah An-Nas", icon: "book-open", xp: 35, gems: 18,
          lesson: [
            { type: "choice", prompt: "An-Nas means…", options: [
              { glyph: "النَّاس", label: "Mankind", correct: true }, { glyph: "الفَجْر", label: "Dawn" },
              { glyph: "الْمَلِك", label: "The King" }, { glyph: "الوَلِي", label: "The Friend" } ],
              explain: "An-Nas means mankind, the people." },
            { type: "choice", prompt: "Surah An-Nas is the… surah of the Quran.", options: [
              { glyph: "الْأَخِيرَة", label: "Last", correct: true }, { glyph: "الْأُولَى", label: "First" },
              { glyph: "الطَّوِيلَة", label: "Longest" }, { glyph: "الَّتِي فِي الوَسَط", label: "Middle" } ],
              explain: "An-Nas is the final surah (114)." },
          ],
        },
      ],
    },
    {
      id: "duas",
      title: "Dua Dunes",
      titleAr: "رمال الدعاء",
      icon: "sparkles",
      theme: "gold",
      desc: "Everyday duas to keep your heart connected to Allah.",
      quests: [
        {
          id: "dua-bismillah", title: "Saying Bismillah", icon: "sparkles", xp: 20, gems: 10,
          lesson: [
            { type: "choice", prompt: "Before eating we say…", options: [
              { glyph: "بِسْمِ اللّٰه", label: "Bismillah", correct: true },
              { glyph: "اَلْحَمْدُ لِلّٰه", label: "Alhamdulillah" },
              { glyph: "اَللّٰهُ أَكْبَر", label: "Allahu Akbar" },
              { glyph: "لَا إِلٰهَ إِلَّا اللّٰه", label: "La ilaha illallah" } ],
              explain: "Bismillah means 'In the name of Allah'." },
            { type: "choice", prompt: "If you forget at the start, what do you say?", options: [
              { glyph: "بِسْمِ اللّٰهِ أَوَّلَهُ وَآخِرَهُ", label: "Bismillahi awwalahu wa aakhirahu", correct: true },
              { glyph: "اَلْحَمْدُ لِلّٰه", label: "Alhamdulillah" },
              { glyph: "سُبْحَانَ اللّٰه", label: "SubhanAllah" },
              { glyph: "مَا شَاءَ اللّٰه", label: "MashaAllah" } ],
              explain: "We say Bismillah at the beginning and the end." },
          ],
        },
        {
          id: "dua-sleep", title: "Before Sleeping", icon: "moon", xp: 20, gems: 10,
          lesson: [
            { type: "choice", prompt: "Which dua do we say before sleeping?", options: [
              { glyph: "بِاسْمِكَ اللّٰهُمَّ أَمُوتُ وَأَحْيَا", label: "Bismika Allahumma amutu wa ahya", correct: true },
              { glyph: "أَصْبَحْنَا", label: "Asbahna" },
              { glyph: "اَلسَّلَامُ عَلَيْكُم", label: "Assalamu Alaikum" },
              { glyph: "بِسْمِ اللّٰه", label: "Bismillah" } ],
              explain: "We remember Allah before resting." },
          ],
        },
      ],
    },
  ];

  /* Flatten quests with a reference to their unit for quick lookup. */
  const ALL_QUESTS = [];
  CURRICULUM.forEach((unit) =>
    unit.quests.forEach((q, i) => {
      ALL_QUESTS.push({ ...q, unitId: unit.id, unitTitle: unit.title, indexInUnit: i });
    })
  );

  const getQuest = (id) => ALL_QUESTS.find((q) => q.id === id);
  const isCompleted = (id) => state.completed.indexOf(id) !== -1;

  /** The next quest a learner should attempt (first not-yet-completed). */
  function nextQuestId() {
    const found = ALL_QUESTS.find((q) => !isCompleted(q.id));
    return found ? found.id : ALL_QUESTS[0].id;
  }

  /* ==========================================================================
     4. SHARED UI HELPERS
     ========================================================================== */
  function syncStats() {
    document.querySelectorAll('[data-stat="streak"]').forEach((el) => (el.textContent = state.streak));
    document.querySelectorAll('[data-stat="coins"]').forEach((el) => (el.textContent = state.coins));
    document.querySelectorAll('[data-stat="hearts"]').forEach((el) => (el.textContent = state.hearts + "/" + state.maxHearts));
    document.querySelectorAll('[data-stat="xp"]').forEach((el) => (el.textContent = state.xp.toLocaleString()));
    document.querySelectorAll('[data-stat="level"]').forEach((el) => (el.textContent = playerLevel()));
    /* Prefer the signed-in session name; fall back to the local profile name. */
    const displayName = isSignedIn() ? userName() : state.name;
    document.querySelectorAll("[data-name]").forEach((el) => (el.textContent = displayName));
    document.querySelectorAll("[data-pet]").forEach((el) => (el.textContent = state.pet));
  }

  /* ---- Authentication chrome (renders into every page header) ---- */
  function renderAuth() {
    document.querySelectorAll("[data-auth-area]").forEach((area) => {
      const ctx = area.dataset.authArea; // "landing" | "app"
      if (isSignedIn()) {
        const proTag = isPro()
          ? '<span class="chip chip--gold"><span class="icon" data-icon="crown"></span>Pro</span>'
          : "";
        if (ctx === "app") {
          area.innerHTML =
            '<span class="auth-name">' + userName() + "</span>" + proTag +
            '<a class="app-bar__avatar app-bar__avatar--custom" href="profile.html" aria-label="Your profile"><span data-avatar-slot></span></a>' +
            '<button class="icon-btn" type="button" data-signout aria-label="Sign out" title="Sign out"><span class="icon" data-icon="logout"></span></button>';
        } else {
          area.innerHTML =
            '<span class="chip chip--emerald"><span class="icon" data-icon="user"></span>' + userName() + "</span>" + proTag +
            (isPro() ? "" : '<a class="btn btn--gold btn--sm" href="pricing.html">Upgrade</a>') +
            '<button class="btn btn--soft btn--sm" type="button" data-signout>Sign out</button>';
        }
      } else {
        area.innerHTML =
          ctx === "app"
            ? '<a class="btn btn--soft btn--sm" href="login.html">Sign in</a>'
            : '<a class="btn btn--soft btn--sm" href="login.html">Log in</a><a class="btn btn--primary btn--sm" href="pricing.html">Get Started</a>';
      }
    });
    hydrateIcons(document);
  }

  /* ---- Upgrade prompt reused by the map and lesson gating ---- */
  function showUpgradeModal(reason) {
    const copy =
      {
        unit: { title: "This quest is part of Noor Pro", text: "Unlock every Quran level, all Namaz guides, offline content and unlimited hearts with Noor Pro." },
        limit: { title: "Daily free lessons used", text: "You have reached today's free lesson limit. Go Pro for unlimited learning." },
      }[reason] || { title: "Go Pro", text: "Unlock the full Noor experience." };

    const overlay = document.createElement("div");
    overlay.className = "modal";
    overlay.innerHTML =
      '<div class="modal__panel">' +
        '<div class="modal__icon"><span class="icon" data-icon="crown"></span></div>' +
        "<h2>" + copy.title + "</h2>" +
        '<p class="muted">' + copy.text + "</p>" +
        '<div class="stack-sm mt-3">' +
          '<a class="btn btn--gold btn--block" href="pricing.html"><span class="icon" data-icon="sparkles"></span> See plans</a>' +
          '<button class="btn btn--soft btn--block" type="button" data-close>Maybe later</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    hydrateIcons(overlay);
    overlay.querySelector("[data-close]").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  let toastTimer;
  let toastCleanupTimer;
  function toast(message, icon, duration) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = `<span class="icon" data-icon="${icon || "sparkles"}"></span><span>${message}</span>`;
    hydrateIcons(el);

    clearTimeout(toastTimer);
    clearTimeout(toastCleanupTimer);
    /* Restart the enter transition even when reusing the same node. */
    el.classList.remove("is-show");
    void el.offsetWidth;
    requestAnimationFrame(() => el.classList.add("is-show"));

    /* Auto-dismiss (default 3s; the avatar toast uses 5s). */
    toastTimer = setTimeout(() => {
      el.classList.remove("is-show");
      /* Detach once the fade-out transition has finished. */
      toastCleanupTimer = setTimeout(() => {
        if (!el.classList.contains("is-show")) el.remove();
      }, 400);
    }, typeof duration === "number" ? duration : 3000);
  }

  /* Text-to-speech helper (keeps the project free of audio asset files). */
  function speak(text, lang) {
    try {
      if (!("speechSynthesis" in window)) return false;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || "ar-SA";
      u.rate = state.prefs.speed || 1;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ==========================================================================
     5. LANDING PAGE
     ========================================================================== */
  function initLanding() {
    /* Mobile menu toggle */
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = menu.hasAttribute("hidden") === false;
        if (open) menu.setAttribute("hidden", "");
        else menu.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", String(!open));
      });
      menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => menu.setAttribute("hidden", ""))
      );
    }

    /* Demo quiz — "tap the letter that sounds like Baa" */
    const quiz = document.getElementById("demoQuiz");
    if (!quiz) return;
    const options = quiz.querySelectorAll(".quiz-option");
    const feedback = quiz.querySelector(".feedback");
    const actionBtn = quiz.querySelector("[data-quiz-action]");
    const gemTag = quiz.querySelector("[data-quiz-gems]");
    let locked = false;

    options.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;
        const correct = btn.dataset.correct === "true";
        options.forEach((b) => {
          b.disabled = true;
          if (b.dataset.correct === "true") b.classList.add("is-correct");
        });
        if (!correct) btn.classList.add("is-wrong");

        feedback.classList.remove("hidden");
        feedback.className = "feedback " + (correct ? "feedback--correct" : "feedback--wrong");
        feedback.querySelector(".feedback__ico").innerHTML = ICONS[correct ? "check" : "x"];
        feedback.querySelector("strong").textContent = correct ? "Masha'Allah, correct!" : "Almost — try again!";
        feedback.querySelector("[data-feedback-desc]").textContent = correct
          ? "You found Baa (ب)! That's +10 Noor Gems."
          : "That's not Baa. Remember, Baa has one dot underneath.";

        if (correct) {
          gemTag.textContent = "+20 Gems";
          gemTag.classList.remove("hidden");
          toast("+10 gems earned in the demo!", "gem");
        }
        actionBtn.textContent = correct ? "Next challenge" : "Try again";
        actionBtn.classList.toggle("btn--primary", correct);
        actionBtn.classList.toggle("btn--error", !correct);

        actionBtn.onclick = () => {
          options.forEach((b) => {
            b.disabled = false;
            b.classList.remove("is-correct", "is-wrong");
          });
          feedback.classList.add("hidden");
          gemTag.classList.add("hidden");
          actionBtn.classList.add("hidden");
          locked = false;
        };
        actionBtn.classList.remove("hidden");
      });
    });
  }

  /* ==========================================================================
     6. QUEST MAP
     ========================================================================== */
  function initMap() {
    const mount = document.getElementById("questMap");
    if (!mount) return;

    /* Plan status banner (free usage / pro state) */
    const planBox = document.getElementById("planStatus");
    if (planBox) {
      if (isPro()) {
        planBox.innerHTML =
          '<span class="chip chip--gold"><span class="icon" data-icon="crown"></span> Noor Pro — all levels unlocked &amp; unlimited hearts</span>';
      } else {
        planBox.innerHTML =
          '<span class="chip chip--neutral"><span class="icon" data-icon="sparkles"></span> Free plan</span>' +
          '<span class="chip chip--neutral"><span class="icon" data-icon="clock"></span> ' + lessonsToday() + "/" + FREE_DAILY_LESSON_LIMIT + " lessons today</span>" +
          '<a class="btn btn--gold btn--sm" href="pricing.html"><span class="icon" data-icon="crown"></span> Upgrade to Pro</a>';
      }
      hydrateIcons(planBox);
    }

    /* Determine which quest is currently "active" (playable).
       Only the first not-yet-completed quest in an unlocked unit is playable. */
    let activeReached = false;

    CURRICULUM.forEach((unit) => {
      const unitEl = document.createElement("section");
      unitEl.className = "stack";
      unitEl.style.gap = "1rem";

      /* Unit banner */
      const proUnit = questNeedsPro({ unitId: unit.id });
      const banner = document.createElement("div");
      banner.className = "unit-banner" + (unit.theme === "sky" ? " unit-banner--sky" : unit.theme === "gold" ? " unit-banner--gold" : unit.theme === "rose" ? " unit-banner--rose" : "");
      const done = unit.quests.filter((q) => isCompleted(q.id)).length;
      banner.innerHTML = `
        <div class="row" style="gap:.9rem">
          <span class="card__ico" style="background:rgba(255,255,255,.22);color:#fff"><span class="icon" data-icon="${unit.icon}"></span></span>
          <div>
            <b>${unit.title}</b>
            <div class="text-sm" style="opacity:.92">${unit.desc}</div>
          </div>
        </div>
        <div class="row" style="gap:.6rem">
          <span class="unit-ar">${unit.titleAr}</span>
          ${proUnit ? '<span class="chip"><span class="icon" data-icon="crown"></span> Pro</span>' : ""}
          <span class="chip">${done}/${unit.quests.length}</span>
        </div>`;
      unitEl.appendChild(banner);

      /* Winding path */
      const path = document.createElement("div");
      path.className = "quest-path";

      unit.quests.forEach((quest, i) => {
        const completed = isCompleted(quest.id);
        const proLocked = !isPro() && !unitIsFree(unit.id);

        /* Status precedence: completed → pro-locked → next active → locked. */
        let status;
        if (completed) {
          status = "done";
        } else if (proLocked) {
          status = "pro";
        } else if (!activeReached) {
          status = "active";
          activeReached = true;
        } else {
          status = "locked";
        }

        const nodeWrap = document.createElement("div");
        nodeWrap.className = "quest-node";
        /* Alternate nodes left/right to create the winding path */
        const offset = Math.round(Math.sin(i * 1.05 + unit.id.length) * 34);
        nodeWrap.style.setProperty("--offset", offset + "px");

        const nodeIcon = status === "locked" ? "lock" : status === "pro" ? "crown" : status === "done" ? "check" : quest.icon;
        const node = document.createElement("button");
        node.type = "button";
        node.className = "node node--" + status;
        node.setAttribute("aria-label", quest.title + " — " + status);
        node.dataset.quest = quest.id;
        node.dataset.status = status;
        node.innerHTML =
          `<span class="icon" data-icon="${nodeIcon}"></span>` +
          (status === "done" ? '<span class="node__badge"><span class="icon" data-icon="star"></span></span>' : "");

        const label = document.createElement("span");
        label.className = "node-label" + (status === "active" ? " node-label--active" : "");
        label.textContent = quest.title;

        if (status === "active") {
          const start = document.createElement("span");
          start.className = "node-start";
          start.textContent = "Start here";
          nodeWrap.appendChild(start);
        }

        nodeWrap.appendChild(node);
        nodeWrap.appendChild(label);
        path.appendChild(nodeWrap);

        node.addEventListener("click", () => {
          if (status === "locked") {
            toast("Finish the quest before this one to unlock it!", "lock");
            return;
          }
          if (status === "pro") {
            showUpgradeModal("unit");
            return;
          }
          window.location.href = "lesson.html?quest=" + encodeURIComponent(quest.id);
        });
      });

      unitEl.appendChild(path);
      mount.appendChild(unitEl);
    });

    hydrateIcons(mount);
  }

  /* ==========================================================================
     7. LESSON ENGINE
     ========================================================================== */
  function initLesson() {
    const mount = document.getElementById("lessonMount");
    if (!mount) return;

    const params = new URLSearchParams(window.location.search);
    const questId = params.get("quest") || nextQuestId();
    const quest = getQuest(questId) || ALL_QUESTS[0];

    const els = {
      title: document.getElementById("lessonTitle"),
      unit: document.getElementById("lessonUnit"),
      progress: document.getElementById("lessonProgressBar"),
      hearts: document.getElementById("lessonHearts"),
      card: document.getElementById("exerciseCard"),
      feedback: document.getElementById("lessonFeedback"),
      check: document.getElementById("lessonCheck"),
    };

    els.title.textContent = quest.title;
    els.unit.textContent = quest.unitTitle + " • " + quest.lesson.length + " exercises";

    /* Plan gating — Pro-only units and the free daily lesson limit. */
    if (questNeedsPro(quest)) {
      mount.innerHTML =
        '<div class="exercise text-center">' +
          '<div class="modal__icon" style="margin-inline:auto"><span class="icon" data-icon="crown"></span></div>' +
          "<h2>" + quest.title + " is a Pro quest</h2>" +
          '<p class="muted">Upgrade to Noor Pro to unlock every Quranic level, advanced Namaz guides and unlimited hearts.</p>' +
          '<a class="btn btn--gold mt-3" href="pricing.html"><span class="icon" data-icon="sparkles"></span> See plans</a>' +
        "</div>";
      hydrateIcons(mount);
      showUpgradeModal("unit");
      return;
    }
    if (!isPro() && lessonsToday() >= FREE_DAILY_LESSON_LIMIT) {
      mount.innerHTML =
        '<div class="exercise text-center">' +
          '<div class="modal__icon" style="margin-inline:auto"><span class="icon" data-icon="clock"></span></div>' +
          "<h2>Daily free lessons used</h2>" +
          '<p class="muted">You have finished today\'s ' + FREE_DAILY_LESSON_LIMIT + ' free lessons. Go Pro for unlimited learning.</p>' +
          '<a class="btn btn--gold mt-3" href="pricing.html"><span class="icon" data-icon="sparkles"></span> See plans</a>' +
        "</div>";
      hydrateIcons(mount);
      showUpgradeModal("limit");
      return;
    }

    let stepIndex = 0;
    let selected = null;       // currently selected answer element
    let answered = false;      // has the current step been checked
    let matchedCount = 0;      // for match exercises

    renderHearts();

    function renderHearts() {
      /* Pro members enjoy unlimited hearts. */
      if (isPro()) {
        els.hearts.innerHTML =
          '<span class="icon" data-icon="heart"></span><span class="fw-600" style="font-size:1.05rem">∞</span>';
        hydrateIcons(els.hearts);
        return;
      }
      let html = "";
      for (let i = 0; i < state.maxHearts; i++) {
        html += `<span class="icon ${i < state.hearts ? "" : "is-lost"}" data-icon="heart"></span>`;
      }
      els.hearts.innerHTML = html;
      hydrateIcons(els.hearts);
    }

    function updateProgress() {
      const pct = Math.round((stepIndex / quest.lesson.length) * 100);
      els.progress.style.width = pct + "%";
    }

    /* ---- Render the current step ---- */
    function renderStep() {
      answered = false;
      selected = null;
      matchedCount = 0;
      updateProgress();

      const step = quest.lesson[stepIndex];
      els.feedback.className = "lesson-feedback hidden";
      els.feedback.innerHTML = "";
      els.check.classList.add("hidden");
      els.check.disabled = true;
      els.check.textContent = "Check answer";
      els.card.innerHTML = "";

      if (step.type === "choice") {
        const audioBtn = document.createElement("button");
        audioBtn.type = "button";
        audioBtn.className = "exercise__audio";
        audioBtn.setAttribute("aria-label", "Listen to the Arabic");
        audioBtn.innerHTML = ICONS.volume;
        audioBtn.addEventListener("click", () => {
          audioBtn.classList.add("is-playing");
          const correctGlyph = (step.options.find((o) => o.correct) || {}).glyph;
          speak(correctGlyph, "ar-SA");
          setTimeout(() => audioBtn.classList.remove("is-playing"), 1200);
        });
        els.card.appendChild(audioBtn);

        const prompt = document.createElement("h2");
        prompt.className = "exercise__prompt";
        prompt.textContent = step.prompt;
        els.card.appendChild(prompt);

        const grid = document.createElement("div");
        grid.className = "answer-grid answer-grid--" + Math.min(step.options.length, 4);
        step.options.forEach((opt) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "answer";
          b.dataset.correct = String(!!opt.correct);
          b.innerHTML = `<span class="glyph">${opt.glyph}</span><span class="label">${opt.label}</span>`;
          b.addEventListener("click", () => {
            if (answered) return;
            grid.querySelectorAll(".answer").forEach((x) => x.classList.remove("is-selected"));
            b.classList.add("is-selected");
            selected = b;
            els.check.disabled = false;
            els.check.classList.remove("hidden");
          });
          grid.appendChild(b);
        });
        els.card.appendChild(grid);
        els.check.textContent = "Check answer";
      }

      if (step.type === "match") {
        const prompt = document.createElement("h2");
        prompt.className = "exercise__prompt";
        prompt.textContent = step.prompt;
        els.card.appendChild(prompt);

        const wrap = document.createElement("div");
        wrap.className = "match-grid";
        const left = document.createElement("div");
        left.className = "match-col";
        const right = document.createElement("div");
        right.className = "match-col";

        const shuffled = step.pairs.slice().sort(() => Math.random() - 0.5);
        step.pairs.forEach((p) => {
          const t = document.createElement("button");
          t.type = "button";
          t.className = "match-tile";
          t.dataset.key = p.label;
          t.dataset.side = "left";
          t.innerHTML = `<span class="glyph">${p.glyph}</span>`;
          left.appendChild(t);
        });
        shuffled.forEach((p) => {
          const t = document.createElement("button");
          t.type = "button";
          t.className = "match-tile";
          t.dataset.key = p.label;
          t.dataset.side = "right";
          t.textContent = p.label;
          right.appendChild(t);
        });
        wrap.appendChild(left);
        wrap.appendChild(right);
        els.card.appendChild(wrap);

        let pickLeft = null;
        let pickRight = null;
        const tryMatch = () => {
          if (!pickLeft || !pickRight) return;
          const ok = pickLeft.dataset.key === pickRight.dataset.key;
          if (ok) {
            pickLeft.classList.add("is-matched");
            pickRight.classList.add("is-matched");
            pickLeft.disabled = true;
            pickRight.disabled = true;
            matchedCount++;
            speak(pickLeft.dataset.key, "en-US");
            if (matchedCount === step.pairs.length) {
              answered = true;
              showFeedback(true, "All matched!", "You matched every pair correctly.");
              els.check.disabled = false;
              els.check.textContent = "Continue";
              els.check.classList.remove("hidden");
            }
          } else {
            pickLeft.classList.remove("is-selected");
            pickRight.classList.remove("is-selected");
            pickLeft.classList.add("is-wrong");
            pickRight.classList.add("is-wrong");
            setTimeout(() => {
              pickLeft && pickLeft.classList.remove("is-wrong");
              pickRight && pickRight.classList.remove("is-wrong");
            }, 420);
            loseHeart();
          }
          pickLeft = null;
          pickRight = null;
        };
        left.querySelectorAll(".match-tile").forEach((t) =>
          t.addEventListener("click", () => {
            if (t.disabled) return;
            left.querySelectorAll(".match-tile").forEach((x) => x.classList.remove("is-selected"));
            t.classList.add("is-selected");
            pickLeft = t;
            tryMatch();
          })
        );
        right.querySelectorAll(".match-tile").forEach((t) =>
          t.addEventListener("click", () => {
            if (t.disabled) return;
            right.querySelectorAll(".match-tile").forEach((x) => x.classList.remove("is-selected"));
            t.classList.add("is-selected");
            pickRight = t;
            tryMatch();
          })
        );
        els.check.classList.add("hidden");
      }
    }

    /* ---- Feedback tray ---- */
    function showFeedback(correct, title, desc) {
      els.feedback.className = "lesson-feedback lesson-feedback--" + (correct ? "correct" : "wrong");
      els.feedback.innerHTML = `
        <span class="icon" data-icon="${correct ? "check" : "x"}" style="width:26px;height:26px"></span>
        <div><strong>${title}</strong><div class="text-sm">${desc}</div></div>`;
      hydrateIcons(els.feedback);
    }

    function loseHeart() {
      if (isPro()) return;             // Pro members never lose hearts
      if (state.hearts <= 0) return;
      state.hearts--;
      saveState();
      renderHearts();
      syncStats();
      if (state.hearts === 0) showOutOfHearts();
    }

    /* ---- Check button ---- */
    els.check.addEventListener("click", () => {
      const step = quest.lesson[stepIndex];
      if (answered) {
        advance();
        return;
      }
      if (step.type !== "choice" || !selected) return;

      answered = true;
      const correct = selected.dataset.correct === "true";
      const answers = els.card.querySelectorAll(".answer");
      answers.forEach((b) => {
        b.disabled = true;
        if (b.dataset.correct === "true") b.classList.add("is-correct");
      });
      selected.classList.remove("is-selected");

      if (correct) {
        showFeedback(true, "Masha'Allah, correct!", step.explain || "Beautifully done!");
        els.check.textContent = "Continue";
        els.check.classList.remove("hidden");
      } else {
        selected.classList.add("is-wrong");
        showFeedback(false, "Not quite — check again", step.explain || "Give it another try!");
        loseHeart();
        els.check.textContent = "Got it";
      }
    });

    function advance() {
      stepIndex++;
      if (stepIndex >= quest.lesson.length) {
        completeQuest();
        return;
      }
      renderStep();
    }

    /* ---- Completion ---- */
    function completeQuest() {
      updateProgress();
      const firstTime = !isCompleted(quest.id);
      if (firstTime) {
        state.completed.push(quest.id);
        state.xp += quest.xp;
        state.coins += quest.gems;

        /* Streak update */
        const today = todayKey();
        if (state.lastActive !== today) {
          const yesterday = dayOffsetKey(1);
          state.streak = state.lastActive === yesterday ? state.streak + 1 : 1;
          state.lastActive = today;
        }
        state.history[today] = (state.history[today] || 0) + quest.xp;
        if (!isPro()) bumpDailyLessons(); // count against the free daily limit
        saveState();
        syncStats();
      }
      showSuccessModal(firstTime ? quest.xp : 0, firstTime ? quest.gems : 0);
    }

    function showSuccessModal(xp, gems) {
      const overlay = document.createElement("div");
      overlay.className = "modal";
      overlay.innerHTML = `
        <div class="modal__panel">
          <div class="confetti"></div>
          <div class="modal__icon modal__icon--emerald"><span class="icon" data-icon="trophy"></span></div>
          <h2>Quest Complete!</h2>
          <p class="muted">You finished <strong>${quest.title}</strong>. ${xp ? "Your streak is glowing!" : "Great practice!"}</p>
          <div class="reward-row">
            <div><b class="text-secondary">+${xp}</b><small>XP</small></div>
            <div><b class="text-primary">+${gems}</b><small>Noor Gems</small></div>
            <div><b>🔥 ${state.streak}</b><small>Day Streak</small></div>
          </div>
          <a class="btn btn--primary btn--block" href="map.html"><span>Back to Quest Map</span><span class="icon" data-icon="arrow-right"></span></a>
        </div>`;

      /* Confetti burst */
      const confetti = overlay.querySelector(".confetti");
      const colors = ["#10B981", "#F59E0B", "#3B82F6", "#F43F5E", "#34D399"];
      for (let i = 0; i < 40; i++) {
        const piece = document.createElement("i");
        piece.style.left = Math.random() * 100 + "%";
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = Math.random() * 0.6 + "s";
        piece.style.transform = "rotate(" + Math.random() * 360 + "deg)";
        confetti.appendChild(piece);
      }
      document.body.appendChild(overlay);
      hydrateIcons(overlay);
    }

    /* ---- Out of hearts modal ---- */
    function showOutOfHearts() {
      const canAfford = state.coins >= HEART_REFILL_COST;
      const overlay = document.createElement("div");
      overlay.className = "modal";
      overlay.innerHTML = `
        <div class="modal__panel">
          <div class="modal__icon modal__icon--error"><span class="icon" data-icon="heart"></span></div>
          <h2>Your hearts ran out</h2>
          <p class="muted">Hearts refill over time. You can also refill now with Noor Gems — ${canAfford ? "you have enough!" : "you need " + HEART_REFILL_COST + " gems."}</p>
          <div class="stack-sm mt-3">
            <button class="btn btn--gold btn--block" data-refill ${canAfford ? "" : "disabled"}>
              <span class="icon" data-icon="gem"></span><span>Refill hearts — ${HEART_REFILL_COST} gems</span>
            </button>
            <a class="btn btn--soft btn--block" href="map.html">Back to map</a>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      hydrateIcons(overlay);

      const refill = overlay.querySelector("[data-refill]");
      if (refill && canAfford) {
        refill.addEventListener("click", () => {
          state.coins -= HEART_REFILL_COST;
          state.hearts = state.maxHearts;
          saveState();
          syncStats();
          renderHearts();
          overlay.remove();
          toast("Hearts refilled! Keep going.", "heart");
        });
      }
    }

    /* Keyboard: Enter advances / checks */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !els.check.classList.contains("hidden")) {
        e.preventDefault();
        els.check.click();
      }
    });

    renderStep();
    hydrateIcons(mount);
  }

  /* ==========================================================================
     7b. STORIES LIBRARY — short, moral Islamic stories for kids
        category: 'prophets' | 'morals'
     ========================================================================== */
  const STORIES = [
    {
      id: "hazrat-adam",
      title: "The First Man: Story of Hazrat Adam (A.S.)",
      category: "prophets",
      icon: "leaf",
      theme: "emerald",
      readTime: 4,
      teaser: "How Allah created the very first human being — and the beautiful lesson of saying sorry.",
      reward: { xp: 20, gems: 12 },
      moral: "Always say sorry to Allah and to others — a humble heart is loved by Allah.",
      paragraphs: [
        "Long, long ago, before there were any people on the earth, Allah decided to create a very special new being. He shaped a man from clay and breathed life into him. This first man was called Adam (A.S.), and Allah taught him the names of everything around him.",
        "Allah told the angels to bow down to Adam as a sign of respect. All the angels obeyed — except one proud jinn named Iblees, who is also called Shaytan. He thought, \u201cI am better than him,\u201d and he refused. Because of his pride, he was sent away from Allah\u2019s mercy.",
        "Allah placed Adam (A.S.) and his wife Hawwa in a beautiful garden full of delicious fruits. They could enjoy everything there, except one special tree. But Shaytan whispered to them and tricked them into eating from it.",
        "As soon as they did, Adam (A.S.) felt very sad and realised their mistake. He did not blame anyone else. He turned to Allah and prayed, \u201cOur Lord, we have wronged ourselves. If You do not forgive us, we will surely be among the losers.\u201d",
        "Allah, the Most Merciful, forgave them. Adam (A.S.) learned that everyone makes mistakes, but the best people are those who say sorry, turn back to Allah, and try to do better.",
      ],
    },
    {
      id: "hazrat-nuh",
      title: "The Patient Prophet: Hazrat Nuh (A.S.)",
      category: "prophets",
      icon: "water",
      theme: "sky",
      readTime: 4,
      teaser: "For hundreds of years Nuh (A.S.) invited his people to Allah with patience and never gave up.",
      reward: { xp: 20, gems: 12 },
      moral: "Be patient and keep doing good, even when others do not listen.",
      paragraphs: [
        "After many generations, people began to forget Allah and started worshipping idols made of stone. Allah sent a kind and patient prophet named Nuh (A.S.) to guide them back to the truth.",
        "Day after day, and year after year, Nuh (A.S.) invited his people to worship only Allah. He was gentle and he never grew tired. He called them in the morning and at night, in secret and in public.",
        "Most people laughed at him and refused to listen. But Nuh (A.S.) did not lose hope. He kept calling to Allah and kept guiding the few who chose to believe.",
        "Then Allah commanded Nuh (A.S.) to build a great ark — a giant boat — far away from any sea. People made fun of him, but he trusted Allah and carried on building it anyway.",
        "When the command of Allah came, water poured from the sky and burst from the earth. Nuh (A.S.) and the believers boarded the ark and were saved, while the proud ones were swept away. Nuh (A.S.) showed us that patience and trust in Allah always win.",
      ],
    },
    {
      id: "hazrat-yunus",
      title: "In the Belly of the Fish: Hazrat Yunus (A.S.)",
      category: "prophets",
      icon: "moon-star",
      theme: "sky",
      readTime: 3,
      teaser: "Swallowed by a giant fish, Yunus (A.S.) called out to Allah from the darkness.",
      reward: { xp: 20, gems: 12 },
      moral: "When you feel lost, call upon Allah — He always hears you.",
      paragraphs: [
        "Yunus (A.S.) was a prophet sent to a town whose people had stopped listening to Allah. He invited them for a long time, but they kept ignoring his message. Feeling sad and upset, he left the town without waiting for Allah\u2019s permission.",
        "He boarded a ship, but soon a fierce storm began to toss it about. The sailors decided that someone must be thrown into the sea to lighten the load. They cast lots, and the lot fell upon Yunus (A.S.).",
        "As he fell into the roaring waves, a huge fish swallowed him whole. Inside its belly it was dark, deep and quiet. Yunus (A.S.) realised his mistake and turned to Allah with all his heart.",
        "In the darkness he called out, \u201cLa ilaha illa anta, subhanaka, inni kuntu minaz-zalimeen\u201d — \u201cThere is no god but You; glory be to You; indeed I was among the wrongdoers.\u201d",
        "Allah heard his sincere prayer. The fish carried him to the shore and placed him on dry land, and Allah caused a leafy plant to grow and shade him. Yunus (A.S.) learned never to give up on Allah\u2019s mercy.",
      ],
    },
    {
      id: "hazrat-ibrahim",
      title: "The Friend of Allah: Hazrat Ibrahim (A.S.)",
      category: "prophets",
      icon: "flame",
      theme: "gold",
      readTime: 3,
      teaser: "The brave young boy who stood up for the Oneness of Allah — even in front of a blazing fire.",
      reward: { xp: 25, gems: 15 },
      moral: "Trust in Allah; He protects those who believe in Him.",
      paragraphs: [
        "Long ago, people carved statues out of stone and worshipped them as gods. A brave boy named Ibrahim (A.S.) looked at the stars, the moon and the sun, and realised that none of them could be a true god, because they all disappeared.",
        "Ibrahim (A.S.) knew that the One who created everything — the One who never sets and never dies — is Allah alone. He gently tried to explain this to his people.",
        "The people became angry. They built a huge fire and threw Ibrahim (A.S.) into it, thinking it would destroy him. But Ibrahim (A.S.) had complete trust in Allah.",
        "Allah commanded the fire, \u201cO fire, be cool and safe for Ibrahim!\u201d The flames did not harm him at all. Allah saved His faithful servant, and his courage amazed everyone.",
        "Ibrahim (A.S.) is called the friend of Allah because of his deep love and trust. He taught us to believe in one Allah and to be brave for the truth.",
      ],
    },
    {
      id: "honest-merchant",
      title: "The Honest Merchant",
      category: "morals",
      icon: "gem",
      theme: "gold",
      readTime: 3,
      teaser: "A small act of honesty brings a big, beautiful blessing.",
      reward: { xp: 15, gems: 10 },
      moral: "Always tell the truth and return what is not yours.",
      paragraphs: [
        "In a busy market lived a young merchant named Bilal who sold dates and honey. One day a rich traveller bought a large basket of dates and rode away quickly.",
        "When Bilal counted the money, he noticed the traveller had paid him far too much by mistake. His friend whispered, \u201cKeep it! He will never know.\u201d",
        "But Bilal shook his head. \u201cThe Prophet \u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064a\u0647 \u0648\u0633\u0644\u0645 taught us that honesty is a part of faith,\u201d he said. He closed his shop and ran after the traveller until he found him.",
        "The traveller was amazed. \u201cNo one has ever chased me to return money,\u201d he said. From that day, he became Bilal\u2019s loyal customer and told everyone about his honesty.",
        "Bilal\u2019s little shop grew busy and blessed, because people love to trust an honest person.",
      ],
    },
    {
      id: "kind-neighbour",
      title: "The Kind Neighbour",
      category: "morals",
      icon: "hand-heart",
      theme: "rose",
      readTime: 3,
      teaser: "A warm bowl of soup teaches a whole street about the joy of kindness.",
      reward: { xp: 15, gems: 10 },
      moral: "Be kind to your neighbours — kindness always comes back.",
      paragraphs: [
        "An old man named Uncle Ahmad lived all alone at the end of the street. One cold evening his cupboard was empty and he had nothing for dinner.",
        "Little Maryam noticed him sitting quietly by his window. She told her mother, who quickly filled a bowl with hot soup and fresh bread.",
        "Maryam carried it carefully to his door and said, \u201cAssalamu Alaikum, Uncle! Please have some dinner.\u201d The old man\u2019s eyes shone with happiness.",
        "The next week, Uncle Ahmad cooked a big pot of his famous lentil soup and shared it with every neighbour on the street. Soon everyone began helping one another.",
        "Maryam learned that a small act of kindness can spread like sunlight, from house to house.",
      ],
    },
    {
      id: "sharing-loaf",
      title: "The Sharing Loaf",
      category: "morals",
      icon: "gift",
      theme: "emerald",
      readTime: 3,
      teaser: "Two children and one hungry little dog learn the secret of sharing.",
      reward: { xp: 15, gems: 10 },
      moral: "Sharing what you love is a beautiful way to please Allah.",
      paragraphs: [
        "Amina and her little brother Yusuf loved fresh bread more than anything. One morning Mama baked two warm, golden loaves and gave one to each of them.",
        "On the way to school, under the old olive tree, they saw a thin, hungry dog with sad eyes. Yusuf hugged his loaf tightly. \u201cIt\u2019s mine,\u201d he whispered.",
        "Amina thought for a moment. Then she broke her loaf in half and gave one piece to the dog. \u201cAllah gave us two loaves,\u201d she smiled, \u201cso we can share one.\u201d",
        "Yusuf felt something warm inside his heart. He looked at his own loaf, then broke off a piece for the dog too. The little dog wagged its tail happily.",
        "That day both children walked to school with lighter hearts. They had learned the Prophet\u2019s \u0635\u0644\u0649 \u0627\u0644\u0644\u0647 \u0639\u0644\u064a\u0647 \u0648\u0633\u0644\u0645 lesson: the giver is never truly the poorer.",
      ],
    },
  ];

  const getStory = (id) => STORIES.find((s) => s.id === id);
  const isStoryRead = (id) => state.stories.indexOf(id) !== -1;

  /* ==========================================================================
     8. PROFILE DASHBOARD
     ========================================================================== */
  const BADGES = [
    /* ---- Standard badges (auto-earned from progress) ---- */
    { id: "first-steps", title: "First Steps", icon: "star", desc: "Complete your first quest", color: "gold", test: () => state.completed.length >= 1 },
    { id: "alif-baa-complete", title: "Completed Alif-Baa", icon: "book", desc: "Finish the Alif & Baa quest", color: "emerald", test: () => isCompleted("alif-baa") },
    { id: "arabic-master", title: "Arabic Master", icon: "book-open", desc: "Finish Arabic Island", color: "emerald", test: () => unitDone("arabic") },
    { id: "wudu-master", title: "Wudu Master", icon: "water", desc: "Finish Wudu Waterfall", color: "sky", test: () => unitDone("wudu") },
    { id: "salah-star", title: "Salah Star", icon: "compass", desc: "Finish Salah Sanctuary", color: "gold", test: () => unitDone("salah") },
    { id: "quran-friend", title: "Quran Friend", icon: "book-open", desc: "Finish Quran Cove", color: "rose", test: () => unitDone("quran") },
    { id: "streak-7", title: "7-Day Streak", icon: "flame", desc: "Reach a 7-day streak", color: "rose", test: () => state.streak >= 7 },
    { id: "gem-collector", title: "Gem Collector", icon: "gem", desc: "Hold 150 Noor Gems", color: "emerald", test: () => state.coins >= 150 },
    { id: "story-explorer", title: "Story Explorer", icon: "book-open", desc: "Read your first Noor story", color: "sky", test: () => state.stories.length >= 1 },
    { id: "story-master", title: "Story Master", icon: "medal", desc: "Read every Noor story", color: "gold", test: () => state.stories.length >= STORIES.length },
    { id: "dua-starter", title: "Dua Starter", icon: "sparkles", desc: "Memorize your first dua", color: "sky", test: () => state.duas.length >= 1 },
    { id: "dua-master", title: "Dua Master", icon: "star", desc: "Memorize every daily dua", color: "gold", test: () => state.duas.length >= DUAS.length },

    /* ---- Special occasion badges (unlocked only via seasonal challenges) ---- */
    { id: "ramzan-hero-2026", title: "Ramzan Hero 2026", icon: "moon", desc: "A Ramadan kindness activity", color: "emerald", special: true },
    { id: "rabi-ul-awwal-explorer", title: "Rabi-ul-Awwal Explorer", icon: "star", desc: "A Rabi-ul-Awwal activity", color: "gold", special: true },
  ];

  function unitDone(unitId) {
    const unit = CURRICULUM.find((u) => u.id === unitId);
    if (!unit) return false;
    return unit.quests.every((q) => isCompleted(q.id));
  }

  const hasBadge = (id) => state.badges.indexOf(id) !== -1;

  /** Unlock a badge and persist it. Returns true when it is newly earned. */
  function awardBadge(id) {
    if (hasBadge(id)) return false;
    state.badges.push(id);
    saveState();
    return true;
  }

  /** Persist any standard badges whose criteria are now satisfied. */
  function syncEarnedBadges() {
    let changed = false;
    BADGES.forEach((b) => {
      if (b.special) return;
      if (!hasBadge(b.id) && b.test()) {
        state.badges.push(b.id);
        changed = true;
      }
    });
    if (changed) saveState();
  }

  const badgeById = (id) => BADGES.find((b) => b.id === id);

  function initProfile() {
    /* Authenticated page: send visitors without a session back to log in. */
    if (!isSignedIn()) {
      window.location.replace("login.html?next=profile.html");
      return;
    }

    const mount = document.getElementById("profileMount");
    if (!mount) return;

    syncStats();

    /* --- Account & plan --- */
    const accountEmail = document.getElementById("accountEmail");
    const planChip = document.getElementById("planChip");
    const accountUpgrade = document.getElementById("accountUpgrade");
    if (accountEmail) accountEmail.textContent = isSignedIn() ? session.email || userName() : "Guest (not signed in)";
    if (planChip) {
      planChip.className = "chip " + (isPro() ? "chip--gold" : "chip--emerald");
      planChip.innerHTML = isPro()
        ? '<span class="icon" data-icon="crown"></span> Noor Pro'
        : '<span class="icon" data-icon="sparkles"></span> Free plan';
      hydrateIcons(planChip);
    }
    if (accountUpgrade) accountUpgrade.style.display = isPro() ? "none" : "";

    document.querySelector('[data-stat="levelLabel"]') &&
      (document.querySelector('[data-stat="levelLabel"]').textContent = "Level " + playerLevel() + " " + levelTitle());

    /* --- Badges --- */
    const badgeGrid = document.getElementById("badgeGrid");
    if (badgeGrid) {
      const colorMap = {
        gold: ["var(--secondary-soft)", "var(--secondary-deep)"],
        emerald: ["var(--primary-soft)", "var(--primary-deep)"],
        sky: ["var(--tertiary-soft)", "var(--tertiary-dark)"],
        rose: ["var(--error-soft)", "var(--error-dark)"],
      };
      const addBadge = (badge) => {
        const unlocked = hasBadge(badge.id);
        const [bg, fg] = colorMap[badge.color] || colorMap.gold;
        const el = document.createElement("div");
        el.className = "badge" + (badge.special ? " badge--special" : "") + (unlocked ? "" : " is-locked");
        el.innerHTML = `
          <div class="badge__ico" style="background:${bg};color:${fg}">
            <span class="icon" data-icon="${unlocked ? badge.icon : "lock"}"></span>
          </div>
          <b>${badge.title}</b>
          <small>${unlocked ? badge.desc : "Locked"}</small>`;
        badgeGrid.appendChild(el);
      };
      const groupLabel = (text, icon) => {
        const l = document.createElement("div");
        l.className = "badge-group-label";
        l.innerHTML = `<span class="icon" data-icon="${icon}"></span> ${text}`;
        badgeGrid.appendChild(l);
      };
      groupLabel("Standard achievements", "trophy");
      BADGES.filter((b) => !b.special).forEach(addBadge);
      groupLabel("Special occasions", "calendar");
      BADGES.filter((b) => b.special).forEach(addBadge);
      hydrateIcons(badgeGrid);
      const unlockedCount = BADGES.filter((b) => hasBadge(b.id)).length;
      const countEl = document.getElementById("badgeCount");
      if (countEl) countEl.textContent = unlockedCount + " unlocked • " + (BADGES.length - unlockedCount) + " to go";
    }

    /* --- Active quest progress rows --- */
    const questList = document.getElementById("activeQuests");
    if (questList) {
      const upcoming = ALL_QUESTS.filter((q) => !isCompleted(q.id)).slice(0, 3);
      const list = upcoming.length ? upcoming : ALL_QUESTS.slice(-3);
      list.forEach((q) => {
        const pct = isCompleted(q.id) ? 100 : 0;
        const row = document.createElement("div");
        row.className = "quest-row";
        row.innerHTML = `
          <div class="quest-row__head">
            <span class="quest-row__ico" style="background:var(--primary-soft);color:var(--primary-deep)"><span class="icon" data-icon="${q.icon}"></span></span>
            <div class="grow">
              <b class="fw-600">${q.title}</b>
              <div class="text-xs muted">${q.unitTitle} • ${q.lesson.length} exercises</div>
            </div>
            <span class="fw-600 text-primary">${isCompleted(q.id) ? "✓" : "+" + q.xp + " XP"}</span>
          </div>
          <div class="mockbar"><span style="width:${pct}%"></span></div>
          <a class="btn btn--primary btn--sm mt-2" href="lesson.html?quest=${encodeURIComponent(q.id)}">${isCompleted(q.id) ? "Practice again" : "Continue quest"}</a>`;
        questList.appendChild(row);
      });
      hydrateIcons(questList);
    }

    /* --- Activity heatmap (last 12 weeks) --- */
    const heat = document.getElementById("activityHeatmap");
    if (heat) {
      const days = 12 * 7;
      for (let i = days - 1; i >= 0; i--) {
        const key = dayOffsetKey(i);
        const xp = state.history[key] || 0;
        let level = 0;
        if (xp > 0) level = 1;
        if (xp >= 20) level = 2;
        if (xp >= 40) level = 3;
        if (xp >= 60) level = 4;
        const cell = document.createElement("div");
        cell.className = "heat-cell";
        cell.dataset.level = String(level);
        cell.title = key + (xp ? " • " + xp + " XP" : " • no activity");
        heat.appendChild(cell);
      }
    }

    /* --- Weekly XP chart --- */
    const chart = document.getElementById("xpChart");
    if (chart) {
      const labels = ["S", "M", "T", "W", "T", "F", "S"];
      const values = [];
      for (let i = 6; i >= 0; i--) values.push(state.history[dayOffsetKey(i)] || 0);
      const max = Math.max(30, ...values);
      const today = new Date().getDay();
      values.forEach((v, i) => {
        const dayIdx = (today - 6 + i + 14) % 7;
        const bar = document.createElement("div");
        bar.className = "xp-bar" + (v > 0 && v === Math.max(...values) ? " is-peak" : "");
        const h = Math.round((v / max) * 100);
        bar.innerHTML = `<span class="text-xs muted">${v || ""}</span><i style="height:${Math.max(v ? 8 : 3, h)}%"></i><small>${labels[dayIdx]}</small>`;
        chart.appendChild(bar);
      });
    }

    /* --- Parent hub: screen-time slider --- */
    const slider = document.getElementById("screenTimeSlider");
    const sliderVal = document.getElementById("screenTimeValue");
    if (slider && sliderVal) {
      slider.value = state.prefs.screenTime;
      sliderVal.textContent = state.prefs.screenTime + " min/day";
      slider.addEventListener("input", (e) => {
        const v = Number(e.target.value);
        sliderVal.textContent = v + " min/day";
        state.prefs.screenTime = v;
        saveState();
      });
    }

    /* --- Parent hub: recitation speed segments --- */
    document.querySelectorAll("[data-speed]").forEach((btn) => {
      if (Number(btn.dataset.speed) === Number(state.prefs.speed)) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-speed]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.prefs.speed = Number(btn.dataset.speed);
        saveState();
        toast("Recitation speed set to " + state.prefs.speed + "×", "clock");
      });
    });

    /* --- Reset progress --- */
    const resetBtn = document.getElementById("resetProgress");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (window.confirm("Reset all progress? This clears gems, streaks and completed quests.")) {
          resetState();
          window.location.reload();
        }
      });
    }

    hydrateIcons(mount);
  }

  /* ==========================================================================
     8b. SEASONAL CHALLENGES — special Islamic occasion activity hub
     ========================================================================== */
  const OCCASIONS = [
    {
      id: "ramadan",
      title: "Ramadan / Ramzan",
      titleAr: "رمضان",
      icon: "moon",
      blurb: "The blessed month of fasting, mercy and giving. Grow your good deeds every night!",
      badge: { id: "ramzan-hero-2026", title: "Ramzan Hero 2026", icon: "moon", color: "emerald" },
      activities: [
        { id: "help-neighbour", title: "Help a neighbour", icon: "hands", desc: "Do a kind errand or help someone nearby." },
        { id: "new-dua", title: "Memorise a new Dua", icon: "book-open", desc: "Learn the dua for breaking the fast (Iftar)." },
        { id: "feed-animals", title: "Feed stray animals", icon: "hand-heart", desc: "Give water and food to a stray cat or bird." },
        { id: "sunnah-habit", title: "Learn a Sunnah habit", icon: "badge-check", desc: "Eat with your right hand and say Bismillah." },
        { id: "share-iftar", title: "Share your Iftar", icon: "utensils", desc: "Give food to a friend, neighbour or the poor." },
        { id: "family-prayer", title: "Pray with family", icon: "mosque", desc: "Join Taraweeh or pray Maghrib together." },
      ],
    },
    {
      id: "rabi-ul-awwal",
      title: "Rabi-ul-Awwal",
      titleAr: "ربيع الأول",
      icon: "star",
      blurb: "The month we remember the birth of our beloved Prophet Muhammad ﷺ.",
      badge: { id: "rabi-ul-awwal-explorer", title: "Rabi-ul-Awwal Explorer", icon: "star", color: "gold" },
      activities: [
        { id: "learn-seerah", title: "Learn a Prophet story", icon: "book-open", desc: "Read one story from the Prophet's life ﷺ." },
        { id: "send-salaam", title: "Send Salaam to 5 people", icon: "sparkles", desc: "Greet family and friends with Assalamu Alaikum." },
        { id: "good-manners", title: "Practise good manners", icon: "badge-check", desc: "Show kindness and honesty all day long." },
        { id: "learn-durood", title: "Learn Durood Shareef", icon: "star", desc: "Recite Salawat upon the Prophet ﷺ." },
        { id: "small-charity", title: "Give a small charity", icon: "gift", desc: "Share a coin or a smile as Sadaqah." },
        { id: "family-story", title: "Family story time", icon: "hands", desc: "Ask a parent to tell you about the Prophet ﷺ." },
      ],
    },
  ];

  const getOccasion = (id) => OCCASIONS.find((o) => o.id === id);

  /** Current Hijri month (1–12) via the browser's built-in Islamic calendar. */
  function currentHijriMonth() {
    try {
      const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic", { month: "numeric" }).formatToParts(new Date());
      const m = parts.find((p) => p.type === "month");
      const n = m ? parseInt(m.value, 10) : NaN;
      return isNaN(n) ? null : n;
    } catch (e) {
      return null;
    }
  }

  /* Hijri month → occasion: 9 = Ramadan, 3 = Rabi-ul-Awwal. */
  const OCCASION_BY_HIJRI = { 9: "ramadan", 3: "rabi-ul-awwal" };
  const detectedOccasionId = () => OCCASION_BY_HIJRI[currentHijriMonth()] || null;

  /** Scatter confetti pieces inside a container (shared by modals). */
  function burstConfetti(container, count) {
    const colors = ["#10B981", "#F59E0B", "#3B82F6", "#F43F5E", "#34D399"];
    for (let i = 0; i < (count || 48); i++) {
      const piece = document.createElement("i");
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = Math.random() * 0.6 + "s";
      piece.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      container.appendChild(piece);
    }
  }

  /** Celebratory modal shown when an occasion activity is logged. */
  function showBadgeModal(occasion, activity, firstTime) {
    const badge = occasion.badge;
    const overlay = document.createElement("div");
    overlay.className = "modal";
    overlay.innerHTML = `
      <div class="modal__panel">
        <div class="confetti"></div>
        <div class="modal__icon ${badge.color === "emerald" ? "modal__icon--emerald" : ""}"><span class="icon" data-icon="${badge.icon}"></span></div>
        <h2>${firstTime ? "Badge unlocked!" : "Masha'Allah!"}</h2>
        <p class="muted">You completed <strong>${activity.title}</strong> in the ${occasion.title} challenge.</p>
        <div class="badge-earned">
          <span class="badge__ico" style="background:${badge.color === "emerald" ? "var(--primary-soft)" : "var(--secondary-soft)"};color:${badge.color === "emerald" ? "var(--primary-deep)" : "var(--secondary-deep)"}"><span class="icon" data-icon="${badge.icon}"></span></span>
          <div><b class="fw-600">${badge.title}</b><div class="text-xs muted">${firstTime ? "New badge added to your profile" : "Already in your trophy room"}</div></div>
        </div>
        <div class="stack-sm mt-3">
          <a class="btn btn--primary btn--block" href="profile.html"><span class="icon" data-icon="trophy"></span> See my badges</a>
          <button class="btn btn--soft btn--block" type="button" data-close>Keep going</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    hydrateIcons(overlay);
    burstConfetti(overlay.querySelector(".confetti"), 48);
    overlay.querySelector("[data-close]").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  }

  function initChallenges() {
    const mount = document.getElementById("challengesMount");
    if (!mount) return;

    const detected = detectedOccasionId();
    let activeId = detected || OCCASIONS[0].id;

    const tabsBox = document.getElementById("occasionTabs");
    const bannerBox = document.getElementById("challengeBanner");
    const progressBox = document.getElementById("challengeProgress");
    const gridBox = document.getElementById("activityGrid");

    const recordFor = (id) => {
      if (!state.challenges[id]) state.challenges[id] = { completed: [], notes: {} };
      if (!Array.isArray(state.challenges[id].completed)) state.challenges[id].completed = [];
      if (!state.challenges[id].notes) state.challenges[id].notes = {};
      return state.challenges[id];
    };

    function paintTabs() {
      tabsBox.innerHTML = "";
      OCCASIONS.forEach((occ) => {
        const b = document.createElement("button");
        b.type = "button";
        b.role = "tab";
        b.setAttribute("aria-selected", String(occ.id === activeId));
        b.className = "occasion-tab" + (occ.id === activeId ? " is-active" : "");
        b.innerHTML =
          `<span class="icon" data-icon="${occ.icon}"></span> ${occ.title}` +
          (occ.id === detected ? ' <span class="chip chip--gold">Now</span>' : "");
        b.addEventListener("click", () => { activeId = occ.id; render(); });
        tabsBox.appendChild(b);
      });
      hydrateIcons(tabsBox);
    }

    function completeActivity(occ, act, note) {
      const rec = recordFor(occ.id);
      if (rec.completed.indexOf(act.id) === -1) rec.completed.push(act.id);
      rec.notes[act.id] = note;
      rec.date = todayKey();
      saveState();
      syncStats();
      const firstTime = awardBadge(occ.badge.id);
      showBadgeModal(occ, act, firstTime);
      render();
    }

    function render() {
      const occ = getOccasion(activeId);
      const rec = recordFor(occ.id);
      const done = rec.completed.length;
      const total = occ.activities.length;
      const badgeEarned = hasBadge(occ.badge.id);

      paintTabs();

      bannerBox.className = "occasion-banner occasion-banner--" + occ.id;
      bannerBox.innerHTML = `
        <div class="row" style="gap:.9rem">
          <span class="card__ico" style="background:rgba(255,255,255,.22);color:#fff"><span class="icon" data-icon="${occ.icon}"></span></span>
          <div>
            <b>${occ.title}${detected === occ.id ? " · happening now" : ""}</b>
            <div class="text-sm" style="opacity:.92">${occ.blurb}</div>
          </div>
        </div>
        <div class="row" style="gap:.6rem">
          <span class="unit-ar">${occ.titleAr}</span>
          <span class="chip">${done}/${total}</span>
        </div>`;
      hydrateIcons(bannerBox);

      const pct = Math.round((done / total) * 100);
      progressBox.innerHTML = `
        <div class="row-between wrap">
          <strong class="fw-600">Your ${occ.title} progress</strong>
          <span class="chip ${badgeEarned ? "chip--gold" : "chip--neutral"}">
            <span class="icon" data-icon="${badgeEarned ? occ.badge.icon : "lock"}"></span>
            ${badgeEarned ? occ.badge.title : "Badge locked"}
          </span>
        </div>
        <div class="mockbar mt-2"><span style="width:${pct}%"></span></div>
        <div class="text-xs muted mt-1">${done} of ${total} activities completed</div>`;
      hydrateIcons(progressBox);

      gridBox.innerHTML = "";
      occ.activities.forEach((act) => {
        const isDone = rec.completed.indexOf(act.id) !== -1;
        const note = (rec.notes && rec.notes[act.id]) || "";
        const card = document.createElement("div");
        card.className = "activity" + (isDone ? " is-done" : "");
        card.innerHTML = `
          <div class="row-between">
            <span class="activity__ico" style="background:var(--primary-soft);color:var(--primary-deep)"><span class="icon" data-icon="${act.icon}"></span></span>
            ${isDone ? '<span class="chip chip--emerald"><span class="icon" data-icon="check"></span> Done</span>' : ""}
          </div>
          <b class="fw-600">${act.title}</b>
          <div class="text-sm muted">${act.desc}</div>
          ${isDone
            ? (note
                ? `<div class="activity__note"><span class="icon" data-icon="sparkles"></span> “${note}”</div>`
                : '<div class="text-xs text-primary fw-600">JazakAllah khair for your good deed!</div>')
            : `<div class="activity__form">
                 <input class="input activity__input" type="text" maxlength="120" placeholder="Add a short note (optional)" />
                 <button class="btn btn--primary btn--sm" type="button" data-do><span class="icon" data-icon="check"></span> I did it!</button>
               </div>`}`;
        gridBox.appendChild(card);
        if (!isDone) {
          card.querySelector("[data-do]").addEventListener("click", () => {
            const input = card.querySelector(".activity__input");
            completeActivity(occ, act, (input.value || "").trim());
          });
          card.querySelector(".activity__input").addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              completeActivity(occ, act, (e.target.value || "").trim());
            }
          });
        }
      });
      hydrateIcons(gridBox);
    }

    render();
  }

  /* ==========================================================================
     8c. DIGITAL COMPLETION CERTIFICATE (certificate.html)
     ========================================================================== */
  function initCertificate() {
    const cert = document.getElementById("certificate");
    if (!cert) return;

    /* The name is taken from the login session, falling back to the local profile. */
    const name = isSignedIn() ? userName() : state.name;
    const nameEl = cert.querySelector("[data-cert-name]");
    if (nameEl) nameEl.textContent = name;

    const now = new Date();
    const dateEl = cert.querySelector("[data-cert-date]");
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    }
    const idEl = cert.querySelector("[data-cert-id]");
    if (idEl) idEl.textContent = "NOOR-" + now.toISOString().slice(0, 10).replace(/-/g, "");

    const total = ALL_QUESTS.length;
    const done = state.completed.length;
    const complete = done >= total;

    const seal = cert.querySelector("[data-cert-seal]");
    if (seal) {
      seal.innerHTML = complete
        ? '<span class="icon" data-icon="medal"></span>'
        : '<span class="icon" data-icon="moon-star"></span>';
    }

    const status = document.getElementById("certStatus");
    if (status) {
      if (complete) {
        status.className = "cert-status cert-status--done";
        status.innerHTML = '<span class="icon" data-icon="trophy"></span> Masha\u2019Allah! You completed every quest \u2014 your certificate is ready to print.';
      } else {
        status.className = "cert-status";
        status.innerHTML = `<span class="icon" data-icon="compass"></span> You\u2019ve completed <b>${done} of ${total}</b> quests. Finish the journey to fully earn it \u2014 you can still print a preview below.`;
      }
      hydrateIcons(status);
    }

    hydrateIcons(cert);

    const btn = document.getElementById("printCert");
    if (btn) btn.addEventListener("click", () => window.print());
  }

  /* ==========================================================================
     8d. STORIES HUB & READER (stories.html)
     ========================================================================== */
  const STORY_CATEGORIES = [
    { id: "all", label: "All Stories", icon: "book-open" },
    { id: "prophets", label: "Prophets' Stories", icon: "moon-star" },
    { id: "morals", label: "Moral Lessons", icon: "heart" },
  ];
  const storyCategoryLabel = (id) => {
    const c = STORY_CATEGORIES.find((x) => x.id === id);
    return c ? c.label : "Story";
  };

  /** Celebration modal shown after a story is completed. */
  function showStoryReward(story, firstTime, badges) {
    const overlay = document.createElement("div");
    overlay.className = "modal";
    overlay.innerHTML = `
      <div class="modal__panel">
        <div class="confetti"></div>
        <div class="modal__icon modal__icon--emerald"><span class="icon" data-icon="book-open"></span></div>
        <h2>${firstTime ? "Story Complete!" : "Beautiful reading!"}</h2>
        <p class="muted">${firstTime ? "You finished" : "You enjoyed"} <strong>${story.title}</strong>${firstTime ? "." : " again."}</p>
        ${firstTime ? `
          <div class="reward-row">
            <div><b class="text-secondary">+${story.reward.xp}</b><small>XP</small></div>
            <div><b class="text-primary">+${story.reward.gems}</b><small>Noor Gems</small></div>
            <div><b>${state.stories.length}/${STORIES.length}</b><small>Stories read</small></div>
          </div>` : ""}
        ${badges
          .map(
            (b) => `
          <div class="badge-earned">
            <span class="badge__ico" style="background:var(--secondary-soft);color:var(--secondary-deep)"><span class="icon" data-icon="${b.icon}"></span></span>
            <div><b class="fw-600">${b.title} unlocked!</b><div class="text-xs muted">${b.desc}</div></div>
          </div>`
          )
          .join("")}
        <div class="stack-sm mt-3">
          <button class="btn btn--primary btn--block" type="button" data-close><span class="icon" data-icon="book-open"></span> Back to stories</button>
          <a class="btn btn--soft btn--block" href="profile.html"><span class="icon" data-icon="trophy"></span> See my badges</a>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    hydrateIcons(overlay);
    burstConfetti(overlay.querySelector(".confetti"), 46);
    overlay.querySelector("[data-close]").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  }

  /** Award XP/gems for a completed story and unlock story badges. */
  function completeStory(story) {
    const firstTime = !isStoryRead(story.id);
    const hadExplorer = hasBadge("story-explorer");
    const hadMaster = hasBadge("story-master");

    if (firstTime) {
      state.stories.push(story.id);
      state.xp += story.reward.xp;
      state.coins += story.reward.gems;

      const today = todayKey();
      if (state.lastActive !== today) {
        const yesterday = dayOffsetKey(1);
        state.streak = state.lastActive === yesterday ? state.streak + 1 : 1;
        state.lastActive = today;
      }
      state.history[today] = (state.history[today] || 0) + story.reward.xp;
      saveState();
    }

    syncEarnedBadges();
    syncStats();

    const newBadges = [];
    if (!hadExplorer && hasBadge("story-explorer")) newBadges.push(badgeById("story-explorer"));
    if (!hadMaster && hasBadge("story-master")) newBadges.push(badgeById("story-master"));

    showStoryReward(story, firstTime, newBadges);
  }

  /** Build and open the immersive, distraction-free story reader. */
  function openStoryReader(story) {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const overlay = document.createElement("div");
    overlay.className = "modal modal--reader";
    overlay.innerHTML = `
      <div class="reader reader--${story.theme}">
        <div class="reader__banner">
          <span class="reader__pattern" aria-hidden="true"></span>
          <button class="icon-btn reader__close" type="button" data-close aria-label="Close story"><span class="icon" data-icon="x"></span></button>
          <span class="reader__cat"><span class="icon" data-icon="${story.icon}"></span> ${storyCategoryLabel(story.category)}</span>
          <h2 class="reader__title">${story.title}</h2>
          <div class="reader__meta">
            <span><span class="icon" data-icon="clock"></span> ${story.readTime} min read</span>
            <span><span class="icon" data-icon="book-open"></span> ${story.paragraphs.length} short paragraphs</span>
          </div>
        </div>

        <div class="reader__toolbar">
          <button class="btn btn--sky btn--sm" type="button" data-narrate></button>
        </div>

        <div class="reader__body">
          ${story.paragraphs.map((p) => `<p>${p}</p>`).join("")}
          <div class="reader__moral">
            <span class="icon" data-icon="sparkles"></span>
            <div><b class="fw-600">The lesson:</b> ${story.moral}</div>
          </div>
        </div>

        <div class="reader__footer">
          <button class="btn btn--gold btn--lg btn--block" type="button" data-complete></button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    hydrateIcons(overlay);

    /* ---- Narration (text-to-speech) ---- */
    const nBtn = overlay.querySelector("[data-narrate]");
    let speaking = false;
    let paused = false;
    const refreshN = () => {
      nBtn.innerHTML =
        speaking && !paused
          ? '<span class="icon" data-icon="pause"></span> Pause narration'
          : '<span class="icon" data-icon="' + (paused ? "play" : "volume") + '"></span> ' +
            (paused ? "Resume narration" : "Listen to this story");
      hydrateIcons(nBtn);
    };
    refreshN();

    nBtn.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) {
        toast("Audio narration isn't available on this device.", "volume");
        return;
      }
      const synth = window.speechSynthesis;
      if (!speaking) {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(story.title + ". " + story.paragraphs.join(" "));
        u.lang = "en-US";
        u.rate = 0.92;
        u.pitch = 1.05;
        const done = () => { speaking = false; paused = false; refreshN(); };
        u.onend = done;
        u.onerror = done;
        synth.speak(u);
        speaking = true;
        paused = false;
      } else if (paused) {
        synth.resume();
        paused = false;
      } else {
        synth.pause();
        paused = true;
      }
      refreshN();
    });

    /* ---- Complete button ---- */
    const cBtn = overlay.querySelector("[data-complete]");
    const paintComplete = () => {
      if (isStoryRead(story.id)) {
        cBtn.className = "btn btn--soft btn--lg btn--block";
        cBtn.disabled = true;
        cBtn.innerHTML = '<span class="icon" data-icon="check"></span> Story completed — well done!';
      } else {
        cBtn.className = "btn btn--gold btn--lg btn--block";
        cBtn.innerHTML =
          '<span class="icon" data-icon="trophy"></span> Complete Story · +' +
          story.reward.xp + " XP · +" + story.reward.gems + " Gems";
      }
      hydrateIcons(cBtn);
    };
    paintComplete();

    cBtn.addEventListener("click", () => {
      if (cBtn.disabled) return;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      speaking = false; paused = false; refreshN();
      const first = !isStoryRead(story.id);
      completeStory(story);
      if (first) paintComplete();
    });

    /* ---- Close handling ---- */
    const close = () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      overlay.remove();
    };
    overlay.querySelector("[data-close]").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape" && document.body.contains(overlay)) {
        close();
        document.removeEventListener("keydown", esc);
      }
    });
  }

  function initStories() {
    const mount = document.getElementById("storiesMount");
    if (!mount) return;

    const tabsBox = document.getElementById("storyFilters");
    const gridBox = document.getElementById("storyGrid");
    let filter = "all";

    function paintTabs() {
      tabsBox.innerHTML = "";
      STORY_CATEGORIES.forEach((cat) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "tab");
        b.className = "occasion-tab" + (cat.id === filter ? " is-active" : "");
        b.setAttribute("aria-selected", String(cat.id === filter));
        b.innerHTML = `<span class="icon" data-icon="${cat.icon}"></span> ${cat.label}`;
        b.addEventListener("click", () => { filter = cat.id; paintTabs(); renderGrid(); });
        tabsBox.appendChild(b);
      });
      hydrateIcons(tabsBox);
    }

    function renderGrid() {
      gridBox.innerHTML = "";
      const list = STORIES.filter((s) => filter === "all" || s.category === filter);
      list.forEach((story) => {
        const read = isStoryRead(story.id);
        const card = document.createElement("article");
        card.className = "story-card" + (read ? " is-read" : "");
        card.innerHTML = `
          <div class="story-card__thumb story-card__thumb--${story.theme}">
            <span class="story-card__pattern" aria-hidden="true"></span>
            <span class="icon story-card__icon" data-icon="${story.icon}"></span>
            <span class="story-card__cat">${storyCategoryLabel(story.category)}</span>
            ${read ? '<span class="story-card__read"><span class="icon" data-icon="check"></span> Read</span>' : ""}
          </div>
          <div class="story-card__body">
            <h3 class="story-card__title">${story.title}</h3>
            <p class="text-sm muted">${story.teaser}</p>
            <div class="row-between mt-2 wrap" style="gap:.5rem">
              <span class="text-xs muted row"><span class="icon" data-icon="clock"></span> ${story.readTime} min read</span>
              <button class="btn btn--primary btn--sm" type="button" data-open>
                <span class="icon" data-icon="book-open"></span> ${read ? "Read again" : "Read Story"}
              </button>
            </div>
          </div>`;
        card.querySelector("[data-open]").addEventListener("click", () => openStoryReader(story));
        card.addEventListener("click", (e) => {
          if (!e.target.closest("[data-open]")) openStoryReader(story);
        });
        gridBox.appendChild(card);
      });
      hydrateIcons(gridBox);

      const done = state.stories.length;
      const countEl = document.getElementById("storyProgress");
      if (countEl) {
        countEl.textContent = done + " of " + STORIES.length + " stories read";
      }
    }

    paintTabs();
    renderGrid();
  }

  /* ==========================================================================
     8e. DAILY DUAS LIBRARY (duas.html)
        category: 'morning-evening' | 'eating-drinking' | 'daily-routines' | 'protection'
     ========================================================================== */
  const DUAS = [
    {
      id: "dua-before-eating",
      title: "Before Eating",
      category: "eating-drinking",
      icon: "utensils",
      theme: "gold",
      arabic: "بِسْمِ اللَّهِ",
      translit: "Bismillah",
      translationEn: "In the name of Allah.",
      translationUr: "اللہ کے نام سے (شروع کرتا ہوں)۔",
      words: [
        { ar: "بِسْمِ", trans: "Bismi — In the name of" },
        { ar: "اللَّهِ", trans: "Allah — Allah" },
      ],
    },
    {
      id: "dua-after-eating",
      title: "After Eating",
      category: "eating-drinking",
      icon: "utensils",
      theme: "emerald",
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ",
      translit: "Alhamdulillahil-lazi at'amana wa saqana wa ja'alana minal-muslimin",
      translationEn: "All praise is for Allah who fed us, gave us drink, and made us among the Muslims.",
      translationUr: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور مسلمانوں میں سے بنایا۔",
      words: [
        { ar: "الْحَمْدُ", trans: "Al-hamdu — All praise" },
        { ar: "لِلَّهِ", trans: "lillah — is for Allah" },
        { ar: "أَطْعَمَنَا", trans: "at'amana — who fed us" },
        { ar: "وَسَقَانَا", trans: "wa saqana — and gave us drink" },
        { ar: "الْمُسْلِمِينَ", trans: "al-muslimin — the Muslims" },
      ],
    },
    {
      id: "dua-before-sleep",
      title: "Before Sleeping",
      category: "daily-routines",
      icon: "moon",
      theme: "sky",
      arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
      translit: "Allahumma bismika amutu wa ahya",
      translationEn: "O Allah, in Your name I die and I live.",
      translationUr: "اے اللہ! تیرے نام سے میں مرتا ہوں اور جیتا ہوں۔",
      words: [
        { ar: "اللَّهُمَّ", trans: "Allahumma — O Allah" },
        { ar: "بِاسْمِكَ", trans: "bismika — in Your name" },
        { ar: "أَمُوتُ", trans: "amutu — I die" },
        { ar: "وَأَحْيَا", trans: "wa ahya — and I live" },
      ],
    },
    {
      id: "dua-waking-up",
      title: "When Waking Up",
      category: "morning-evening",
      icon: "moon-star",
      theme: "gold",
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
      translit: "Alhamdulillahil-lazi ahyana ba'da ma amatana wa ilaihin-nushur",
      translationEn: "All praise is for Allah who gave us life after He caused us to die, and to Him is the return.",
      translationUr: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں موت کے بعد زندگی دی، اور اسی کی طرف لوٹنا ہے۔",
      words: [
        { ar: "أَحْيَانَا", trans: "ahyana — gave us life" },
        { ar: "أَمَاتَنَا", trans: "amatana — caused us to die" },
        { ar: "النُّشُورُ", trans: "an-nushur — the return" },
      ],
    },
    {
      id: "dua-entering-bathroom",
      title: "Entering the Bathroom",
      category: "daily-routines",
      icon: "hands",
      theme: "emerald",
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
      translit: "Allahumma inni a'uzu bika minal-khubusi wal-khaba'is",
      translationEn: "O Allah, I seek refuge with You from all evil and harmful things.",
      translationUr: "اے اللہ! میں تیری پناہ مانگتا ہوں ہر بری اور ناپاک چیز سے۔",
      words: [
        { ar: "أَعُوذُ", trans: "a'uzu — I seek refuge" },
        { ar: "بِكَ", trans: "bika — with You" },
        { ar: "الْخُبُثِ", trans: "al-khubusi — evil" },
        { ar: "الْخَبَائِثِ", trans: "wal-khaba'is — and harmful things" },
      ],
    },
    {
      id: "dua-leaving-bathroom",
      title: "Leaving the Bathroom",
      category: "daily-routines",
      icon: "hands",
      theme: "sky",
      arabic: "غُفْرَانَكَ",
      translit: "Ghufranak",
      translationEn: "I seek Your forgiveness (O Allah).",
      translationUr: "اے اللہ! میں تیری بخشش چاہتا ہوں۔",
      words: [{ ar: "غُفْرَانَكَ", trans: "Ghufranak — I seek Your forgiveness" }],
    },
    {
      id: "dua-morning",
      title: "Morning Remembrance",
      category: "morning-evening",
      icon: "star",
      theme: "gold",
      arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
      translit: "Asbahna wa asbahal-mulku lillah, walhamdulillah, la ilaha illallahu wahdahu la sharika lah",
      translationEn: "We have entered the morning and the kingdom belongs to Allah. All praise is for Allah. There is no god but Allah alone, He has no partner.",
      translationUr: "ہم نے صبح کی اور بادشاہی اللہ کے لیے ہے۔ تمام تعریفیں اللہ کے لیے ہیں۔ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں۔",
      words: [
        { ar: "أَصْبَحْنَا", trans: "Asbahna — we entered the morning" },
        { ar: "الْمُلْكُ", trans: "al-mulku — the kingdom" },
        { ar: "لِلَّهِ", trans: "lillah — belongs to Allah" },
        { ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", trans: "la ilaha illallah — there is no god but Allah" },
      ],
    },
    {
      id: "dua-evening",
      title: "Evening Remembrance",
      category: "morning-evening",
      icon: "moon",
      theme: "sky",
      arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
      translit: "Amsayna wa amsal-mulku lillah, walhamdulillah, la ilaha illallahu wahdahu la sharika lah",
      translationEn: "We have entered the evening and the kingdom belongs to Allah. All praise is for Allah. There is no god but Allah alone, He has no partner.",
      translationUr: "ہم نے شام کی اور بادشاہی اللہ کے لیے ہے۔ تمام تعریفیں اللہ کے لیے ہیں۔ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں۔",
      words: [
        { ar: "أَمْسَيْنَا", trans: "Amsayna — we entered the evening" },
        { ar: "الْمُلْكُ", trans: "al-mulku — the kingdom" },
        { ar: "لِلَّهِ", trans: "lillah — belongs to Allah" },
        { ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", trans: "la ilaha illallah — there is no god but Allah" },
      ],
    },
    {
      id: "dua-protection",
      title: "Dua for Protection",
      category: "protection",
      icon: "shield",
      theme: "emerald",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      translit: "A'uzu bikalimatillahit-tammati min sharri ma khalaq",
      translationEn: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
      translationUr: "میں اللہ کے مکمل کلمات کی پناہ مانگتا ہوں ہر اس چیز کے شر سے جو اس نے پیدا کی۔",
      words: [
        { ar: "أَعُوذُ", trans: "a'uzu — I seek refuge" },
        { ar: "بِكَلِمَاتِ", trans: "bikalimati — in the words" },
        { ar: "اللَّهِ", trans: "Allah — of Allah" },
        { ar: "مِنْ شَرِّ", trans: "min sharri — from the evil" },
        { ar: "مَا خَلَقَ", trans: "ma khalaq — of what He created" },
      ],
    },
  ];

  const DUAS_CATEGORIES = [
    { id: "all", label: "All Duas", icon: "sparkles" },
    { id: "morning-evening", label: "Morning & Evening", icon: "moon-star" },
    { id: "eating-drinking", label: "Eating & Drinking", icon: "utensils" },
    { id: "daily-routines", label: "Daily Routines", icon: "home" },
    { id: "protection", label: "Protection", icon: "shield" },
  ];
  const duaCategoryLabel = (id) => {
    const c = DUAS_CATEGORIES.find((x) => x.id === id);
    return c ? c.label : "Dua";
  };
  const isDuaMemorized = (id) => state.duas.indexOf(id) !== -1;

  /** Reward modal shown after a dua is memorized. */
  function showDuaReward(dua, badges) {
    const overlay = document.createElement("div");
    overlay.className = "modal";
    overlay.innerHTML = `
      <div class="modal__panel">
        <div class="confetti"></div>
        <div class="modal__icon modal__icon--emerald"><span class="icon" data-icon="star"></span></div>
        <h2>Dua Memorized!</h2>
        <p class="muted">You learned <strong>${dua.title}</strong>.</p>
        <div class="reward-row">
          <div><b class="text-secondary">+20</b><small>XP</small></div>
          <div><b class="text-primary">+10</b><small>Noor Gems</small></div>
          <div><b>${state.duas.length}/${DUAS.length}</b><small>Duas learned</small></div>
        </div>
        ${badges
          .map(
            (b) => `
          <div class="badge-earned">
            <span class="badge__ico" style="background:var(--secondary-soft);color:var(--secondary-deep)"><span class="icon" data-icon="${b.icon}"></span></span>
            <div><b class="fw-600">${b.title} unlocked!</b><div class="text-xs muted">${b.desc}</div></div>
          </div>`
          )
          .join("")}
        <div class="stack-sm mt-3">
          <button class="btn btn--primary btn--block" type="button" data-close><span class="icon" data-icon="sparkles"></span> Continue learning</button>
          <a class="btn btn--soft btn--block" href="profile.html"><span class="icon" data-icon="trophy"></span> See my badges</a>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    hydrateIcons(overlay);
    burstConfetti(overlay.querySelector(".confetti"), 40);
    overlay.querySelector("[data-close]").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  }

  function initDuas() {
    const grid = document.getElementById("duasGrid");
    if (!grid) return;

    const filterBtns = document.querySelectorAll("[data-filter]");
    const modal = document.getElementById("duaModal");
    const modalContent = document.getElementById("duaModalContent");
    let filter = "all";

    function paintFilters() {
      filterBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === filter));
    }

    function renderGrid() {
      grid.innerHTML = "";
      const list = DUAS.filter((d) => filter === "all" || d.category === filter);
      list.forEach((dua) => {
        const memorized = isDuaMemorized(dua.id);
        const card = document.createElement("article");
        card.className = "dua-card" + (memorized ? " is-memorized" : "");
        card.innerHTML = `
          <div class="dua-card__header">
            <span class="dua-card__icon dua-card__icon--${dua.theme}"><span class="icon" data-icon="${dua.icon}"></span></span>
            <div class="dua-card__title">
              <h3>${dua.title}</h3>
              <span class="chip chip--${dua.theme}">${duaCategoryLabel(dua.category)}</span>
            </div>
          </div>
          <div class="dua-card__arabic">${dua.arabic}</div>
          <p class="dua-card__translit">${dua.translit}</p>
          <p class="dua-card__trans">${dua.translationEn}</p>
          <div class="row-between wrap" style="gap:.5rem">
            <span class="text-xs muted row">${memorized ? '<span class="icon" data-icon="check"></span> Memorized' : '<span class="icon" data-icon="' + dua.icon + '"></span> ' + duaCategoryLabel(dua.category)}</span>
            <button class="btn btn--primary btn--sm" type="button" data-open>
              <span class="icon" data-icon="book-open"></span> ${memorized ? "Review" : "Learn"}
            </button>
          </div>`;
        card.querySelector("[data-open]").addEventListener("click", (e) => { e.stopPropagation(); openDua(dua); });
        card.addEventListener("click", () => openDua(dua));
        grid.appendChild(card);
      });
      hydrateIcons(grid);
    }

    function closeDua() {
      if (!modal) return;
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }

    function openDua(dua) {
      if (!modal || !modalContent) return;
      const memorized = isDuaMemorized(dua.id);
      const wordsHtml = (dua.words || [])
        .map(
          (w) => `
        <button class="dua-word-btn" type="button" data-word="${w.ar}">
          <span class="ar">${w.ar}</span>
          <span class="trans">${w.trans}</span>
        </button>`
        )
        .join("");

      modalContent.innerHTML = `
        <h2 class="text-center">${dua.title}</h2>
        <div class="dua-modal__meta">
          <span class="chip chip--${dua.theme}">${duaCategoryLabel(dua.category)}</span>
        </div>
        <div class="dua-modal__arabic">${dua.arabic}</div>
        <div class="dua-modal__meta">
          <button class="btn btn--primary btn--sm" type="button" data-speak-ar><span class="icon" data-icon="volume"></span> Listen</button>
          <button class="btn btn--soft btn--sm" type="button" data-speak-slow><span class="icon" data-icon="mic"></span> Slow words</button>
        </div>
        <div class="dua-modal__section">
          <h4>Transliteration</h4>
          <p class="dua-card__translit">${dua.translit}</p>
        </div>
        <div class="dua-modal__section">
          <h4>English Translation</h4>
          <p>${dua.translationEn}</p>
        </div>
        <div class="dua-modal__section">
          <h4>Urdu Translation</h4>
          <p lang="ur" dir="rtl">${dua.translationUr}</p>
        </div>
        <div class="dua-modal__section">
          <h4>Word by Word</h4>
          <div class="dua-word-breakdown">${wordsHtml}</div>
        </div>
        <button class="btn ${memorized ? "btn--soft" : "btn--gold"} btn--block" type="button" data-memorize${memorized ? " disabled" : ""}>
          <span class="icon" data-icon="${memorized ? "check" : "star"}"></span>
          ${memorized ? "Memorized — well done!" : "Mark as Memorized · +20 XP · +10 Gems"}
        </button>`;
      hydrateIcons(modalContent);

      modalContent.querySelector("[data-speak-ar]").addEventListener("click", () => {
        if (!speak(dua.arabic, "ar-SA")) toast("Audio isn't available on this device.", "volume");
      });
      const slow = modalContent.querySelector("[data-speak-slow]");
      if (slow) slow.addEventListener("click", () => {
        if (!speak(dua.translit, "ar")) toast("Audio isn't available on this device.", "volume");
      });
      modalContent.querySelectorAll("[data-word]").forEach((btn) => {
        btn.addEventListener("click", () => speak(btn.dataset.word, "ar-SA"));
      });
      const memBtn = modalContent.querySelector("[data-memorize]");
      if (memBtn && !memorized) memBtn.addEventListener("click", () => memorizeDua(dua));

      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
    }

    function memorizeDua(dua) {
      if (isDuaMemorized(dua.id)) return;
      const hadStarter = hasBadge("dua-starter");
      const hadMaster = hasBadge("dua-master");

      state.duas.push(dua.id);
      state.xp += 20;
      state.coins += 10;

      const today = todayKey();
      if (state.lastActive !== today) {
        const yesterday = dayOffsetKey(1);
        state.streak = state.lastActive === yesterday ? state.streak + 1 : 1;
        state.lastActive = today;
      }
      state.history[today] = (state.history[today] || 0) + 20;
      saveState();
      syncEarnedBadges();
      syncStats();

      const badges = [];
      if (!hadStarter && hasBadge("dua-starter")) badges.push(badgeById("dua-starter"));
      if (!hadMaster && hasBadge("dua-master")) badges.push(badgeById("dua-master"));

      closeDua();
      renderGrid();
      showDuaReward(dua, badges);
    }

    filterBtns.forEach((b) =>
      b.addEventListener("click", () => { filter = b.dataset.filter; paintFilters(); renderGrid(); })
    );

    if (modal) {
      const closeBtn = modal.querySelector("[data-close-dua]");
      if (closeBtn) closeBtn.addEventListener("click", closeDua);
      modal.addEventListener("click", (e) => { if (e.target === modal) closeDua(); });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) closeDua();
      });
    }

    paintFilters();
    renderGrid();
  }

  /* ==========================================================================
     9. AUTHENTICATION (login.html) & PRICING (pricing.html)
     ========================================================================== */
  function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const tabs = document.querySelectorAll("[data-auth-tab]");
    const nameField = document.getElementById("nameField");
    const submit = document.getElementById("loginSubmit");
    const notice = document.getElementById("loginNotice");
    let mode = "signin"; // "signin" | "signup"

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "map.html";

    function setMode(m) {
      mode = m;
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.authTab === m));
      if (nameField) nameField.style.display = m === "signup" ? "" : "none";
      if (submit) submit.querySelector("span:last-child") && (submit.innerHTML =
        '<span class="icon" data-icon="user"></span> ' + (m === "signup" ? "Create account" : "Sign in"));
      hydrateIcons(submit || document);
    }
    tabs.forEach((t) => t.addEventListener("click", () => setMode(t.dataset.authTab)));
    setMode("signin");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (document.getElementById("loginEmail").value || "").trim();
      const pass = (document.getElementById("loginPassword").value || "").trim();
      const name = (document.getElementById("loginName") || {}).value || "";
      if (!email || !pass) {
        if (notice) { notice.textContent = "Please enter your email and password."; notice.className = "form-notice is-error"; }
        return;
      }
      startSession(email, mode === "signup" ? name.trim() : "");
      if (notice) { notice.textContent = "Welcome to Noor! Redirecting…"; notice.className = "form-notice is-ok"; }
      window.location.href = next;
    });

    const guest = document.getElementById("loginGuest");
    if (guest) guest.addEventListener("click", () => { startSession("guest@noor.app", "Explorer"); window.location.href = next; });
  }

  function initPricing() {
    const cycleBtns = document.querySelectorAll("[data-cycle]");
    let cycle = "monthly"; // "monthly" | "yearly"

    function paintCycle() {
      cycleBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.cycle === cycle));
      const priceEls = document.querySelectorAll("[data-price]");
      priceEls.forEach((el) => {
        const m = el.dataset.priceMonthly;
        const y = el.dataset.priceYearly;
        el.textContent = cycle === "yearly" ? y : m;
      });
      const perEls = document.querySelectorAll("[data-per]");
      perEls.forEach((el) => (el.textContent = cycle === "yearly" ? "/year" : "/month"));
    }
    cycleBtns.forEach((b) => b.addEventListener("click", () => { cycle = b.dataset.cycle; paintCycle(); }));
    paintCycle();

    document.querySelectorAll("[data-choose-plan]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const plan = btn.dataset.choosePlan;
        if (plan === "free") {
          showCheckout("free", cycle);
          return;
        }
        showCheckout("pro", cycle);
      });
    });
  }

  function showCheckout(plan, cycle) {
    if (plan === "free") {
      startSession(session ? session.email : "guest@noor.app", session ? session.name : "Explorer");
      session.plan = "free";
      saveSession();
      toast("You are on the Free plan — happy learning!", "sparkles");
      setTimeout(() => (window.location.href = "map.html"), 900);
      return;
    }

    const amount = cycle === "yearly" ? "$79.99" : "$9.99";
    const overlay = document.createElement("div");
    overlay.className = "modal";
    overlay.innerHTML =
      '<div class="modal__panel">' +
        '<div class="modal__icon"><span class="icon" data-icon="crown"></span></div>' +
        "<h2>Go Pro — " + amount + (cycle === "yearly" ? " / year" : " / month") + "</h2>" +
        '<p class="muted">Simulated checkout — no payment is taken in this demo.</p>' +
        '<div class="stack-sm mt-3" style="text-align:left">' +
          '<label class="field"><span>Card number</span><input class="input" inputmode="numeric" placeholder="4242 4242 4242 4242" /></label>' +
          '<div class="row" style="gap:.75rem">' +
            '<label class="field" style="flex:1"><span>Expiry</span><input class="input" placeholder="12/30" /></label>' +
            '<label class="field" style="flex:1"><span>CVC</span><input class="input" placeholder="123" /></label>' +
          "</div>" +
        "</div>" +
        '<div class="stack-sm mt-3">' +
          '<button class="btn btn--gold btn--block" type="button" data-pay><span class="icon" data-icon="shield"></span> Pay ' + amount + "</button>" +
          '<button class="btn btn--soft btn--block" type="button" data-close>Cancel</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    hydrateIcons(overlay);

    overlay.querySelector("[data-close]").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector("[data-pay]").addEventListener("click", () => {
      startSession(session ? session.email : "pro@noor.app", session ? session.name : "Explorer");
      session.plan = "pro";
      saveSession();
      overlay.remove();
      toast("Welcome to Noor Pro — everything unlocked!", "crown");
      setTimeout(() => (window.location.href = "map.html"), 1000);
    });
  }

  /* ==========================================================================
     10. BOOTSTRAP
     ========================================================================== */
  function init() {
    hydrateIcons(document);
    syncStats();
    syncEarnedBadges();
    renderAuth();
    loadUserAvatar();

    /* Keep copyright year current */
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

    /* Highlight the current item in the app bar + bottom nav */
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === here) a.classList.add("is-active");
    });

    /* Global sign-out (matches any element with [data-signout], incl. rendered auth area) */
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-signout]");
      if (btn) {
        e.preventDefault();
        signOut();
      }
    });

    /* Open the avatar studio from any trigger */
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-avatar-studio]")) {
        e.preventDefault();
        openAvatarStudio();
      }
    });

    const page = document.body.dataset.page;
    if (page === "landing") initLanding();
    if (page === "map") initMap();
    if (page === "lesson") initLesson();
    if (page === "profile") initProfile();
    if (page === "challenges") initChallenges();
    if (page === "certificate") initCertificate();
    if (page === "stories") initStories();
    if (page === "duas") initDuas();
    if (page === "login") initLogin();
    if (page === "pricing") initPricing();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
