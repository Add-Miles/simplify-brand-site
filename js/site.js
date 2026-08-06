(() => {
  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  const root = document.documentElement;
  const bg = document.getElementById("bg");
  const video = document.getElementById("bg-video");
  const hero = document.getElementById("hero");

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Only very narrow screens skip video; do not use pointer:coarse */
  const isMobile = matchMedia("(max-width: 640px)").matches;
  const useVideo = !reduceMotion && !isMobile && !!video;

  if (video && !useVideo) {
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((s) => s.remove());
    try {
      video.load();
    } catch (_) {}
    if (bg) bg.classList.add("is-static");
  }

  let wantPlay = false;
  let unlockBound = false;

  const hardMute = () => {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.playsInline = true;
  };

  const inHero = () => (scrollY || 0) < (hero?.offsetHeight || 700) * 0.85;

  const play = () => {
    if (!useVideo || document.hidden) return;
    wantPlay = true;
    hardMute();
    if (video.ended) {
      try {
        video.currentTime = 0;
      } catch (_) {}
    }
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        if (bg) bg.classList.remove("is-static");
      }).catch(() => {
        bindUnlockOnce();
      });
    }
  };

  const pause = () => {
    if (!useVideo) return;
    wantPlay = false;
    if (!video.paused) video.pause();
  };

  const bindUnlockOnce = () => {
    if (unlockBound) return;
    unlockBound = true;
    const unlock = () => {
      if (!wantPlay || document.hidden) return;
      hardMute();
      video.play().catch(() => {});
    };
    ["pointerdown", "touchstart", "keydown", "scroll"].forEach((ev) => {
      document.addEventListener(ev, unlock, { passive: true, once: true });
    });
  };

  if (useVideo) {
    hardMute();
    video.loop = true;
    video.preload = "auto";

    ["loadeddata", "canplay", "canplaythrough"].forEach((ev) => {
      video.addEventListener(ev, play, { once: true });
    });

    /* Keep trying briefly until playback is confirmed */
    let tries = 0;
    const kick = setInterval(() => {
      tries += 1;
      if (!video.paused && !video.ended) {
        clearInterval(kick);
        return;
      }
      if (inHero() && !document.hidden) play();
      if (tries >= 12) clearInterval(kick);
    }, 500);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (!video.paused) video.pause();
      } else if (wantPlay || inHero()) {
        play();
      }
    });
  }

  let ticking = false;
  let lastS = -1;
  let lastScene = -1;
  let lastTop = null;

  /* Header lock: full bar at top → capsule on scroll; never hide */
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY || 0;
      const s = Math.round(Math.min(1, y / 150) * 12) / 12;
      if (s !== lastS) {
        lastS = s;
        const e = s * s * (3 - 2 * s);
        root.style.setProperty("--scroll", e.toFixed(3));
      }
      const atTop = y < 8;
      if (header && atTop !== lastTop) {
        lastTop = atTop;
        header.dataset.atTop = String(atTop);
      }
      if (header && !header.dataset.atTop) {
        header.dataset.atTop = String(atTop);
      }

      let scene = 0;
      if (hero) {
        const h = hero.offsetHeight || 1;
        const a = h * 0.4;
        const b = h * 0.9;
        if (y <= a) scene = 0;
        else if (y >= b) scene = 1;
        else scene = (y - a) / (b - a);
      }
      const sq = Math.round(scene * 8) / 8;
      if (sq !== lastScene) {
        lastScene = sq;
        root.style.setProperty("--scene", sq.toFixed(3));
        if (bg) bg.classList.toggle("is-dim", sq >= 0.5);
      }

      if (useVideo) {
        /* Keep playing through most of the page; only dim far into content */
        if (sq >= 0.85) pause();
        else play();
      }
      ticking = false;
    });
  };

  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuBtn && header && navLinks) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = header.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        /* close mobile drawer only; header bar always stays */
        header.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
    /* click outside closes drawer, not the bar */
    document.addEventListener("click", (e) => {
      if (!header.classList.contains("is-open")) return;
      if (header.contains(e.target)) return;
      header.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  }

  const map = new Map();
  document.querySelectorAll(".nav-a").forEach((el) => {
    const href = el.getAttribute("href") || "";
    if (href.startsWith("#")) map.set(href.slice(1), el);
  });

  const setActive = (id) => {
    map.forEach((el, key) => {
      const on = key === id;
      el.classList.toggle("is-on", on);
      if (on) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.15, 0.4] }
    );
    ["biz", "product", "team", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    addEventListener(
      "scroll",
      () => {
        if ((scrollY || 0) < 140) setActive(null);
      },
      { passive: true }
    );
  }

  if ("IntersectionObserver" in window) {
    const rev = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            rev.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => rev.observe(el));
  } else {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  }
})();
