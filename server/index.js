// server/index.js  (FIXED)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // added

dotenv.config();

const dbConnect = require('./db');
const seedAdmin = require('./utils/seedAdmin');
const Technician = require('./models/Technician');
const Admin = require('./models/Admin');
const ServiceForm = require('./models/ServiceForm');
const ForwardedCall = require('./models/ForwardedCall');
const Payment = require('./models/Payment');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json({limit:'10mb'}));

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 4;

// Helpers
function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function pickPagination(req) {
  const page = Math.max(parseInt(req.query.page||PAGE_DEFAULT),1);
  const limit = Math.max(parseInt(req.query.limit||LIMIT_DEFAULT),1);
  const skip = (page-1)*limit;
  return { page, limit, skip };
}

// ---------- Auth Routes ----------
app.post('/api/technicians/register', async (req,res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({error:'Missing fields'});
    const exists = await Technician.findOne({ phone });
    if (exists) return res.status(400).json({error:'Phone already registered'});
    const passwordHash = await bcrypt.hash(password, 10);
    const t = await Technician.create({ name, phone, passwordHash });
    const token = signToken(t._id, 'technician');
    res.json({ token, technician: { id: t._id, name: t.name, phone: t.phone } });
  } catch (e) {
    console.error('register error', e);
    res.status(500).json({error:'Register failed'});
  }
});

app.post('/api/technicians/login', async (req,res) => {
  try {
    const { phone, password } = req.body;
    const t = await Technician.findOne({ phone });
    if (!t) return res.status(400).json({error:'Invalid phone or password'});
    const ok = await bcrypt.compare(password, t.passwordHash);
    if (!ok) return res.status(400).json({error:'Invalid phone or password'});
    const token = signToken(t._id, 'technician');
    res.json({ token, technician: { id: t._id, name: t.name, phone: t.phone } });
  } catch (e) {
    console.error('technician login error', e);
    res.status(500).json({error:'Login failed'});
  }
});

app.post('/api/admin/login', async (req,res) => {
  try {
    const { username, password } = req.body;
    const a = await Admin.findOne({ username });
    if (!a) return res.status(400).json({error:'Invalid username or password'});
    const ok = await bcrypt.compare(password, a.passwordHash);
    if (!ok) return res.status(400).json({error:'Invalid username or password'});
    const token = signToken(a._id, 'admin');
    res.json({ token, admin: { id: a._id, username: username } });
  } catch (e) {
    console.error('admin login error', e);
    res.status(500).json({error:'Login failed'});
  }
});

// ---------- Technician: Service Form ----------
app.post('/api/service-forms', auth('technician'), async (req,res) => {
  try {
    const { clientName, clientAddress, payment, phone, status, clientSignature } = req.body;
    if (!clientName || !clientAddress || !phone || !clientSignature) return res.status(400).json({error:'Missing required fields'});
    const form = await ServiceForm.create({
      technicianId: req.user.id, clientName, clientAddress, payment: payment||0, phone,
      status: status || 'Under Process', clientSignature
    });
    res.json({ success: true, form });
  } catch (e) {
    console.error('create service form error', e);
    res.status(500).json({error:'Create failed'});
  }
});

// Admin view of forms with filters
app.get('/api/service-forms', auth('admin'), async (req,res) => {
  try {
    const { page, limit, skip } = pickPagination(req);
    const { technicianId, status, search, date, from, to, today } = req.query;
    const q = {};
    if (technicianId) q.technicianId = technicianId;
    if (status) q.status = status;
    if (today === 'true') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      q.createdAt = {$gte:start, $lte:end};
    } else if (date) {
      const d = new Date(date);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      q.createdAt = {$gte:start, $lte:end};
    } else if (from && to) {
      q.createdAt = {$gte:new Date(from), $lte:new Date(to)};
    }
    if (search) {
      q.$or = [
        { clientName: {$regex: search, $options:'i'} },
        { phone: {$regex: search, $options:'i'} },
        { clientAddress: {$regex: search, $options:'i'} }
      ];
    }
    const total = await ServiceForm.countDocuments(q);
    const items = await ServiceForm.find(q).sort({createdAt:-1}).skip(skip).limit(limit).populate('technicianId','name phone');
    res.json({ total, page, limit, items });
  } catch (e) {
    console.error('fetch service forms error', e);
    res.status(500).json({error:'Fetch failed'});
  }
});

