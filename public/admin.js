/**
 * TERRA TELEMETRY — Real-Time Admin Intelligence & SSE Controller
 */

let adminKey = localStorage.getItem('terra_admin_key') || '';
let map2DInstance = null;
let mapMarkers = [];
let currentVisitors = [];
let allCountriesSet = new Set();
let sseSource = null;
let audioEnabled = true;

// Three.js 3D Globe objects
let adminGlobeScene, adminGlobeCamera, adminGlobeRenderer, adminGlobeSphere, adminGlobeMarkersGroup;
let isDraggingAdminGlobe = false;
let adminMousePrev = { x: 0, y: 0 };

// Flag emoji converter
function getCountryFlag(code) {
  if (!code || code.length !== 2) return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Relative time formatter
function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString.replace(' ', 'T') + 'Z');
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Synthesize pleasant radar ping via Web Audio API
function playAlertChime() {
  if (!audioEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    // Audio context may require initial user click in some browsers
  }
}

function showToast(msg) {
  const toast = document.getElementById('toastNotice');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---------------- AUTHENTICATION ----------------
function quickFillPasskey() {
  document.getElementById('adminKeyInput').value = 'admin2026';
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const inputKey = document.getElementById('adminKeyInput').value.trim();
  const errEl = document.getElementById('authError');
  errEl.style.display = 'none';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: inputKey })
    });

    if (res.ok) {
      adminKey = inputKey;
      localStorage.setItem('terra_admin_key', adminKey);
      initDashboard();
    } else {
      errEl.textContent = 'Invalid Passkey. Please verify and try again.';
      errEl.style.display = 'block';
    }
  } catch (err) {
    errEl.textContent = 'Connection error. Ensure the server is active.';
    errEl.style.display = 'block';
  }
}

function logout() {
  localStorage.removeItem('terra_admin_key');
  adminKey = '';
  if (sseSource) {
    sseSource.close();
    sseSource = null;
  }
  document.getElementById('dashboardLayout').style.display = 'none';
  document.getElementById('authOverlay').style.display = 'flex';
}

// ---------------- INITIALIZATION ----------------
document.addEventListener('DOMContentLoaded', () => {
  if (adminKey) {
    fetch('/api/admin/stats', { headers: { 'x-admin-key': adminKey } })
      .then(res => {
        if (res.ok) initDashboard();
        else document.getElementById('authOverlay').style.display = 'flex';
      })
      .catch(() => {
        document.getElementById('authOverlay').style.display = 'flex';
      });
  } else {
    document.getElementById('authOverlay').style.display = 'flex';
  }

  setupEventListeners();
});

function initDashboard() {
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('dashboardLayout').style.display = 'flex';

  initMap2D();
  initAdminGlobe3D();
  fetchAllData();
  setupRealtimeSSE();
}

// ---------------- REAL-TIME SERVER-SENT EVENTS (SSE) ----------------
function setupRealtimeSSE() {
  if (sseSource) sseSource.close();

  const statusBadge = document.getElementById('streamStatusBadge');
  sseSource = new EventSource(`/api/admin/live-stream?key=${encodeURIComponent(adminKey)}`);

  sseSource.onopen = () => {
    statusBadge.textContent = '● LIVE SSE STREAMING';
    statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    statusBadge.style.color = '#10b981';
  };

  sseSource.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'visitor_activity') {
        const { visitor, isNew } = msg.data;
        handleIncomingRealtimeHit(visitor, isNew, msg.stats);
      }
    } catch (err) {
      // Ignored
    }
  };

  sseSource.onerror = () => {
    statusBadge.textContent = '○ STREAM RECONNECTING...';
    statusBadge.style.background = 'rgba(245, 158, 11, 0.15)';
    statusBadge.style.color = '#f59e0b';
  };
}

