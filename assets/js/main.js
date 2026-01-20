(() => {
  const root = document.documentElement;
  root.classList.add("js-enabled");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // ---------------- utils ----------------
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // =========================================================
  // 1) HERO + IMAGE SCROLL FX (your logic, a bit safer)
  // =========================================================
  const frame = document.querySelector(".img-frame--hero");
  const hero = document.querySelector(".hero--minimal");

  let ticking = false;
  let heroTop = 0;
  let heroBottom = 0;
  let heroHeight = 1;

  function measureHero() {
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    heroTop = r.top + window.scrollY;
    heroBottom = r.bottom + window.scrollY;
    heroHeight = Math.max(1, r.height);
  }

  function updateHeroAndImage() {
    const vh = window.innerHeight || 800;
    const y = window.scrollY || 0;

    // ---- text progress (starts immediately on scroll) ----
    if (hero) {
      let pt = clamp((y - heroTop) / (heroHeight * 0.70), 0, 1);
      pt = easeOut(pt);

      const textO = 1 - 0.65 * pt; // opacity down to 0.35
      const textS = 1 - 0.10 * pt; // scale to 0.90
      const textY = -18 * pt;      // lift a bit

      root.style.setProperty("--hero-o", textO.toFixed(3));
      root.style.setProperty("--hero-s", textS.toFixed(3));
      root.style.setProperty("--hero-y", `${textY.toFixed(2)}px`);
    }

    // ---- image progress (starts later) ----
    if (frame && hero) {
      const start = heroBottom - vh * 0.35;
      const end = heroBottom + vh * 0.55;

      let pi = clamp((y - start) / (end - start), 0, 1);
      pi = easeOut(pi);

      // NOTE: These values are intentionally strong.
      // If you still get large gaps, reduce imgY magnitude (e.g. -220 instead of -520).
      const imgY = -520 * pi;
      const imgS = 1 + 0.20 * pi;
      const imgB = 1 - 0.10 * pi;
      const imgSat = 1 + 0.08 * pi;

      root.style.setProperty("--img-y", `${imgY.toFixed(2)}px`);
      root.style.setProperty("--img-s", imgS.toFixed(3));
      root.style.setProperty("--img-b", imgB.toFixed(3));
      root.style.setProperty("--img-sat", imgSat.toFixed(3));
    }
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateHeroAndImage();
      });
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    measureHero();
    requestTick();
  });

  measureHero();
  updateHeroAndImage();

  // =========================================================
  // 2) SCROLL REVEAL (.js-fade) + STATEMENT "BLINK" OUT
  // =========================================================
  const fadeEls = Array.from(document.querySelectorAll(".js-fade"));
  if (!fadeEls.length) return;

	const io = new IntersectionObserver(
	  (entries) => {
		for (const entry of entries) {
		  const el = entry.target;
		  const isBlink = el.classList.contains("js-fade--blink");

		  if (entry.isIntersecting) el.classList.add("is-visible");
		  else if (isBlink) el.classList.remove("is-visible");
		}
	  },
	  {
		// This creates a "trigger zone" around the middle of the viewport
		rootMargin: "-45% 0px -45% 0px",
		threshold: 0
	  }
	);

    {
      // Use a slightly larger threshold for statement "blink" so it feels intentional
      // (It appears when a decent portion is visible.)
      threshold: [0, 0.15, 0.35],
      rootMargin: "0px 0px -10% 0px",
    }
  );

  fadeEls.forEach((el) => io.observe(el));
})();
