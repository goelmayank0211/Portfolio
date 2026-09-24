// =======================================================
// script.js — Mayank Goel Portfolio (120fps Smooth Optimized)
// =======================================================

// ─────────────────────────────────────────────────────────
// 0. DEVICE TIER DETECTION
// ─────────────────────────────────────────────────────────
(function () {
  var w = window.innerWidth;
  var mem = navigator.deviceMemory || 4;
  var cores = navigator.hardwareConcurrency || 4;
  var isTouch = 'ontouchstart' in window;
  var isMobile = w <= 768 || isTouch;
  var tier = 'high';
  if (isMobile || mem <= 2 || cores <= 2) tier = 'low';
  else if (w <= 1280 || mem <= 4 || cores <= 4) tier = 'mid';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) tier = 'low';

  window.__perf = {
    tier: tier,
    isMobile: isMobile,
    reduced: reduced,
    dpr: tier === 'low' ? 0.75 : (tier === 'mid' ? 0.9 : 1),
    targetFrameMs: tier === 'high' ? 1000 / 144 : (tier === 'mid' ? 1000 / 90 : 1000 / 60)
  };
})();

// ─────────────────────────────────────────────────────────
// 1. BACKGROUND — Canvas Particle Universe
// ─────────────────────────────────────────────────────────
(function () {
  var bgEl = document.getElementById('bgAnimation');
  if (!bgEl) return;

  var perf = window.__perf;
  var isMobile = perf.isMobile;
  var tier = perf.tier;

  var codeSymbolsArr = (typeof window.pageSpecificSymbols !== 'undefined')
    ? window.pageSpecificSymbols
    : ["MAYANK GOEL","Java","Python","SQL","MySQL","OOP","DSA","DBMS","HTML","CSS","JavaScript",
       "if","else","for","while","class","import","const","let","var","function","return","=>",
       "CODE","DEV","</>","JSON","{ }","< >","[ ]","( )","==","!=","&&","||",
       "++","--","+=","-=","void","int","float","string","boolean","null","true","false",
       "try","catch","finally","switch","case","break","continue","new","this","public","private","static","final"];

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  bgEl.insertBefore(canvas, bgEl.firstChild);
  var ctx = canvas.getContext('2d', { alpha: true });

  var W, H, CW, CH, mouse = { x: -9999, y: -9999 };
  var COUNT, CONNECT, CONNECT2, CONNECT_STEP;
  if (tier === 'low')      { COUNT = 30; CONNECT = 95;  CONNECT_STEP = 2; }
  else if (tier === 'mid') { COUNT = 56; CONNECT = 128; CONNECT_STEP = 1; }
  else                     { COUNT = 82; CONNECT = 142; CONNECT_STEP = 1; }
  CONNECT2 = CONNECT * CONNECT;
  var CELL_SIZE = CONNECT;

  var particles = [];
  var time = 0;

  var glowSprites = {};
  function makeGlowSprite(hue, sat) {
    var key = (hue|0) + '-' + (sat|0);
    if (glowSprites[key]) return glowSprites[key];
    var size = 64;
    var off = document.createElement('canvas');
    off.width = off.height = size;
    var octx = off.getContext('2d');
    var g = octx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0, 'hsla(' + hue + ',' + sat + '%,70%,0.55)');
    g.addColorStop(0.5, 'hsla(' + hue + ',' + sat + '%,70%,0.18)');
    g.addColorStop(1, 'hsla(' + hue + ',' + sat + '%,70%,0)');
    octx.fillStyle = g;
    octx.fillRect(0, 0, size, size);
    glowSprites[key] = off;
    return off;
  }

  function resize() {
    var dpr = perf.dpr;
    CW = bgEl.offsetWidth || window.innerWidth;
    CH = bgEl.offsetHeight || window.innerHeight;
    canvas.width  = Math.floor(CW * dpr);
    canvas.height = Math.floor(CH * dpr);
    canvas.style.width  = CW + 'px';
    canvas.style.height = CH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = CW; H = CH;
  }

  function P() {
    this.x = Math.random() * (W || window.innerWidth);
    this.y = Math.random() * (H || window.innerHeight);
    this.z = 0.3 + Math.random() * 1.7;
    this.vx = (Math.random() - 0.5) * 0.5 * this.z;
    this.vy = (Math.random() - 0.5) * 0.5 * this.z - 0.3 * this.z;
    this.r = (0.8 + Math.random() * 2) * this.z;
    var hueBase = Math.random() > 0.5 ? 190 : 280;
    this.hue = hueBase + (Math.floor(Math.random() * 4) * 10);
    this.sat = 90;
    this.pulse = Math.random() * Math.PI * 2;
    this.pSpeed = 0.010 + Math.random() * 0.018;
    this.orbitR = 0; this.orbitA = 0; this.orbitS = 0;
    if (Math.random() < 0.15) {
      this.orbitR = 80 + Math.random() * 200;
      this.orbitA = Math.random() * Math.PI * 2;
      this.orbitS = (Math.random() > 0.5 ? 1 : -1) * (0.0003 + Math.random() * 0.0006);
    }
    this.sprite = makeGlowSprite(this.hue, this.sat);
  }
  P.prototype.update = function () {
    this.pulse += this.pSpeed;
    if (this.orbitR > 0) {
      this.orbitA += this.orbitS;
      this.x = W / 2 + Math.cos(this.orbitA) * this.orbitR;
      this.y = H / 2 + Math.sin(this.orbitA) * this.orbitR;
    } else {
      if (mouse.x > 0) {
        var dx = mouse.x - this.x, dy = mouse.y - this.y;
        var d2 = dx * dx + dy * dy;
        var range = isMobile ? 150*150 : 300*300;
        if (d2 < range) {
          var maxDist = isMobile ? 150 : 300;
          var f = (1 - Math.sqrt(d2) / maxDist) * (isMobile ? 0.008 : 0.012);
          this.vx += dx * f; this.vy += dy * f;
        }
      }
      this.vx *= 0.982; this.vy *= 0.982;
      this.vy -= 0.006 * this.z;
      this.x += this.vx; this.y += this.vy;
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }
  };

  var nebulaCanvas = document.createElement('canvas');
  var nctx = nebulaCanvas.getContext('2d');
  var nebulaDirty = true;
  function resizeNebula() {
    nebulaCanvas.width = Math.max(1, Math.floor(W / 2));
    nebulaCanvas.height = Math.max(1, Math.floor(H / 2));
    nebulaDirty = true;
  }
  function renderNebula() {
    var w = nebulaCanvas.width, h = nebulaCanvas.height;
    var t = time * 0.0004;
    nctx.clearRect(0, 0, w, h);
    var blobs = [
      { x: w*0.15 + Math.sin(t*0.7)*60, y: h*0.2 + Math.cos(t*0.5)*40, r: w*0.55, c:'rgba(0,212,255,0.045)' },
      { x: w*0.85 + Math.cos(t*0.6)*50, y: h*0.8 + Math.sin(t*0.8)*45, r: w*0.60, c:'rgba(120,0,255,0.04)' },
      { x: w*0.5  + Math.sin(t*0.35)*40,y: h*0.5 + Math.cos(t*0.4)*35, r: w*0.40, c:'rgba(0,255,160,0.025)' }
    ];
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var g = nctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c); g.addColorStop(1, 'transparent');
      nctx.fillStyle = g; nctx.beginPath();
      nctx.arc(b.x, b.y, b.r, 0, Math.PI*2); nctx.fill();
    }
    nebulaDirty = false;
  }

  var hexCanvas = document.createElement('canvas');
  var hctx = hexCanvas.getContext('2d', { alpha: true });
  var hexBuiltW = 0, hexBuiltH = 0, hexSize = 70;
  function buildHexLayer() {
    hexSize = isMobile ? 55 : 70;
    var scale = tier === 'low' ? 0.35 : 0.5;
    hexCanvas.width = Math.max(1, Math.floor(W * scale));
    hexCanvas.height = Math.max(1, Math.floor(H * scale));
    hctx.setTransform(scale, 0, 0, scale, 0, 0);
    hctx.clearRect(0, 0, W, H);
    hctx.strokeStyle = isMobile ? 'rgba(0,212,255,0.018)' : 'rgba(0,212,255,0.025)';
    hctx.lineWidth = isMobile ? 0.6 : 0.8;
    var sz = hexSize;
    var rows = Math.ceil(H/sz)+3, cols = Math.ceil(W/sz)+3;
    for (var r = -2; r < rows; r++) {
      for (var c = -2; c < cols; c++) {
        var cx = c * sz * 1.732 + (r%2) * sz * 0.866;
        var cy = r * sz * 1.5;
        hctx.beginPath();
        for (var i = 0; i < 6; i++) {
          var a = (Math.PI/3)*i - Math.PI/6;
          var px = cx + sz*Math.cos(a)*0.88;
          var py = cy + sz*Math.sin(a)*0.88;
          if (i === 0) hctx.moveTo(px, py); else hctx.lineTo(px, py);
        }
        hctx.closePath(); hctx.stroke();
      }
    }
    hexBuiltW = W; hexBuiltH = H;
  }
  function drawHexGrid() {
    if (hexBuiltW !== W || hexBuiltH !== H) buildHexLayer();
    ctx.save();
    var t = time * (isMobile ? 0.00002 : 0.00003);
    ctx.translate(W/2, H/2); ctx.rotate(t);
    ctx.drawImage(hexCanvas, -W/2, -H/2, W, H);
    ctx.restore();
  }

  var stars = [];
  var STAR_CAP = tier === 'low' ? 2 : 5;
  function spawnStar() {
    stars.push({ x: Math.random()*W, y: Math.random()*H*0.5,
                 vx: 4+Math.random()*8, vy: 1+Math.random()*3,
                 life:1, maxLen:80+Math.random()*120 });
  }
  function drawStars() {
    if (Math.random() < 0.008 && stars.length < STAR_CAP) spawnStar();
    for (var i = stars.length - 1; i >= 0; i--) {
      var s = stars[i];
      s.x += s.vx; s.y += s.vy; s.life -= 0.025;
      if (s.life <= 0) { stars.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.life * 0.9;
      ctx.strokeStyle = 'rgba(255,255,255,1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 6, s.y - s.vy * 6);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawVortex() {
    if (isMobile || mouse.x < 0) return;
    var rings = tier === 'mid' ? 3 : 4;
    for (var i = rings; i > 0; i--) {
      var r = i * 18 + Math.sin(time*0.05)*4;
      var alpha = (1 - i/rings) * 0.12;
      ctx.strokeStyle = 'rgba(0,212,255,'+alpha+')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, r, 0, Math.PI*2); ctx.stroke();
    }
    for (var j = 0; j < 6; j++) {
      var a = (time * 0.04) + j * Math.PI/3;
      ctx.strokeStyle = 'rgba(0,212,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mouse.x + Math.cos(a)*8,  mouse.y + Math.sin(a)*8);
      ctx.lineTo(mouse.x + Math.cos(a)*28, mouse.y + Math.sin(a)*28);
      ctx.stroke();
    }
  }

  var visible = true, inView = true;
  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
    }, { threshold: 0 });
    io.observe(bgEl);
  }

  var lastT = 0;
  var FRAME_MS = perf.targetFrameMs;
  var nebulaCounter = 0;
  var grid = Object.create(null), activeCells = [];

  function resetGrid(){ grid = Object.create(null); activeCells.length = 0; }
  function addToGrid(p){
    var cx = (p.x / CELL_SIZE) | 0, cy = (p.y / CELL_SIZE) | 0;
    var key = cx + ',' + cy;
    if (!grid[key]) { grid[key] = []; activeCells.push({ x: cx, y: cy, key: key }); }
    grid[key].push(p);
  }
  function connectPair(a, b){
    var dx = a.x - b.x, dy = a.y - b.y;
    var d2 = dx * dx + dy * dy;
    if (d2 >= CONNECT2) return;
    var alpha = (1 - d2 / CONNECT2) * 0.30 * (a.z + b.z) / 3.4;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = (a.z + b.z) * 0.16;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  function drawConnections(){
    ctx.strokeStyle = 'hsla(220,100%,70%,1)';
    ctx.globalAlpha = 1;
    for (var c = 0; c < activeCells.length; c += CONNECT_STEP) {
      var cell = activeCells[c], list = grid[cell.key];
      for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) connectPair(list[i], list[j]);
      for (var ox = 0; ox <= 1; ox++) {
        for (var oy = -1; oy <= 1; oy++) {
          if (ox === 0 && oy <= 0) continue;
          var near = grid[(cell.x + ox) + ',' + (cell.y + oy)];
          if (!near) continue;
          for (var a = 0; a < list.length; a++) for (var b = 0; b < near.length; b++) connectPair(list[a], near[b]);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    requestAnimationFrame(draw);
    if (!visible || !inView) return;
    var delta = now - lastT;
    if (delta < FRAME_MS) return;
    lastT = now - (delta % FRAME_MS);

    if (window.isScrolling) {
      if ((time & 3) !== 0) { time++; return; }
    }
    time++;

    ctx.clearRect(0, 0, W, H);

    if (nebulaDirty || (nebulaCounter++ & 3) === 0) renderNebula();
    ctx.drawImage(nebulaCanvas, 0, 0, W, H);

    drawHexGrid();
    if (!isMobile) drawVortex();
    drawStars();

    resetGrid();
    for (var u = 0; u < COUNT; u++) { particles[u].update(); addToGrid(particles[u]); }
    drawConnections();

    for (var k = 0; k < COUNT; k++) {
      var p = particles[k];
      var pr = p.r * (1 + Math.sin(p.pulse) * 0.35);
      var size = pr * 10;
      ctx.drawImage(p.sprite, p.x - size/2, p.y - size/2, size, size);
      ctx.fillStyle = 'hsla(' + p.hue + ',' + p.sat + '%,85%,' + (0.6 + p.z*0.25) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI*2); ctx.fill();
    }
  }

  function spawnSymbols() {
    var symLimit = tier === 'low' ? Math.min(14, codeSymbolsArr.length)
                 : tier === 'mid' ? Math.min(26, codeSymbolsArr.length)
                                  : Math.min(40, codeSymbolsArr.length);
    var frag = document.createDocumentFragment();
    var symStep = Math.max(1, Math.floor(codeSymbolsArr.length / symLimit));
    for (var j = 0; j < symLimit; j++) {
      var sym = document.createElement('div');
      sym.className = 'code-symbol';
      sym.textContent = codeSymbolsArr[(j * symStep) % codeSymbolsArr.length];
      sym.style.left = Math.random()*100 + '%';
      sym.style.animationDuration = (7+Math.random()*5) + 's';
      sym.style.animationDelay = (j * 1.2 + Math.random()*1.5) + 's';
      sym.style.fontSize = (1.0 + Math.random()*1.2) + 'rem';
      sym.style.zIndex = '2';
      frag.appendChild(sym);
    }
    var numShapes = tier === 'low' ? 4 : (tier === 'mid' ? 7 : 10);
    for (var i = 0; i < numShapes; i++) {
      var shape = document.createElement('div');
      var type = i % 2 === 0 ? 'circle' : 'square';
      shape.className = 'geometric-shape shape-' + type;
      var sz = 40 + Math.random()*90;
      shape.style.width = sz + 'px'; shape.style.height = sz + 'px';
      shape.style.left = Math.random()*100 + '%';
      shape.style.top = Math.random()*100 + '%';
      shape.style.animationDuration = (12 + Math.random()*22) + 's';
      shape.style.animationDelay = Math.random()*6 + 's';
      shape.style.zIndex = '1';
      frag.appendChild(shape);
    }
    bgEl.appendChild(frag);
  }

  var mouseQueued = false, pendingMX = 0, pendingMY = 0;
  function pumpMouse() {
    mouse.x = pendingMX; mouse.y = pendingMY;
    mouseQueued = false;
  }
  if (!isMobile) {
    document.addEventListener('mousemove', function (e) {
      pendingMX = e.clientX;
      pendingMY = e.clientY;
      if (!mouseQueued) { mouseQueued = true; requestAnimationFrame(pumpMouse); }
    }, { passive: true });
  } else {
    document.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      pendingMX = t.clientX; pendingMY = t.clientY;
      if (!mouseQueued) { mouseQueued = true; requestAnimationFrame(pumpMouse); }
    }, { passive: true });
    document.addEventListener('touchend', function () {
      mouse.x = -9999; mouse.y = -9999;
    }, { passive: true });
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize(); resizeNebula(); hexBuiltW = 0; hexBuiltH = 0;
    }, 150);
  }, { passive: true });

  resize(); resizeNebula();
  for (var n = 0; n < COUNT; n++) particles.push(new P());
  if ('requestIdleCallback' in window) {
    requestIdleCallback(spawnSymbols, { timeout: 1500 });
  } else {
    setTimeout(spawnSymbols, 100);
  }
  requestAnimationFrame(draw);
})();

