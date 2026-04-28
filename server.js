/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║   KRUPA BOUTIQUE — Backend Server v2.0                   ║
 * ║   Node.js only — ZERO npm dependencies required          ║
 * ║   File-based JSON database (db.json)                     ║
 * ║   JWT Authentication + API Key security                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 *  HOW TO RUN:
 *    node server.js
 *    Open http://localhost:3000
 *
 *  DEPLOY FREE:
 *    Glitch.com   — paste this file, instant URL
 *    Railway.app  — GitHub → auto deploy
 *    Render.com   — free 750hr/month Node hosting
 */
'use strict';

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const url    = require('url');

// ── Configuration ──────────────────────────────────────────
const PORT       = process.env.PORT || 3000;
const DB_FILE    = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'KrupaBoutique_JWT_Secret_2026_!@#$';
const API_KEY    = process.env.API_KEY    || 'KB-2026-a7f3d9e2c1b8f5a4-krupaboutique';

// ── Database ────────────────────────────────────────────────
function dbRead() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (_) {}
  return dbCreate();
}

function dbWrite(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function dbCreate() {
  const db = {
    boutique: {
      name: 'Krupa Boutique',
      owner: 'Admin',
      email: 'krupaboutique@gmail.com',
      phone: '09979430978',
      address: '132, 1st floor, RADHE SQUARE, above cake bar, nr. Reliance Cross Road, Kudasan, Gandhinagar, Gujarat 382419',
      gst: '',
      logo: '✂️',
      whatsapp: 'https://wa.me/919979430978?text=Hi%2C%20I%20want%20to%20book%20an%20appointment%20at%20Krupa%20Boutique',
      calendar: 'https://calendar.google.com/calendar/u/0/r?authuser=krupaboutique@gmail.com'
    },
    admin: { email: 'krupaboutique@gmail.com', pass: 'admin123' },
    orders: [],
    customers: [],
    tailors: [],
    appointments: [],
    expenses: [],
    attendance: []
  };
  dbWrite(db);
  return db;
}

// ── Helpers ─────────────────────────────────────────────────
const uid = () => crypto.randomBytes(5).toString('hex');

function jwtSign(payload) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 })).toString('base64url');
  const s = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}

function jwtVerify(token) {
  try {
    const [h, p, s] = (token || '').split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url');
    if (s !== expected) return null;
    const pl = JSON.parse(Buffer.from(p, 'base64url').toString());
    return pl.exp > Date.now() ? pl : null;
  } catch (_) { return null; }
}

function readBody(req) {
  return new Promise(resolve => {
    let d = '';
    req.on('data', c => { d += c; });
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch (_) { resolve({}); } });
  });
}

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  });
  res.end(body);
}

