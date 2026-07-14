/* ============================================
   LOA CASTLE - Modern Interactive Scripts
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
    // Initialize all modules
    initMobileNav();
    initHeaderScroll();
    initClassSlider();
    // initDonateSlider(); // (removed: donate slider replaced by text wall)
    initPlayerOnline();
    initEventTimers();
    initDonateLinks();
    // initDonateButtons(); // old modal checkout (removed)
    initScrollAnimations();
	initRegisterPopup();
    initContentProtection();
});

/* ====== Mobile Navigation Toggle ====== */

function initMobileNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    
    if (!navToggle || !navLinks) return;
    
    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("is-open");
        navToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
    });

    // Close menu when clicking a link
    navLinks.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            navLinks.classList.remove("is-open");
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
            navLinks.classList.remove("is-open");
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ====== Header Scroll Effect ====== */

function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 50;

    function handleScroll() {
        const currentScroll = window.scrollY;
        
        if (currentScroll > scrollThreshold) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        lastScroll = currentScroll;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
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

    // Create indicators
    if (indicatorsContainer) {
        slides.forEach((_, index) => {
            const indicator = document.createElement("span");
            indicator.addEventListener("click", () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
    }

    function updateSlider() {
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;
        
        // Update button states
        btnPrev.disabled = currentIndex === 0;
        btnNext.disabled = currentIndex === slides.length - 1;
        
        // Update indicators
        if (indicatorsContainer) {
            const indicators = indicatorsContainer.querySelectorAll("span");
            indicators.forEach((ind, i) => {
                ind.classList.toggle("active", i === currentIndex);
            });
        }

        // Trigger stat bar animations on current slide
        animateStatBars(slides[currentIndex]);
    }

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));
        updateSlider();
        resetAutoPlay();
    }

    function nextSlide() {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
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
        bars.forEach(bar => {
            const fill = bar.style.getPropertyValue('--fill');
            bar.style.width = '0%';
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

    // Event listeners
    btnPrev.addEventListener("click", () => {
        prevSlide();
        resetAutoPlay();
    });

    btnNext.addEventListener("click", () => {
        nextSlide();
        resetAutoPlay();
    });

    // Touch support
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
            if (diff > 0 && currentIndex < slides.length - 1) {
                nextSlide();
            } else if (diff < 0 && currentIndex > 0) {
                prevSlide();
            }
            resetAutoPlay();
        }
    }

    // Pause autoplay on hover
    track.addEventListener("mouseenter", () => clearInterval(autoTimer));
    track.addEventListener("mouseleave", startAutoPlay);

    // Initialize
    updateSlider();
    startAutoPlay();
}

/* ====== Donate Slider Logic ====== */

function initDonateSlider() {
    const track = document.querySelector("#donateSliderTrack");
    const slides = track ? Array.from(track.querySelectorAll(".donate-slide")) : [];
    const btnPrev = document.querySelector(".donate-nav-btn.prev");
    const btnNext = document.querySelector(".donate-nav-btn.next");
    const indicatorsContainer = document.querySelector("#donateIndicators");
    
    if (!track || slides.length === 0 || !btnPrev || !btnNext) return;
    
    let currentIndex = 0;
    let autoTimer;
    const autoPlayDelay = 6000;

    // Create indicators
    if (indicatorsContainer) {
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
            indicators.forEach((ind, i) => {
                ind.classList.toggle("active", i === currentIndex);
            });
        }
    }

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));
        updateSlider();
        resetAutoPlay();
    }

    function nextSlide() {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
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

    // Touch support
    let touchStartX = 0;
    const swipeThreshold = 50;

    track.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) nextSlide();
            else prevSlide();
            resetAutoPlay();
        }
    }, { passive: true });

    track.addEventListener("mouseenter", () => clearInterval(autoTimer));
    track.addEventListener("mouseleave", startAutoPlay);

    updateSlider();
    startAutoPlay();
}

/* ====== Players Online (Live via Vercel API) ====== */

