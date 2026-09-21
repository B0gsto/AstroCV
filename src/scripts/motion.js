// Fluid motion layer. No libraries: a spring integrator, a smoothed scroll
// reader and a handful of behaviours bound through data attributes.
//
//   [data-reveal]      materialises when it enters the viewport
//   [data-split]       heading words rise one after another
//   [data-tilt]        tile leans towards the cursor, with a soft light
//   [data-magnetic]    button is pulled towards the cursor and springs back
//   [data-parallax]    child image drifts against the scroll (value = strength)
//   [data-scale-in]    tile grows into place as it scrolls up
//   #statement         words light up with scroll progress
//   #journey-track     drag with momentum, plus paging buttons
//
// Everything runs on transform/opacity only, stays interruptible, and is
// switched off under prefers-reduced-motion. Without JS the page is static
// and fully visible.

const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* ---------- frame loop: runs only while something is still moving ---------- */

const tasks = new Set();
let rafId = 0;
let lastTime = 0;

function frame(now) {
  const dt = Math.min(0.034, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  tasks.forEach((task) => {
    if (!task(dt)) tasks.delete(task);
  });
  rafId = tasks.size ? requestAnimationFrame(frame) : 0;
}

function run(task) {
  tasks.add(task);
  if (!rafId) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }
}

/* ---------- spring: x'' = -k(x - target) - c·x' ---------- */

function createSpring({ stiffness = 170, damping = 22, onUpdate }) {
  const state = { value: 0, velocity: 0, target: 0 };
  const step = (dt) => {
    const force = -stiffness * (state.value - state.target) - damping * state.velocity;
    state.velocity += force * dt;
    state.value += state.velocity * dt;
    const settled = Math.abs(state.velocity) < 0.001 && Math.abs(state.value - state.target) < 0.001;
    if (settled) {
      state.value = state.target;
      state.velocity = 0;
    }
    onUpdate(state.value);
    return !settled;
  };
  return {
    // retargeting keeps the current value and velocity, so motion never jumps
    set(target) {
      state.target = target;
      run(step);
    },
  };
}

/* ---------- per-page setup and teardown ---------- */

let cleanups = [];
const listen = (target, type, handler, options) => {
  target.addEventListener(type, handler, options);
  cleanups.push(() => target.removeEventListener(type, handler, options));
};

function initReveal() {
  const targets = document.querySelectorAll("[data-reveal], [data-split]");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  targets.forEach((el) => observer.observe(el));
  cleanups.push(() => observer.disconnect());
}

function initSplit() {
  document.querySelectorAll("[data-split]:not([data-split-done])").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((word, i) => {
      const span = document.createElement("span");
      span.className = "split-word";
      span.style.setProperty("--w", i);
      span.textContent = word;
      el.append(span, " ");
    });
    el.setAttribute("data-split-done", "");
  });
}

function initTilt() {
  if (!finePointer.matches) return;
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    let rx = 0;
    let ry = 0;
    let lift = 0;
    const apply = () => {
      const idle = Math.abs(rx) < 0.01 && Math.abs(ry) < 0.01 && lift < 0.001;
      el.style.transform = idle
        ? ""
        : `perspective(1100px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${(1 + lift * 0.015).toFixed(4)})`;
    };
    const springX = createSpring({ stiffness: 150, damping: 18, onUpdate: (v) => { rx = v; apply(); } });
    const springY = createSpring({ stiffness: 150, damping: 18, onUpdate: (v) => { ry = v; apply(); } });
    const springLift = createSpring({ stiffness: 200, damping: 26, onUpdate: (v) => { lift = v; apply(); } });

    listen(el, "pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      springX.set((0.5 - py) * 5);
      springY.set((px - 0.5) * 5);
      springLift.set(1);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });
    listen(el, "pointerleave", () => {
      springX.set(0);
      springY.set(0);
      springLift.set(0);
    });
  });
}

function initMagnetic() {
  if (!finePointer.matches) return;
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    let x = 0;
    let y = 0;
    const apply = () => {
      el.style.translate = Math.abs(x) < 0.05 && Math.abs(y) < 0.05 ? "" : `${x.toFixed(2)}px ${y.toFixed(2)}px`;
    };
    // slightly under-damped: the button overshoots a touch when released
    const springX = createSpring({ stiffness: 260, damping: 16, onUpdate: (v) => { x = v; apply(); } });
    const springY = createSpring({ stiffness: 260, damping: 16, onUpdate: (v) => { y = v; apply(); } });
    listen(el, "pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      springX.set((event.clientX - (rect.left + rect.width / 2)) * 0.28);
      springY.set((event.clientY - (rect.top + rect.height / 2)) * 0.36);
    });
    listen(el, "pointerleave", () => {
      springX.set(0);
      springY.set(0);
    });
  });
}

