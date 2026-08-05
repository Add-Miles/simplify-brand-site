(() => {
  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  const root = document.documentElement;
  const bg = document.getElementById("bg");
  const video = document.getElementById("bg-video");
  const hero = document.getElementById("hero");

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile =
    matchMedia("(max-width: 768px)").matches ||
    matchMedia("(pointer: coarse)").matches;
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

  let playing = false;
  const play = () => {
    if (!useVideo || document.hidden || playing) return;
    video.muted = true;
    video.playsInline = true;
    const p = video.play();
    if (p && p.then) p.then(() => (playing = true)).catch(() => {});
    else playing = true;
  };
  const pause = () => {
    if (!useVideo || !playing) return;
    video.pause();
    playing = false;
  };

  if (useVideo) {
    video.addEventListener("canplay", play, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause();
      else if ((scrollY || 0) < (hero?.offsetHeight || 500) * 0.65) play();
    });
  }

  /* scroll: quantized CSS vars — less paint thrash */
  let ticking = false;
  let lastS = -1;
  let lastScene = -1;
  let lastTop = null;

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
        if (sq >= 0.5) pause();
        else play();
      }
      ticking = false;
    });
  };

  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuBtn && header && navLinks) {
    menuBtn.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        header.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* active nav */
  const map = new Map();
  document.querySelectorAll(".nav-link").forEach((el) => {
    const href = el.getAttribute("href") || "";
    if (href.startsWith("#")) map.set(href.slice(1), el);
  });
  const setActive = (id) => {
    document.querySelectorAll(".nav-link").forEach((el) => {
      el.classList.remove("is-active");
      el.removeAttribute("aria-current");
    });
    if (!id) {
      const home = document.querySelector('.nav-link[href="./"]');
      if (home) {
        home.classList.add("is-active");
        home.setAttribute("aria-current", "page");
      }
      return;
    }
    const t = map.get(id);
    if (t) {
      t.classList.add("is-active");
      t.setAttribute("aria-current", "page");
    }
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
    ["biz", "product", "contact"].forEach((id) => {
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

  /* reveal */
  const nodes = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("is-in"));
  } else {
    const rio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            rio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach((el) => rio.observe(el));
  }
})();
