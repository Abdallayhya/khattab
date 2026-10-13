/* ============================================================================
   موقع الشيخ خطاب الأزهري — script.js
   ----------------------------------------------------------------------------
   JavaScript خالص (بدون أي مكتبات). يغطّي:
   - قائمة الجوال (Hamburger)
   - تغيّر خلفية الشريط عند التمرير + تحديد الرابط النشِط
   - تمرير ناعم للروابط الداخلية
   - ظهور العناصر عند التمرير (IntersectionObserver)
   - عدّادات الأرقام المتحركة
   - الأكورديون في الأسئلة الشائعة
   - زر النسخ + الإشعار (Toast)
   - نموذج يرسل البيانات عبر واتساب
   - زر العودة للأعلى
   - الوضع الليلي (في الذاكرة فقط — بدون localStorage)
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------- اختصارات مساعدة --------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* الرقم بصيغة دولية لروابط واتساب */
  const WHATSAPP_INTL = "201277588280";

  /* ============================ رقم السنة في الفوتر ======================== */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================ قائمة الجوال ============================== */
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");

  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      hamburger.classList.toggle("active", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* =================== الشريط: التمرير + الرابط النشِط ==================== */
  const navbar = $("#navbar");
  const sections = $$("main section[id]");
  const navItems = $$(".nav-link");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (navbar) navbar.classList.toggle("scrolled", y > 20);

    /* زر العودة للأعلى */
    const backBtn = $("#backToTop");
    if (backBtn) backBtn.classList.toggle("show", y > 500);

    /* تحديد القسم الحالي */
    let current = "";
    sections.forEach((sec) => {
      if (y >= sec.offsetTop - 120) current = sec.id;
    });
    navItems.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("active", href === "#" + current);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* =========================== التمرير الناعم ============================= */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });

      closeMenu();
    });
  });

  /* ===================== الظهور عند التمرير (Reveal) ====================== */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ========================= عدّادات الأرقام ============================== */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toFixed(decimals);
      }
    }
    requestAnimationFrame(frame);
  }

  const counters = $$(".stat-number[data-target]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = parseFloat(el.dataset.target || "0").toFixed(
        parseInt(el.dataset.decimals || "0", 10)
      );
    });
  }

  /* ========================= الأكورديون (FAQ) =========================== */
  $$(".faq-item").forEach((item) => {
    const btn = $(".faq-question", item);
    const answer = $(".faq-answer", item);
    if (!btn || !answer) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      /* إغلاق البقية (سلوك أكورديون واحد مفتوح) */
      $$(".faq-item.open").forEach((other) => {
        if (other === item) return;
        other.classList.remove("open");
        $(".faq-answer", other).style.maxHeight = null;
        $(".faq-question", other).setAttribute("aria-expanded", "false");
      });

      if (isOpen) {
        item.classList.remove("open");
        answer.style.maxHeight = null;
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ========================= النسخ + الإشعار ============================= */
  const toast = $("#toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message || "تم النسخ ✓";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  $$(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy || "";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          /* بديل تعبيري للمتصفحات القديمة / عند فتح الملف محلياً */
          const tmp = document.createElement("textarea");
          tmp.value = value;
          tmp.setAttribute("readonly", "");
          tmp.style.position = "absolute";
          tmp.style.left = "-9999px";
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand("copy");
          document.body.removeChild(tmp);
        }
        showToast("تم النسخ ✓");
      } catch (err) {
        showToast("تعذّر النسخ، انسخ الرقم يدوياً");
      }
    });
  });

  /* ========================= زر العودة للأعلى ============================ */
  const backToTop = $("#backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ===================== الوضع الليلي (في الذاكرة فقط) ==================== */
  const themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.title = isDark ? "الوضع النهاري" : "الوضع الليلي";
    });
  }

  /* ==================== نموذج التواصل عبر واتساب ========================= */
  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = ($("#fName")?.value || "").trim();
      const age = ($("#fAge")?.value || "").trim();
      const level = ($("#fLevel")?.value || "").trim();
      const message = ($("#fMessage")?.value || "").trim();

      if (!name) {
        showToast("من فضلك اكتب اسمك");
        $("#fName")?.focus();
        return;
      }

      const lines = [
        "السلام عليكم ورحمة الله وبركاته يا شيخ خطاب،",
        "أرغب في الاشتراك في حلقات حفظ القرآن الكريم.",
        "",
        "الاسم: " + name,
      ];
      if (age) lines.push("العمر: " + age);
      if (level) lines.push("المستوى: " + level);
      if (message) lines.push("رسالتي: " + message);

      const text = encodeURIComponent(lines.join("\n"));
      const url = "https://wa.me/" + WHATSAPP_INTL + "?text=" + text;
      window.open(url, "_blank", "noopener");
      showToast("جارٍ فتح واتساب…");
    });
  }

  /* ================== إغلاق القائمة عند تغيير حجم النافذة ================= */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
})();
