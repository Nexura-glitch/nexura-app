/**
 * data-service.js
 * ------------------------------------------------------------------
 * Capa de acceso a datos — ahora conectada a la API real de Nexura
 * (Node.js + Express + PostgreSQL/Supabase, desplegada en Render).
 *
 * Ninguna página necesita cambiar: todas siguen llamando únicamente
 * a `window.DataService.*`. Este archivo traduce esas llamadas en
 * peticiones HTTP autenticadas con JWT hacia la API real.
 * ------------------------------------------------------------------
 */

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const API_BASE = "https://nexura-backend-k7dc.onrender.com/api";

const STATUS_LABELS = {
  pending: "Pendiente",
  review: "En Revisión",
  verified: "Verificado",
  processing: "Procesando",
  transferred: "Transferido",
  completed: "Completado",
  cancelled: "Cancelado",
  rejected: "Cancelado",
};
const STATUS_ORDER = ["pending", "review", "verified", "processing", "transferred", "completed", "cancelled"];

/* =========================================================
   TOKENS
   ========================================================= */

function getClientToken() {
  return localStorage.getItem("nexura:token") || null;
}
function setClientToken(token) {
  if (token) localStorage.setItem("nexura:token", token);
  else localStorage.removeItem("nexura:token");
}
function getAdminToken() {
  return localStorage.getItem("nexura:admin-token") || null;
}
function setAdminToken(token) {
  if (token) localStorage.setItem("nexura:admin-token", token);
  else localStorage.removeItem("nexura:admin-token");
}
function isAdminMode() {
  return !!getAdminToken();
}

/* =========================================================
   FETCH HELPER
   ========================================================= */

async function apiFetch(path, { method = "GET", body, useAdminToken } = {}) {
  const token = useAdminToken === true ? getAdminToken() : useAdminToken === false ? getClientToken() : (isAdminMode() ? getAdminToken() : getClientToken());

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("No se pudo conectar con el servidor. Verifique su conexión.");
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || `Error ${res.status}`;
    throw new Error(message);
  }
  return data;
}

/* =========================================================
   MAPEADORES — snake_case (backend) -> camelCase (frontend)
   ========================================================= */

function initialsFromName(name) {
  return (name || "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function mapUser(row, cardsForUser, accessLogRows) {
  if (!row) return null;
  const name = `${row.first_name || ""} ${row.last_name || ""}`.trim();
  const debit = (cardsForUser || []).find((c) => c.card_type === "debito");
  const virtual = (cardsForUser || []).find((c) => c.card_type === "virtual");

  return {
    id: row.id,
    name,
    email: row.email,
    phone: row.phone || "",
    address: row.address || "",
    initials: initialsFromName(name),
    accountNumber: row.account_number,
    routingNumber: row.routing_number,
    accountTypeLabel: row.account_type || "Cuenta Corriente",
    balance: Number(row.balance) || 0,
    available: Number(row.available) || 0,
    verificationLevel: row.verification_level || "Pendiente",
    accountStatus: row.account_status || "Activa",
    twoFactorEnabled: !!row.two_factor_enabled,
    lastAccess: row.last_access,
    lastIP: row.last_ip,
    createdAt: row.created_at,
    accessLog: (accessLogRows || []).map((l) => ({ date: l.created_at, ip: l.ip_address })),
    debitCardActive: debit ? !!debit.is_active : true,
    debitCardFrozen: debit ? !!debit.is_frozen : false,
    cardFrozen: debit ? !!debit.is_frozen : false,
    virtualCardActive: virtual ? !!virtual.is_active : false,
    virtualCardFrozen: virtual ? !!virtual.is_frozen : false,
    debitLimit: debit ? Number(debit.spend_limit) || 0 : 1000,
    virtualLimit: virtual ? Number(virtual.spend_limit) || 0 : 300,
  };
}

function mapTransaction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: Number(row.amount) || 0,
    label: row.label,
    category: row.category,
    status: row.status,
    reference: row.reference,
    date: row.created_at,
  };
}

function mapTransfer(row) {
  return {
    id: row.id,
    userId: row.sender_id,
    reference: row.reference,
    beneficiaryName: row.beneficiary_name,
    beneficiaryAccount: row.receiver_account,
    beneficiaryBank: row.receiver_bank || "—",
    accountType: row.account_type || "Cuenta Corriente",
    transferType: row.transfer_type || "interna",
    scheduledDate: row.scheduled_date,
    amount: Number(row.amount) || 0,
    note: row.note || "",
    status: row.status,
    date: row.created_at,
  };
}

function mapNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: !!row.is_read,
    date: row.created_at,
  };
}

function mapDocument(row) {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.document_type,
    title: row.title,
    fileUrl: row.file_url,
    date: row.created_at,
  };
}

function mapBeneficiary(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    account: row.account_number,
    bank: row.bank || "",
    accountType: row.account_type || "Cuenta Corriente",
  };
}

/* =========================================================
   Ayudantes internos para la gestión de tarjetas
   ========================================================= */

async function getUserByIdAdmin(id) {
  const [users, cards] = await Promise.all([
    apiFetch("/users", { useAdminToken: true }),
    apiFetch("/cards", { useAdminToken: true }),
  ]);
  const row = users.find((u) => u.id === id);
  return mapUser(row, cards.filter((c) => c.user_id === id));
}

async function applyCardFields(userId, cardFields) {
  const admin = isAdminMode();
  const cards = admin
    ? await apiFetch(`/cards?userId=${encodeURIComponent(userId)}`, { useAdminToken: true })
    : await apiFetch("/cards/me", { useAdminToken: false });

  const debit = cards.find((c) => c.card_type === "debito");
  const virtual = cards.find((c) => c.card_type === "virtual");

  const debitPatch = {};
  if (cardFields.debitCardActive !== undefined) debitPatch.isActive = cardFields.debitCardActive;
  if (cardFields.debitCardFrozen !== undefined) debitPatch.isFrozen = cardFields.debitCardFrozen;
  if (cardFields.cardFrozen !== undefined) debitPatch.isFrozen = cardFields.cardFrozen;
  if (cardFields.debitLimit !== undefined) debitPatch.spendLimit = cardFields.debitLimit;

  const virtualPatch = {};
  if (cardFields.virtualCardActive !== undefined) virtualPatch.isActive = cardFields.virtualCardActive;
  if (cardFields.virtualCardFrozen !== undefined) virtualPatch.isFrozen = cardFields.virtualCardFrozen;
  if (cardFields.virtualLimit !== undefined) virtualPatch.spendLimit = cardFields.virtualLimit;

  const path = (cardId) => (admin ? `/cards/${cardId}/admin` : `/cards/${cardId}`);

  if (debit && Object.keys(debitPatch).length > 0) {
    await apiFetch(path(debit.id), { method: "PATCH", body: debitPatch, useAdminToken: admin });
  }
  if (virtual && Object.keys(virtualPatch).length > 0) {
    await apiFetch(path(virtual.id), { method: "PATCH", body: virtualPatch, useAdminToken: admin });
  }
}

/* =========================================================
   API pública — mismos nombres de método que antes
   ========================================================= */

