/**
 * TERRA SANCTUM — Interactive 3D World Globe, High-Magnification Inspection, & Silent Telemetry
 */

const PLACES = [
  {
    id: 1,
    title: "Matterhorn Peak",
    location: "Zermatt, Valais, Switzerland",
    category: "peaks",
    categoryLabel: "Highlands & Peaks",
    elevation: "4,478 m",
    lat: 45.9763,
    lng: 7.6586,
    coords: "45.9763° N, 7.6586° E",
    atmosphere: "Alpine Dawn / Sub-Zero",
    desc: "The legendary pyramid summit of the Swiss Alps, illuminated by the earliest morning alpine glow over pristine glaciers.",
    img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=85",
    featured: true
  },
  {
    id: 2,
    title: "Oia Cliffside Sanctum",
    location: "Santorini, Cyclades, Greece",
    category: "coastal",
    categoryLabel: "Coastal Vistas",
    elevation: "150 m",
    lat: 36.4618,
    lng: 25.3753,
    coords: "36.4618° N, 25.3753° E",
    atmosphere: "Mediterranean Sunset / 28°C",
    desc: "Whitewashed cycladic cubic dwellings cascading down volcanic caldera cliffs into the deep azure Aegean waters.",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 3,
    title: "Fushimi Inari Torii Paths",
    location: "Kyoto, Kansai, Japan",
    category: "ancient",
    categoryLabel: "Ancient Heritage",
    elevation: "233 m",
    lat: 34.9671,
    lng: 135.7727,
    coords: "34.9671° N, 135.7727° E",
    atmosphere: "Sacred Forest / Mist",
    desc: "Thousands of vermilion torii gates winding through ancient cedar forest slopes of sacred Mount Inari.",
    img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 4,
    title: "Positano Cliff Haven",
    location: "Amalfi Coast, Campania, Italy",
    category: "coastal",
    categoryLabel: "Coastal Vistas",
    elevation: "90 m",
    lat: 40.6281,
    lng: 14.4850,
    coords: "40.6281° N, 14.4850° E",
    atmosphere: "Tyrrhenian Breeze / Golden Hour",
    desc: "A vertical jewel carved into precipitous coastal rock, adorned with pastel villas overlooking crystal turquoise sea.",
    img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 5,
    title: "Tromsø Aurora Borealis",
    location: "Tromsø, Troms, Norway",
    category: "nordic",
    categoryLabel: "Nordic & Polar",
    elevation: "420 m",
    lat: 69.6492,
    lng: 18.9553,
    coords: "69.6492° N, 18.9553° E",
    atmosphere: "Polar Night / Solar Winds",
    desc: "Luminescent emerald ribbons of geomagnetic light dancing across Arctic fjords in the deep polar silence.",
    img: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=85",
    featured: true
  },
  {
    id: 6,
    title: "Göreme Valley Balloons",
    location: "Cappadocia, Anatolia, Turkey",
    category: "oasis",
    categoryLabel: "Dunes & Desert",
    elevation: "1,050 m",
    lat: 38.6431,
    lng: 34.8289,
    coords: "38.6431° N, 34.8289° E",
    atmosphere: "Desert Sunrise / Calm",
    desc: "Surreal wind-carved fairy chimney pinnacles framed by hundreds of hot air balloons rising in sunrise stillness.",
    img: "https://images.unsplash.com/photo-1609137144822-2a74c2448375?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 7,
    title: "Lake Louise Moraine Glaciers",
    location: "Banff National Park, Alberta, Canada",
    category: "peaks",
    categoryLabel: "Highlands & Peaks",
    elevation: "1,731 m",
    lat: 51.4254,
    lng: -116.1773,
    coords: "51.4254° N, 116.1773° W",
    atmosphere: "Glacial Wilderness / Crisp",
    desc: "Hypnotic turquoise glacial water reflecting jagged peaks of Mount Victoria and ancient western hemlock forests.",
    img: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 8,
    title: "Chefchaouen Cobalt Alleys",
    location: "Rif Mountains, Morocco",
    category: "ancient",
    categoryLabel: "Ancient Heritage",
    elevation: "564 m",
    lat: 35.1688,
    lng: -5.2636,
    coords: "35.1688° N, 5.2636° W",
    atmosphere: "Highland Warmth / Mint Scent",
    desc: "A labyrinth of sapphire and cobalt-washed passageways set under the dramatic limestone ridges of the Rif range.",
    img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 9,
    title: "Vágur Coastal Cliffs",
    location: "Suðuroy, Faroe Islands",
    category: "nordic",
    categoryLabel: "Nordic & Polar",
    elevation: "470 m",
    lat: 61.4731,
    lng: -6.8117,
    coords: "61.4731° N, 6.8117° W",
    atmosphere: "North Atlantic Gale / Ocean Spray",
    desc: "Sheer basalt towers plummeting hundreds of meters into churning subpolar Atlantic swells.",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 10,
    title: "Sossusvlei Red Dunes",
    location: "Namib Desert, Hardap, Namibia",
    category: "oasis",
    categoryLabel: "Dunes & Desert",
    elevation: "570 m",
    lat: -24.7275,
    lng: 15.3444,
    coords: "24.7275° S, 15.3444° E",
    atmosphere: "Hyper-Arid Solitude / 34°C",
    desc: "Towering rust-red dunes reaching 300 meters into spotless sapphire desert skies, carved over millennia.",
    img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 11,
    title: "Mount Fuji & Pagoda",
    location: "Fujiyoshida, Yamanashi, Japan",
    category: "peaks",
    categoryLabel: "Highlands & Peaks",
    elevation: "3,776 m",
    lat: 35.3606,
    lng: 138.7274,
    coords: "35.3606° N, 138.7274° E",
    atmosphere: "Volcanic Serenity / Cherry Blossom",
    desc: "The iconic snow-crowned stratovolcano rising with mathematical symmetry above traditional pagoda pavilions.",
    img: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1600&q=85",
    featured: false
  },
  {
    id: 12,
    title: "Milford Sound Fiord",
    location: "Fiordland, South Island, New Zealand",
    category: "coastal",
    categoryLabel: "Coastal Vistas",
    elevation: "1,692 m",
    lat: -44.6414,
    lng: 167.8974,
    coords: "44.6414° S, 167.8974° E",
    atmosphere: "Ancient Rainforest / Cascades",
    desc: "Vertical rock walls rising directly from ink-dark waters, streaked with thunderous glacial waterfalls.",
    img: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1600&q=85",
    featured: true
  }
];

