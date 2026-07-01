// ============================================================
// BARAKA COMPUTER — Admin Dashboard Logic
// Handles: auth guard, navigation, dark mode, and CRUD for
// every Firestore-backed CMS section.
// ============================================================

import { auth, db } from "../../js/firebase-config.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ---------------- Auth Guard ----------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    $("#whoAmI").textContent = user.email;
    initDashboard();
  }
});

$("#logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------------- Toast ----------------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------------- Theme ----------------
function initTheme() {
  const saved = localStorage.getItem("baraka-admin-theme") || "light";
  document.documentElement.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
  document.body.setAttribute("data-theme", saved);
  updateThemeBtn(saved);
  $("#themeToggle").addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", current);
    localStorage.setItem("baraka-admin-theme", current);
    updateThemeBtn(current);
  });
}
function updateThemeBtn(mode) {
  $("#themeToggle").textContent = mode === "dark" ? "☀️ লাইট মোড" : "🌙 ডার্ক মোড";
}

// ---------------- Navigation ----------------
function initNav() {
  const links = $$("#sideNav a");
  const titleMap = {
    overview: "ওভারভিউ", homepage: "হোমপেজ", about: "আমাদের সম্পর্কে", services: "সেবাসমূহ",
    gallery: "গ্যালারি", reviews: "রিভিউ", faq: "FAQ", notice: "নোটিশ", messages: "মেসেজ ইনবক্স", settings: "সেটিংস"
  };
  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const panel = link.dataset.panel;
      $$(".panel").forEach(p => p.classList.remove("active"));
      $(`#panel-${panel}`).classList.add("active");
      $("#panelTitle").textContent = titleMap[panel];
      $("#sidebar").classList.remove("open");
    });
  });
  $("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
}

// ---------------- Generic helpers ----------------
function fmtDate(ts) {
  try {
    if (!ts) return "-";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });
  } catch { return "-"; }
}
function escapeHtml(str = "") {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function clearForm(ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; }); }

