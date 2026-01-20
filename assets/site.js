(() => {
  // Mark that JS is running (used by CSS to enable scroll-fade only when JS is available)
  document.documentElement.classList.add("js-enabled");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
      history.pushState(null, "", id);
    });
  });

  // Fade-in for sections on enter
  const fadeEls = Array.from(document.querySelectorAll(".js-fade"));

  // If reduced motion, show everything immediately
  if (prefersReduced) {
    fadeEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target); // one-time reveal = less work
          }
        }
      },
      { threshold: 0.12 }
    );

    fadeEls.forEach((el) => io.observe(el));

    // Safety: if something is already in view before observer fires (rare), reveal on next frame
    requestAnimationFrame(() => {
      fadeEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.98) el.classList.add("is-visible");
      });
    });
  } else {
    // Fallback: show everything
    fadeEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Hero fade-out on scroll
  const hero = document.querySelector(".js-hero");
  if (!hero || prefersReduced) return;

  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  const onScroll = () => {
    const y = window.scrollY || 0;
    const fadeRange = Math.max(260, hero.offsetHeight * 0.55);
    const t = clamp01(y / fadeRange);

    hero.style.opacity = String(1 - t);
    hero.style.transform = `translateY(${t * -10}px)`;
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();
