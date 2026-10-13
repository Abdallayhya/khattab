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

// Form -> WhatsApp
$("#form").onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const msg = `السلام عليكم، أريد الاشتراك في حلقات حفظ القرآن أونلاين.\nالاسم: ${f.get("name")}\nالسن: ${f.get("age") || "-"}\nالمستوى: ${f.get("level")}\n${f.get("msg") || ""}`;
  open("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg), "_blank");
};