// ─────────────────────────────────────────────────────────
// 2. MOBILE HAMBURGER MENU
// ─────────────────────────────────────────────────────────
var menuToggle = document.getElementById("menuToggle");
var navMenu = document.getElementById("navMenu");
var pageBody = document.body;
function openMenu(){if(!menuToggle||!navMenu)return;menuToggle.classList.add("active");navMenu.classList.add("active");pageBody.style.overflow="hidden";}
function closeMenu(){if(!menuToggle||!navMenu)return;menuToggle.classList.remove("active");navMenu.classList.remove("active");pageBody.style.overflow="";}
if(menuToggle&&navMenu){
  menuToggle.addEventListener("click",function(e){e.stopPropagation();navMenu.classList.contains("active")?closeMenu():openMenu();});
  var navLinks=navMenu.querySelectorAll("a"); for(var l=0;l<navLinks.length;l++)navLinks[l].addEventListener("click",closeMenu);
  document.addEventListener("click",function(e){if(navMenu.classList.contains("active")&&!menuToggle.contains(e.target)&&!navMenu.contains(e.target))closeMenu();});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&navMenu.classList.contains("active"))closeMenu();});
  var mobileHeader=navMenu.querySelector(".mobile-menu-header");
  if(mobileHeader){var closeBtn=document.createElement("button");closeBtn.className="mobile-close-btn";closeBtn.setAttribute("aria-label","Close menu");closeBtn.innerHTML='<i class="fa-solid fa-xmark"></i>';closeBtn.addEventListener("click",function(e){e.stopPropagation();closeMenu();});mobileHeader.appendChild(closeBtn);}
}

