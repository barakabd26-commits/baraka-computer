// ============================================================
// BARAKA COMPUTER — Public Site Script
// Loads content from Firestore where available, and falls back
// to sensible defaults so the site NEVER looks broken/empty
// before the admin has entered data.
// ============================================================

import { db } from "./firebase-config.js";
import {
  doc, getDoc, collection, getDocs, query, orderBy, where,
  addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------------- Defaults (used until admin edits content) ----------------
const DEFAULTS = {
  settings: {
    siteName: "BARAKA COMPUTER",
    tagline: "সেবা, বিশ্বাস ও প্রযুক্তির নির্ভরযোগ্য প্রতিষ্ঠান",
    phone: "01917014656",
    whatsapp: "01917014656",
    email: "barakabd26@gmail.com",
    address: "Sonargaon Govt. College Road, Mograpara Chowrasta, Sonargaon, Narayanganj",
    facebook: "",
    youtube: "",
    mapEmbed: "",
    logo: "images/logo.png"
  },
  hero: {
    title: "আপনার নির্ভরযোগ্য কম্পিউটার সেবা কেন্দ্র",
    subtitle: "ফটোকপি, প্রিন্ট, স্ক্যান, পাসপোর্ট ছবি, NID, অনলাইন আবেদনসহ সকল কম্পিউটার সেবা এক জায়গায়।",
    buttonText: "সেবাসমূহ দেখুন",
    buttonLink: "services.html",
    bannerImage: "images/banner.png"
  },
  about: {
    title: "আমাদের সম্পর্কে",
    description: "বারাকা কম্পিউটার সোনারগাঁও এলাকার একটি নির্ভরযোগ্য কম্পিউটার সার্ভিস প্রতিষ্ঠান। আমরা ফটোকপি, প্রিন্টিং, স্ক্যানিং, পাসপোর্ট ছবি, বিভিন্ন অনলাইন আবেদন ও কম্পিউটার সম্পর্কিত সকল সেবা প্রদান করে থাকি।",
    mission: "সততা ও গুণগত মানের মাধ্যমে গ্রাহকের প্রতিটি প্রয়োজন দ্রুত ও নির্ভুলভাবে সম্পন্ন করা।",
    vision: "প্রযুক্তি সেবার মাধ্যমে এলাকার মানুষের জীবনযাত্রা সহজ করে তোলা।",
    image: "images/banner.png"
  }
};

const FALLBACK_SERVICES = [
  { title: "ফটোকপি ও প্রিন্ট", description: "কম্পোজ, ফটোকপি ও প্রিন্টের সকল কাজ।", icon: "🖨️", price: "", order: 1 },
  { title: "ছবি তোলা", description: "পাসপোর্ট সাইজ ও যেকোনো ছবি তোলা এবং ছবি থেকে ছবি প্রিন্ট।", icon: "📷", price: "", order: 2 },
  { title: "NID ও জন্ম নিবন্ধন", description: "জাতীয় পরিচয়পত্র ও জন্ম নিবন্ধন আবেদন এবং সংশোধন।", icon: "🪪", price: "", order: 3 },
  { title: "পাসপোর্ট আবেদন", description: "পাসপোর্টের জন্য অনলাইন আবেদন প্রক্রিয়া।", icon: "🛂", price: "", order: 4 },
  { title: "শিক্ষা প্রতিষ্ঠানে ভর্তি আবেদন", description: "স্কুল, কলেজ ও বিশ্ববিদ্যালয়ের ভর্তি আবেদন।", icon: "🎓", price: "", order: 5 },
  { title: "ভিসা যাচাই ও অনুবাদ", description: "সৌদি ভিসা অনুবাদ ও ভিসা চেক সেবা।", icon: "🌍", price: "", order: 6 },
  { title: "ট্যাক্স ই-রিটার্ন", description: "আয়কর ই-রিটার্ন প্রদান সেবা।", icon: "🧾", price: "", order: 7 },
  { title: "পুলিশ ক্লিয়ারেন্স / জিডি", description: "পুলিশ ক্লিয়ারেন্স সার্টিফিকেট ও জিডি সংক্রান্ত সেবা।", icon: "🛡️", price: "", order: 8 },
  { title: "বিকাশ/নগদ রিচার্জ", description: "মোবাইল রিচার্জ ও মোবাইল ব্যাংকিং সেবা।", icon: "💳", price: "", order: 9 },
  { title: "জমির খাজনা/নামজারি", description: "ভূমি খাজনা প্রদান, নামজারি ও খতিয়ান সংক্রান্ত সেবা।", icon: "📜", price: "", order: 10 },
  { title: "হজ্জ/ওমরাহ ফিঙ্গার", description: "হজ্জ ও ওমরাহ যাত্রীদের ফিঙ্গারপ্রিন্ট সংক্রান্ত সেবা।", icon: "🕋", price: "", order: 11 },
  { title: "চাকরির আবেদন", description: "বিভিন্ন সরকারি ও বেসরকারি চাকরির অনলাইন আবেদন।", icon: "💼", price: "", order: 12 },
  { title: "লেমিনেশন", description: "গুরুত্বপূর্ণ কাগজপত্র লেমিনেটিং সেবা।", icon: "📄", price: "", order: 13 }
];

// ---------------- Helpers ----------------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

async function safeGetDoc(path) {
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn("Firestore read failed for", path, e);
    return null;
  }
}