const DataService = {
  STATUS_LABELS,
  STATUS_ORDER,

  async init() {
    /* La API real no necesita inicialización previa. */
  },

  /* ---------- SESIÓN ---------- */

  async setSession(userId) {
    if (!userId) setClientToken(null);
  },
  async getSession() {
    return getClientToken() ? "self" : null;
  },
  async setAdminSession(active) {
    if (!active) setAdminToken(null);
  },
  async getAdminSession() {
    return !!getAdminToken();
  },

  /* ---------- AUTENTICACIÓN ---------- */

  async login(email, password) {
    const data = await apiFetch("/auth/login", { method: "POST", body: { email, password }, useAdminToken: false });
    setClientToken(data.token);
    return mapUser(data.user);
  },

  async register({ firstName, lastName, email, password }) {
    const data = await apiFetch("/auth/register", { method: "POST", body: { firstName, lastName, email, password }, useAdminToken: false });
    setClientToken(data.token);
    return mapUser(data.user);
  },

  async adminLogin(email, password) {
    const data = await apiFetch("/auth/admin-login", { method: "POST", body: { email, password }, useAdminToken: false });
    setAdminToken(data.token);
    return data.admin;
  },

  /* ---------- USUARIOS ---------- */

  async getUsers() {
    const [users, cards] = await Promise.all([
      apiFetch("/users", { useAdminToken: true }),
      apiFetch("/cards", { useAdminToken: true }),
    ]);
    return users.map((u) => mapUser(u, cards.filter((c) => c.user_id === u.id)));
  },

  async getUser() {
    const [me, cards, log] = await Promise.all([
      apiFetch("/users/me", { useAdminToken: false }),
      apiFetch("/cards/me", { useAdminToken: false }),
      apiFetch("/users/me/access-log", { useAdminToken: false }),
    ]);
    return mapUser(me, cards, log);
  },

  async findUserByEmail() {
    return null;
  },

  async updateUser(id, fields) {
    const cardKeys = ["debitCardActive", "debitCardFrozen", "cardFrozen", "virtualCardActive", "virtualCardFrozen", "debitLimit", "virtualLimit"];
    const cardFields = {};
    const userFields = {};
    for (const [k, v] of Object.entries(fields)) {
      if (cardKeys.includes(k)) cardFields[k] = v;
      else userFields[k] = v;
    }

    if (Object.keys(cardFields).length > 0) {
      await applyCardFields(id, cardFields);
    }

    const userPayload = {};
    if (userFields.phone !== undefined) userPayload.phone = userFields.phone;
    if (userFields.address !== undefined) userPayload.address = userFields.address;
    if (userFields.twoFactorEnabled !== undefined) userPayload.twoFactorEnabled = userFields.twoFactorEnabled;
    if (userFields.balance !== undefined) userPayload.balance = userFields.balance;
    if (userFields.available !== undefined) userPayload.available = userFields.available;
    if (userFields.verificationLevel !== undefined) userPayload.verificationLevel = userFields.verificationLevel;
    if (userFields.accountStatus !== undefined) userPayload.accountStatus = userFields.accountStatus;

    if (Object.keys(userPayload).length > 0) {
      if (!isAdminMode()) {
        await apiFetch("/users/me", { method: "PATCH", body: userPayload, useAdminToken: false });
      } else {
        await apiFetch(`/users/${id}`, { method: "PATCH", body: userPayload, useAdminToken: true });
      }
    }

    return isAdminMode() ? await getUserByIdAdmin(id) : await DataService.getUser();
  },

  async createUser(fields) {
    const name = (fields.name || "").trim();
    const parts = name.split(" ");
    const firstName = parts[0] || "Cliente";
    const lastName = parts.slice(1).join(" ") || firstName;
    const tempPassword = "Nx" + Math.random().toString(36).slice(2, 10) + "!1";

    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: { firstName, lastName, email: fields.email, password: tempPassword },
      useAdminToken: false,
    });

    const patch = {};
    if (fields.balance) patch.balance = fields.balance;
    if (fields.available) patch.available = fields.available;
    if (Object.keys(patch).length > 0) {
      await apiFetch(`/users/${data.user.id}`, { method: "PATCH", body: patch, useAdminToken: true });
    }

    alert(`Cuenta creada.\n\nCorreo: ${fields.email}\nContraseña temporal: ${tempPassword}\n\nComparta esta contraseña con el cliente — no volverá a mostrarse.`);

    return mapUser({ ...data.user, ...patch });
  },

  async adjustFunds(userId, delta) {
    const direction = delta >= 0 ? "credit" : "debit";
    const amount = Math.abs(delta);
    const updated = await apiFetch(`/users/${userId}/adjust-funds`, {
      method: "POST",
      body: { amount, direction },
      useAdminToken: true,
    });
    return mapUser(updated);
  },

  /* ---------- BENEFICIARIOS ---------- */

  async getBeneficiaries() {
    const rows = await apiFetch("/beneficiaries/me", { useAdminToken: false });
    return rows.map(mapBeneficiary);
  },
  async addBeneficiary(fields) {
    const row = await apiFetch("/beneficiaries/me", {
      method: "POST",
      body: { name: fields.name, accountNumber: fields.account, bank: fields.bank, accountType: fields.accountType },
      useAdminToken: false,
    });
    return mapBeneficiary(row);
  },
  async updateBeneficiary(id, fields) {
    const body = {};
    if (fields.name !== undefined) body.name = fields.name;
    if (fields.account !== undefined) body.accountNumber = fields.account;
    if (fields.bank !== undefined) body.bank = fields.bank;
    if (fields.accountType !== undefined) body.accountType = fields.accountType;
    const row = await apiFetch(`/beneficiaries/${id}`, { method: "PATCH", body, useAdminToken: false });
    return mapBeneficiary(row);
  },
  async deleteBeneficiary(id) {
    await apiFetch(`/beneficiaries/${id}`, { method: "DELETE", useAdminToken: false });
  },

  /* ---------- TRANSACCIONES ---------- */

  async getTransactions(userId) {
    if (!isAdminMode()) {
      const rows = await apiFetch("/transactions/me", { useAdminToken: false });
      return rows.map(mapTransaction);
    }
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const rows = await apiFetch(`/transactions${qs}`, { useAdminToken: true });
    return rows.map(mapTransaction);
  },

  async addTransaction(fields) {
    const row = await apiFetch("/transactions", {
      method: "POST",
      body: { userId: fields.userId, type: fields.type, amount: fields.amount, label: fields.label, category: fields.category },
      useAdminToken: true,
    });
    return mapTransaction(row);
  },

  async updateTransaction() {
    throw new Error("La edición de movimientos ya registrados no está disponible. Elimine el movimiento y cree uno nuevo si necesita corregirlo.");
  },

  async deleteTransaction(id) {
    const all = await apiFetch("/transactions", { useAdminToken: true });
    const txn = all.find((t) => t.id === id);
    if (txn) {
      const reverseDelta = txn.type === "credit" ? -Number(txn.amount) : Number(txn.amount);
      await DataService.adjustFunds(txn.user_id, reverseDelta);
    }
    await apiFetch(`/transactions/${id}`, { method: "DELETE", useAdminToken: true });
  },

  /* ---------- TRANSFERENCIAS ---------- */

  async getTransfers(userId) {
    if (!isAdminMode()) {
      const rows = await apiFetch("/transfers/me", { useAdminToken: false });
      return rows.map(mapTransfer);
    }
    const rows = await apiFetch("/transfers", { useAdminToken: true });
    const filtered = userId ? rows.filter((r) => r.sender_id === userId) : rows;
    return filtered.map(mapTransfer);
  },

  async createTransfer(fields) {
    if (isAdminMode()) {
      const row = await apiFetch("/transfers", {
        method: "POST",
        body: {
          userId: fields.userId, beneficiaryName: fields.beneficiaryName, receiverAccount: fields.beneficiaryAccount,
          receiverBank: fields.beneficiaryBank, accountType: fields.accountType, amount: fields.amount,
          status: fields.status || "pending", note: fields.note,
        },
        useAdminToken: true,
      });
      return mapTransfer(row);
    }
    const row = await apiFetch("/transfers/me", {
      method: "POST",
      body: {
        beneficiaryName: fields.beneficiaryName, receiverAccount: fields.beneficiaryAccount,
        receiverBank: fields.beneficiaryBank, accountType: fields.accountType, amount: fields.amount,
        transferType: fields.transferType || "interna", scheduledDate: fields.scheduledDate || null, note: fields.note,
      },
      useAdminToken: false,
    });
    return mapTransfer(row);
  },

  async updateTransferStatus(id, status) {
    const row = await apiFetch(`/transfers/${id}/status`, { method: "PATCH", body: { status }, useAdminToken: true });
    return mapTransfer(row);
  },

  /* ---------- NOTIFICACIONES ---------- */

  async getNotifications(userId) {
    if (!isAdminMode()) {
      const rows = await apiFetch("/notifications/me", { useAdminToken: false });
      return rows.map(mapNotification);
    }
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const rows = await apiFetch(`/notifications${qs}`, { useAdminToken: true });
    return rows.map(mapNotification);
  },
  async addNotification(fields) {
    const row = await apiFetch("/notifications", {
      method: "POST",
      body: { userId: fields.userId, type: fields.type, title: fields.title, message: fields.message },
      useAdminToken: true,
    });
    return mapNotification(row);
  },
  async updateNotification(id, fields) {
    const row = await apiFetch(`/notifications/${id}`, { method: "PATCH", body: fields, useAdminToken: true });
    return mapNotification(row);
  },
  async markNotificationRead(id) {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH", useAdminToken: false });
  },
  async markAllRead() {
    await apiFetch("/notifications/me/read-all", { method: "PATCH", useAdminToken: false });
  },
  async deleteNotification(id) {
    await apiFetch(`/notifications/${id}`, { method: "DELETE", useAdminToken: true });
  },

  /* ---------- DOCUMENTOS ---------- */

  async getDocuments(userId) {
    if (!isAdminMode()) {
      const rows = await apiFetch("/documents/me", { useAdminToken: false });
      return rows.map(mapDocument);
    }
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const rows = await apiFetch(`/documents${qs}`, { useAdminToken: true });
    return rows.map(mapDocument);
  },
  async addDocument(fields) {
    const row = await apiFetch("/documents", {
      method: "POST",
      body: { userId: fields.userId, documentType: fields.category, title: fields.title },
      useAdminToken: true,
    });
    return mapDocument(row);
  },
  async deleteDocument(id) {
    await apiFetch(`/documents/${id}`, { method: "DELETE", useAdminToken: true });
  },

  /* ---------- ESTADÍSTICAS (admin) ---------- */

  async getGlobalStats() {
    return apiFetch("/stats/overview", { useAdminToken: true });
  },
};

window.DataService = DataService;