// ─────────────────────────────────────────────────────────
// 3. TYPING ANIMATION — Hero Section (FIXED)
// ─────────────────────────────────────────────────────────
var mainTitles=["Software Developer","Java Developer","Full Stack Java Developer"];
var mainTitleIndex=0,mainCharIndex=0,isMainDeleting=false;
var typingText=document.getElementById("typingText");
function typeMainTitle(){if(!typingText)return;var title=mainTitles[mainTitleIndex];if(isMainDeleting){mainCharIndex--;typingText.textContent=title.substring(0,mainCharIndex);}else{mainCharIndex++;typingText.textContent=title.substring(0,mainCharIndex);}var delay=isMainDeleting?50:100;if(!isMainDeleting&&mainCharIndex===title.length){delay=2000;isMainDeleting=true;}else if(isMainDeleting&&mainCharIndex===0){isMainDeleting=false;mainTitleIndex=(mainTitleIndex+1)%mainTitles.length;delay=500;}setTimeout(typeMainTitle,delay);}
if(typingText)typeMainTitle();

// ─────────────────────────────────────────────────────────
// 4. TYPING ANIMATION — Mobile Menu Subtitle (FIXED)
// ─────────────────────────────────────────────────────────
var mobileTitles=["Software Developer","Java Developer","Full Stack Java Developer"];
var mobileTitleIndex=0,mobileCharIndex=0,isMobileDeleting=false;
var mobileTypingText=document.getElementById("mobileTypingText");
function typeMobileTitle(){if(!mobileTypingText)return;var title=mobileTitles[mobileTitleIndex];if(isMobileDeleting){mobileCharIndex--;mobileTypingText.textContent=title.substring(0,mobileCharIndex);}else{mobileCharIndex++;mobileTypingText.textContent=title.substring(0,mobileCharIndex);}var delay=isMobileDeleting?40:80;if(!isMobileDeleting&&mobileCharIndex===title.length){delay=2000;isMobileDeleting=true;}else if(isMobileDeleting&&mobileCharIndex===0){isMobileDeleting=false;mobileTitleIndex=(mobileTitleIndex+1)%mobileTitles.length;delay=500;}setTimeout(typeMobileTitle,delay);}
if(mobileTypingText)typeMobileTitle();

