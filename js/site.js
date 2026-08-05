(() => {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("site-menu");
  const root = document.documentElement;
  const earthVideo = document.getElementById("earth-video");
  const hero = document.getElementById("hero");
  const bgEarth = document.getElementById("bg-earth");

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const smallView = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  // Mobile / reduced-motion: poster only — main source of stutter
  const useVideo = !reduceMotion && !coarsePointer && !smallView && earthVideo;

  if (earthVideo && !useVideo) {
    earthVideo.removeAttribute("autoplay");
    earthVideo.pause();
    earthVideo.removeAttribute("src");
    earthVideo.querySelectorAll("source").forEach((s) => s.remove());
    earthVideo.load();
    earthVideo.style.display = "none";
    if (bgEarth) bgEarth.classList.add("is-static");
  }

  let videoPlaying = false;

  const playVideo = () => {
    if (!useVideo || document.hidden || videoPlaying) return;
    earthVideo.muted = true;
    earthVideo.defaultMuted = true;
    earthVideo.playsInline = true;
    const p = earthVideo.play();
    if (p && typeof p.catch === "function") {
      p.then(() => {
        videoPlaying = true;
      }).catch(() => {});
    } else {
      videoPlaying = true;
    }
  };

  const pauseVideo = () => {
    if (!useVideo || !videoPlaying) return;
    earthVideo.pause();
    videoPlaying = false;
  };

  if (useVideo) {
    earthVideo.preload = "metadata";
    // Start only when near-ready (avoid early thrash)
    const onReady = () => playVideo();
    if (earthVideo.readyState >= 2) onReady();
    else earthVideo.addEventListener("canplay", onReady, { once: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseVideo();
      else if ((window.scrollY || 0) < (hero?.offsetHeight || 600) * 0.7) playVideo();
    });
  }

  // ── Scroll: nav morph + scene (batched, quantized — fewer style writes)
  const MORPH_RANGE = 160;
  let ticking = false;
  let lastScrollQ = -1;
  let lastSceneQ = -1;
  let lastScrollMode = "";

  const updateScroll = () => {
    const y = window.scrollY || 0;

    // Quantize to cut continuous --scroll/scene updates (lag source)
    const scrollT = Math.min(1, Math.max(0, y / MORPH_RANGE));
    const scrollQ = Math.round(scrollT * 20) / 20; // 0.05 steps
    if (scrollQ !== lastScrollQ) {
      lastScrollQ = scrollQ;
      const eased = scrollQ * scrollQ * (3 - 2 * scrollQ);
      root.style.setProperty("--scroll", eased.toFixed(2));
    }

    const mode = y < 8 ? "0" : "1";
    if (header && mode !== lastScrollMode) {
      lastScrollMode = mode;
      header.dataset.scroll = mode;
    }

    let scene = 0;
    if (hero) {
      const heroH = hero.offsetHeight || 1;
      const start = heroH * 0.4;
      const end = heroH * 0.9;
      if (y <= start) scene = 0;
      else if (y >= end) scene = 1;
      else scene = (y - start) / (end - start);
    }
    const sceneQ = Math.round(scene * 10) / 10; // 0.1 steps
    if (sceneQ !== lastSceneQ) {
      lastSceneQ = sceneQ;
      root.style.setProperty("--scene", sceneQ.toFixed(1));
      if (bgEarth) {
        bgEarth.classList.toggle("is-recessed", sceneQ >= 0.5);
      }
    }

    if (useVideo) {
      if (sceneQ >= 0.5) pauseVideo();
      else playVideo();
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

  // ── Active tab
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
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.15, 0.4] }
    );

    ["sectors", "products", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    window.addEventListener(
      "scroll",
      () => {
        if ((window.scrollY || 0) < 160) setActiveTab(null);
      },
      { passive: true }
    );
  }

  // ── Reveal
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
    { rootMargin: "0px 0px -6% 0px", threshold: 0.12 }
  );
  nodes.forEach((el) => io.observe(el));
})();
