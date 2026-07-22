/* ============================================
   LOA CASTLE - Modern Interactive Scripts
   ============================================ */

const gradeRanks = {
  1: "Trainee",
  2: "Initiate",
  3: "Accensus",
  4: "Adept",
  5: "Legionary",
  6: "Praetorian",
  7: "Decanus",
  8: "Decurion",
  9: "Aspirant",
  10: "Tribune",
  11: "Adjutant",
  12: "Journeyman",
  13: "Squire",
  14: "Chevalier",
  15: "Sergeant",
  16: "Lieutenant",
  17: "Captain",
  18: "Knight",
  19: "Centurion",
  20: "Executor",
  21: "Legate",
  22: "Archon",
  23: "Praetor",
  24: "Imperator"
};

document.addEventListener("DOMContentLoaded", function () {
  initMobileNav();
  initHeaderScroll();
  initClassSlider();
  initPlayerOnline();
  initRankings();
  initEventTimers();
  initDonateLinks();
  initScrollAnimations();
  initRegisterPopup();
  initRankInfoPopover();
  initContentProtection();
});

/* ====== Mobile Navigation Toggle ====== */

function initMobileNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!navToggle || !navLinks) return;

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", navLinks.classList.contains("is-open"));
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ====== Header Scroll Effect ====== */

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const scrollThreshold = 50;

  function handleScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > scrollThreshold) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

/* ====== Class Slider Logic ====== */

function initClassSlider() {
  const track = document.querySelector("#classSliderTrack");
  const slides = track ? Array.from(track.querySelectorAll(".class-slide")) : [];
  const btnPrev = document.querySelector(".class-nav-btn.prev");
  const btnNext = document.querySelector(".class-nav-btn.next");
  const indicatorsContainer = document.querySelector("#classIndicators");

  if (!track || slides.length === 0 || !btnPrev || !btnNext) return;

  let currentIndex = 0;
  let autoTimer;
  const autoPlayDelay = 8000;

  if (indicatorsContainer) {
    indicatorsContainer.innerHTML = "";
    slides.forEach((_, index) => {
      const indicator = document.createElement("span");
      indicator.addEventListener("click", () => goToSlide(index));
      indicatorsContainer.appendChild(indicator);
    });
  }

  function updateSlider() {
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === slides.length - 1;

    if (indicatorsContainer) {
      const indicators = indicatorsContainer.querySelectorAll("span");
      indicators.forEach((ind, i) => ind.classList.toggle("active", i === currentIndex));
    }

    animateStatBars(slides[currentIndex]);
  }

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    updateSlider();
    resetAutoPlay();
  }

  function nextSlide() {
    currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
    updateSlider();
  }

  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  }

  function animateStatBars(slide) {
    if (!slide) return;
    const bars = slide.querySelectorAll(".stat-bar-fill");
    bars.forEach((bar) => {
      const fill = bar.style.getPropertyValue("--fill");
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = fill;
        });
      });
    });
  }

  function startAutoPlay() {
    autoTimer = setInterval(nextSlide, autoPlayDelay);
  }

  function resetAutoPlay() {
    clearInterval(autoTimer);
    startAutoPlay();
  }

  btnPrev.addEventListener("click", () => {
    prevSlide();
    resetAutoPlay();
  });

  btnNext.addEventListener("click", () => {
    nextSlide();
    resetAutoPlay();
  });

  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 50;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentIndex < slides.length - 1) nextSlide();
      else if (diff < 0 && currentIndex > 0) prevSlide();
      resetAutoPlay();
    }
  }

  track.addEventListener("mouseenter", () => clearInterval(autoTimer));
  track.addEventListener("mouseleave", startAutoPlay);

  updateSlider();
  startAutoPlay();
}

/* ====== Players Online (Public Count API) ====== */