// ─────────────────────────────────────────────────────────
// 5. SMOOTH SCROLLING
// ─────────────────────────────────────────────────────────
function getNavH(){var n=document.querySelector('nav');return n?n.offsetHeight:80;}
function scrollToSection(target){
  if(!target)return;
  var top=target.getBoundingClientRect().top+window.pageYOffset-getNavH()-10;
  if(typeof window.__lerpScrollTo === 'function'){
    window.__lerpScrollTo(top);
  } else {
    window.scrollTo({top:top,behavior:'smooth'});
  }
}
var scrollLinks=document.querySelectorAll('a[href^="#"]');
for(var s=0;s<scrollLinks.length;s++){scrollLinks[s].addEventListener("click",function(e){var href=this.getAttribute("href");if(!href||href==="#"||href.length===1)return;if(href.startsWith("index.html#"))return;e.preventDefault();try{var target=document.querySelector(href);if(target)scrollToSection(target);}catch(err){console.warn("Invalid selector:",href);}});}

// ─────────────────────────────────────────────────────────
// 6. ACTIVE NAV LINK ON SCROLL
// ─────────────────────────────────────────────────────────
(function(){
  var sections = [], navLinkMap = {};
  function rebuild(){
    sections = Array.prototype.slice.call(document.querySelectorAll('section'));
    var links = document.querySelectorAll('nav a');
    navLinkMap = {};
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href');
      if (h && h.charAt(0) === '#') navLinkMap[h.slice(1)] = links[i];
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rebuild);
  } else { rebuild(); }

  var ticking = false, lastActive = '';
  function update() {
    ticking = false;
    var y = window.scrollY, current = '';
    for (var i = 0; i < sections.length; i++) {
      if (y >= sections[i].offsetTop - 120) current = sections[i].id;
    }
    if (current === lastActive) return;
    if (lastActive && navLinkMap[lastActive]) navLinkMap[lastActive].classList.remove('active');
    if (current && navLinkMap[current]) navLinkMap[current].classList.add('active');
    lastActive = current;
  }
  window.addEventListener('scroll', function(){
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
})();

// ─────────────────────────────────────────────────────────
// 7. THEME TOGGLE, DOWNLOAD CARD BUTTON, HASH SCROLL
// ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded",function(){
  var themeToggle=document.getElementById("themeToggle");
  var htmlEl=document.documentElement;
  if(themeToggle){themeToggle.checked=(htmlEl.getAttribute("data-theme")==="light");themeToggle.addEventListener("change",function(){var newTheme=themeToggle.checked?"light":"dark";htmlEl.setAttribute("data-theme",newTheme);localStorage.setItem("theme",newTheme);});}
  var downloadBtn=document.getElementById("downloadCardBtn");
  if(downloadBtn){downloadBtn.addEventListener("click",function(e){e.preventDefault();var theme=document.documentElement.getAttribute("data-theme")||"dark";var fileUrl=(theme==="light")?"Images/Light Card.jpg":"Images/Dark Card.jpg";var fileName=(theme==="light")?"Mayank-Goel-Portfolio-Card(Light).jpg":"Mayank-Goel-Portfolio-Card(Dark).jpg";var a=document.createElement("a");a.href=fileUrl;a.setAttribute("download",fileName);document.body.appendChild(a);a.click();document.body.removeChild(a);});}
  if(window.location.hash){setTimeout(function(){try{var target=document.querySelector(window.location.hash);if(target)scrollToSection(target);}catch(err){console.warn("Invalid hash:",window.location.hash);}},300);}
});