// ---------- Admin: Forward Call ----------
app.post('/api/calls/forward', auth('admin'), async (req,res) => {
  try {
    const { clientName, phone, address, technicianId } = req.body;
    if (!clientName || !phone || !address || !technicianId) return res.status(400).json({error:'Missing fields'});
    const call = await ForwardedCall.create({ assignedBy: req.user.id, technicianId, clientName, phone, address });
    // no socket; technicians will poll /notifications
    res.json({ success: true, call });
  } catch (e) {
    console.error('forward call error', e);
    res.status(500).json({error:'Forward failed'});
  }
});

// Admin: list forwarded calls
app.get('/api/calls/forwarded', auth('admin'), async (req,res) => {
  try {
    const { page, limit, skip } = pickPagination(req);
    const { search, today, status, technicianId } = req.query;
    const q = {};
    if (status) q.status = status;
    if (technicianId) q.technicianId = technicianId;
    if (today === 'true') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      q.createdAt = {$gte:start, $lte:end};
    }
    if (search) {
      q.$or = [
        { clientName: {$regex: search, $options:'i'} },
        { phone: {$regex: search, $options:'i'} },
        { address: {$regex: search, $options:'i'} }
      ];
    }
    const total = await ForwardedCall.countDocuments(q);
    const items = await ForwardedCall.find(q).sort({createdAt:-1}).skip(skip).limit(limit).populate('technicianId','name phone');
    res.json({ total, page, limit, items });
  } catch (e) {
    console.error('fetch forwarded calls error', e);
    res.status(500).json({error:'Fetch failed'});
  }
});

// Technician: view forwarded calls with tabs + pagination
app.get('/api/technicians/my-calls', auth('technician'), async (req,res) => {
  try {
    const { page, limit, skip } = pickPagination(req);
    const { tab } = req.query; // all|today|pending|inprocess|completed|closed
    const q = { technicianId: req.user.id };
    if (tab === 'today') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      q.createdAt = {$gte:start, $lte:end};
    } else if (tab === 'pending') q.status = 'Pending';
    else if (tab === 'inprocess') q.status = 'In Process';
    else if (tab === 'completed') q.status = 'Completed';
    else if (tab === 'closed') q.status = 'Closed';
    const total = await ForwardedCall.countDocuments(q);
    const items = await ForwardedCall.find(q).sort({createdAt:-1}).skip(skip).limit(limit);
    res.json({ total, page, limit, items });
  } catch (e) {
    console.error('technician my-calls error', e);
    res.status(500).json({error:'Fetch failed'});
  }
});

// Technician: update call status (including "close call")
app.post('/api/technicians/call-status', auth('technician'), async (req,res) => {
  try {
    const { callId, status } = req.body; // 'Pending','In Process','Completed','Closed'
    const call = await ForwardedCall.findOne({_id: callId, technicianId: req.user.id});
    if (!call) return res.status(404).json({error:'Call not found'});
    call.status = status;
    call.updatedAt = new Date();
    await call.save();
    res.json({ success: true, call });
  } catch (e) {
    console.error('update call status error', e);
    res.status(500).json({error:'Update failed'});
  }
});

// Technician: Payment Mode form
app.post('/api/payments', auth('technician'), async (req,res) => {
  try {
    const { recipientName, mode, amountOnline, amountCash, recipientSignature, note } = req.body;
    if (!recipientName || !recipientSignature || !mode) return res.status(400).json({error:'Missing fields'});
    const m = ['Online','Cash','Both'];
    if (!m.includes(mode)) return res.status(400).json({error:'Invalid mode'});
    const pay = await Payment.create({
      technicianId: req.user.id, recipientName, mode,
      amountOnline: amountOnline || 0, amountCash: amountCash || 0, recipientSignature, note
    });
    res.json({ success: true, payment: pay });
  } catch (e) {
    console.error('create payment error', e);
    res.status(500).json({error:'Create failed'});
  }
});