function initPlayerOnline() {
  const el = document.getElementById("playersOnline");
  if (!el) return;

  const ONLINE_URL = "/api/online-count";

  async function refresh() {
    try {
      const res = await fetch(ONLINE_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const count = Number(data.online ?? 0);

      el.textContent = Number.isFinite(count) ? String(count) : "0";
    } catch (err) {
      el.textContent = "--";
      console.error("Failed to load online count:", err);
    }
  }

  refresh();
  setInterval(refresh, 5000);
}

/* ====== Rankings ====== */

function initRankings() {
  loadRanking("ranking-topplayers", "/api/rankings/topplayers", "level");
  loadRanking("ranking-toppk", "/api/rankings/toppk", "wins");
  loadRanking("ranking-toppvp", "/api/rankings/toppvp", "grade");
}

function getCharacterName(row) {
  return (
    row.character_name ??
    row.charactername ??
    row.char_name ??
    row.name ??
    row.player_name ??
    row.username ??
    "-"
  );
}

function renderRankingList(rows, type) {
  if (!Array.isArray(rows) || !rows.length) {
    return '<li><span class="rank-pos">--</span><span class="rank-name">No ranking data found.</span><span class="rank-value">--</span></li>';
  }

  return rows.map((row, index) => {
    const pos = String(index + 1).padStart(2, "0");
    const name = escapeHtml(getCharacterName(row));

    let value = "-";
    if (type === "level") {
      value = `Lv ${row.level ?? row.Level ?? row.lvl ?? 0}`;
    } else if (type === "wins") {
      const kills = Number(row.wins ?? row.pk ?? row.pk_count ?? row.kills ?? row.kill_count ?? 0);
      value = `${kills.toLocaleString()} Kills`;
    } else if (type === "grade") {
      const gradeNum = Number(row.grade ?? row.rank ?? row.dksq ?? row.grade_no ?? row.pvp_rank ?? 0);
      value = gradeRanks[gradeNum] ?? `Rank ${gradeNum}`;
    }

    return `
      <li>
        <span class="rank-pos">${pos}</span>
        <span class="rank-name">${name}</span>
        <span class="rank-value">${escapeHtml(value)}</span>
      </li>
    `;
  }).join("");
}

async function loadRanking(targetId, endpoint, type) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data.rows || data.data || data.rankings || []);
    target.innerHTML = renderRankingList(rows, type);
  } catch (err) {
    target.innerHTML = '<li><span class="rank-pos">--</span><span class="rank-name">Loading..</span><span class="rank-value">--</span></li>';
    console.error(`Failed to load ${endpoint}:`, err);
  }
}

/* ====== Scroll Animations ====== */

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll("[data-animate]");
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add("is-visible");
        }, parseInt(delay, 10));
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  animatedElements.forEach(el => observer.observe(el));
}

/* ====== EVENT TIMERS ====== */

const eventSchedules = {
  deadfront: {
    timesSeconds: [0, 4, 8, 12, 16, 20].map(h => h * 3600),
    duration: 30
  },
  partyMatch: {
    timesSeconds: [2, 6, 10, 14, 18, 22].map(h => h * 3600),
    duration: 60
  },
  battleRoyal: {
    timesSeconds: [3, 7, 11, 15, 19, 23].map(h => h * 3600),
    duration: 60
  },
  deadland: {
    timesSeconds: [(7 * 3600) + (5 * 60), (14 * 3600) + (5 * 60), (23 * 3600) + (5 * 60)],
    duration: 30
  },
  elonohm: {
    timesSeconds: [(7 * 3600) + (5 * 60), (14 * 3600) + (5 * 60), (23 * 3600) + (5 * 60)],
    duration: 30
  },
  rubyEye: {
    timesSeconds: [(7 * 3600) + (5 * 60), (14 * 3600) + (5 * 60), (23 * 3600) + (5 * 60)],
    duration: 30
  }
};

function initEventTimers() {
  setInterval(updateAllTimers, 1000);
  updateAllTimers();
}

function updateAllTimers() {
  const now = new Date();
  const gmt8 = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" }));

  const hours = gmt8.getHours();
  const mins = gmt8.getMinutes();
  const secs = gmt8.getSeconds();

  updateEventTimer("deadfrontCardTimer", eventSchedules.deadfront, hours, mins, secs);
  updateEventTimer("partyCardTimer", eventSchedules.partyMatch, hours, mins, secs);
  updateEventTimer("battleCardTimer", eventSchedules.battleRoyal, hours, mins, secs);
  updateEventTimer("deadlandCardTimer", eventSchedules.deadland, hours, mins, secs);
  updateEventTimer("elonohmCardTimer", eventSchedules.elonohm, hours, mins, secs);
  updateEventTimer("rubyEyeCardTimer", eventSchedules.rubyEye, hours, mins, secs);
}

function isEventOngoing(eventTimesSeconds, durationMinutes, currentTotalSeconds) {
  for (const startSec of eventTimesSeconds) {
    const endSec = startSec + (durationMinutes * 60);
    if (currentTotalSeconds >= startSec && currentTotalSeconds < endSec) return true;
  }
  return false;
}