// ─────────────────────────────────────────────────────────
// 8. CURSOR TRAIL (Desktop)
// ─────────────────────────────────────────────────────────
(function(){
  var perf = window.__perf;
  if (perf.isMobile || perf.tier === 'low') return;

  var colors=['#00d4ff','#00ffaa','#a855f7','#ff6ecf','#ffd700','#ffffff'];
  var lastX=0, lastY=0, ticking=false, dots=[], rings=[];

  var trailCanvas = document.createElement('canvas');
  trailCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;';
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
  document.body.appendChild(trailCanvas);
  var tCtx = trailCanvas.getContext('2d', { alpha: true });
  window.addEventListener('resize', function(){
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }, { passive: true });

  var lastFade = 0;
  function drawTrail(now){
    requestAnimationFrame(drawTrail);
    if (now - lastFade < 1000 / 60) return;
    lastFade = now;
    tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (var i = dots.length - 1; i >= 0; i--) {
      var d = dots[i]; d.life -= 0.055; d.r += 0.22;
      if (d.life <= 0) { dots.splice(i, 1); continue; }
      tCtx.globalAlpha = d.life;
      tCtx.fillStyle = d.c;
      tCtx.beginPath(); tCtx.arc(d.x, d.y, d.r, 0, Math.PI*2); tCtx.fill();
    }
    for (var j = rings.length - 1; j >= 0; j--) {
      var r = rings[j]; r.life -= 0.045; r.rad += 1.6;
      if (r.life <= 0) { rings.splice(j, 1); continue; }
      tCtx.globalAlpha = r.life * 0.85;
      tCtx.strokeStyle = 'rgba(0,212,255,0.9)';
      tCtx.lineWidth = 1.2;
      tCtx.beginPath(); tCtx.arc(r.x, r.y, r.rad, 0, Math.PI*2); tCtx.stroke();
    }
    tCtx.globalAlpha = 1;
  }
  requestAnimationFrame(drawTrail);

  var ringTimer=0;
  document.addEventListener('mousemove',function(e){
    if (ticking) return;
    ticking = true;
    var ex = e.clientX, ey = e.clientY;
    requestAnimationFrame(function(){
      ticking = false;
      var dx = Math.abs(ex - lastX), dy = Math.abs(ey - lastY);
      if (dx + dy < 6) return;
      var c = colors[(Math.random()*colors.length)|0];
      dots.push({ x: ex, y: ey, r: 2.2, life: 1, c: c });
      if (dots.length > 42) dots.shift();
      if (++ringTimer % 8 === 0) {
        rings.push({ x: ex, y: ey, rad: 4, life: 1 });
        if (rings.length > 5) rings.shift();
      }
      lastX = ex; lastY = ey;
    });
  }, { passive: true });
})();

