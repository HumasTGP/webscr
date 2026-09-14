const ACCOUNTS_KEY = "sicepat.accounts.v1";
const RESET_KEY = "sicepat.reset.v1";

const DEFAULT_ADMIN = {
  id: "sicepat-admin",
  email: "admin@sicepat.local",
  username: "admin",
  password: "admin",
  organization: "Administrator Si Cepat",
  role: "sicepat",
  isAdmin: true,
  active: true,
};

function normalizeAccounts(accounts) {
  const source = Array.isArray(accounts) ? accounts : [];
  const regularAccounts = source.filter((account) => !account?.isAdmin);

  // Selalu gunakan kredensial admin bawaan terbaru.
  return [DEFAULT_ADMIN, ...regularAccounts];
}

export function loadSiCepatAccounts() {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [DEFAULT_ADMIN];
    const parsed = JSON.parse(raw);
    const normalized = normalizeAccounts(parsed);
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (_) {
    return [DEFAULT_ADMIN];
  }
}

export function saveSiCepatAccounts(accounts) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(normalizeAccounts(accounts)));
}

export function registerSiCepatAccount({ email, username, password, organization }) {
  const accounts = loadSiCepatAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();
  if (accounts.some((a) => a.email?.toLowerCase() === cleanEmail)) return { ok: false, reason: "email" };
  if (accounts.some((a) => a.username?.toLowerCase() === cleanUsername.toLowerCase())) return { ok: false, reason: "username" };
  const account = {
    id: `SCP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    email: cleanEmail,
    username: cleanUsername,
    password,
    organization: organization.trim(),
    role: "sicepat",
    isAdmin: false,
    active: true,
    createdAt: new Date().toISOString(),
  };
  saveSiCepatAccounts([...accounts, account]);
  return { ok: true, account };
}

export function authenticateSiCepat(identity, password) {
  const key = identity.trim().toLowerCase();
  const account = loadSiCepatAccounts().find((a) =>
    (a.username?.toLowerCase() === key || a.email?.toLowerCase() === key) && a.password === password
  );
  if (!account) return { ok: false, reason: "wrong" };
  if (account.active === false) return { ok: false, reason: "inactive" };
  return { ok: true, account };
}

export function createResetLink(email) {
  const account = loadSiCepatAccounts().find((a) => a.email?.toLowerCase() === email.trim().toLowerCase() && !a.isAdmin);
  if (!account) return { ok: false };
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  const payload = { token, accountId: account.id, expiresAt: Date.now() + 30 * 60 * 1000 };
  window.localStorage.setItem(RESET_KEY, JSON.stringify(payload));
  const base = `${window.location.origin}${window.location.pathname}`;
  return { ok: true, link: `${base}#sicepat-reset=${token}`, token };
}

export function consumeResetToken(token, username, password) {
  try {
    const raw = window.localStorage.getItem(RESET_KEY);
    if (!raw) return { ok: false, reason: "invalid" };
    const payload = JSON.parse(raw);
    if (payload.token !== token || Date.now() > payload.expiresAt) return { ok: false, reason: "expired" };
    const accounts = loadSiCepatAccounts();
    if (accounts.some((a) => a.id !== payload.accountId && a.username?.toLowerCase() === username.trim().toLowerCase())) return { ok: false, reason: "username" };
    const next = accounts.map((a) => a.id === payload.accountId ? { ...a, username: username.trim(), password } : a);
    saveSiCepatAccounts(next);
    window.localStorage.removeItem(RESET_KEY);
    return { ok: true };
  } catch (_) {
    return { ok: false, reason: "invalid" };
  }
}

export function replaceSiCepatAccounts(accounts) {
  saveSiCepatAccounts(accounts);
}