// Scroll-linked values chase their targets instead of snapping to them,
// which is what makes scrolling feel fluid rather than mechanical.
function initScrollLinked(reduced) {
  const items = [];
  const ease = reduced ? 1 : 0.12;

  (reduced ? [] : document.querySelectorAll("[data-parallax]")).forEach((el) => {
    const inner = el.querySelector("img") ?? el.firstElementChild;
    if (!inner) return;
    const strength = parseFloat(el.dataset.parallax) || 0.1;
    items.push({
      current: 0,
      read(vh) {
        const rect = el.getBoundingClientRect();
        return clamp((rect.top + rect.height / 2 - vh / 2) / vh, -1, 1);
      },
      write(v) {
        inner.style.transform = `translate3d(0, ${(v * strength * -100).toFixed(2)}px, 0) scale(${1 + strength * 1.6})`;
      },
    });
  });

  (reduced ? [] : document.querySelectorAll("[data-scale-in]")).forEach((el) => {
    items.push({
      current: 0,
      read(vh) {
        const rect = el.getBoundingClientRect();
        return clamp((vh - rect.top) / (vh * 0.7), 0, 1);
      },
      write(v) {
        el.style.scale = (0.9 + v * 0.1).toFixed(4);
      },
    });
  });

  const statement = document.getElementById("statement");
  if (statement && !reduced) {
    items.push({
      current: 0,
      read(vh) {
        const rect = statement.getBoundingClientRect();
        const start = vh * 0.85;
        const end = vh * 0.3;
        return clamp((start - rect.top) / (start - end + rect.height), 0, 1);
      },
      write(v) {
        statement.style.setProperty("--p", v.toFixed(4));
      },
    });
  }

  const bar = document.getElementById("read-progress-bar");
  const article = document.querySelector(".post");
  if (bar && article) {
    items.push({
      current: 0,
      read(vh) {
        const rect = article.getBoundingClientRect();
        const total = rect.height - vh;
        return total > 0 ? clamp(-rect.top / total, 0, 1) : 1;
      },
      write(v) {
        bar.style.transform = `scaleX(${v.toFixed(4)})`;
      },
    });
  }

  if (!items.length) return;

  let needsRead = true;
  const step = () => {
    const vh = window.innerHeight;
    let moving = false;
    items.forEach((item) => {
      if (needsRead) item.target = item.read(vh);
      const delta = item.target - item.current;
      if (Math.abs(delta) > 0.0004) {
        item.current += delta * ease;
        moving = true;
      } else {
        item.current = item.target;
      }
      item.write(item.current);
    });
    needsRead = false;
    return moving;
  };
  const wake = () => {
    needsRead = true;
    run(step);
  };
  items.forEach((item) => {
    item.target = item.read(window.innerHeight);
    item.current = item.target;
    item.write(item.current);
  });
  listen(window, "scroll", wake, { passive: true });
  listen(window, "resize", wake);
}

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  let lastY = window.scrollY;
  listen(
    window,
    "scroll",
    () => {
      const y = window.scrollY;
      const hide = y > 240 && y > lastY + 4;
      const show = y < lastY - 4 || y <= 240;
      if (hide) document.documentElement.classList.add("header-hidden");
      else if (show) document.documentElement.classList.remove("header-hidden");
      lastY = y;
    },
    { passive: true },
  );
  cleanups.push(() => document.documentElement.classList.remove("header-hidden"));
}

function initJourney(reduced) {
  const track = document.getElementById("journey-track");
  if (!track) return;
  const prev = document.getElementById("journey-prev");
  const next = document.getElementById("journey-next");
  const cardStep = () => {
    const card = track.querySelector(".journey-card");
    return card ? card.getBoundingClientRect().width + 20 : 360;
  };
  const sync = () => {
    if (prev) prev.disabled = track.scrollLeft < 8;
    if (next) next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
  };
  const page = (direction) =>
    track.scrollBy({ left: direction * cardStep(), behavior: reduced ? "auto" : "smooth" });
  if (prev) listen(prev, "click", () => page(-1));
  if (next) listen(next, "click", () => page(1));
  listen(track, "scroll", sync, { passive: true });
  listen(window, "resize", sync);
  sync();

  if (reduced || !finePointer.matches) return;

  // Mouse drag with momentum: the track keeps the velocity it was thrown with,
  // decelerates, then settles on the nearest card. Touch keeps native scrolling.
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;

  const settle = () => {
    const step = cardStep();
    track.scrollTo({ left: Math.round(track.scrollLeft / step) * step, behavior: "smooth" });
    window.setTimeout(() => {
      if (!dragging) track.style.scrollSnapType = "";
    }, 450);
  };

  const glide = () => {
    if (dragging) return false;
    velocity *= 0.95;
    track.scrollLeft -= velocity * 16;
    const atEdge = track.scrollLeft <= 0 || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    if (Math.abs(velocity) < 0.05 || atEdge) {
      settle();
      return false;
    }
    return true;
  };

  listen(track, "pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragging = true;
    velocity = 0;
    startX = lastX = event.clientX;
    startScroll = track.scrollLeft;
    lastT = performance.now();
    track.style.scrollSnapType = "none";
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });
  listen(track, "pointermove", (event) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    velocity = velocity * 0.6 + ((event.clientX - lastX) / dt) * 0.4;
    lastX = event.clientX;
    lastT = now;
    track.scrollLeft = startScroll - (event.clientX - startX);
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    run(glide);
  };
  listen(track, "pointerup", release);
  listen(track, "pointercancel", release);
}

function initToc() {
  const links = document.querySelectorAll("[data-toc]");
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = {};
  links.forEach((link) => (byId[link.getAttribute("data-toc")] = link));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.remove("active"));
        byId[entry.target.id]?.classList.add("active");
      });
    },
    { rootMargin: "-15% 0px -70% 0px" },
  );
  Object.keys(byId).forEach((id) => {
    const heading = document.getElementById(id);
    if (heading) observer.observe(heading);
  });
  cleanups.push(() => observer.disconnect());
}

function init() {
  window.__motionReady = true;
  cleanups.forEach((fn) => fn());
  cleanups = [];
  tasks.clear();

  const reduced = reducedQuery.matches;
  document.documentElement.classList.add("js");
  initSplit();
  initReveal();
  initJourney(reduced);
  initToc();
  initScrollLinked(reduced);
  if (reduced) return;
  initTilt();
  initMagnetic();
  initHeader();
}

// With Astro's ClientRouter this fires on first load and after every navigation.
document.addEventListener("astro:page-load", init);
