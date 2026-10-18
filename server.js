const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET_KEY = process.env.ADMIN_KEY || 'admin2026';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Helper to determine if an IP is local/private
function isPrivateOrLocalIp(ip) {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.') || ip.startsWith('fc00:')) return true;
  return false;
}

// Extract raw IP from request
function getClientIp(req) {
  let ip = req.headers['cf-connecting-ip'] || 
           req.headers['x-real-ip'] || 
           req.headers['x-forwarded-for'] || 
           req.socket.remoteAddress || 
           '';

  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip || '127.0.0.1';
}

// Server-side fallback IP & Geolocation resolution
async function resolveServerSideGeo(incomingIp) {
  try {
    let targetIp = incomingIp;
    
    // If incoming IP is local loopback (testing from localhost), fetch host's actual public IP
    if (isPrivateOrLocalIp(targetIp)) {
      const publicIpRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      if (publicIpRes.ok) {
        const publicIpData = await publicIpRes.json();
        if (publicIpData && publicIpData.ip) {
          targetIp = publicIpData.ip;
        }
      }
    }

    // Now resolve geo for targetIp
    const geoUrl = targetIp && !isPrivateOrLocalIp(targetIp) 
      ? `https://ipwho.is/${targetIp}` 
      : 'https://ipwho.is/';

    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3500) });
    if (geoRes.ok) {
      const geo = await geoRes.json();
      if (geo && geo.success !== false) {
        return {
          ip: geo.ip || targetIp,
          country: geo.country || 'Unknown',
          country_code: (geo.country_code || '').toUpperCase(),
          region: geo.region || 'Unknown',
          city: geo.city || 'Unknown',
          postal: geo.postal || '',
          latitude: parseFloat(geo.latitude) || 0,
          longitude: parseFloat(geo.longitude) || 0,
          isp: geo.connection?.isp || geo.connection?.org || 'Unknown',
          timezone: geo.timezone?.id || ''
        };
      }
    }
  } catch (err) {
    // Fallback quietly if external lookup fails
  }

  return { ip: incomingIp };
}