async function safeGetCollection(name, { orderField, statusFilter } = {}) {
  try {
    const colRef = collection(db, name);
    const snap = await getDocs(colRef);
    let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (statusFilter) items = items.filter(i => i.status !== "inactive");
    if (orderField) items.sort((a, b) => (a[orderField] ?? 0) - (b[orderField] ?? 0));
    return items;
  } catch (e) {
    console.warn("Firestore collection read failed for", name, e);
    return [];
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------- Settings (used on EVERY page: header/footer/notice) ----------------
async function loadSettingsIntoChrome() {
  const remote = await safeGetDoc("settings/website");
  const s = { ...DEFAULTS.settings, ...(remote || {}) };

  $$(".site-phone").forEach(el => el.textContent = s.phone);
  $$(".site-phone-link").forEach(el => el.href = `tel:${s.phone}`);
  $$(".site-whatsapp-link").forEach(el => el.href = `https://wa.me/88${s.whatsapp}`);
  $$(".site-email").forEach(el => el.textContent = s.email);
  $$(".site-email-link").forEach(el => el.href = `mailto:${s.email}`);
  $$(".site-address").forEach(el => el.textContent = s.address);
  $$(".site-name").forEach(el => el.textContent = s.siteName);
  $$(".site-tagline").forEach(el => el.textContent = s.tagline);
  $$(".site-logo").forEach(el => el.src = s.logo || DEFAULTS.settings.logo);

  const fb = $(".social-facebook");
  if (fb) fb.style.display = s.facebook ? "flex" : "none";
  if (fb && s.facebook) fb.href = s.facebook;
  const yt = $(".social-youtube");
  if (yt) yt.style.display = s.youtube ? "flex" : "none";
  if (yt && s.youtube) yt.href = s.youtube;

  const mapBox = $(".map-embed iframe");
  if (mapBox && s.mapEmbed) mapBox.src = s.mapEmbed;

  // Notice bar (optional, shown only if an active notice exists)
  const notices = await safeGetCollection("notice", { statusFilter: true });
  const noticeBar = $("#noticeBar");
  if (noticeBar) {
    if (notices.length) {
      noticeBar.textContent = "📢 " + notices[0].text;
      noticeBar.style.display = "block";
    } else {
      noticeBar.style.display = "none";
    }
  }
}

// ---------------- Homepage ----------------
async function renderHomepage() {
  const remote = await safeGetDoc("homepage/hero");
  const h = { ...DEFAULTS.hero, ...(remote || {}) };

  const titleEl = $("#heroTitle");
  const subEl = $("#heroSubtitle");
  const btnEl = $("#heroButton");
  const imgEl = $("#heroImage");
  if (titleEl) titleEl.textContent = h.title;
  if (subEl) subEl.textContent = h.subtitle;
  if (btnEl) { btnEl.textContent = h.buttonText; btnEl.href = h.buttonLink || "services.html"; }
  if (imgEl) imgEl.src = h.bannerImage || DEFAULTS.hero.bannerImage;

  // Featured services (first 6)
  const grid = $("#featuredServices");
  if (grid) {
    let services = await safeGetCollection("services", { orderField: "order", statusFilter: true });
    if (!services.length) services = FALLBACK_SERVICES;
    grid.innerHTML = services.slice(0, 6).map(serviceCardHtml).join("");
  }

  // Reviews
  const reviewGrid = $("#reviewGrid");
  if (reviewGrid) {
    const reviews = await safeGetCollection("reviews", { statusFilter: true });
    reviewGrid.innerHTML = reviews.length
      ? reviews.map(reviewCardHtml).join("")
      : `<div class="empty-state">এখনো কোনো রিভিউ যুক্ত করা হয়নি।</div>`;
  }
}

function serviceCardHtml(s) {
  return `
    <div class="card">
      ${s.image ? `<img class="card-photo" src="${escapeHtml(s.image)}" alt="${escapeHtml(s.title)}" loading="lazy">` : `<div class="card-icon">${s.icon ? escapeHtml(s.icon) : "🛠️"}</div>`}
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.description || "")}</p>
      ${s.price ? `<div class="price">${escapeHtml(s.price)}</div>` : ""}
    </div>`;
}

function reviewCardHtml(r) {
  const stars = "★".repeat(Number(r.rating) || 5) + "☆".repeat(5 - (Number(r.rating) || 5));
  return `
    <div class="card review-card">
      <div class="stars">${stars}</div>
      <p>"${escapeHtml(r.text || "")}"</p>
      <strong>${escapeHtml(r.name || "গ্রাহক")}</strong>
    </div>`;
}

// ---------------- About page ----------------
async function renderAbout() {
  const remote = await safeGetDoc("about/company");
  const a = { ...DEFAULTS.about, ...(remote || {}) };
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("aboutTitle", a.title);
  set("aboutDescription", a.description);
  set("aboutMission", a.mission);
  set("aboutVision", a.vision);
  const img = $("#aboutImage");
  if (img) img.src = a.image || DEFAULTS.about.image;
}

// ---------------- Services page ----------------
async function renderServicesPage() {
  const grid = $("#allServices");
  if (!grid) return;
  let services = await safeGetCollection("services", { orderField: "order", statusFilter: true });
  if (!services.length) services = FALLBACK_SERVICES;
  grid.innerHTML = services.map(serviceCardHtml).join("");

  const search = $("#serviceSearch");
  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      const filtered = services.filter(s =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
      );
      grid.innerHTML = filtered.length
        ? filtered.map(serviceCardHtml).join("")
        : `<div class="empty-state">কোনো সেবা পাওয়া যায়নি।</div>`;
    });
  }
}