function initPlayerOnline() {
  const el = document.getElementById("playersOnline");
  if (!el) return;

  // Same-origin route served by Vercel (HTTPS-safe)
  const ONLINE_URL = "/api/online";

  async function refresh() {
    try {
      const res = await fetch(ONLINE_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();

      const count = Number(data.count ?? 0);
      el.textContent = Number.isFinite(count) ? String(count) : "0";
    } catch (err) {
      el.textContent = "--"; // shows offline / unreachable
    }
  }

  refresh();
  setInterval(refresh, 5000); // ✅ refresh every 5 seconds
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
                }, parseInt(delay));
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    animatedElements.forEach(el => observer.observe(el));
}

/* ====== EVENT TIMERS (6 events, minute-accurate, CSS-driven state) ====== */
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
  for (let startSec of eventTimesSeconds) {
    const endSec = startSec + (durationMinutes * 60);
    if (currentTotalSeconds >= startSec && currentTotalSeconds < endSec) return true;
  }
  return false;
}

function updateEventTimer(elementId, schedule, currentHour, currentMin, currentSec) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Clear inline styles from older versions (let CSS control visuals)
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

  // Next start (today or tomorrow)
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


/* ====== DONATE LINKS (Hosted PayPal Checkout) ====== */
function initDonateLinks() {
  const links = document.querySelectorAll("a.donate-link");
  if (!links || links.length === 0) return;

  links.forEach((a) => {
    a.addEventListener("click", () => {
      const row = a.closest(".donate-text-row");
      if (row) {
        row.classList.remove("is-clicked");
        // trigger reflow for animation restart
        void row.offsetWidth;
        row.classList.add("is-clicked");
      }
    });
  });
}

/* ====== DONATE BUTTON HANDLING (PayPal via LoaCastleBE) ====== */

/**
 * This site uses LoaCastleBE endpoints:
 *  - GET  /api/paypal/config
 *  - POST /api/paypal/create-order   { username, package }
 *  - POST /api/paypal/capture-order  { order_id }
 *
 * If your website is NOT served from the same domain as the BE,
 * set API_BASE to your BE domain (example: "https://loacastle.online").
 */
const API_BASE = "";

let selectedTier = null;
let paypalButtonsRendered = false;
let paypalConfig = null;