// ---------------- TELEMETRY ENDPOINT ----------------
app.post('/api/telemetry', async (req, res) => {
  try {
    const serverDetectedIp = getClientIp(req);
    const body = req.body || {};

    let clientIp = body.ip && !isPrivateOrLocalIp(body.ip) ? body.ip : serverDetectedIp;
    let geo = {
      ip: clientIp,
      country: body.country,
      country_code: body.country_code,
      region: body.region,
      city: body.city,
      postal: body.postal,
      latitude: parseFloat(body.latitude) || 0,
      longitude: parseFloat(body.longitude) || 0,
      isp: body.isp,
      timezone: body.timezone
    };

    // If client provided insufficient geo data or tested on localhost, enrich via server lookup
    if (!geo.country || geo.country === 'Unknown' || isPrivateOrLocalIp(geo.ip)) {
      const enriched = await resolveServerSideGeo(clientIp);
      geo = { ...enriched, ...geo, ip: enriched.ip || clientIp };
      if (!geo.country || geo.country === 'Unknown') geo.country = enriched.country || 'Unknown';
      if (!geo.country_code) geo.country_code = enriched.country_code || '';
      if (!geo.region || geo.region === 'Unknown') geo.region = enriched.region || 'Unknown';
      if (!geo.city || geo.city === 'Unknown') geo.city = enriched.city || 'Unknown';
      if (!geo.latitude && enriched.latitude) geo.latitude = enriched.latitude;
      if (!geo.longitude && enriched.longitude) geo.longitude = enriched.longitude;
      if (!geo.isp || geo.isp === 'Unknown') geo.isp = enriched.isp || 'Unknown';
      if (!geo.timezone && enriched.timezone) geo.timezone = enriched.timezone;
    }

    const visitorData = {
      ...geo,
      device_type: body.device_type || 'Desktop',
      browser: body.browser || 'Unknown',
      os: body.os || 'Unknown',
      screen_resolution: body.screen_resolution || '',
      language: body.language || '',
      user_agent: req.headers['user-agent'] || body.user_agent || '',
      referrer: body.referrer || req.headers['referer'] || ''
    };

    const result = db.recordVisitor(visitorData);
    res.json({ success: true, id: result.id, visits: result.visit_count, record: result.record });
  } catch (error) {
    console.error('Error logging visitor telemetry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------- SERVER-SENT EVENTS (SSE) REAL-TIME STREAM ----------------
app.get('/api/admin/live-stream', (req, res) => {
  const authKey = req.query.key;
  if (!authKey || authKey !== ADMIN_SECRET_KEY) {
    return res.status(401).send('Unauthorized');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  // Listener for new visitors
  const onVisitorActivity = (eventData) => {
    const stats = db.getStats();
    res.write(`data: ${JSON.stringify({ type: 'visitor_activity', data: eventData, stats })}\n\n`);
  };

  db.telemetryEvents.on('visitor_activity', onVisitorActivity);

  // Heartbeat every 15s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    db.telemetryEvents.off('visitor_activity', onVisitorActivity);
  });
});

// ---------------- ADMIN ENDPOINTS ----------------
function checkAdminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-key'] || req.query.key;
  if (!authHeader || authHeader !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_SECRET_KEY) {
    return res.json({ success: true, message: 'Authentication successful' });
  }
  return res.status(401).json({ error: 'Invalid Passkey' });
});

app.get('/api/admin/visitors', checkAdminAuth, (req, res) => {
  try {
    const { search, country, limit } = req.query;
    const visitors = db.getVisitors({ search, country, limit: limit || 1000 });
    res.json({ visitors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

app.get('/api/admin/stats', checkAdminAuth, (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.delete('/api/admin/visitors/:id', checkAdminAuth, (req, res) => {
  try {
    db.deleteVisitor(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

app.delete('/api/admin/clear', checkAdminAuth, (req, res) => {
  try {
    db.clearAllVisitors();
    res.json({ success: true, message: 'All visitor records purged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear records' });
  }
});

// Seed sample realistic visitors for instant demo inspection
app.post('/api/admin/seed-demo', checkAdminAuth, (req, res) => {
  try {
    const samples = [
      {
        ip: '104.28.19.45',
        country: 'United States',
        country_code: 'US',
        region: 'California',
        city: 'San Francisco',
        postal: '94107',
        latitude: 37.7749,
        longitude: -122.4194,
        isp: 'Cloudflare Inc.',
        device_type: 'Desktop',
        browser: 'Chrome 128',
        os: 'macOS Sonoma',
        screen_resolution: '2560x1440',
        language: 'en-US',
        timezone: 'America/Los_Angeles'
      },
      {
        ip: '185.199.108.153',
        country: 'United Kingdom',
        country_code: 'GB',
        region: 'Greater London',
        city: 'London',
        postal: 'EC2A 4NE',
        latitude: 51.5074,
        longitude: -0.1278,
        isp: 'British Telecommunications',
        device_type: 'Desktop',
        browser: 'Safari 17.4',
        os: 'macOS Sequoia',
        screen_resolution: '1920x1080',
        language: 'en-GB',
        timezone: 'Europe/London'
      },
      {
        ip: '133.242.18.2',
        country: 'Japan',
        country_code: 'JP',
        region: 'Tokyo',
        city: 'Shinjuku',
        postal: '160-0022',
        latitude: 35.6895,
        longitude: 139.6917,
        isp: 'NTT Communications',
        device_type: 'Mobile',
        browser: 'Mobile Safari',
        os: 'iOS 18.0',
        screen_resolution: '393x852',
        language: 'ja-JP',
        timezone: 'Asia/Tokyo'
      },
      {
        ip: '49.207.214.88',
        country: 'India',
        country_code: 'IN',
        region: 'Gujarat',
        city: 'Talaja',
        postal: '364140',
        latitude: 21.3527,
        longitude: 72.0352,
        isp: 'Bharti Airtel Limited',
        device_type: 'Desktop',
        browser: 'Edge 130',
        os: 'Windows 11',
        screen_resolution: '1536x864',
        language: 'en-IN',
        timezone: 'Asia/Kolkata'
      },
      {
        ip: '178.62.195.8',
        country: 'Germany',
        country_code: 'DE',
        region: 'Bavaria',
        city: 'Munich',
        postal: '80331',
        latitude: 48.1351,
        longitude: 11.5820,
        isp: 'Deutsche Telekom AG',
        device_type: 'Desktop',
        browser: 'Firefox 130',
        os: 'Windows 11',
        screen_resolution: '3840x2160',
        language: 'de-DE',
        timezone: 'Europe/Berlin'
      },
      {
        ip: '139.130.4.5',
        country: 'Australia',
        country_code: 'AU',
        region: 'New South Wales',
        city: 'Sydney',
        postal: '2000',
        latitude: -33.8688,
        longitude: 151.2093,
        isp: 'Telstra Corporation',
        device_type: 'Tablet',
        browser: 'Mobile Safari',
        os: 'iPadOS 17.5',
        screen_resolution: '820x1180',
        language: 'en-AU',
        timezone: 'Australia/Sydney'
      }
    ];

    samples.forEach(s => db.recordVisitor(s));
    res.json({ success: true, count: samples.length, message: 'Sample visitors seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Seed failed' });
  }
});

// CSV Export
app.get('/api/admin/export', checkAdminAuth, (req, res) => {
  try {
    const visitors = db.getVisitors({ limit: 10000 });
    const headers = [
      'ID', 'IP Address', 'Country', 'Country Code', 'State/Region', 'City', 
      'Postal', 'Latitude', 'Longitude', 'ISP/Network', 'Device', 'OS', 
      'Browser', 'Screen Res', 'Language', 'Visit Count', 'First Seen', 'Last Seen'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = visitors.map(v => [
      v.id, v.ip, v.country, v.country_code, v.region, v.city,
      v.postal, v.latitude, v.longitude, v.isp, v.device_type, v.os,
      v.browser, v.screen_resolution, v.language, v.visit_count,
      v.first_visited_at, v.last_visited_at
    ].map(escapeCsv).join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="telemetry_export_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Admin page route
app.get('/admin', (req, res) => {
  res.sendFile('admin.html', { root: PUBLIC_DIR });
});

// Fallback route to index.html
app.use((req, res) => {
  res.sendFile('index.html', { root: PUBLIC_DIR });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌍 TERRA SANCTUM GALLERY & REAL-TIME IP INTELLIGENCE`);
  console.log(`======================================================`);
  console.log(`> Public Visitor Gallery: http://localhost:${PORT}/`);
  console.log(`> Admin Monitoring Suite: http://localhost:${PORT}/admin`);
  console.log(`> Default Admin Passkey : ${ADMIN_SECRET_KEY}`);
  console.log(`======================================================\n`);
});