// ---------------- HOMEPAGE ----------------
async function loadHomepageForm() {
  const snap = await getDoc(doc(db, "homepage/hero"));
  const d = snap.exists() ? snap.data() : {};
  $("#hp-title").value = d.title || "আপনার নির্ভরযোগ্য কম্পিউটার সেবা কেন্দ্র";
  $("#hp-subtitle").value = d.subtitle || "";
  $("#hp-buttonText").value = d.buttonText || "সেবাসমূহ দেখুন";
  $("#hp-buttonLink").value = d.buttonLink || "services.html";
  $("#hp-bannerImage").value = d.bannerImage || "images/banner.png";
}
$("#hp-save")?.addEventListener("click", async () => {
  await setDoc(doc(db, "homepage/hero"), {
    title: $("#hp-title").value.trim(),
    subtitle: $("#hp-subtitle").value.trim(),
    buttonText: $("#hp-buttonText").value.trim(),
    buttonLink: $("#hp-buttonLink").value.trim(),
    bannerImage: $("#hp-bannerImage").value.trim(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  await logActivity("হোমপেজ কন্টেন্ট আপডেট করা হয়েছে");
  toast("হোমপেজ সংরক্ষণ করা হয়েছে ✅");
});

// ---------------- ABOUT ----------------
async function loadAboutForm() {
  const snap = await getDoc(doc(db, "about/company"));
  const d = snap.exists() ? snap.data() : {};
  $("#ab-title").value = d.title || "আমাদের সম্পর্কে";
  $("#ab-description").value = d.description || "";
  $("#ab-mission").value = d.mission || "";
  $("#ab-vision").value = d.vision || "";
  $("#ab-image").value = d.image || "images/banner.png";
}
$("#ab-save")?.addEventListener("click", async () => {
  await setDoc(doc(db, "about/company"), {
    title: $("#ab-title").value.trim(),
    description: $("#ab-description").value.trim(),
    mission: $("#ab-mission").value.trim(),
    vision: $("#ab-vision").value.trim(),
    image: $("#ab-image").value.trim(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  await logActivity("এবাউট পেজ আপডেট করা হয়েছে");
  toast("সংরক্ষণ করা হয়েছে ✅");
});

// ---------------- SETTINGS ----------------
async function loadSettingsForm() {
  const snap = await getDoc(doc(db, "settings/website"));
  const d = snap.exists() ? snap.data() : {};
  $("#st-siteName").value = d.siteName || "BARAKA COMPUTER";
  $("#st-tagline").value = d.tagline || "সেবা, বিশ্বাস ও প্রযুক্তির নির্ভরযোগ্য প্রতিষ্ঠান";
  $("#st-phone").value = d.phone || "01917014656";
  $("#st-whatsapp").value = d.whatsapp || "01917014656";
  $("#st-email").value = d.email || "barakabd26@gmail.com";
  $("#st-address").value = d.address || "";
  $("#st-facebook").value = d.facebook || "";
  $("#st-youtube").value = d.youtube || "";
  $("#st-mapEmbed").value = d.mapEmbed || "";
  $("#st-logo").value = d.logo || "images/logo.png";
}
$("#st-save")?.addEventListener("click", async () => {
  await setDoc(doc(db, "settings/website"), {
    siteName: $("#st-siteName").value.trim(),
    tagline: $("#st-tagline").value.trim(),
    phone: $("#st-phone").value.trim(),
    whatsapp: $("#st-whatsapp").value.trim(),
    email: $("#st-email").value.trim(),
    address: $("#st-address").value.trim(),
    facebook: $("#st-facebook").value.trim(),
    youtube: $("#st-youtube").value.trim(),
    mapEmbed: $("#st-mapEmbed").value.trim(),
    logo: $("#st-logo").value.trim(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  await logActivity("ওয়েবসাইট সেটিংস আপডেট করা হয়েছে");
  toast("সেটিংস সংরক্ষণ করা হয়েছে ✅");
});

// ---------------- Generic CRUD factory for simple collections ----------------
// Used for: services, gallery, reviews, faq, notice
function makeCrud({ colName, prefix, fields, tableBody, renderRow, resetExtra }) {
  let cache = [];

  async function load() {
    const snap = await getDocs(collection(db, colName));
    cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cache.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const body = $(`#${tableBody}`);
    body.innerHTML = cache.length
      ? cache.map(renderRow).join("")
      : `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">কোনো তথ্য নেই</td></tr>`;

    $$(`#${tableBody} [data-edit]`).forEach(btn =>
      btn.addEventListener("click", () => editItem(btn.dataset.edit)));
    $$(`#${tableBody} [data-del]`).forEach(btn =>
      btn.addEventListener("click", () => deleteItem(btn.dataset.del)));

    return cache;
  }

  function editItem(id) {
    const item = cache.find(i => i.id === id);
    if (!item) return;
    $(`#${prefix}-id`).value = id;
    fields.forEach(f => { const el = $(`#${prefix}-${f}`); if (el) el.value = item[f] ?? ""; });
    $(`#${prefix}-cancel`).style.display = "inline-block";
    $(`#${prefix}-form-title`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function deleteItem(id) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান?")) return;
    await deleteDoc(doc(db, colName, id));
    await logActivity(`${colName} থেকে একটি আইটেম মুছে ফেলা হয়েছে`);
    toast("মুছে ফেলা হয়েছে");
    await load();
  }

  $(`#${prefix}-save`)?.addEventListener("click", async () => {
    const id = $(`#${prefix}-id`).value;
    const data = {};
    fields.forEach(f => {
      const el = $(`#${prefix}-${f}`);
      if (!el) return;
      data[f] = (f === "order" || f === "rating") ? Number(el.value || 0) : el.value.trim();
    });
    if (id) {
      await updateDoc(doc(db, colName, id), data);
      toast("আপডেট করা হয়েছে ✅");
    } else {
      await addDoc(collection(db, colName), data);
      toast("যুক্ত করা হয়েছে ✅");
    }
    await logActivity(`${colName} সেকশন আপডেট করা হয়েছে`);
    resetForm();
    await load();
  });

  function resetForm() {
    $(`#${prefix}-id`).value = "";
    fields.forEach(f => { const el = $(`#${prefix}-${f}`); if (el && el.tagName !== "SELECT") el.value = ""; });
    if (resetExtra) resetExtra();
    $(`#${prefix}-cancel`).style.display = "none";
  }
  $(`#${prefix}-cancel`)?.addEventListener("click", resetForm);

  return { load, getCache: () => cache };
}

const servicesCrud = makeCrud({
  colName: "services", prefix: "svc",
  fields: ["title", "icon", "price", "order", "image", "description", "status"],
  tableBody: "svc-table-body",
  renderRow: (s) => `
    <tr>
      <td>${s.image ? `<img class="thumb" src="${escapeHtml(s.image)}" onerror="this.style.opacity=0.2">` : "-"}</td>
      <td>${s.order ?? "-"}</td>
      <td>${escapeHtml(s.title || "")}</td>
      <td>${escapeHtml(s.price || "-")}</td>
      <td><span class="badge ${s.status === "inactive" ? "inactive" : "active"}">${s.status === "inactive" ? "নিষ্ক্রিয়" : "সক্রিয়"}</span></td>
      <td class="table-actions">
        <button class="btn btn-sm btn-secondary" data-edit="${s.id}">এডিট</button>
        <button class="btn btn-sm btn-danger" data-del="${s.id}">মুছুন</button>
      </td>
    </tr>`,
  resetExtra: () => { $("#svc-status").value = "active"; $("#svc-order").value = "1"; }
});

const galleryCrud = makeCrud({
  colName: "gallery", prefix: "gal",
  fields: ["imageUrl", "category", "order"],
  tableBody: "gal-table-body",
  renderRow: (g) => `
    <tr>
      <td><img class="thumb" src="${escapeHtml(g.imageUrl || "")}" onerror="this.style.opacity=0.2"></td>
      <td>${escapeHtml(g.category || "-")}</td>
      <td>${g.order ?? "-"}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-secondary" data-edit="${g.id}">এডিট</button>
        <button class="btn btn-sm btn-danger" data-del="${g.id}">মুছুন</button>
      </td>
    </tr>`,
  resetExtra: () => { $("#gal-order").value = "1"; }
});

const reviewsCrud = makeCrud({
  colName: "reviews", prefix: "rv",
  fields: ["name", "rating", "text", "status"],
  tableBody: "rv-table-body",
  renderRow: (r) => `
    <tr>
      <td>${escapeHtml(r.name || "")}</td>
      <td>${"★".repeat(Number(r.rating)||5)}</td>
      <td><span class="badge ${r.status === "inactive" ? "inactive" : "active"}">${r.status === "inactive" ? "লুকানো" : "প্রদর্শিত"}</span></td>
      <td class="table-actions">
        <button class="btn btn-sm btn-secondary" data-edit="${r.id}">এডিট</button>
        <button class="btn btn-sm btn-danger" data-del="${r.id}">মুছুন</button>
      </td>
    </tr>`,
  resetExtra: () => { $("#rv-status").value = "active"; $("#rv-rating").value = "5"; }
});

const faqCrud = makeCrud({
  colName: "faq", prefix: "faq",
  fields: ["question", "answer", "order"],
  tableBody: "faq-table-body",
  renderRow: (f) => `
    <tr>
      <td>${escapeHtml(f.question || "")}</td>
      <td>${f.order ?? "-"}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-secondary" data-edit="${f.id}">এডিট</button>
        <button class="btn btn-sm btn-danger" data-del="${f.id}">মুছুন</button>
      </td>
    </tr>`,
  resetExtra: () => { $("#faq-order").value = "1"; }
});

const noticeCrud = makeCrud({
  colName: "notice", prefix: "nt",
  fields: ["text", "status"],
  tableBody: "nt-table-body",
  renderRow: (n) => `
    <tr>
      <td>${escapeHtml(n.text || "")}</td>
      <td><span class="badge ${n.status === "inactive" ? "inactive" : "active"}">${n.status === "inactive" ? "নিষ্ক্রিয়" : "সক্রিয়"}</span></td>
      <td class="table-actions">
        <button class="btn btn-sm btn-secondary" data-edit="${n.id}">এডিট</button>
        <button class="btn btn-sm btn-danger" data-del="${n.id}">মুছুন</button>
      </td>
    </tr>`,
  resetExtra: () => { $("#nt-status").value = "active"; }
});

// ---------------- MESSAGES ----------------
async function loadMessages() {
  const snap = await getDocs(collection(db, "messages"));
  let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  const body = $("#msg-table-body");
  body.innerHTML = items.length ? items.map(m => `
    <tr>
      <td>${escapeHtml(m.name || "")}</td>
      <td>${escapeHtml(m.phone || "")}</td>
      <td style="max-width:260px; white-space:normal;">${escapeHtml(m.message || "")}</td>
      <td>${fmtDate(m.createdAt)}</td>
      <td><span class="badge ${m.read ? "active" : "unread"}">${m.read ? "পঠিত" : "নতুন"}</span></td>
      <td class="table-actions">
        ${!m.read ? `<button class="btn btn-sm btn-secondary" data-read="${m.id}">পঠিত করুন</button>` : ""}
        <button class="btn btn-sm btn-danger" data-delmsg="${m.id}">মুছুন</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">কোনো মেসেজ নেই</td></tr>`;

  $$("#msg-table-body [data-read]").forEach(btn => btn.addEventListener("click", async () => {
    await updateDoc(doc(db, "messages", btn.dataset.read), { read: true });
    await loadMessages();
    await loadStats();
  }));
  $$("#msg-table-body [data-delmsg]").forEach(btn => btn.addEventListener("click", async () => {
    if (!confirm("মেসেজটি মুছে ফেলতে চান?")) return;
    await deleteDoc(doc(db, "messages", btn.dataset.delmsg));
    await loadMessages();
    await loadStats();
  }));
  return items;
}

// ---------------- ACTIVITY LOG ----------------
async function logActivity(text) {
  try {
    await addDoc(collection(db, "activity"), { text, createdAt: serverTimestamp() });
  } catch (e) { /* non-critical */ }
}

// ---------------- OVERVIEW STATS ----------------
async function loadStats() {
  try {
    const [services, gallery, reviews, messages] = await Promise.all([
      getDocs(collection(db, "services")),
      getDocs(collection(db, "gallery")),
      getDocs(collection(db, "reviews")),
      getDocs(collection(db, "messages")),
    ]);
    $("#statServices").textContent = services.size;
    $("#statGallery").textContent = gallery.size;
    $("#statReviews").textContent = reviews.size;
    const unread = messages.docs.filter(d => !d.data().read).length;
    $("#statMessages").textContent = unread;
  } catch (e) { console.warn(e); }
}

// ---------------- Boot dashboard ----------------
async function initDashboard() {
  initTheme();
  initNav();
  await Promise.all([
    loadHomepageForm(),
    loadAboutForm(),
    loadSettingsForm(),
    servicesCrud.load(),
    galleryCrud.load(),
    reviewsCrud.load(),
    faqCrud.load(),
    noticeCrud.load(),
    loadMessages(),
    loadStats()
  ]);
}
