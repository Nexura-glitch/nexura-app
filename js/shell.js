/**
 * shell.js — elementos de interfaz compartidos entre las páginas del cliente.
 */

const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="11" width="8" height="10" rx="2"/><rect x="3" y="14" width="8" height="7" rx="2"/></svg>`,
  transfer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 7h13l-4-4M17 17H4l4 4"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l4 2"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 3.5v5c0 5-3.4 8.5-8 9.5-4.6-1-8-4.5-8-9.5v-5L12 3z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`,
  card: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>`,
  users2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>`,
  up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg>`,
  down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7l10 10M17 7v10H7"/></svg>`,
};

const NAV_ITEMS = [
  { key: "dashboard", href: "dashboard.html", label: "Panel Principal", icon: "dashboard" },
  { key: "transfer", href: "transfer.html", label: "Transferencias", icon: "transfer" },
  { key: "cards", href: "cards.html", label: "Tarjetas", icon: "card" },
  { key: "history", href: "history.html", label: "Historial", icon: "history" },
  { key: "documents", href: "documents.html", label: "Documentos", icon: "doc" },
  { key: "notifications", href: "notifications.html", label: "Notificaciones", icon: "bell" },
  { key: "profile", href: "profile.html", label: "Perfil", icon: "user" },
];

function fmtUSD(n) {
  const sign = n < 0 ? "-" : "";
  const val = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${val}`;
}

function fmtAmountParts(n) {
  const [intPart, dec] = Math.abs(n).toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return { sign: n < 0 ? "-" : "", int: grouped, dec };
}

function pad(n) { return String(n).padStart(2, "0"); }

function fmtDate(iso) {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function fmtDateTime(iso) {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`;
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "hace un instante";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)} d`;
  return fmtDate(iso);
}

function initials(name) {
  return (name || "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function maskAccount(num) {
  if (!num) return "—";
  const digits = num.replace(/\s/g, "");
  return `•••• ${digits.slice(-4)}`;
}

function applyStoredTheme() {
  const saved = localStorage.getItem("nexura:theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  return saved;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("nexura:theme", next);
  return next;
}

function skeletonRows(count = 4) {
  let html = "";
  for (let i = 0; i < count; i++) {
    html += `<div class="skeleton-row">
      <div class="skeleton skeleton-circle"></div>
      <div style="flex:1;">
        <div class="skeleton skeleton-line" style="width:${55 + (i % 3) * 10}%;"></div>
        <div class="skeleton skeleton-line" style="width:35%; height:10px; margin-bottom:0;"></div>
      </div>
    </div>`;
  }
  return html;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toast(message, type = "success") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>`,
  };
  const el = document.createElement("div");
  el.className = `toast ${type === "error" ? "error" : type === "info" ? "info" : ""}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.success}</span><span>${message}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s, transform .3s";
    el.style.opacity = "0";
    el.style.transform = "translateX(20px) scale(0.96)";
    setTimeout(() => el.remove(), 320);
  }, 3600);
}

async function requireClientSession() {
  await window.DataService.init();
  const sessionId = await window.DataService.getSession();
  if (!sessionId) {
    window.location.href = "index.html";
    return null;
  }
  const user = await window.DataService.getUser(sessionId);
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

async function requireAdminSession() {
  await window.DataService.init();
  const active = await window.DataService.getAdminSession();
  if (!active) {
    window.location.href = "../index.html";
    return false;
  }
  return true;
}

async function renderShell(activeKey, user) {
  const unread = (await window.DataService.getNotifications(user.id)).filter((n) => !n.read).length;

  const nav = NAV_ITEMS.map(
    (item) => `
      <a class="nav-item ${item.key === activeKey ? "active" : ""}" href="${item.href}">
        ${ICONS[item.icon]}<span>${item.label}</span>
      </a>`
  ).join("");

  document.getElementById("shell-sidebar").innerHTML = `
    <div class="brand">
      <div class="brand-mark"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" style="width:100%;height:100%;display:block;"><defs><linearGradient id="nexuraGrad" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f0c17e"/><stop offset="1" stop-color="#c9793c"/></linearGradient></defs><rect x="1" y="1" width="46" height="46" rx="13" fill="url(#nexuraGrad)"/><path d="M15 34V14.6c0-.9 1.08-1.36 1.73-.73L32 28.7V14" stroke="#14161a" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></div>
      <div>
        <div class="brand-name">Nexura</div>
        <div class="brand-tag">Banking</div>
      </div>
    </div>
    <div class="nav-group">
      <div class="nav-label">Cuenta</div>
      ${nav}
    </div>
    <div class="sidebar-foot">
      <div class="sandbox-pill"><span class="dot"></span> Entorno de Prueba</div>
    </div>
  `;

  const topRight = document.getElementById("shell-topbar-right");
  if (topRight) {
    topRight.innerHTML = `
      <button class="icon-btn theme-toggle-btn" id="theme-toggle-btn" title="Cambiar tema">
        <span class="icon-sun">${ICONS.sun}</span><span class="icon-moon">${ICONS.moon}</span>
      </button>
      <button class="icon-btn" id="notif-shortcut" title="Notificaciones">
        ${ICONS.bell}
        ${unread > 0 ? `<span class="badge-dot">${unread}</span>` : ""}
      </button>
      <button class="icon-btn" id="logout-btn" title="Cerrar sesión">${ICONS.logout}</button>
      <div class="avatar" title="${user.name}">${user.initials || initials(user.name)}</div>
    `;
    document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);
    document.getElementById("notif-shortcut").addEventListener("click", () => (window.location.href = "notifications.html"));
    document.getElementById("logout-btn").addEventListener("click", async () => {
      await window.DataService.setSession(null);
      window.location.href = "index.html";
    });
  }
}

window.Shell = {
  ICONS,
  fmtUSD,
  fmtAmountParts,
  fmtDate,
  fmtTime,
  fmtDateTime,
  timeAgo,
  initials,
  maskAccount,
  toast,
  skeletonRows,
  wait,
  applyStoredTheme,
  toggleTheme,
  requireClientSession,
  requireAdminSession,
  renderShell,
};

/**
 * ---------------------------------------------------------------
 * A continuación: utilidades del portal administrador (antes en
 * admin-shell.js, fusionadas aquí para simplificar el despliegue).
 * ---------------------------------------------------------------
 */

const ADMIN_NAV = [
  { key: "dashboard", href: "dashboard.html", label: "Resumen General", icon: "dashboard" },
  { key: "users", href: "users.html", label: "Usuarios", icon: "users" },
  { key: "transfers", href: "transfers.html", label: "Transferencias", icon: "transfer" },
  { key: "transactions", href: "transactions.html", label: "Movimientos", icon: "history" },
  { key: "cards", href: "cards.html", label: "Tarjetas", icon: "card" },
  { key: "documents", href: "documents.html", label: "Documentos", icon: "doc" },
  { key: "notifications", href: "notifications.html", label: "Notificaciones", icon: "bell" },
];

const ADMIN_ICONS = {
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

async function renderAdminShell(activeKey) {
  const nav = ADMIN_NAV.map(
    (item) => `
      <a class="nav-item ${item.key === activeKey ? "active" : ""}" href="${item.href}">
        ${ADMIN_ICONS[item.icon] || Shell.ICONS[item.icon]}<span>${item.label}</span>
      </a>`
  ).join("");

  const adminLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" style="width:70%;height:70%;color:#0a1520;"><rect x="1" y="1" width="46" height="46" rx="13" fill="none" stroke="currentColor" stroke-width="2" opacity="0.25"/><path d="M15 34V14.6c0-.9 1.08-1.36 1.73-.73L32 28.7V14" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

  document.getElementById("shell-sidebar").innerHTML = `
    <div class="brand">
      <div class="brand-mark" style="background:linear-gradient(135deg,#6cc4e8,#3f7fa8);">${adminLogo}</div>
      <div>
        <div class="brand-name">Nexura</div>
        <div class="brand-tag">Administración</div>
      </div>
    </div>
    <div class="nav-group">
      <div class="nav-label">Gestión</div>
      ${nav}
    </div>
    <div class="sidebar-foot">
      <a href="../dashboard.html" class="nav-item" style="margin-bottom:8px;">${Shell.ICONS.dashboard}<span>Portal del Cliente</span></a>
      <div class="sandbox-pill"><span class="dot"></span> Entorno de Prueba</div>
    </div>
  `;

  const topRight = document.getElementById("shell-topbar-right");
  if (topRight) {
    topRight.innerHTML = `
      <button class="icon-btn theme-toggle-btn" id="theme-toggle-btn" title="Cambiar tema">
        <span class="icon-sun">${Shell.ICONS.sun}</span><span class="icon-moon">${Shell.ICONS.moon}</span>
      </button>
      <button class="icon-btn" id="admin-logout-btn" title="Salir de la administración">${Shell.ICONS.logout}</button>
      <div class="avatar" title="Administrador">AD</div>
    `;
    document.getElementById("theme-toggle-btn").addEventListener("click", Shell.toggleTheme);
    document.getElementById("admin-logout-btn").addEventListener("click", async () => {
      await DataService.setAdminSession(false);
      window.location.href = "../index.html";
    });
  }
}

window.AdminShell = { renderAdminShell, ADMIN_NAV };