function handleIncomingRealtimeHit(visitor, isNew, newStats) {
  playAlertChime();

  // Show top live ticker banner
  const flag = getCountryFlag(visitor.country_code);
  const ticker = document.getElementById('liveTickerBanner');
  const tickerText = document.getElementById('tickerText');
  tickerText.innerHTML = `
    <strong>🔴 REAL-TIME VISITOR DETECTED:</strong> 
    ${flag} ${visitor.city || 'Unknown'}, ${visitor.region || ''} (${visitor.country}) 
    • IP: <code>${visitor.ip}</code> 
    • Network: ${visitor.isp || 'N/A'} 
    • ${visitor.device_type} (${visitor.browser}) 
    • <em>Just now</em>
  `;
  ticker.style.display = 'flex';

  // Update existing visitor in memory or prepend new
  const existingIdx = currentVisitors.findIndex(v => v.ip === visitor.ip);
  if (existingIdx !== -1) {
    currentVisitors[existingIdx] = visitor;
  } else {
    currentVisitors.unshift(visitor);
  }

  // Update Stats & UI
  if (newStats) updateStatsUI(newStats);
  updateVisitorsUI(currentVisitors);

  // Add glowing marker to 2D Map and 3D Globe
  plotMapMarkers(currentVisitors, false);
  plotAdminGlobePins();

  // Highlight first row in table
  setTimeout(() => {
    const firstRow = document.querySelector('#telemetryTbody tr');
    if (firstRow) {
      firstRow.classList.add('new-hit-highlight');
      setTimeout(() => firstRow.classList.remove('new-hit-highlight'), 3000);
    }
  }, 100);
}

function closeTicker() {
  document.getElementById('liveTickerBanner').style.display = 'none';
}

// ---------------- MAP INITIALIZATION (2D Leaflet & 3D Globe) ----------------
function initMap2D() {
  if (map2DInstance) return;
  const mapEl = document.getElementById('visitorMap');
  if (!mapEl) return;

  map2DInstance = L.map('visitorMap', {
    zoomControl: true,
    attributionControl: false
  }).setView([20, 0], 2);

  // CartoDB Dark Matter tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map2DInstance);
}

function initAdminGlobe3D() {
  const container = document.getElementById('visitorGlobe3D');
  if (!container || !window.THREE) return;

  const w = container.clientWidth || 800;
  const h = container.clientHeight || 400;

  adminGlobeScene = new THREE.Scene();
  adminGlobeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  adminGlobeCamera.position.z = 210;

  adminGlobeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  adminGlobeRenderer.setSize(w, h);
  adminGlobeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(adminGlobeRenderer.domElement);

  // Lights
  adminGlobeScene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  dirLight.position.set(120, 80, 100);
  adminGlobeScene.add(dirLight);

  // Earth Sphere
  const earthTexture = createAdminEarthTexture();
  const earthGeo = new THREE.SphereGeometry(65, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 30,
    specular: new THREE.Color(0x38bdf8),
    emissive: new THREE.Color(0x060812)
  });
  adminGlobeSphere = new THREE.Mesh(earthGeo, earthMat);
  adminGlobeScene.add(adminGlobeSphere);

  // Outer Atmosphere
  const atmoGeo = new THREE.SphereGeometry(67, 64, 64);
  const atmoMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.1, side: THREE.BackSide });
  adminGlobeScene.add(new THREE.Mesh(atmoGeo, atmoMat));

  // Markers
  adminGlobeMarkersGroup = new THREE.Group();
  adminGlobeSphere.add(adminGlobeMarkersGroup);

  // Mouse Drag Controls
  container.addEventListener('mousedown', (e) => {
    isDraggingAdminGlobe = true;
    adminMousePrev = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDraggingAdminGlobe = false; });

  container.addEventListener('mousemove', (e) => {
    if (!isDraggingAdminGlobe) return;
    const deltaX = e.clientX - adminMousePrev.x;
    const deltaY = e.clientY - adminMousePrev.y;
    adminGlobeSphere.rotation.y += deltaX * 0.005;
    adminGlobeSphere.rotation.x += deltaY * 0.005;
    adminMousePrev = { x: e.clientX, y: e.clientY };
  });

  function animateAdminGlobe() {
    requestAnimationFrame(animateAdminGlobe);
    if (!isDraggingAdminGlobe) adminGlobeSphere.rotation.y += 0.0015;
    adminGlobeRenderer.render(adminGlobeScene, adminGlobeCamera);
  }
  animateAdminGlobe();
}

function createAdminEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Continent outlines
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  const continents = [
    [[500, 100], [650, 80], [800, 100], [850, 180], [750, 250], [650, 300], [600, 400], [550, 320], [470, 220]],
    [[180, 80], [300, 90], [280, 200], [320, 300], [290, 420], [250, 320], [190, 200], [150, 120]],
    [[800, 320], [880, 320], [890, 400], [820, 410]]
  ];

  continents.forEach(poly => {
    ctx.beginPath();
    poly.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  return new THREE.CanvasTexture(canvas);
}

function plotAdminGlobePins() {
  if (!adminGlobeMarkersGroup) return;
  while (adminGlobeMarkersGroup.children.length > 0) {
    adminGlobeMarkersGroup.remove(adminGlobeMarkersGroup.children[0]);
  }

  const radius = 65;
  currentVisitors.forEach(v => {
    if (v.latitude && v.longitude && (v.latitude !== 0 || v.longitude !== 0)) {
      const phi = (90 - v.latitude) * (Math.PI / 180);
      const theta = (v.longitude + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      const pinGeo = new THREE.SphereGeometry(1.5, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, y, z);

      // Radar Ring
      const ringGeo = new THREE.RingGeometry(2.0, 2.5, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      pin.add(ring);

      adminGlobeMarkersGroup.add(pin);
    }
  });
}

// ---------------- EVENT LISTENERS ----------------
function setupEventListeners() {
  document.getElementById('btnLogout').addEventListener('click', logout);
  document.getElementById('btnRefresh').addEventListener('click', () => {
    fetchAllData();
    showToast('Telemetry refreshed');
  });

  document.getElementById('btnSeedDemo').addEventListener('click', seedDemoData);
  document.getElementById('btnClearLogs').addEventListener('click', clearAllLogs);
  document.getElementById('btnExportCsv').addEventListener('click', exportCsv);

  // Audio Toggle
  document.getElementById('btnAudioToggle').addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    document.getElementById('audioStatusText').textContent = audioEnabled ? 'ON' : 'OFF';
    document.getElementById('audioIcon').textContent = audioEnabled ? '🔔' : '🔕';
    showToast(`Audio alerts turned ${audioEnabled ? 'ON' : 'OFF'}`);
  });

  // Map 2D vs 3D Globe View Switcher
  const btnMap2D = document.getElementById('btnMap2D');
  const btnMap3D = document.getElementById('btnMap3D');
  const visitorMap = document.getElementById('visitorMap');
  const visitorGlobe3D = document.getElementById('visitorGlobe3D');

  btnMap2D.addEventListener('click', () => {
    btnMap2D.classList.add('active');
    btnMap3D.classList.remove('active');
    visitorMap.style.display = 'block';
    visitorGlobe3D.style.display = 'none';
    if (map2DInstance) map2DInstance.invalidateSize();
  });

  btnMap3D.addEventListener('click', () => {
    btnMap3D.classList.add('active');
    btnMap2D.classList.remove('active');
    visitorMap.style.display = 'none';
    visitorGlobe3D.style.display = 'block';
    plotAdminGlobePins();
    if (adminGlobeRenderer) {
      adminGlobeRenderer.setSize(visitorGlobe3D.clientWidth, visitorGlobe3D.clientHeight);
    }
  });

  // Table search & filter
  document.getElementById('tableSearchInput').addEventListener('input', applyTableFilters);
  document.getElementById('countryFilterSelect').addEventListener('change', applyTableFilters);
}

// ---------------- DATA FETCHING ----------------
async function fetchAllData() {
  if (!adminKey) return;

  try {
    const [statsRes, visitorsRes] = await Promise.all([
      fetch('/api/admin/stats', { headers: { 'x-admin-key': adminKey } }),
      fetch('/api/admin/visitors', { headers: { 'x-admin-key': adminKey } })
    ]);

    if (statsRes.status === 401 || visitorsRes.status === 401) {
      logout();
      return;
    }

    const stats = await statsRes.json();
    const visitorsData = await visitorsRes.json();

    updateStatsUI(stats);
    currentVisitors = visitorsData.visitors || [];
    updateVisitorsUI(currentVisitors);
    plotMapMarkers(currentVisitors, true);
    plotAdminGlobePins();
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

function updateStatsUI(stats) {
  document.getElementById('kpiTotalHits').textContent = Number(stats.totalVisits || 0).toLocaleString();
  document.getElementById('kpiUniqueIps').textContent = Number(stats.uniqueIPs || 0).toLocaleString();
  document.getElementById('kpiCountries').textContent = Number(stats.countriesCount || 0).toLocaleString();
  document.getElementById('kpiLast24h').textContent = Number(stats.last24h || 0).toLocaleString();

  // Country Bars
  const countryListEl = document.getElementById('countryList');
  countryListEl.innerHTML = '';

  if (!stats.topCountries || stats.topCountries.length === 0) {
    countryListEl.innerHTML = '<div class="empty-state">No country telemetry recorded yet.</div>';
  } else {
    const maxCount = Math.max(...stats.topCountries.map(c => c.visitor_count), 1);
    stats.topCountries.forEach(c => {
      const flag = getCountryFlag(c.country_code);
      const pct = Math.round((c.visitor_count / maxCount) * 100);

      const item = document.createElement('div');
      item.className = 'country-item';
      item.innerHTML = `
        <div class="country-item-meta">
          <span class="country-name">${flag} ${c.country}</span>
          <span class="country-count">${c.visitor_count} (${c.total_hits} hits)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%;"></div>
        </div>
      `;
      countryListEl.appendChild(item);
    });
  }

  // Devices & Platform
  const deviceChipsEl = document.getElementById('deviceChips');
  deviceChipsEl.innerHTML = '';

  const allChips = [];
  (stats.devices || []).forEach(d => allChips.push({ label: d.device_type, val: d.count }));
  (stats.operatingSystems || []).forEach(os => allChips.push({ label: os.os, val: os.count }));
  (stats.browsers || []).forEach(b => allChips.push({ label: b.browser, val: b.count }));

  if (allChips.length === 0) {
    deviceChipsEl.innerHTML = '<span class="empty-state">No device data.</span>';
  } else {
    allChips.forEach(chip => {
      const chipEl = document.createElement('div');
      chipEl.className = 'chip';
      chipEl.innerHTML = `
        <span class="chip-label">${chip.label}:</span>
        <span class="chip-val">${chip.val}</span>
      `;
      deviceChipsEl.appendChild(chipEl);
    });
  }
}

// Plot Markers on 2D Leaflet Map
function plotMapMarkers(visitors, fitBounds = true) {
  if (!map2DInstance) return;

  mapMarkers.forEach(m => map2DInstance.removeLayer(m));
  mapMarkers = [];
  const validCoords = [];

  visitors.forEach(v => {
    if (v.latitude && v.longitude && (v.latitude !== 0 || v.longitude !== 0)) {
      const flag = getCountryFlag(v.country_code);
      const icon = L.divIcon({
        className: 'custom-pin-container',
        html: `<div class="custom-pin" title="${v.city}, ${v.country}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([v.latitude, v.longitude], { icon }).addTo(map2DInstance);
      const popupContent = `
        <div style="font-family: var(--font-sans); color: #0f172a; padding: 4px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
            ${flag} ${v.city || 'Unknown'}, ${v.region || ''}
          </div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 2px;">
            Country: <strong>${v.country}</strong>
          </div>
          <div style="font-size: 11px; font-family: monospace; color: #2563eb; margin-bottom: 4px;">
            IP: ${v.ip}
          </div>
          <div style="font-size: 11px; color: #64748b;">
            ISP: ${v.isp || 'N/A'}<br>
            Device: ${v.device_type} (${v.os} • ${v.browser})<br>
            Hits: ${v.visit_count}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      mapMarkers.push(marker);
      validCoords.push([v.latitude, v.longitude]);
    }
  });

  if (fitBounds && validCoords.length > 0) {
    map2DInstance.fitBounds(validCoords, { padding: [50, 50], maxZoom: 8 });
  }
}

// ---------------- VISITORS TABLE ----------------
function updateVisitorsUI(visitors) {
  document.getElementById('logCountBadge').textContent = `${visitors.length} records`;

  const countrySelect = document.getElementById('countryFilterSelect');
  const currentSelected = countrySelect.value;
  
  visitors.forEach(v => {
    if (v.country && v.country !== 'Unknown') allCountriesSet.add(v.country);
  });

  const currentOptionsCount = countrySelect.options.length - 1;
  if (currentOptionsCount !== allCountriesSet.size) {
    countrySelect.innerHTML = '<option value="ALL">All Countries</option>';
    Array.from(allCountriesSet).sort().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      if (c === currentSelected) opt.selected = true;
      countrySelect.appendChild(opt);
    });
  }

  applyTableFilters();
}

function applyTableFilters() {
  const searchTerm = document.getElementById('tableSearchInput').value.toLowerCase().trim();
  const selectedCountry = document.getElementById('countryFilterSelect').value;

  const filtered = currentVisitors.filter(v => {
    if (selectedCountry !== 'ALL' && v.country !== selectedCountry) return false;
    if (searchTerm) {
      const matchString = `${v.ip} ${v.country} ${v.region} ${v.city} ${v.isp} ${v.browser} ${v.os}`.toLowerCase();
      if (!matchString.includes(searchTerm)) return false;
    }
    return true;
  });

  renderTableRows(filtered);
}

function renderTableRows(visitors) {
  const tbody = document.getElementById('telemetryTbody');
  tbody.innerHTML = '';

  if (visitors.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">No telemetry records match the current criteria.</td>
      </tr>
    `;
    return;
  }

  visitors.forEach(v => {
    const tr = document.createElement('tr');
    tr.id = `row-visitor-${v.id}`;
    const flag = getCountryFlag(v.country_code);
    const relTime = formatRelativeTime(v.last_visited_at);

    let coordsHtml = '<span style="color: var(--text-muted);">N/A</span>';
    if (v.latitude && v.longitude) {
      coordsHtml = `
        <a 
          href="https://www.google.com/maps?q=${v.latitude},${v.longitude}" 
          target="_blank" 
          rel="noopener" 
          class="coords-link"
          title="Open in Google Maps"
        >
          ${v.latitude.toFixed(3)}, ${v.longitude.toFixed(3)} ↗
        </a>
      `;
    }

    tr.innerHTML = `
      <td title="${v.last_visited_at}">
        <span style="font-weight: 500;">${relTime}</span>
      </td>
      <td>
        <div class="ip-cell">
          <span>${v.ip}</span>
          <button class="copy-btn" onclick="copyIp('${v.ip}')" title="Copy IP">📋</button>
        </div>
      </td>
      <td>
        <span class="country-flag-badge">${flag} ${v.country || 'Unknown'}</span>
      </td>
      <td>${v.region || 'Unknown'}</td>
      <td><strong>${v.city || 'Unknown'}</strong></td>
      <td>${coordsHtml}</td>
      <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${v.isp || ''}">
        ${v.isp || 'Unknown'}
      </td>
      <td>
        <span class="badge-device">${v.device_type} • ${v.os}</span>
      </td>
      <td>
        <span class="badge-hits">${v.visit_count}</span>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem;">
          <button class="btn-table-action" onclick="openDetailsModal(${v.id})" title="View Raw Telemetry">Inspect</button>
          <button class="btn-table-action btn-table-del" onclick="deleteVisitorRow(${v.id})" title="Delete Record">✕</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function copyIp(ip) {
  navigator.clipboard.writeText(ip).then(() => {
    showToast(`Copied ${ip} to clipboard`);
  });
}

// ---------------- ACTIONS & MANAGEMENT ----------------
async function seedDemoData() {
  if (!confirm('Populate realistic sample visitors from US, UK, Japan, Germany, India, and Australia?')) return;

  try {
    const res = await fetch('/api/admin/seed-demo', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey }
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Sample visitors seeded successfully!');
      fetchAllData();
    } else {
      alert(data.error || 'Seed failed');
    }
  } catch (err) {
    alert('Failed to seed demo data');
  }
}

async function deleteVisitorRow(id) {
  if (!confirm(`Delete record #${id}?`)) return;

  try {
    const res = await fetch(`/api/admin/visitors/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey }
    });
    if (res.ok) {
      showToast(`Record #${id} deleted`);
      fetchAllData();
    }
  } catch (err) {
    alert('Deletion failed');
  }
}

async function clearAllLogs() {
  if (!confirm('WARNING: Are you sure you want to permanently purge all visitor records?')) return;

  try {
    const res = await fetch('/api/admin/clear', {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey }
    });
    if (res.ok) {
      showToast('All logs successfully cleared');
      fetchAllData();
    }
  } catch (err) {
    alert('Failed to clear logs');
  }
}

function exportCsv() {
  window.location.href = `/api/admin/export?key=${encodeURIComponent(adminKey)}`;
}

// ---------------- DETAILS MODAL ----------------
function openDetailsModal(id) {
  const visitor = currentVisitors.find(v => v.id === id);
  if (!visitor) return;

  document.getElementById('modalTitle').textContent = `Visitor Telemetry #${visitor.id} — ${visitor.ip}`;
  const body = document.getElementById('modalBody');

  body.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <h4 style="margin-bottom: 0.5rem; color: #fff;">Summary Highlights</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">
        <div><strong>Country:</strong> ${visitor.country} (${visitor.country_code})</div>
        <div><strong>State / Region:</strong> ${visitor.region}</div>
        <div><strong>City:</strong> ${visitor.city}</div>
        <div><strong>Postal Code:</strong> ${visitor.postal || 'N/A'}</div>
        <div><strong>Latitude:</strong> ${visitor.latitude}</div>
        <div><strong>Longitude:</strong> ${visitor.longitude}</div>
        <div><strong>Network / ISP:</strong> ${visitor.isp}</div>
        <div><strong>Timezone:</strong> ${visitor.timezone || 'N/A'}</div>
        <div><strong>Platform:</strong> ${visitor.device_type} • ${visitor.os}</div>
        <div><strong>Browser:</strong> ${visitor.browser}</div>
        <div><strong>Screen Resolution:</strong> ${visitor.screen_resolution}</div>
        <div><strong>Language:</strong> ${visitor.language}</div>
        <div><strong>Total Visits:</strong> ${visitor.visit_count}</div>
        <div><strong>First Seen:</strong> ${visitor.first_visited_at}</div>
        <div><strong>Last Seen:</strong> ${visitor.last_visited_at}</div>
      </div>
    </div>
    <div>
      <h4 style="margin-bottom: 0.5rem; color: #fff;">Raw Payload / User-Agent</h4>
      <div class="raw-json-box">${JSON.stringify(visitor, null, 2)}</div>
    </div>
  `;

  document.getElementById('detailsModal').style.display = 'flex';
}

function closeDetailsModal() {
  document.getElementById('detailsModal').style.display = 'none';
}