// ─────────────────────────────────────────────────────────
// 9. SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────
(function(){
  var bar=document.createElement('div');
  bar.style.cssText='position:fixed;top:0;left:0;height:3px;width:100%;transform:scaleX(0);transform-origin:left center;background:linear-gradient(90deg,#00d4ff,#a855f7,#00ffaa,#00d4ff);background-size:200% auto;z-index:99999;pointer-events:none;box-shadow:0 0 10px rgba(0,212,255,0.75);animation:barShift 2.5s linear infinite;will-change:transform;';
  var s=document.createElement('style');
  s.textContent='@keyframes barShift{0%{background-position:0% center;}100%{background-position:200% center;}}';
  document.head.appendChild(s);
  document.body.appendChild(bar);

  var dh = 0, recompute = true, ticking = false;
  function refreshHeight(){
    dh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    recompute = false;
  }
  window.addEventListener('resize', function(){ recompute = true; }, { passive: true });

  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      if (recompute || dh === 0) refreshHeight();
      var st = window.scrollY || document.documentElement.scrollTop;
      bar.style.transform = 'scaleX(' + (dh > 0 ? Math.min(1, Math.max(0, st/dh)) : 0) + ')';
    });
  }, { passive: true });
})();

// ─────────────────────────────────────────────────────────
// 10. SECTION TITLE GLITCH EFFECT
// ─────────────────────────────────────────────────────────
(function(){
  var s=document.createElement('style');
  s.textContent=
    '@keyframes g1{0%,100%{clip-path:inset(0 0 95% 0);transform:translate(-3px,0);}20%{clip-path:inset(25% 0 55% 0);transform:translate(3px,0);}40%{clip-path:inset(60% 0 20% 0);transform:translate(-2px,0);}60%{clip-path:inset(80% 0 5% 0);transform:translate(2px,0);}80%{clip-path:inset(10% 0 75% 0);transform:translate(-3px,0);}}'+
    '@keyframes g2{0%,100%{clip-path:inset(80% 0 5% 0);transform:translate(3px,0);}20%{clip-path:inset(50% 0 30% 0);transform:translate(-3px,0);}40%{clip-path:inset(15% 0 65% 0);transform:translate(2px,0);}60%{clip-path:inset(5% 0 85% 0);transform:translate(-2px,0);}80%{clip-path:inset(65% 0 20% 0);transform:translate(3px,0);}}'+
    '.section-title{position:relative;display:inline-block;width:100%;text-align:center;cursor:default;}'+
    '.section-title.glitching::before,.section-title.glitching::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%;background:transparent;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}'+
    '.section-title.glitching::before{background-image:linear-gradient(90deg,#00ffaa,#00ffaa);animation:g1 0.45s steps(1) forwards;}'+
    '.section-title.glitching::after{background-image:linear-gradient(90deg,#ff6ecf,#ff6ecf);animation:g2 0.45s steps(1) forwards;}';
  document.head.appendChild(s);
  document.querySelectorAll('.section-title').forEach(function(t){
    t.setAttribute('data-text',t.textContent);
    t.addEventListener('mouseenter',function(){
      if(t.classList.contains('glitching'))return;
      t.classList.add('glitching');
      setTimeout(function(){t.classList.remove('glitching');},500);
    });
  });
})();

