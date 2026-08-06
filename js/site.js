(() => {
  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  const root = document.documentElement;

  let ticking = false;
  let lastS = -1;
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
        header.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
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
    ["biz", "product", "team", "background", "contact"].forEach((id) => {
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

  const revealAll = () => {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  };

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
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => rev.observe(el));
    // Never leave content stuck invisible if observer misses
    setTimeout(revealAll, 2200);
  } else {
    revealAll();
  }
})();