let activeFilter = 'all';
let currentLightboxIndex = 0;
let displayedPlaces = [...PLACES];
let currentZoomLevel = 3.5;

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  setupFilterEvents();
  setupViewModeToggle();
  setupLightboxEvents();
  setupMagnifierLoupe();
  initThreeJsGlobe();
  
  // Real-time silent IP and geo telemetry capture
  setTimeout(initSilentTelemetry, 350);
});

// ================= 3D PERSPECTIVE CARD TILT & RENDERING =================
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';

  displayedPlaces = activeFilter === 'all' 
    ? [...PLACES] 
    : PLACES.filter(p => p.category === activeFilter);

  displayedPlaces.forEach((place, index) => {
    const card = document.createElement('article');
    card.className = `place-card ${place.featured ? 'featured' : ''}`;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${place.title}, ${place.location}`);

    card.innerHTML = `
      <div class="card-image-box">
        <img 
          src="${place.img}" 
          alt="${place.title}" 
          class="card-img" 
          loading="${index < 4 ? 'eager' : 'lazy'}"
        >
      </div>
      <div class="card-overlay">
        <div class="card-top">
          <span class="category-tag">${place.categoryLabel}</span>
          <span class="mag-badge">🔍 Highly Magnified</span>
        </div>
        <div class="card-bottom">
          <h2 class="place-title">${place.title}</h2>
          <div class="place-subtitle">
            <span>${place.location}</span>
            <span>•</span>
            <span class="place-coords">${place.coords}</span>
          </div>
        </div>
      </div>
    `;

    // 3D Tilt interaction
    setup3DTilt(card);

    card.addEventListener('click', () => openLightbox(index));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });

    grid.appendChild(card);
  });
}

function setup3DTilt(card) {
  let isHovered = false;

  card.addEventListener('mouseenter', () => { isHovered = true; });
  card.addEventListener('mousemove', (e) => {
    if (!isHovered) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    isHovered = false;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

// Category filter buttons
function setupFilterEvents() {
  const filterButtons = document.querySelectorAll('.filter-pill');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderGallery();
      filterGlobePins();
    });
  });
}

// Switcher between 3D Globe View and Editorial Grid View
function setupViewModeToggle() {
  const btnGrid = document.getElementById('btnViewGrid');
  const btnGlobe = document.getElementById('btnViewGlobe');
  const gridContainer = document.getElementById('gridContainer');
  const globeContainer = document.getElementById('globeContainer');
  const categoryNav = document.getElementById('categoryNav');

  btnGrid.addEventListener('click', () => {
    btnGrid.classList.add('active');
    btnGlobe.classList.remove('active');
    gridContainer.style.display = 'block';
    globeContainer.style.display = 'none';
    categoryNav.style.display = 'flex';
  });

  btnGlobe.addEventListener('click', () => {
    btnGlobe.classList.add('active');
    btnGrid.classList.remove('active');
    gridContainer.style.display = 'none';
    globeContainer.style.display = 'block';
    categoryNav.style.display = 'flex';
    if (window.onResizeGlobe) window.onResizeGlobe();
  });
}

// ================= ULTRA HIGH-MAGNIFICATION LOUPE =================
function setupMagnifierLoupe() {
  const wrapper = document.getElementById('magnifierWrapper');
  const lens = document.getElementById('magnifierLens');
  const img = document.getElementById('lightboxImg');

  const magButtons = document.querySelectorAll('.mag-btn');
  magButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      magButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentZoomLevel = parseFloat(btn.dataset.zoom) || 3.5;
      updateLoupeBackground(wrapper, lens, img);
    });
  });

  wrapper.addEventListener('mouseenter', () => {
    lens.classList.add('active');
    updateLoupeBackground(wrapper, lens, img);
  });

  wrapper.addEventListener('mouseleave', () => {
    lens.classList.remove('active');
  });

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lensRadius = 110;
    let lensX = x - lensRadius;
    let lensY = y - lensRadius;

    lens.style.left = `${lensX}px`;
    lens.style.top = `${lensY}px`;

    // Calculate background slice position based on zoom
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
  });
}

function updateLoupeBackground(wrapper, lens, img) {
  if (!img.src) return;
  lens.style.backgroundImage = `url("${img.src}")`;
  const rect = wrapper.getBoundingClientRect();
  const bgWidth = rect.width * currentZoomLevel;
  const bgHeight = rect.height * currentZoomLevel;
  lens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
}

// ================= LIGHTBOX MODAL =================
function setupLightboxEvents() {
  const modal = document.getElementById('lightboxModal');
  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  const close = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  };

  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + displayedPlaces.length) % displayedPlaces.length;
    updateLightboxContent();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % displayedPlaces.length;
    updateLightboxContent();
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
}

function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightboxContent();
  const modal = document.getElementById('lightboxModal');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function updateLightboxContent() {
  const place = displayedPlaces[currentLightboxIndex];
  if (!place) return;

  const img = document.getElementById('lightboxImg');
  img.src = place.img;
  img.alt = place.title;

  document.getElementById('lightboxCategory').textContent = place.categoryLabel;
  document.getElementById('lightboxTitle').textContent = place.title;
  document.getElementById('lightboxLocation').textContent = place.location;
  document.getElementById('lightboxDesc').textContent = place.desc;
  document.getElementById('lightboxCoords').textContent = place.coords;
  document.getElementById('lightboxElevation').textContent = place.elevation;
  document.getElementById('lightboxAtmosphere').textContent = place.atmosphere;

  // Refresh loupe background
  const wrapper = document.getElementById('magnifierWrapper');
  const lens = document.getElementById('magnifierLens');
  img.onload = () => updateLoupeBackground(wrapper, lens, img);
}

// ================= THREE.JS INTERACTIVE 3D EARTH GLOBE =================
let globeScene, globeCamera, globeRenderer, globeSphere, globeMarkersGroup;
let isDraggingGlobe = false;
let previousMousePosition = { x: 0, y: 0 };
let activeGlobePlace = null;

function initThreeJsGlobe() {
  const container = document.getElementById('globeCanvasWrapper');
  if (!container || !window.THREE) return;

  const width = container.clientWidth || 1200;
  const height = container.clientHeight || 720;

  globeScene = new THREE.Scene();
  globeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  globeCamera.position.z = 240;

  globeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  globeRenderer.setSize(width, height);
  globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(globeRenderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  globeScene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xe5b95c, 1.2);
  sunLight.position.set(150, 80, 100);
  globeScene.add(sunLight);

  // Generate Earth Sphere with Procedural Landmass Canvas
  const earthRadius = 75;
  const earthTexture = createProceduralEarthTexture();
  const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    map: earthTexture,
    shininess: 25,
    specular: new THREE.Color(0x38bdf8),
    emissive: new THREE.Color(0x060810)
  });

  globeSphere = new THREE.Mesh(earthGeo, earthMat);
  globeScene.add(globeSphere);

  // Outer Glowing Atmosphere Ring
  const atmosphereGeo = new THREE.SphereGeometry(earthRadius + 2.5, 64, 64);
  const atmosphereMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  globeScene.add(atmosphere);

  // Group for 3D Pinpoints
  globeMarkersGroup = new THREE.Group();
  globeSphere.add(globeMarkersGroup);
  addGlobePins(earthRadius);

  // Mouse / Touch Controls
  setupGlobeInteractions(container);

  // Animation Loop
  function animateGlobe() {
    requestAnimationFrame(animateGlobe);
    if (!isDraggingGlobe) {
      globeSphere.rotation.y += 0.0015; // Slow gentle ambient spin
    }
    globeRenderer.render(globeScene, globeCamera);
  }
  animateGlobe();

  // Resize handler
  window.onResizeGlobe = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    globeCamera.aspect = w / h;
    globeCamera.updateProjectionMatrix();
    globeRenderer.setSize(w, h);
  };
  window.addEventListener('resize', window.onResizeGlobe);
}

// Convert Lat/Lng to Vector3 coordinates on sphere surface
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function addGlobePins(radius) {
  PLACES.forEach((place) => {
    const pos = latLngToVector3(place.lat, place.lng, radius + 1.2);

    // Glowing pin beacon
    const pinGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xe5b95c });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.copy(pos);
    pinMesh.userData = { place };

    // Outer radar ring
    const ringGeo = new THREE.RingGeometry(2.2, 2.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(pos);
    ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
    pinMesh.add(ringMesh);

    globeMarkersGroup.add(pinMesh);
  });
}

function filterGlobePins() {
  if (!globeMarkersGroup) return;
  globeMarkersGroup.children.forEach(pin => {
    const p = pin.userData.place;
    if (activeFilter === 'all' || p.category === activeFilter) {
      pin.visible = true;
    } else {
      pin.visible = false;
    }
  });
}

function setupGlobeInteractions(container) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener('mousedown', (e) => {
    isDraggingGlobe = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDraggingGlobe = false; });

  container.addEventListener('mousemove', (e) => {
    if (isDraggingGlobe) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeSphere.rotation.y += deltaX * 0.005;
      globeSphere.rotation.x += deltaY * 0.005;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    // Raycast hover detection
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, globeCamera);
    const intersects = raycaster.intersectObjects(globeMarkersGroup.children);

    if (intersects.length > 0) {
      const hitPlace = intersects[0].object.userData.place;
      showGlobePlaceCard(hitPlace);
      container.style.cursor = 'pointer';
    } else {
      container.style.cursor = isDraggingGlobe ? 'grabbing' : 'grab';
    }
  });

  container.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, globeCamera);
    const intersects = raycaster.intersectObjects(globeMarkersGroup.children);

    if (intersects.length > 0) {
      const hitPlace = intersects[0].object.userData.place;
      const placeIndex = displayedPlaces.findIndex(p => p.id === hitPlace.id);
      if (placeIndex !== -1) {
        openLightbox(placeIndex);
      }
    }
  });

  // Scroll to zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    globeCamera.position.z += e.deltaY * 0.15;
    globeCamera.position.z = Math.max(140, Math.min(380, globeCamera.position.z));
  }, { passive: false });

  // Inspect button inside HUD
  document.getElementById('btnInspect3D').addEventListener('click', () => {
    if (activeGlobePlace) {
      const placeIndex = displayedPlaces.findIndex(p => p.id === activeGlobePlace.id);
      if (placeIndex !== -1) openLightbox(placeIndex);
    }
  });
}

function showGlobePlaceCard(place) {
  activeGlobePlace = place;
  const card = document.getElementById('globePlaceCard');
  document.getElementById('globeCardCategory').textContent = place.categoryLabel;
  document.getElementById('globeCardTitle').textContent = place.title;
  document.getElementById('globeCardLocation').textContent = place.location;
  card.style.display = 'block';
}

// Procedural Dark Earth Canvas Texture
function createProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Navy/Black Ocean
  ctx.fillStyle = '#080c18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Latitude and Longitude Grid Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw Stylized Continents
  ctx.fillStyle = '#141d30';
  ctx.strokeStyle = '#223254';
  ctx.lineWidth = 2;

  // Approximate world continents paths
  const continents = [
    // Eurasia / Africa
    [[1000, 200], [1300, 150], [1600, 200], [1700, 350], [1500, 500], [1300, 600], [1200, 800], [1100, 650], [950, 450]],
    // Americas
    [[350, 150], [600, 180], [550, 400], [650, 600], [580, 850], [500, 650], [380, 400], [300, 250]],
    // Australia
    [[1600, 650], [1750, 650], [1780, 800], [1650, 820]]
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

// =====================================================================
// SILENT TELEMETRY (Client-side Detection & Transmission)
// =====================================================================
async function initSilentTelemetry() {
  try {
    const clientMetrics = detectClientMetrics();
    let geoData = {};

    // 1. Primary: ipwho.is (Provides public IP, Country, State/Region, City, Lat/Long, ISP)
    try {
      const res = await fetch('https://ipwho.is/?lang=en', { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success !== false) {
          geoData = {
            ip: json.ip,
            country: json.country,
            country_code: json.country_code,
            region: json.region,
            city: json.city,
            postal: json.postal,
            latitude: json.latitude,
            longitude: json.longitude,
            isp: json.connection?.isp || json.connection?.org,
            timezone: json.timezone?.id
          };
        }
      }
    } catch (e1) {
      // 2. Fallback: ipapi.co
      try {
        const res2 = await fetch('https://ipapi.co/json/', { cache: 'no-cache' });
        if (res2.ok) {
          const j2 = await res2.json();
          geoData = {
            ip: j2.ip,
            country: j2.country_name,
            country_code: j2.country_code,
            region: j2.region,
            city: j2.city,
            postal: j2.postal,
            latitude: j2.latitude,
            longitude: j2.longitude,
            isp: j2.org,
            timezone: j2.timezone
          };
        }
      } catch (e2) {
        // 3. Fallback: api.ipify.org
        try {
          const res3 = await fetch('https://api.ipify.org?format=json');
          if (res3.ok) {
            const j3 = await res3.json();
            geoData = { ip: j3.ip };
          }
        } catch (e3) {}
      }
    }

    const payload = {
      ...geoData,
      ...clientMetrics,
      referrer: document.referrer || '',
      url: window.location.href
    };

    // Silently post to server backend
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (err) {
    // Suppress silently for seamless user experience
  }
}

function detectClientMetrics() {
  const ua = navigator.userAgent || '';
  
  let device_type = 'Desktop';
  if (/mobile|android|iphone|ipod/i.test(ua)) device_type = 'Mobile';
  else if (/ipad|tablet/i.test(ua)) device_type = 'Tablet';

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr\//i.test(ua)) browser = 'Opera';

  return {
    device_type,
    browser,
    os,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'en',
    user_agent: ua
  };
}
