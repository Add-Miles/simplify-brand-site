(() => {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("site-menu");
  const root = document.documentElement;
  const earthVideo = document.getElementById("earth-video");

  const hero = document.getElementById("hero");

  // ── Earth video: always play in hero (brand atmosphere)
  let allowPlay = true;

  if (earthVideo) {
    const tryPlay = () => {
      if (document.hidden || !allowPlay) return;
      earthVideo.muted = true;
      earthVideo.defaultMuted = true;
      earthVideo.volume = 0;
      earthVideo.playsInline = true;
      earthVideo.loop = true;
      earthVideo.setAttribute("muted", "");
      earthVideo.setAttribute("playsinline", "");
      earthVideo.setAttribute("webkit-playsinline", "");
      const p = earthVideo.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    try {
      if (earthVideo.readyState < 2) earthVideo.load();
    } catch (_) {}
    tryPlay();
    ["canplay", "canplaythrough", "loadeddata", "loadedmetadata"].forEach((ev) => {
      earthVideo.addEventListener(ev, tryPlay);
    });
    setInterval(() => {
      if (!document.hidden && allowPlay && earthVideo.paused) tryPlay();
    }, 1200);
    earthVideo.addEventListener("ended", () => {
      earthVideo.currentTime = 0.01;
      tryPlay();
    });
    const unlock = () => tryPlay();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("scroll", unlock, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) earthVideo.pause();
      else tryPlay();
    });

    // expose for scene handler
    window.__tryPlayEarth = tryPlay;
  }

  // ── Scroll: nav morph + scene recede (video calms after hero)
  const MORPH_RANGE = 180;
  let ticking = false;

  const updateScroll = () => {
    const y = window.scrollY || 0;

    // nav pill
    const t = Math.min(1, Math.max(0, y / MORPH_RANGE));
    const eased = t * t * (3 - 2 * t);
    root.style.setProperty("--scroll", eased.toFixed(4));
    if (header) {
      header.dataset.scroll = y < 6 ? "0" : "1";
    }

    // scene: 0 while mostly in hero, → 1 as we leave hero into content
    let scene = 0;
    if (hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const start = heroBottom * 0.35;
      const end = heroBottom * 0.95;
      if (y <= start) scene = 0;
      else if (y >= end) scene = 1;
      else scene = (y - start) / (end - start);
      scene = scene * scene * (3 - 2 * scene); // smoothstep
    }
    root.style.setProperty("--scene", scene.toFixed(4));

    // pause video past hero — freezes last frame as calm atmosphere
    if (earthVideo) {
      if (scene > 0.55) {
        allowPlay = false;
        if (!earthVideo.paused) earthVideo.pause();
      } else {
        allowPlay = true;
        if (earthVideo.paused && !document.hidden && window.__tryPlayEarth) {
          window.__tryPlayEarth();
        }
      }
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateScroll();

  // ── Mobile menu
  if (toggle && header && menu) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ── Active tab highlight on hash sections
  const sectionIds = ["sectors", "products", "connect"];
  const tabMap = new Map();
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    const href = tab.getAttribute("href") || "";
    if (href.startsWith("#")) tabMap.set(href.slice(1), tab);
  });

  const setActiveTab = (id) => {
    document.querySelectorAll(".nav-tab").forEach((t) => {
      t.classList.remove("is-active");
      t.removeAttribute("aria-current");
    });
    const home = document.querySelector('.nav-tab[href="./"]');
    if (!id && home) {
      home.classList.add("is-active");
      home.setAttribute("aria-current", "page");
      return;
    }
    const tab = tabMap.get(id);
    if (tab) {
      tab.classList.add("is-active");
      tab.setAttribute("aria-current", "page");
    }
  };

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveTab(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    const topCheck = () => {
      if ((window.scrollY || 0) < 180) setActiveTab(null);
    };
    window.addEventListener("scroll", topCheck, { passive: true });
  }

  // ── Reveal on enter
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );

  nodes.forEach((el) => io.observe(el));
})();
