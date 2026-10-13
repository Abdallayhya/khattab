/* script.js - edit the numbers here */
const PHONE = "201277588280";
const WA = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent("السلام عليكم ورحمة الله، أريد الاشتراك في حلقات حفظ القرآن أونلاين مع الشيخ خطاب الأزهري.");
const $ = s => document.querySelector(s);

document.querySelectorAll("[data-wa]").forEach(a => a.href = WA);
$("#year").textContent = new Date().getFullYear();

// Navbar: background on scroll, back-to-top, active link
const links = [...document.querySelectorAll("#menu a")];
const secs = links.map(a => $(a.getAttribute("href")));
addEventListener("scroll", () => {
  $("#nav").classList.toggle("solid", scrollY > 40);
  $("#top").classList.toggle("show", scrollY > 500);
  let cur = 0;
  secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 140) cur = i; });
  links.forEach((a, i) => a.classList.toggle("active", i === cur));
}, { passive: true });
$("#top").onclick = () => scrollTo({ top: 0 });

// Mobile menu
$("#burger").onclick = () => {
  const open = $("#menu").classList.toggle("open");
  $("#burger").setAttribute("aria-expanded", open);
};
links.forEach(a => a.addEventListener("click", () => $("#menu").classList.remove("open")));

// Theme toggle (memory only)
$("#theme").onclick = () => {
  const d = document.documentElement;
  d.dataset.theme = d.dataset.theme === "dark" ? "" : "dark";
};

// Animated counters
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  io.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now();
  const tick = t => {
    const p = Math.min((t - t0) / 1400, 1);
    el.textContent = (end * p).toFixed(dec);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), { threshold: .6 });
document.querySelectorAll("[data-count]").forEach(el => io.observe(el));

// Copy Vodafone Cash number
$("#copy").onclick = async () => {
  const n = $("#cash").textContent.trim();
  try { await navigator.clipboard.writeText(n); }
  catch (e) {
    const r = document.createRange(); r.selectNode($("#cash"));
    getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand("copy");
  }
  const t = $("#toast"); t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
};

// Form -> Telegram bot (falls back to WhatsApp if sending fails)
const BOT_TOKEN = "8832097213:AAF810LzShZRPtxdZ8L5ShS6tmz-DSUC_mk";
const CHAT_ID = "6458147839";
$("#form").onsubmit = async e => {
  e.preventDefault();
  const f = new FormData(e.target), st = $("#formstatus"), btn = e.target.querySelector("button");
  const text = `طلب اشتراك جديد من الموقع\nالاسم: ${f.get("name")}\nالسن: ${f.get("age") || "-"}\nالمستوى: ${f.get("level")}\nالرسالة: ${f.get("msg") || "-"}`;
  btn.disabled = true; st.textContent = "جاري الإرسال...";
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    if (!r.ok) throw new Error(r.status);
    st.textContent = "تم إرسال بياناتك بنجاح، سنتواصل معك قريباً بإذن الله ✓";
    e.target.reset();
  } catch (err) {
    st.textContent = "تعذر الإرسال، سيتم فتح واتساب لإرسال بياناتك.";
    open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text), "_blank");
  }
  btn.disabled = false;
};