// ─────────────────────────────────────────────────────────
// 11. INTERSECTION OBSERVER — SCROLL REVEAL
// ─────────────────────────────────────────────────────────
(function(){
  var revealStyle = document.createElement('style');
  revealStyle.textContent =
    '.rv{opacity:0;transform:translateY(32px);transition:opacity 0.7s cubic-bezier(0.22,1,0.36,1),transform 0.7s cubic-bezier(0.22,1,0.36,1);will-change:opacity,transform;}' +
    '.rv.rved{opacity:1 !important;transform:translateY(0) !important;will-change:auto;}' +
    '.rv-d1{transition-delay:0.07s}.rv-d2{transition-delay:0.13s}.rv-d3{transition-delay:0.19s}' +
    '.rv-d4{transition-delay:0.25s}.rv-d5{transition-delay:0.31s}.rv-d6{transition-delay:0.37s}' +
    '.rv-d7{transition-delay:0.43s}.rv-d8{transition-delay:0.49s}.rv-d9{transition-delay:0.55s}' +
    '@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none;}}';
  document.head.appendChild(revealStyle);

  var AUTO_TARGETS = [
    { sel: '.card',                   skipFirst: true  },
    { sel: '.cert-card',              skipFirst: true  },
    { sel: '.internship-card',        skipFirst: true  },
    { sel: '.skill-item',             skipFirst: false },
    { sel: '.skill-category',         skipFirst: false },
    { sel: '.timeline-item',          skipFirst: false },
    { sel: '.timeline-content',       skipFirst: false },
    { sel: '.internship-preview-card',skipFirst: false },
    { sel: '.resume-highlights li',   skipFirst: false },
    { sel: '.resume-highlight-item',  skipFirst: false },
    { sel: '.contact-action',         skipFirst: false },
    { sel: '.contact-item',           skipFirst: false },
    { sel: '.stat-item',              skipFirst: false },
    { sel: '.achievement-card',       skipFirst: false },
    { sel: '.cert-btn',               skipFirst: false },
    { sel: '.section-box',            skipFirst: false },
    { sel: '.about-image-box',        skipFirst: false },
    { sel: '.hero-btn',               skipFirst: false },
  ];

  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('rved');
        obs.unobserve(e.target);
      }
    });
  },{threshold:0.05, rootMargin:'0px 0px -15px 0px'});

  function applyReveal(el, delayIdx) {
    if(el.classList.contains('rv')) return;
    el.classList.add('rv');
    if(delayIdx > 0) el.classList.add('rv-d' + Math.min(delayIdx, 9));
    obs.observe(el);
  }

  function initReveal(){
    document.querySelectorAll('.reveal').forEach(function(el){
      el.classList.add('rv');
      obs.observe(el);
    });
    AUTO_TARGETS.forEach(function(t){
      var allEls = document.querySelectorAll(t.sel);
      if(!allEls.length) return;
      if(!t.skipFirst){
        var parentMap = new Map();
        allEls.forEach(function(el){
          var p = el.parentElement || document.body;
          var idx = parentMap.get(p) || 0;
          applyReveal(el, idx);
          parentMap.set(p, idx + 1);
        });
      } else {
        var parents = [];
        allEls.forEach(function(el){
          var p = el.parentElement;
          if(p && parents.indexOf(p) === -1) parents.push(p);
        });
        parents.forEach(function(p){
          var children = p.querySelectorAll(t.sel);
          children.forEach(function(el, idx){
            if(idx === 0) return;
            applyReveal(el, idx);
          });
        });
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initReveal);
  } else { initReveal(); }
})();

// ─────────────────────────────────────────────────────────
// 12. NAVBAR DRAG SCROLL (Desktop)
// ─────────────────────────────────────────────────────────
(function(){
  var navList=document.getElementById('navMenu');
  if(!navList)return;
  var isDown=false,startX,scrollLeft,isDragging=false;
  navList.addEventListener('mousedown',function(e){if(window.innerWidth<=768||e.target.tagName==='A')return;isDown=true;isDragging=false;startX=e.pageX-navList.offsetLeft;scrollLeft=navList.scrollLeft;navList.style.cursor='grabbing';e.preventDefault();});
  document.addEventListener('mouseup',function(){if(!isDown)return;isDown=false;navList.style.cursor='';});
  document.addEventListener('mousemove',function(e){if(!isDown||window.innerWidth<=768)return;var x=e.pageX-navList.offsetLeft;var walk=(x-startX)*1.8;if(Math.abs(walk)>3)isDragging=true;navList.scrollLeft=scrollLeft-walk;});
  navList.addEventListener('click',function(e){if(isDragging&&window.innerWidth>768){e.preventDefault();e.stopPropagation();isDragging=false;}},true);
  var lastActiveLi = null;
  function scrollActive(){if(window.innerWidth<=768)return;var a=navList.querySelector('a.active');if(!a)return;var li=a.parentElement;if(!li||li===lastActiveLi)return;lastActiveLi=li;navList.scrollTo({left:li.offsetLeft-(navList.offsetWidth/2)+(li.offsetWidth/2),behavior:'smooth'});}
  var navTicking = false;
  window.addEventListener('scroll',function(){
    if (navTicking) return; navTicking = true;
    requestAnimationFrame(function(){ navTicking = false; scrollActive(); });
  },{passive:true});
})();

// ─────────────────────────────────────────────────────────
// 13. PWA INSTALL BUTTON
// ─────────────────────────────────────────────────────────
(function(){
  var deferredPrompt=null;
  var installBtn=document.getElementById('pwaInstallBtn');
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredPrompt=e;if(installBtn){installBtn.style.display='';installBtn.classList.add('pwa-visible');}});
  if(installBtn){installBtn.addEventListener('click',function(){if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt.userChoice.then(function(r){if(r.outcome==='accepted'){installBtn.innerHTML='<i class="fa-solid fa-circle-check"></i><span class="pwa-btn-text"> Installed!</span>';installBtn.classList.add('pwa-installed');setTimeout(function(){installBtn.classList.remove('pwa-visible','pwa-installed');installBtn.style.display='none';},2500);}deferredPrompt=null;});});}
  window.addEventListener('appinstalled',function(){deferredPrompt=null;if(installBtn){installBtn.classList.remove('pwa-visible');installBtn.style.display='none';}});
  if(window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true){if(installBtn)installBtn.style.display='none';}
})();

// ─────────────────────────────────────────────────────────
// 14. NAVBAR GLASSMORPHISM ON SCROLL
// ─────────────────────────────────────────────────────────
(function(){
  var nav=document.querySelector('nav');
  if(!nav)return;
  var ticking = false, blurred = false;
  window.addEventListener('scroll',function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      var shouldBlur = window.scrollY > 60;
      if (shouldBlur === blurred) return;
      blurred = shouldBlur;
      if (shouldBlur) {
        nav.style.backdropFilter='blur(18px)';
        nav.style.webkitBackdropFilter='blur(18px)';
      } else {
        nav.style.backdropFilter='';
        nav.style.webkitBackdropFilter='';
        nav.style.background='';
        nav.style.boxShadow='';
      }
    });
  },{passive:true});
})();