function sendFile(res, filePath, mime) {
  try {
    res.writeHead(200, { 'Content-Type': mime || 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    res.writeHead(404); res.end('Not found');
  }
}

// ── Auth helpers ────────────────────────────────────────────
function getUser(req) {
  const auth = req.headers['authorization'] || '';
  return jwtVerify(auth.startsWith('Bearer ') ? auth.slice(7) : '');
}
const adminOnly = req => { const u = getUser(req); return u && u.role === 'admin' ? u : null; };
const anyUser   = req => getUser(req);

// ── Main router ─────────────────────────────────────────────
async function router(req, res) {
  const { pathname } = url.parse(req.url);
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    });
    return res.end();
  }

  // Serve frontend
  if (method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    return sendFile(res, path.join(__dirname, 'index.html'));
  }

  // Health check (no auth needed)
  if (method === 'GET' && pathname === '/health') {
    return send(res, 200, { ok: true, time: new Date().toISOString(), version: '2.0' });
  }

  // All /api/* routes require API key
  if (pathname.startsWith('/api/')) {
    if (req.headers['x-api-key'] !== API_KEY) {
      return send(res, 401, { error: 'Invalid or missing X-API-Key header' });
    }
  }

  const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(req) : {};
  const db = dbRead();
  const seg = pathname.split('/').filter(Boolean);
  const [, resource, id, sub] = seg;

  // ══ AUTH ══════════════════════════════════════════════════

  if (method === 'POST' && pathname === '/api/auth/login/admin') {
    const { email, pass } = body;
    if (email !== db.admin.email || pass !== db.admin.pass)
      return send(res, 401, { error: 'Wrong email or password' });
    const token = jwtSign({ role: 'admin', email });
    return send(res, 200, { ok: true, token, role: 'admin', apiKey: API_KEY });
  }

  if (method === 'POST' && pathname === '/api/auth/login/tailor') {
    const { phone, pass } = body;
    const t = db.tailors.find(t => t.phone === phone && t.password === pass && t.status === 'Active');
    if (!t) return send(res, 401, { error: 'Wrong phone/password or account inactive' });
    const token = jwtSign({ role: 'tailor', id: t.id, name: t.name, phone });
    return send(res, 200, { ok: true, token, role: 'tailor', id: t.id, name: t.name, speciality: t.speciality, apiKey: API_KEY });
  }

  // ══ BOUTIQUE ══════════════════════════════════════════════

  if (pathname === '/api/boutique') {
    if (!anyUser(req)) return send(res, 401, { error: 'Not authenticated' });
    if (method === 'GET') return send(res, 200, db.boutique);
    if (method === 'PUT') {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      db.boutique = { ...db.boutique, ...body };
      dbWrite(db);
      return send(res, 200, { ok: true, boutique: db.boutique });
    }
  }

  if (method === 'PUT' && pathname === '/api/boutique/password') {
    if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
    if (!body.pass || body.pass.length < 4) return send(res, 400, { error: 'Password min 4 chars' });
    db.admin.pass = body.pass;
    dbWrite(db);
    return send(res, 200, { ok: true });
  }

  // ══ ORDERS ════════════════════════════════════════════════

  if (resource === 'orders') {
    const user = anyUser(req);
    if (!user) return send(res, 401, { error: 'Not authenticated' });

    // GET all
    if (method === 'GET' && !id) {
      let orders = db.orders;
      if (user.role === 'tailor') orders = orders.filter(o => o.assigned_to === user.id);
      return send(res, 200, orders);
    }
    // GET one
    if (method === 'GET' && id && !sub) {
      const o = db.orders.find(o => o.id === id);
      if (!o) return send(res, 404, { error: 'Not found' });
      if (user.role === 'tailor' && o.assigned_to !== user.id) return send(res, 403, { error: 'Not your order' });
      return send(res, 200, o);
    }
    // POST create
    if (method === 'POST' && !id) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const o = { id: uid(), created_at: new Date().toISOString(), status: 'Received', remarks: [], ...body };
      db.orders.push(o);
      dbWrite(db);
      return send(res, 201, { ok: true, order: o });
    }
    // PUT update
    if (method === 'PUT' && id && !sub) {
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx === -1) return send(res, 404, { error: 'Not found' });
      if (user.role === 'tailor') {
        if (db.orders[idx].assigned_to !== user.id) return send(res, 403, { error: 'Not your order' });
        if (body.status)  db.orders[idx].status  = body.status;
        if (body.remarks) db.orders[idx].remarks = body.remarks;
      } else {
        db.orders[idx] = { ...db.orders[idx], ...body, id };
      }
      dbWrite(db);
      return send(res, 200, { ok: true, order: db.orders[idx] });
    }
    // DELETE
    if (method === 'DELETE' && id && !sub) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      db.orders = db.orders.filter(o => o.id !== id);
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
    // POST /orders/:id/remark
    if (method === 'POST' && id && sub === 'remark') {
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx === -1) return send(res, 404, { error: 'Not found' });
      if (user.role === 'tailor' && db.orders[idx].assigned_to !== user.id)
        return send(res, 403, { error: 'Not your order' });
      if (!body.text) return send(res, 400, { error: 'text required' });
      const remark = { id: uid(), role: user.role, name: user.name || 'Admin', text: body.text, ts: new Date().toISOString() };
      if (!db.orders[idx].remarks) db.orders[idx].remarks = [];
      db.orders[idx].remarks.push(remark);
      dbWrite(db);
      return send(res, 200, { ok: true, remark });
    }
  }

  // ══ CUSTOMERS ═════════════════════════════════════════════

  if (resource === 'customers') {
    const user = anyUser(req);
    if (!user) return send(res, 401, { error: 'Not authenticated' });

    if (method === 'GET' && !id) {
      let custs = db.customers;
      if (user.role === 'tailor') {
        const myIds = new Set(db.orders.filter(o => o.assigned_to === user.id).map(o => o.cust_id));
        custs = custs.filter(c => myIds.has(c.id)).map(c => ({ id: c.id, name: c.name, phone: c.phone, city: c.city }));
      }
      return send(res, 200, custs);
    }
    if (method === 'GET' && id) {
      const c = db.customers.find(c => c.id === id);
      if (!c) return send(res, 404, { error: 'Not found' });
      return send(res, 200, c);
    }
    if (method === 'POST' && !id) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const c = { id: uid(), join_date: new Date().toISOString().slice(0, 10), ...body };
      db.customers.push(c);
      dbWrite(db);
      return send(res, 201, { ok: true, customer: c });
    }
    if (method === 'PUT' && id) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const idx = db.customers.findIndex(c => c.id === id);
      if (idx === -1) return send(res, 404, { error: 'Not found' });
      db.customers[idx] = { ...db.customers[idx], ...body, id };
      dbWrite(db);
      return send(res, 200, { ok: true, customer: db.customers[idx] });
    }
    if (method === 'DELETE' && id) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      db.customers = db.customers.filter(c => c.id !== id);
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
  }

  // ══ TAILORS ═══════════════════════════════════════════════

  if (resource === 'tailors') {
    const user = anyUser(req);
    if (!user) return send(res, 401, { error: 'Not authenticated' });

    // GET /tailors/me
    if (method === 'GET' && id === 'me') {
      if (user.role !== 'tailor') return send(res, 403, { error: 'Tailor only' });
      const t = db.tailors.find(t => t.id === user.id);
      if (!t) return send(res, 404, { error: 'Not found' });
      const { password, ...safe } = t;
      return send(res, 200, safe);
    }
    // GET all (admin)
    if (method === 'GET' && !id) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      return send(res, 200, db.tailors.map(({ password, ...t }) => t));
    }
    // GET one (admin)
    if (method === 'GET' && id && id !== 'me' && !sub) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const t = db.tailors.find(t => t.id === id);
      if (!t) return send(res, 404, { error: 'Not found' });
      const { password, ...safe } = t;
      return send(res, 200, safe);
    }
    // POST create
    if (method === 'POST' && !id) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const t = { id: uid(), join_date: new Date().toISOString().slice(0, 10), status: 'Active', payments: [], ...body };
      db.tailors.push(t);
      dbWrite(db);
      const { password, ...safe } = t;
      return send(res, 201, { ok: true, tailor: safe });
    }
    // PUT update
    if (method === 'PUT' && id && !sub) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const idx = db.tailors.findIndex(t => t.id === id);
      if (idx === -1) return send(res, 404, { error: 'Not found' });
      db.tailors[idx] = { ...db.tailors[idx], ...body, id };
      dbWrite(db);
      const { password, ...safe } = db.tailors[idx];
      return send(res, 200, { ok: true, tailor: safe });
    }
    // DELETE
    if (method === 'DELETE' && id && !sub) {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      db.tailors = db.tailors.filter(t => t.id !== id);
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
    // POST /tailors/:id/payment
    if (method === 'POST' && id && sub === 'payment') {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const idx = db.tailors.findIndex(t => t.id === id);
      if (idx === -1) return send(res, 404, { error: 'Not found' });
      if (!body.amount || !body.type) return send(res, 400, { error: 'type and amount required' });
      const payment = { id: uid(), ts: new Date().toISOString(), ...body };
      if (!db.tailors[idx].payments) db.tailors[idx].payments = [];
      db.tailors[idx].payments.push(payment);
      dbWrite(db);
      return send(res, 200, { ok: true, payment });
    }
    // GET /tailors/:id/attendance
    if (method === 'GET' && id && sub === 'attendance') {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const rec = db.attendance.filter(a => a.tailor_id === id);
      return send(res, 200, rec);
    }
    // POST /tailors/:id/attendance
    if (method === 'POST' && id && sub === 'attendance') {
      if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
      const { date, status: ast } = body;
      if (!date || !ast) return send(res, 400, { error: 'date and status required' });
      const existing = db.attendance.findIndex(a => a.tailor_id === id && a.date === date);
      if (existing >= 0) db.attendance[existing].status = ast;
      else db.attendance.push({ id: uid(), tailor_id: id, date, status: ast });
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
  }

  // ══ APPOINTMENTS ══════════════════════════════════════════

  if (resource === 'appointments') {
    if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
    if (method === 'GET' && !id)   return send(res, 200, db.appointments);
    if (method === 'POST' && !id) {
      const a = { id: uid(), ...body };
      db.appointments.push(a);
      dbWrite(db);
      return send(res, 201, { ok: true, appointment: a });
    }
    if (method === 'PUT' && id) {
      const idx = db.appointments.findIndex(a => a.id === id);
      if (idx === -1) return send(res, 404, { error: 'Not found' });
      db.appointments[idx] = { ...db.appointments[idx], ...body, id };
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
    if (method === 'DELETE' && id) {
      db.appointments = db.appointments.filter(a => a.id !== id);
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
  }

  // ══ EXPENSES ══════════════════════════════════════════════

  if (resource === 'expenses') {
    if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
    if (method === 'GET' && !id)  return send(res, 200, db.expenses);
    if (method === 'POST' && !id) {
      const e = { id: uid(), date: new Date().toISOString().slice(0, 10), ...body };
      db.expenses.push(e);
      dbWrite(db);
      return send(res, 201, { ok: true, expense: e });
    }
    if (method === 'PUT' && id) {
      const idx = db.expenses.findIndex(e => e.id === id);
      if (idx === -1) return send(res, 404, { error: 'Not found' });
      db.expenses[idx] = { ...db.expenses[idx], ...body, id };
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
    if (method === 'DELETE' && id) {
      db.expenses = db.expenses.filter(e => e.id !== id);
      dbWrite(db);
      return send(res, 200, { ok: true });
    }
  }

  // ══ BACKUP / RESTORE ══════════════════════════════════════

  if (method === 'GET' && pathname === '/api/backup') {
    if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
    return send(res, 200, { ...db, backup_date: new Date().toISOString() });
  }

  if (method === 'POST' && pathname === '/api/restore') {
    if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
    const { orders, customers, tailors, appointments, expenses, boutique, attendance } = body;
    if (orders)       db.orders       = orders;
    if (customers)    db.customers    = customers;
    if (tailors)      db.tailors      = tailors;
    if (appointments) db.appointments = appointments;
    if (expenses)     db.expenses     = expenses;
    if (boutique)     db.boutique     = boutique;
    if (attendance)   db.attendance   = attendance;
    dbWrite(db);
    return send(res, 200, { ok: true });
  }

  // ══ REPORTS (summary) ═════════════════════════════════════

  if (method === 'GET' && pathname === '/api/reports') {
    if (!adminOnly(req)) return send(res, 403, { error: 'Admin only' });
    const { orders, customers, tailors, expenses } = db;
    const rev    = orders.reduce((s, o) => s + Number(o.advance || 0), 0);
    const pend   = orders.reduce((s, o) => s + (Number(o.total || 0) - Number(o.advance || 0)), 0);
    const expTot = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const tPaid  = tailors.reduce((s, t) => s + (t.payments || []).filter(p => p.type === 'Salary' || p.type === 'Bonus').reduce((ss, p) => ss + Number(p.amount || 0), 0), 0);
    const statusCounts = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    return send(res, 200, { revenue: rev, pending: pend, expenses: expTot, tailorPaid: tPaid, profit: rev - expTot, totalOrders: orders.length, totalCustomers: customers.length, statusCounts });
  }

  // 404
  return send(res, 404, { error: 'Route not found', path: pathname });
}

// ── Start ────────────────────────────────────────────────────
const server = http.createServer(router);
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║         KRUPA BOUTIQUE BACKEND v2.0 RUNNING          ║');
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║  URL:      http://localhost:${PORT}                       ║`);
  console.log(`║  API KEY:  ${API_KEY}  ║`);
  console.log(`║  DB FILE:  ${DB_FILE}  ║`);
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log('║  ROUTES:                                              ║');
  console.log('║  POST  /api/auth/login/admin                         ║');
  console.log('║  POST  /api/auth/login/tailor                        ║');
  console.log('║  GET|PUT          /api/boutique                      ║');
  console.log('║  GET|POST|PUT|DEL /api/orders[/:id][/remark]         ║');
  console.log('║  GET|POST|PUT|DEL /api/customers[/:id]               ║');
  console.log('║  GET|POST|PUT|DEL /api/tailors[/:id][/payment]       ║');
  console.log('║  GET|POST|PUT|DEL /api/appointments[/:id]            ║');
  console.log('║  GET|POST|DEL     /api/expenses[/:id]                ║');
  console.log('║  GET  /api/reports                                   ║');
  console.log('║  GET  /api/backup  |  POST /api/restore              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
});
