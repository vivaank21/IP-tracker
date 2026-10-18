const Database = require('better-sqlite3');
const path = require('path');
const EventEmitter = require('events');

const dbPath = path.join(__dirname, 'visitors.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');

// Telemetry event emitter for real-time live streaming
const telemetryEvents = new EventEmitter();

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    country TEXT DEFAULT 'Unknown',
    country_code TEXT DEFAULT '',
    region TEXT DEFAULT 'Unknown',
    city TEXT DEFAULT 'Unknown',
    postal TEXT DEFAULT '',
    latitude REAL DEFAULT 0,
    longitude REAL DEFAULT 0,
    isp TEXT DEFAULT 'Unknown',
    timezone TEXT DEFAULT '',
    currency TEXT DEFAULT '',
    device_type TEXT DEFAULT 'Desktop',
    browser TEXT DEFAULT 'Unknown',
    os TEXT DEFAULT 'Unknown',
    screen_resolution TEXT DEFAULT '',
    language TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    referrer TEXT DEFAULT '',
    first_visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    visit_count INTEGER DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_visitors_ip ON visitors(ip);
  CREATE INDEX IF NOT EXISTS idx_visitors_last_visited ON visitors(last_visited_at);
  CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
`);

module.exports = {
  db,
  telemetryEvents,
  
  // Record or update a visitor
  recordVisitor(data) {
    const existing = db.prepare(`SELECT * FROM visitors WHERE ip = ?`).get(data.ip);
    let recordId;
    let isNew = false;
    let visitCount = 1;

    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE visitors 
        SET 
          country = CASE WHEN ? != 'Unknown' AND ? != '' THEN ? ELSE country END,
          country_code = CASE WHEN ? != '' THEN ? ELSE country_code END,
          region = CASE WHEN ? != 'Unknown' AND ? != '' THEN ? ELSE region END,
          city = CASE WHEN ? != 'Unknown' AND ? != '' THEN ? ELSE city END,
          postal = CASE WHEN ? != '' THEN ? ELSE postal END,
          latitude = CASE WHEN ? != 0 THEN ? ELSE latitude END,
          longitude = CASE WHEN ? != 0 THEN ? ELSE longitude END,
          isp = CASE WHEN ? != 'Unknown' AND ? != '' THEN ? ELSE isp END,
          timezone = CASE WHEN ? != '' THEN ? ELSE timezone END,
          device_type = CASE WHEN ? != '' THEN ? ELSE device_type END,
          browser = CASE WHEN ? != 'Unknown' THEN ? ELSE browser END,
          os = CASE WHEN ? != 'Unknown' THEN ? ELSE os END,
          screen_resolution = CASE WHEN ? != '' THEN ? ELSE screen_resolution END,
          language = CASE WHEN ? != '' THEN ? ELSE language END,
          user_agent = CASE WHEN ? != '' THEN ? ELSE user_agent END,
          referrer = CASE WHEN ? != '' THEN ? ELSE referrer END,
          last_visited_at = CURRENT_TIMESTAMP,
          visit_count = visit_count + 1
        WHERE id = ?
      `);
      
      updateStmt.run(
        data.country, data.country, data.country,
        data.country_code, data.country_code,
        data.region, data.region, data.region,
        data.city, data.city, data.city,
        data.postal, data.postal,
        data.latitude, data.latitude,
        data.longitude, data.longitude,
        data.isp, data.isp, data.isp,
        data.timezone, data.timezone,
        data.device_type, data.device_type,
        data.browser, data.browser,
        data.os, data.os,
        data.screen_resolution, data.screen_resolution,
        data.language, data.language,
        data.user_agent, data.user_agent,
        data.referrer, data.referrer,
        existing.id
      );
      
      recordId = existing.id;
      isNew = false;
      visitCount = existing.visit_count + 1;
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO visitors (
          ip, country, country_code, region, city, postal,
          latitude, longitude, isp, timezone, currency,
          device_type, browser, os, screen_resolution,
          language, user_agent, referrer, first_visited_at, last_visited_at, visit_count
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1
        )
      `);
      
      const info = insertStmt.run(
        data.ip,
        data.country || 'Unknown',
        data.country_code || '',
        data.region || 'Unknown',
        data.city || 'Unknown',
        data.postal || '',
        data.latitude || 0,
        data.longitude || 0,
        data.isp || 'Unknown',
        data.timezone || '',
        data.currency || '',
        data.device_type || 'Desktop',
        data.browser || 'Unknown',
        data.os || 'Unknown',
        data.screen_resolution || '',
        data.language || '',
        data.user_agent || '',
        data.referrer || ''
      );
      
      recordId = info.lastInsertRowid;
      isNew = true;
      visitCount = 1;
    }

    // Retrieve fresh full record for live broadcast
    const fullRecord = db.prepare(`SELECT * FROM visitors WHERE id = ?`).get(recordId);
    
    // Broadcast live event
    telemetryEvents.emit('visitor_activity', {
      isNew,
      visitor: fullRecord
    });

    return { id: recordId, isNew, visit_count: visitCount, record: fullRecord };
  },

  // Get all visitors with optional search, sorting, limit
  getVisitors(options = {}) {
    let query = `SELECT * FROM visitors WHERE 1=1`;
    const params = [];

    if (options.search) {
      query += ` AND (ip LIKE ? OR country LIKE ? OR region LIKE ? OR city LIKE ? OR isp LIKE ? OR os LIKE ? OR browser LIKE ?)`;
      const s = `%${options.search}%`;
      params.push(s, s, s, s, s, s, s);
    }

    if (options.country && options.country !== 'ALL') {
      query += ` AND country = ?`;
      params.push(options.country);
    }

    query += ` ORDER BY last_visited_at DESC`;

    if (options.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(options.limit, 10));
    }

    return db.prepare(query).all(...params);
  },

  // Get aggregate stats
  getStats() {
    const totalVisits = db.prepare(`SELECT SUM(visit_count) as total FROM visitors`).get().total || 0;
    const uniqueIPs = db.prepare(`SELECT COUNT(*) as count FROM visitors`).get().count || 0;
    const countriesCount = db.prepare(`SELECT COUNT(DISTINCT country) as count FROM visitors WHERE country != 'Unknown' AND country != ''`).get().count || 0;
    
    // Top countries
    const topCountries = db.prepare(`
      SELECT country, country_code, COUNT(*) as visitor_count, SUM(visit_count) as total_hits
      FROM visitors 
      WHERE country != 'Unknown' AND country != ''
      GROUP BY country
      ORDER BY visitor_count DESC
      LIMIT 8
    `).all();

    // Device breakdown
    const devices = db.prepare(`
      SELECT device_type, COUNT(*) as count 
      FROM visitors 
      GROUP BY device_type
    `).all();

    // OS breakdown
    const operatingSystems = db.prepare(`
      SELECT os, COUNT(*) as count 
      FROM visitors 
      GROUP BY os 
      ORDER BY count DESC 
      LIMIT 5
    `).all();

    // Browsers breakdown
    const browsers = db.prepare(`
      SELECT browser, COUNT(*) as count 
      FROM visitors 
      GROUP BY browser 
      ORDER BY count DESC 
      LIMIT 5
    `).all();

    // Visits in last 24h
    const last24h = db.prepare(`
      SELECT COUNT(*) as count 
      FROM visitors 
      WHERE datetime(last_visited_at, 'localtime') >= datetime('now', '-1 day', 'localtime')
    `).get().count || 0;

    return {
      totalVisits,
      uniqueIPs,
      countriesCount,
      topCountries,
      devices,
      operatingSystems,
      browsers,
      last24h
    };
  },

  deleteVisitor(id) {
    return db.prepare(`DELETE FROM visitors WHERE id = ?`).run(id);
  },

  clearAllVisitors() {
    return db.prepare(`DELETE FROM visitors`).run();
  }
};