function updateEventTimer(elementId, schedule, currentHour, currentMin, currentSec) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.style.color = "";
  el.style.textShadow = "";

  const card = el.closest(".event-card");
  const currentTotalSeconds = (currentHour * 3600) + (currentMin * 60) + currentSec;
  const times = (schedule.timesSeconds || []).slice().sort((a, b) => a - b);
  const ongoing = isEventOngoing(times, schedule.duration, currentTotalSeconds);

  if (card) card.classList.toggle("is-ongoing", ongoing);

  if (ongoing) {
    el.textContent = "ONGOING";
    return;
  }

  let nextStart = times.find(t => t > currentTotalSeconds);
  if (nextStart === undefined) nextStart = times[0] + (24 * 3600);

  displayTimer(el, nextStart - currentTotalSeconds);
}

function displayTimer(el, seconds) {
  const displayHours = Math.floor(seconds / 3600);
  const displayMins = Math.floor((seconds % 3600) / 60);
  const displaySecs = seconds % 60;

  el.textContent =
    String(displayHours).padStart(2, "0") + ":" +
    String(displayMins).padStart(2, "0") + ":" +
    String(displaySecs).padStart(2, "0");
}

/* ====== DONATE LINKS ====== */

function initDonateLinks() {
  const links = document.querySelectorAll("a.donate-link");
  if (!links.length) return;

  links.forEach((a) => {
    a.addEventListener("click", () => {
      const row = a.closest(".donate-text-row");
      if (row) {
        row.classList.remove("is-clicked");
        void row.offsetWidth;
        row.classList.add("is-clicked");
      }
    });
  });
}

/* ====== Register Popup ====== */

function initRegisterPopup() {
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const registerLink = navLinks.find(a => a.textContent.trim().toLowerCase() === "register");
  if (!registerLink) return;

  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    showRegisterPopup({
      title: "How to register?",
      message: "Log in ingame to auto-create your account.",
      buttonText: "Yes, I understand"
    });
  });
}

/* ====== Rank Info Popover ====== */

function initRankInfoPopover() {
  const wrap = document.getElementById("rankInfo");
  const btn = document.getElementById("rankInfoBtn");
  const popover = document.getElementById("rankInfoPopover");

  if (!wrap || !btn || !popover) return;

  popover.innerHTML = `
    <ul>
      ${Object.keys(gradeRanks)
        .sort((a, b) => Number(a) - Number(b))
        .map((num) => `
          <li>
            <span class="rank-info-num">${num}</span>
            <span class="rank-info-name">${escapeHtml(gradeRanks[num])}</span>
          </li>
        `).join("")}
    </ul>
  `;

  function openPopover() {
    popover.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
  }

  function closePopover() {
    popover.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  }

  function togglePopover(e) {
    e.stopPropagation();
    if (popover.classList.contains("is-open")) closePopover();
    else openPopover();
  }

  btn.addEventListener("click", togglePopover);

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) closePopover();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopover();
  });
}

function showRegisterPopup({ title, message, buttonText }) {
  if (document.getElementById("registerPopupOverlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "register-popup-overlay";
  overlay.id = "registerPopupOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", title);

  const modal = document.createElement("div");
  modal.className = "register-popup-modal";

  modal.innerHTML = `
    <div class="register-popup-header">
      <h2>${escapeHtml(title)}</h2>
    </div>
    <div class="register-popup-body">
      <p class="register-popup-message">${escapeHtml(message)}</p>
    </div>
    <div class="register-popup-footer">
      <button type="button" class="btn btn-primary register-popup-confirm">${escapeHtml(buttonText)}</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add("is-open"));

  const onKeyDown = (e) => {
    if (e.key === "Escape") closePopup();
  };

  const closePopup = () => {
    overlay.classList.remove("is-open");
    window.setTimeout(() => {
      overlay.remove();
      document.removeEventListener("keydown", onKeyDown);
    }, 300);
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });

  modal.querySelector(".register-popup-confirm")?.addEventListener("click", closePopup);
  document.addEventListener("keydown", onKeyDown);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[ch]));
}

/* ====== Content Protection ====== */

function initContentProtection() {
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    const blockedCombo =
      key === "F12" ||
      (e.ctrlKey && e.shiftKey && (key === "I" || key === "J" || key === "C")) ||
      (e.ctrlKey && key === "U") ||
      (e.metaKey && e.altKey && (key === "I" || key === "J" || key === "C"));

    if (blockedCombo) e.preventDefault();
  });

  document.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") e.preventDefault();
  });
}