// ─────────────────────────────────────────────────────────
// 15. BUTTON CLICK BURST PARTICLES
// ─────────────────────────────────────────────────────────
(function(){
  var perf = window.__perf;
  if (perf.isMobile || perf.tier === 'low') return;

  var BURST = perf.tier === 'mid' ? 8 : 12;
  var s=document.createElement('style');
  s.textContent='@keyframes burst{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(var(--bx),var(--by)) scale(0);opacity:0;}}.burst-p{position:fixed;border-radius:50%;pointer-events:none;z-index:99999;animation:burst 0.75s cubic-bezier(0.22,1,0.36,1) forwards;will-change:transform,opacity;}';
  document.head.appendChild(s);
  document.querySelectorAll('.project-button,.hero-btn,.resume-view-btn,.internship-btn,.btn-certificate,.btn-offer').forEach(function(btn){
    btn.addEventListener('click',function(e){
      var frag = document.createDocumentFragment();
      var nodes = [];
      for(var i=0;i<BURST;i++){
        var p=document.createElement('div'); p.className='burst-p';
        var angle=Math.random()*Math.PI*2;
        var dist=45+Math.random()*70;
        var c=['#00d4ff','#a855f7','#00ffaa','#ff6ecf','#ffd700'][(Math.random()*5)|0];
        var sz=3+Math.random()*5;
        p.style.cssText='width:'+sz+'px;height:'+sz+'px;background:'+c+';box-shadow:0 0 '+(sz*2.5)+'px '+c+';left:'+e.clientX+'px;top:'+e.clientY+'px;--bx:'+(Math.cos(angle)*dist)+'px;--by:'+(Math.sin(angle)*dist)+'px;';
        frag.appendChild(p);
        nodes.push(p);
      }
      document.body.appendChild(frag);
      setTimeout(function(){
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
        }
      }, 780);
    });
  });
})();

// ─────────────────────────────────────────────────────────
// 16. SCROLL PERFORMANCE
// ─────────────────────────────────────────────────────────
(function () {
  var perf = window.__perf;

  var scrollTimer = null;
  window.isScrolling = false;
  window.addEventListener('scroll', function () {
    window.isScrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { window.isScrolling = false; }, 120);
  }, { passive: true });

  function applyGpuHints() {
    var canvases = document.querySelectorAll('canvas');
    for (var j = 0; j < canvases.length; j++) {
      canvases[j].style.transform = 'translate3d(0,0,0)';
      canvases[j].style.contain = 'strict';
    }
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(applyGpuHints, { timeout: 2000 });
  } else {
    document.addEventListener('DOMContentLoaded', applyGpuHints);
  }

  document.documentElement.style.scrollBehavior = 'smooth';
  window.__lerpScrollTo = function(targetPos) {
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  };
})();

// ─────────────────────────────────────────────────────────
// 17. CUSTOM CURSOR
// ─────────────────────────────────────────────────────────
(function () {
  var mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!mq || !mq.matches) return;

  var dot = document.createElement('div');
  dot.id = 'smooth-cursor';
  var ring = document.createElement('div');
  ring.id = 'smooth-cursor-ring';

  var mx = 0, my = 0;
  var rx = 0, ry = 0;
  var cursorRafId = null;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = 'translate(' + (mx - 5.5) + 'px,' + (my - 5.5) + 'px)';
  }, { passive: true });

  function lerpRing() {
    rx += (mx - rx - 19) * 0.11;
    ry += (my - ry - 19) * 0.11;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    cursorRafId = requestAnimationFrame(lerpRing);
  }
  lerpRing();

  var interactives = 'a, button, .card, .cert-card, .badge-row, ' +
    '.project-button, .internship-btn, .cert-btn, ' +
    '.resume-view-btn, .hero-btn, label, [role="button"]';

  document.querySelectorAll(interactives).forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', function () {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    });
  });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.55';
  });
})();

// ─────────────────────────────────────────────────────────
// 18. HERO PARALLAX
// ─────────────────────────────────────────────────────────
(function () {
  var mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!mq || !mq.matches) return;
  if (window.__perf && window.__perf.reduced) return;

  var heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  var ticking = false;
  var px = 0, py = 0;

  document.addEventListener('mousemove', function (e) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      px = (e.clientX / window.innerWidth  - 0.5) * 12;
      py = (e.clientY / window.innerHeight - 0.5) * 12;
      heroContent.style.transform = 'translate(' + (px * 0.3) + 'px, ' + (py * 0.3) + 'px)';
    });
  }, { passive: true });
})();

// ─────────────────────────────────────────────────────────
// 19. INTERNAL LINKS -> SAME TAB
// ─────────────────────────────────────────────────────────
(function(){
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[target="_blank"]');
    if(!a) return;
    if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href');
    if(!href) return;
    var url;
    try { url = new URL(href, window.location.href); } catch(err){ return; }
    if(url.origin !== window.location.origin) return;
    e.preventDefault();
    window.location.href = url.href;
  }, true);
})();