// ---------------- Gallery page ----------------
async function renderGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;
  const items = await safeGetCollection("gallery", { orderField: "order" });
  grid.innerHTML = items.length
    ? items.map(g => `
        <div class="gallery-item">
          <img src="${escapeHtml(g.imageUrl)}" alt="${escapeHtml(g.category || 'gallery')}" loading="lazy">
        </div>`).join("")
    : `<div class="empty-state">গ্যালারিতে এখনো কোনো ছবি যুক্ত করা হয়নি।</div>`;
}

// ---------------- FAQ (used on contact or a dedicated section) ----------------
async function renderFaq() {
  const wrap = $("#faqList");
  if (!wrap) return;
  const items = await safeGetCollection("faq", { orderField: "order" });
  if (!items.length) { wrap.innerHTML = `<div class="empty-state">কোনো প্রশ্ন যুক্ত করা হয়নি।</div>`; return; }
  wrap.innerHTML = items.map((f, i) => `
    <div class="faq-item" data-i="${i}">
      <div class="faq-question">${escapeHtml(f.question)} <span>+</span></div>
      <div class="faq-answer"><p>${escapeHtml(f.answer)}</p></div>
    </div>`).join("");
  $$(".faq-question", wrap).forEach(q => {
    q.addEventListener("click", () => q.parentElement.classList.toggle("open"));
  });
}

// ---------------- Contact page ----------------
async function renderContactPage() {
  const remote = await safeGetDoc("settings/website");
  const s = { ...DEFAULTS.settings, ...(remote || {}) };
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("contactPhone", s.phone);
  set("contactEmail", s.email);
  set("contactAddress", s.address);

  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msgBox = $("#contactFormMsg");
      const name = $("#cf-name").value.trim();
      const phone = $("#cf-phone").value.trim();
      const message = $("#cf-message").value.trim();
      if (!name || !phone || !message) return;
      try {
        await addDoc(collection(db, "messages"), {
          name, phone, message, read: false, createdAt: serverTimestamp()
        });
        msgBox.textContent = "ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে।";
        msgBox.className = "form-msg show success";
        form.reset();
      } catch (err) {
        msgBox.textContent = "দুঃখিত, বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
        msgBox.className = "form-msg show error";
      }
    });
  }
}

// ---------------- Mobile nav toggle (every page) ----------------
function initMobileNav() {
  const btn = $(".menu-toggle");
  const nav = $(".nav-links");
  if (btn && nav) btn.addEventListener("click", () => nav.classList.toggle("open"));
}

// ---------------- Boot ----------------
document.addEventListener("DOMContentLoaded", async () => {
  initMobileNav();
  await loadSettingsIntoChrome();

  const page = document.body.dataset.page;
  if (page === "home") await renderHomepage();
  if (page === "about") await renderAbout();
  if (page === "services") await renderServicesPage();
  if (page === "gallery") await renderGallery();
  if (page === "contact") { await renderContactPage(); await renderFaq(); }
});
