/* SeedSigner Independent Custody Guide — reading edition
   Progressive enhancement only: the page is fully readable without this file. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- theme */

  var root = document.documentElement;
  var toggle = document.querySelector(".theme");

  function labelFor(mode) {
    return mode === "light" ? "Dark" : "Light";
  }

  function currentMode() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  try {
    var saved = localStorage.getItem("icg-theme");
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {
    /* storage unavailable — fall back to the OS preference */
  }

  if (toggle) {
    toggle.textContent = labelFor(currentMode());

    /* if the reader changes their OS theme with the page open, the button label
       has to follow — unless they've already made an explicit choice here */
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", function () {
        if (!root.getAttribute("data-theme")) {
          toggle.textContent = labelFor(currentMode());
        }
      });

    toggle.addEventListener("click", function () {
      var next = currentMode() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      toggle.textContent = labelFor(next);
      try {
        localStorage.setItem("icg-theme", next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* -------------------------------------------------------------- reveals */

  var revealables = document.querySelectorAll(".reveal");

  if (reduce || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add("in");
    });
  } else {
    var revealer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    Array.prototype.forEach.call(revealables, function (el) {
      revealer.observe(el);
    });
  }

  /* ---------------------------------------------- animated figures on view

     The four transaction GIFs ship as static first frames. They only swap in
     the animation while they are near the viewport, so a long page isn't
     repainting four animations you can't see. */

  var animated = document.querySelectorAll("img[data-gif]");

  if (animated.length && "IntersectionObserver" in window) {
    var player = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var img = entry.target;
          var gif = img.getAttribute("data-gif");
          var poster = img.getAttribute("data-poster");
          if (!poster) {
            poster = img.getAttribute("src");
            img.setAttribute("data-poster", poster);
          }
          var want = entry.isIntersecting ? gif : poster;
          if (img.getAttribute("src") !== want) img.setAttribute("src", want);
        });
      },
      { rootMargin: "150px 0px" }
    );
    Array.prototype.forEach.call(animated, function (img) {
      player.observe(img);
    });
  } else {
    /* no observer: just show the animations */
    Array.prototype.forEach.call(animated, function (img) {
      img.setAttribute("src", img.getAttribute("data-gif"));
    });
  }

  /* --------------------------------------------------- rail + progress bar */

  /* scoped to the ordered list: the back-to-top link points at the top of the
     document and would break the monotonic active-section scan below */
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".rail ol a")
  );
  var sections = links
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);
  var bar = document.querySelector(".progress i");
  var rail = document.querySelector(".rail");
  var railToggle = document.querySelector(".rail-toggle");
  var railNow = document.querySelector(".rail-toggle-now");
  var queued = false;

  function sync() {
    queued = false;

    if (bar) {
      var span = document.documentElement.scrollHeight - window.innerHeight;
      var pct = span > 0 ? (window.scrollY / span) * 100 : 0;
      bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    }

    if (!sections.length) return;
    var mark = window.innerHeight * 0.32;
    var active = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= mark) active = i;
    }
    links.forEach(function (a, i) {
      if (i === active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });

    /* the collapsed mobile bar names where you are */
    if (railNow) {
      railNow.textContent =
        active < 0
          ? "Contents"
          : links[active].textContent.trim().replace(/^(\d+)/, "$1 · ");
    }
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(sync);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  sync();

  /* --------------------------------------------------- mobile contents bar */

  if (rail && railToggle) {
    var setOpen = function (open) {
      rail.classList.toggle("open", open);
      /* the floating theme button would sit on top of the open sheet */
      document.body.classList.toggle("nav-open", open);
      railToggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    railToggle.addEventListener("click", function () {
      setOpen(!rail.classList.contains("open"));
    });

    /* choosing a destination closes the sheet */
    rail.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && rail.classList.contains("open")) {
        setOpen(false);
        railToggle.focus();
      }
    });
  }
})();