function openPayPalModal() {
  const modal = document.getElementById("paypalModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closePayPalModal() {
  const modal = document.getElementById("paypalModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  setModalMessage("");
}

function setModalMessage(msg, kind) {
  const el = document.getElementById("donateModalMsg") || null;
  // fallback if you don't have donateModalMsg (we use alerts as backup)
  if (!el) return;
  el.classList.remove("is-error", "is-ok");
  if (!msg) { el.textContent = ""; return; }
  el.textContent = msg;
  if (kind === "error") el.classList.add("is-error");
  if (kind === "ok") el.classList.add("is-ok");
}

async function loadPayPalConfig() {
  if (paypalConfig) return paypalConfig;
  const res = await fetch(`${API_BASE}/api/paypal/config`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load PayPal config");
  paypalConfig = await res.json();
  return paypalConfig;
}

function ensurePayPalSDK(clientId, currency) {
  return new Promise((resolve, reject) => {
    if (window.paypal && window.paypal.Buttons) return resolve();

    const existing = document.querySelector("script[data-paypal-sdk='1']");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load PayPal SDK")));
      return;
    }

    const s = document.createElement("script");
    s.dataset.paypalSdk = "1";
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.head.appendChild(s);
  });
}

function validUsername(u) {
  return /^[A-Za-z0-9]{3,20}$/.test(u);
}

function updateModalSubtext() {
  const sub = document.getElementById("paypalModalSub");
  if (!sub || !selectedTier) return;
  const bonusTxt = selectedTier.bonus && selectedTier.bonus !== "0" ? ` +${selectedTier.bonus} bonus` : "";
  sub.textContent = `${selectedTier.tier} — ${selectedTier.price} (Coins: ${selectedTier.coins}${bonusTxt})`;
}

function clearPayPalButtons() {
  const c = document.getElementById("paypal-button-container");
  if (c) c.innerHTML = "";
  paypalButtonsRendered = false;
}

function initDonateButtons() {
  const donateButtons = document.querySelectorAll(".donate-btn");
  if (!donateButtons || donateButtons.length === 0) return;

  donateButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      selectedTier = {
        package: btn.dataset.package || (btn.dataset.tier || "donation").toLowerCase(),
        tier: btn.dataset.tier || "Donation",
        coins: btn.dataset.coins || "0",
        bonus: btn.dataset.bonus || "0",
        price: (btn.closest(".donate-text-right")?.querySelector(".donate-text-price")?.textContent || `€${btn.dataset.amount || ""}`).trim(),
      };

      updateModalSubtext();
      openPayPalModal();

      // We re-render buttons each time so package changes are always applied
      clearPayPalButtons();

      try {
        const cfg = await loadPayPalConfig();
        await ensurePayPalSDK(cfg.clientId, cfg.currency);

        // render PayPal buttons
        paypalButtonsRendered = true;

        paypal.Buttons({
          style: { layout: "vertical", label: "paypal", shape: "pill" },

          createOrder: async () => {
            const username = (document.getElementById("paypalUsername")?.value || "").trim();

            if (!validUsername(username)) {
              throw new Error("Invalid username. Use 3–20 letters/numbers only.");
            }

            const res = await fetch(`${API_BASE}/api/paypal/create-order`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: username,
                package: selectedTier.package,
              }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Create order failed");

            // LoaCastleBE returns { orderID: "..." }
            return data.orderID;
          },

          onApprove: async (data) => {
            const res = await fetch(`${API_BASE}/api/paypal/capture-order`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: data.orderID }),
            });

            const out = await res.json().catch(() => ({}));
            if (!res.ok || !out.ok) {
              throw new Error(out?.error || out?.status || "Capture failed");
            }

            alert("✅ Payment successful! Thank you for supporting Loa Castle ❤️");
            closePayPalModal();
          },

          onError: (err) => {
            console.error("PayPal error:", err);
            alert("❌ Payment failed. " + (err?.message || "Please try again."));
          },
        }).render("#paypal-button-container");
      } catch (err) {
        console.error(err);
        alert("❌ PayPal is not available right now. " + (err?.message || ""));
      }
    });
  });
}

// Close modal
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-close='paypal']")) closePayPalModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePayPalModal();
});

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

function showRegisterPopup({ title, message, buttonText }) {
  // prevent duplicates
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

  // open animation (your CSS already supports .is-open)
  requestAnimationFrame(() => overlay.classList.add("is-open"));

  const closePopup = () => {
    overlay.classList.remove("is-open");
    window.setTimeout(() => overlay.remove(), 300);
  };

  // close on outside click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });

  // close on button click
  modal.querySelector(".register-popup-confirm")?.addEventListener("click", closePopup);

  // close on ESC
  const onKeyDown = (e) => {
    if (e.key === "Escape") closePopup();
  };
  document.addEventListener("keydown", onKeyDown);

  // cleanup keydown when removed
  overlay.addEventListener("transitionend", () => {
    if (!document.getElementById("registerPopupOverlay")) {
      document.removeEventListener("keydown", onKeyDown);
    }
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}


/* ====== Content Protection ======
   Deterrents only — casual copy-paste protection.
   None of this stops a determined visitor (view-source,
   curl, or a browser with JS disabled bypasses all of it),
   but it stops right-click "Save As", inspect-element
   shortcuts, and image drag-saving for most visitors. */

function initContentProtection() {
  // Block the right-click context menu site-wide
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Block common "open dev tools" / "view source" keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    const blockedCombo =
      key === "F12" ||
      (e.ctrlKey && e.shiftKey && (key === "I" || key === "J" || key === "C")) ||
      (e.ctrlKey && key === "U") ||
      (e.metaKey && e.altKey && (key === "I" || key === "J" || key === "C")); // macOS
    if (blockedCombo) e.preventDefault();
  });

  // Prevent dragging images out of the page (a common way to "save" art)
  document.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") e.preventDefault();
  });
}