// Admin: payments list + totals by technician
app.get('/api/payments', auth('admin'), async (req,res) => {
  try {
    const { page, limit, skip } = pickPagination(req);
    const { search, today, technicianId, from, to } = req.query;
    const q = {};
    if (technicianId) q.technicianId = technicianId;
    if (today === 'true') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      q.createdAt = {$gte:start, $lte:end};
    } else if (from && to) {
      q.createdAt = {$gte:new Date(from), $lte:new Date(to)};
    }
    if (search) {
      q.$or = [
        { recipientName: {$regex: search, $options:'i'} }
      ];
    }
    const total = await Payment.countDocuments(q);
    const items = await Payment.find(q).sort({createdAt:-1}).skip(skip).limit(limit).populate('technicianId','name phone');
    // totals per technician
    const totals = await Payment.aggregate([
      { $match: q },
      { $group: { _id: "$technicianId", totalOnline: { $sum: "$amountOnline" }, totalCash: { $sum: "$amountCash" } } }
    ]);
    res.json({ total, page, limit, items, totals });
  } catch (e) {
    console.error('fetch payments error', e);
    res.status(500).json({error:'Fetch failed'});
  }
});

// Admin: technicians list + details
app.get('/api/technicians', auth('admin'), async (req,res) => {
  try {
    const techs = await Technician.find().sort({createdAt:-1});
    res.json({ items: techs });
  } catch (e) {
    console.error('fetch technicians error', e);
    res.status(500).json({error:'Fetch failed'});
  }
});

app.get('/api/technicians/:id/summary', auth('admin'), async (req,res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const qForms = { technicianId: id };
    const qPays = { technicianId: id };
    if (from && to) {
      qForms.createdAt = {$gte:new Date(from), $lte:new Date(to)};
      qPays.createdAt = {$gte:new Date(from), $lte:new Date(to)};
    }
    const forms = await ServiceForm.find(qForms).sort({createdAt:-1});
    const payments = await Payment.find(qPays).sort({createdAt:-1});
    const totalCollected = payments.reduce((s,p)=>s+(p.amountCash||0)+(p.amountOnline||0),0);
    res.json({ forms, payments, totalCollected });
  } catch (e) {
    console.error('technician summary error', e);
    res.status(500).json({error:'Fetch failed'});
  }
});

// Notifications (technicians poll for new calls since last check)
app.get('/api/notifications', auth('technician'), async (req,res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);
    const calls = await ForwardedCall.find({ technicianId: req.user.id, createdAt: { $gt: since }}).sort({createdAt:-1}).limit(5);
    // update last check
    await Technician.findByIdAndUpdate(req.user.id, { lastNotificationCheck: new Date() });
    res.json({ items: calls, now: new Date() });
  } catch (e) {
    console.error('notifications error', e);
    res.status(500).json({error:'Notify failed'});
  }
});

// Routes test
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working 🚀" });
});

// Delete endpoints for admin (soft simple delete)
app.delete('/api/service-forms/:id', auth('admin'), async (req,res)=>{
  try { await ServiceForm.findByIdAndDelete(req.params.id); res.json({success:true}); }
  catch(e){ console.error('delete service form error', e); res.status(500).json({error:'Delete failed'}); }
});
app.delete('/api/calls/:id', auth('admin'), async (req,res)=>{
  try { await ForwardedCall.findByIdAndDelete(req.params.id); res.json({success:true}); }
  catch(e){ console.error('delete call error', e); res.status(500).json({error:'Delete failed'}); }
});
app.delete('/api/payments/:id', auth('admin'), async (req,res)=>{
  try { await Payment.findByIdAndDelete(req.params.id); res.json({success:true}); }
  catch(e){ console.error('delete payment error', e); res.status(500).json({error:'Delete failed'}); }
});

// Health
app.get('/api/health', (req,res)=>res.json({ok:true}));

// -------------------- Start server & DB connection --------------------
const PORT = process.env.PORT || 4000;

// Use dbConnect (cached connection util) that's already required at top
dbConnect(process.env.MONGO_URI)
  .then(async () => {
    try {
      // seed admin if needed
      await seedAdmin();
      console.log('✅ MongoDB Connected Successfully!');
    } catch (seedErr) {
      console.error('seed admin error', seedErr);
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err && err.message ? err.message : err);
    process.exit(1);
  });
  app.get("/", (req, res) => {
  res.send("✅ API is running successfully on Render!");
});

// Vercel / other usage: export app
module.exports = app;
