# BARAKA COMPUTER — Website + Admin CMS

A complete, working website + admin content management system for **Baraka Computer**, built with plain HTML/CSS/JavaScript, Firebase Authentication, and Firebase Firestore. Hosted for free on GitHub Pages.

---

## ✅ What's included (working, not a demo)

- **Public website**: Home, About, Services, Gallery, Contact — all pulling live content from Firestore, with safe fallback content so the site never looks broken.
- **Admin panel** (`/admin`): real email/password login, dashboard with sidebar navigation, dark mode, and full add/edit/delete for:
  - Homepage hero section
  - About section
  - Services (with search on the public site)
  - Gallery
  - Reviews
  - FAQ
  - Notice bar
  - Website settings (phone, email, address, social links, map, logo)
  - Contact form inbox (messages sent by visitors)
- **Contact form** on the website that writes directly into Firestore, visible in the admin inbox.
- **Firestore security rules** (`firestore.rules`) so the site is genuinely safe to put online.

## ⚠️ What is intentionally NOT included (be aware)

This is a **minimal end-to-end version**, not the full 50–70 file mega-CMS originally scoped. On purpose, to give you something that actually works today:

- **No image upload button.** You said you want images stored directly in the GitHub repo, so there's no Cloudinary/upload integration. To add a photo: put the file in the `images/` folder (or `images/gallery/` for gallery photos) in your GitHub repo, then type that path into the admin form (e.g. `images/gallery/shop1.jpg`). Explained below.
- **No multi-admin roles.** Any account you create in Firebase Authentication has full admin access. There's no "Super Admin vs Admin" permission matrix. Good enough for one shop owner; easy to extend later if you hire staff.
- **No visitor analytics dashboard.** Firebase/Google Analytics can be added later, but isn't wired up here.
- **No offline/service-worker caching**, just a basic `manifest.json` so it can be "Added to Home Screen."

If you need any of the above, ask and it can be added on top of this — the foundation here won't need to be rebuilt.

---

## 📁 Project structure

```
Baraka-Computer/
├── index.html          (Home page)
├── about.html
├── services.html
├── gallery.html
├── contact.html
├── 404.html
├── manifest.json
├── robots.txt
├── sitemap.xml
├── firestore.rules      ← copy into Firebase Console → Firestore → Rules
├── css/
│   └── style.css
├── js/
│   ├── firebase-config.js   ← your Firebase keys live here (already filled in)
│   └── site.js               (loads all dynamic content on the public site)
├── images/
│   ├── logo.png
│   ├── banner.png
│   └── gallery/              ← put your gallery photos here
└── admin/
    ├── index.html    (Login page)
    ├── dashboard.html
    ├── css/admin.css
    └── js/
        ├── auth.js
        └── dashboard.js
```

---

## 🚀 Step 1 — Create your admin login

Your Firebase project (`baraka-computer-c2524`) is already configured in `js/firebase-config.js` — you don't need to touch that file.

1. Go to the [Firebase Console](https://console.firebase.google.com/) → your project → **Authentication** → **Users** tab.
2. Click **Add user**.
3. Enter the email and password you (the shop owner) will log in with, e.g. `barakabd26@gmail.com` + a strong password.
4. Save.

That's your one and only admin login — use it at `yoursite.com/admin/`.

---

## 🚀 Step 2 — Set up Firestore Security Rules

1. Firebase Console → **Firestore Database** → **Rules** tab.
2. Delete everything there and paste in the entire contents of `firestore.rules` from this project.
3. Click **Publish**.

Without this step, your Firestore data will either be wide open or completely locked — this file makes it "public can read, only logged-in admin can write."

---

## 🚀 Step 3 — Upload to GitHub and enable GitHub Pages

1. Create a new repository on GitHub (e.g. `baraka-computer`).
2. Upload **all files in this folder** to that repository (drag-and-drop on github.com works fine, or `git push` if you're comfortable with Git).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**, branch: `main`, folder: `/ (root)`. Save.
5. GitHub will give you a live URL like `https://yourusername.github.io/baraka-computer/`. It takes 1–2 minutes to go live.

Your site is now live and your admin panel is at:
`https://yourusername.github.io/baraka-computer/admin/`

---

## 🖼️ How to add images (since images live in the repo, not Cloudinary)

**Logo / banner:** already included at `images/logo.png` and `images/banner.png` from the designs you provided.

**To add a new gallery photo:**
1. On GitHub, open the `images/gallery` folder in your repo (create it if it doesn't exist) → **Add file → Upload files** → upload your photo, e.g. `shop-front.jpg`.
2. Wait ~1 minute for GitHub Pages to redeploy.
3. Go to your admin panel → **গ্যালারি (Gallery)** → enter the path `images/gallery/shop-front.jpg` → Save.

Same idea applies to the homepage banner or about-page image — upload the file to `images/`, then type its path into the relevant admin form field.

---

## ✏️ Editing content day-to-day

Once steps 1–3 above are done, you (or the shop owner) never need to touch code again:

1. Go to `yoursite.com/admin/`
2. Log in
3. Use the sidebar to edit Homepage text, About text, Services, Gallery, Reviews, FAQ, Notice bar, or Settings (phone/email/address/social links).
4. Changes save to Firestore immediately and appear on the live website on next page load — no rebuild or redeploy needed.

---

## 🔒 A note on security

- The Firebase config values (`apiKey`, etc.) being visible in the JavaScript is **normal and expected** for Firebase web apps — they are not secret keys. Real security comes from the Firestore Rules file, which is why Step 2 matters.
- Keep your admin password private — anyone with it can edit all site content.
- If you ever suspect the password is compromised, go to Firebase Console → Authentication → Users → reset or delete the account.

---

## 🧩 Extending this later

Natural next additions, each addable without rebuilding what's here:
- Cloudinary or Firebase Storage image uploads (drag-and-drop instead of typing paths)
- Multiple staff logins with a `users` collection + role field
- Visitor analytics
- Email notifications when a new contact message arrives (requires a small Cloud Function)

---

Built for **Baraka Computer** — Sonargaon Govt. College Road, Mograpara Chowrasta, Sonargaon, Narayanganj. 📞 01917014656 · ✉️ barakabd26@gmail.com
