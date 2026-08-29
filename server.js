const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { stats: {}, appeals: [], donations: [], complaints: [], portalTickets: [], subscribers: [] };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { stats: {}, appeals: [], donations: [], complaints: [], portalTickets: [], subscribers: [] };
  }
}

function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// JSON body parser helper
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// API Response helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // ==========================================
  // BACKEND REST API ROUTES
  // ==========================================

  // 1. GET /api/stats - Live Impact Metrics
  if (req.method === 'GET' && pathname === '/api/stats') {
    const db = readDb();
    return sendJson(res, 200, { success: true, data: db.stats });
  }

  // 2. GET /api/appeals - Active Appeals List
  if (req.method === 'GET' && pathname === '/api/appeals') {
    const db = readDb();
    return sendJson(res, 200, { success: true, count: db.appeals.length, data: db.appeals });
  }

  // 3. GET /api/donations - Recent Donations Ticker
  if (req.method === 'GET' && pathname === '/api/donations') {
    const db = readDb();
    const recent = db.donations.slice(0, 10);
    return sendJson(res, 200, { success: true, count: db.donations.length, data: recent });
  }

  // 4. POST /api/donations - Process & Record Donation
  if (req.method === 'POST' && pathname === '/api/donations') {
    const body = await parseBody(req);
    const amount = parseFloat(body.amount) || 50;
    const appealName = body.appeal || 'Where Most Needed';
    const frequency = body.frequency || 'One-off';
    const giftAid = Boolean(body.giftAid);
    const donorName = body.donorName || 'Generous Donor';
    const donorEmail = body.donorEmail || '';

    const db = readDb();
    const receiptNum = Math.floor(1000 + Math.random() * 9000);
    const receiptId = `MH-REC-${receiptNum}`;

    const newDonation = {
      receiptId,
      donorName,
      donorEmail,
      amount,
      currency: body.currency || 'GBP',
      frequency,
      appeal: appealName,
      giftAid,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    db.donations.unshift(newDonation);

    // Update appeal progress if matched
    const targetAppeal = db.appeals.find(a => a.title.toLowerCase().includes(appealName.toLowerCase()));
    if (targetAppeal) {
      targetAppeal.raised += amount;
    }

    // Update global stats
    if (db.stats.totalRaisedYTD) {
      db.stats.totalRaisedYTD += amount;
    }
    if (appealName.toLowerCase().includes('zakat') && db.stats.zakatDistributed) {
      db.stats.zakatDistributed += amount;
    }

    writeDb(db);

    return sendJson(res, 201, {
      success: true,
      message: `Jazakallah Khair! Your donation of £${amount.toFixed(2)} was processed.`,
      receipt: newDonation
    });
  }

  // 5. POST /api/complaints - Submit New Complaint
  if (req.method === 'POST' && pathname === '/api/complaints') {
    const body = await parseBody(req);
    const db = readDb();

    const randId = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `MH-2026-${randId}`;

    const newComplaint = {
      referenceCode,
      category: body.category || 'General Community Feedback',
      location: body.location || 'Global Location',
      name: body.name || 'Anonymous Beneficiary',
      contact: body.contact || 'None Provided',
      details: body.details || '',
      status: 'Under Review',
      priority: body.priority || 'Normal',
      timeline: [
        {
          status: 'Received & Logged',
          timestamp: new Date().toISOString(),
          notes: 'Case logged into Safeguarding System and assigned to Field Review Officer.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    db.complaints.unshift(newComplaint);
    writeDb(db);

    return sendJson(res, 201, {
      success: true,
      referenceCode,
      message: 'Complaint submitted successfully and assigned for investigation.',
      data: newComplaint
    });
  }

  // 6. GET /api/complaints/track - Track Complaint Status by Reference ID
  if (req.method === 'GET' && pathname === '/api/complaints/track') {
    const ref = parsedUrl.searchParams.get('ref')?.trim().toUpperCase();
    if (!ref) {
      return sendJson(res, 400, { success: false, error: 'Missing reference code query parameter (ref)' });
    }

    const db = readDb();
    const complaint = db.complaints.find(c => c.referenceCode.toUpperCase() === ref);

    if (!complaint) {
      return sendJson(res, 404, {
        success: false,
        error: `No complaint record found for reference "${ref}". Please verify the code and try again.`
      });
    }

    return sendJson(res, 200, { success: true, data: complaint });
  }

  // 7. GET /api/complaints - List all complaints (for Admin Console)
  if (req.method === 'GET' && pathname === '/api/complaints') {
    const db = readDb();
    return sendJson(res, 200, { success: true, count: db.complaints.length, data: db.complaints });
  }

  // 8. PATCH /api/complaints/update - Update Complaint Status & Add Resolution Notes
  if (req.method === 'PATCH' && pathname === '/api/complaints/update') {
    const body = await parseBody(req);
    const { referenceCode, status, notes } = body;
    const db = readDb();

    const item = db.complaints.find(c => c.referenceCode === referenceCode);
    if (!item) {
      return sendJson(res, 404, { success: false, error: 'Complaint ticket not found' });
    }

    if (status) item.status = status;
    if (notes) {
      item.timeline.push({
        status: status || item.status,
        timestamp: new Date().toISOString(),
        notes
      });
    }

    writeDb(db);
    return sendJson(res, 200, { success: true, message: 'Ticket updated successfully', data: item });
  }

  // 9. POST /api/portal/login - Authenticate Portal Role
  if (req.method === 'POST' && pathname === '/api/portal/login') {
    const body = await parseBody(req);
    const role = body.role || 'student';
    const id = body.id || 'MH-EDU-2026-081';

    return sendJson(res, 200, {
      success: true,
      token: `auth-token-${Date.now()}`,
      role,
      user: {
        id,
        name: role === 'teacher' ? 'Ustadha Maryam Khan' : role === 'parent' ? 'Parent Guardian' : 'Student Zayd Ali',
        institution: 'Muslim Hands School of Excellence #4'
      }
    });
  }

  // 10. POST /api/portal/tickets - Submit Support Ticket from Portal
  if (req.method === 'POST' && pathname === '/api/portal/tickets') {
    const body = await parseBody(req);
    const db = readDb();

    const ticketId = `PORTAL-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket = {
      ticketId,
      role: body.role || 'student',
      studentId: body.studentId || 'MH-USER',
      subject: body.subject || 'Support Request',
      details: body.details || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    db.portalTickets.unshift(newTicket);
    writeDb(db);

    return sendJson(res, 201, {
      success: true,
      ticketId,
      message: 'Portal ticket submitted to school administration.',
      data: newTicket
    });
  }

  // 11. POST /api/newsletter - Subscribe Email
  if (req.method === 'POST' && pathname === '/api/newsletter') {
    const body = await parseBody(req);
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return sendJson(res, 400, { success: false, error: 'Please provide a valid email address.' });
    }

    const db = readDb();
    if (!db.subscribers.includes(email)) {
      db.subscribers.push(email);
      writeDb(db);
    }

    return sendJson(res, 200, { success: true, message: 'Subscribed to Muslim Hands Emergency & Impact Updates.' });
  }

  // 12. POST /api/zakat/calculate - Shariah Calculation Verification
  if (req.method === 'POST' && pathname === '/api/zakat/calculate') {
    const body = await parseBody(req);
    const { cash = 0, gold = 0, silver = 0, investments = 0, business = 0, debts = 0 } = body;
    const totalAssets = Number(cash) + Number(gold) + Number(silver) + Number(investments) + Number(business);
    const netWealth = Math.max(0, totalAssets - Number(debts));
    const nisabSilver = 380.00;
    const zakatDue = netWealth >= nisabSilver ? netWealth * 0.025 : 0;

    return sendJson(res, 200, {
      success: true,
      data: {
        totalAssets,
        debts,
        netWealth,
        nisabSilver,
        isEligible: netWealth >= nisabSilver,
        zakatDue: Number(zakatDue.toFixed(2))
      }
    });
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(PUBLIC_DIR, reqPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(handler);

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`\n======================================================`);
    console.log(`  🌟 MUSLIM HANDS PLATFORM WITH COMPLETE BACKEND RUNNING!`);
    console.log(`  🔗 Local Host Link: http://localhost:${portToTry}`);
    console.log(`  🛠️ Admin & API Endpoints: http://localhost:${portToTry}/admin.html`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToTry} in use, trying ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

if (require.main === module) {
  startServer(PORT);
}

module.exports = handler;
