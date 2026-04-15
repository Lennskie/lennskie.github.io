/* ═══════════════════════════════════════════════
   LENN TERMINAL — main.js
   Handles: hero start, terminal commands, skill bar
   animations, scroll observer.
═══════════════════════════════════════════════ */

const output = document.getElementById('terminal-output');
const input = document.getElementById('t-input');

let isTyping = false;

// Unified Skills Configuration
const MY_SKILLS = [
  { name: '(Azure) Active Directory &amp; Windows Servers', val: 85 },
  { name: 'Office 365', val: 90 },
  { name: 'Networks', val: 80 },
  { name: 'Documentation', val: 90 },
  { name: 'Azure &amp; Intune', val: 80 },
  { name: 'PowerShell &amp; General scripting', val: 85 },
];

// Typing speed configuration (ms per character)
const SPEEDS = {
  slow: 8,
  med: 5,
  fast: 2,
};

// ── COMMAND DEFINITIONS ──
const COMMANDS = {
  help: () => [
    '<span class="t-muted">Available commands:</span>',
    '  <span class="t-bright">whoami</span>    — system entity identification',
    '  <span class="t-bright">skills</span>    — list loaded skill modules',
    '  <span class="t-bright">status</span>    — current operational status',
    '  <span class="t-bright">contact</span>   — uplink parameters',
    '  <span class="t-bright">ls</span>        — list directory contents',
    '  <span class="t-bright">cat</span>       — read file contents',
    '  <span class="t-bright">clear</span>     — flush terminal buffer',
  ],

  whoami: () => [
    '<span class="t-muted">I am Lenn, Cyber Security graduate and IT Support.</span>',
    '<span class="t-muted">My methodology prioritizes tenant security, identity governance, and automation.</span>',
    '<span class="t-bright">To see my skills, type: </span>skills',
  ],

  skills: () => {
    const lines = ['<span class="t-muted">Loading skill modules...</span>'];
    MY_SKILLS.forEach(skill => {
      lines.push(`  <span class="t-bright">[ ${skill.val}% ]</span> <span class="t-muted">${skill.name}</span>`);
    });
    lines.push('<span class="t-muted">All modules online.</span>');
    return lines;
  },

  status: () => {
    const years = ((new Date() - new Date('2023-11-20')) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2);
    return [
      '<span class="t-muted">Currently employed at Pemco International.</span>',
      `<span class="t-muted">${years} years active.</span>`,
      '<span class="t-bright">[ EMPLOYED ]</span>',
    ];
  },

  contact: () => [
    '<span class="t-muted">Uplink parameters:</span>',
    '  <span class="t-bright">LINKEDIN</span>  linkedin.com/in/lenn-crochart',
    '  <span class="t-bright">GITHUB</span>    github.com/lennskie',
    '  <span class="t-bright">EMAIL</span>     lenn.crochart+fromwebsite@gmail.com',
  ],

  generator: () => {
    document.location.href = '/generator'
  },

  ls: () => [
    '<span class="t-bright">contact</span> &nbsp;&nbsp;&nbsp;&nbsp; <span class="t-bright">skills</span> &nbsp;&nbsp;&nbsp;&nbsp; <span class="t-bright">status</span> &nbsp;&nbsp;&nbsp;&nbsp; <span class="t-bright">whoami</span>',
  ],

  dir: () => COMMANDS.ls(),

  'cat contact': () => COMMANDS.contact(),
  'cat skills': () => COMMANDS.skills(),
  'cat status': () => COMMANDS.status(),
  'cat whoami': () => COMMANDS.whoami(),
  'cat': () => ['<span class="t-err">cat: missing file operand</span>'],

  clear: () => { output.innerHTML = ''; return null; },
};

// ── TERMINAL OUTPUT ──

// Standard instant output
function appendLine(html) {
  const div = document.createElement('div');
  div.className = 't-line';
  div.innerHTML = html;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

// Async typing output for any element (defaults to a new line in terminal)
async function typeLine(html, speed, container = null) {
  const isCustom = !!container;
  const div = isCustom ? container : document.createElement('div');

  if (!isCustom) {
    div.className = 't-line';
    output.appendChild(div);
  } else {
    div.style.opacity = '1';
  }

  div.innerHTML = html;

  // Collect all text nodes for sequential typing
  const textNodes = [];
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null, false);
  let n;
  while (n = walker.nextNode()) textNodes.push(n);

  const originalTexts = textNodes.map(node => node.textContent);
  textNodes.forEach(node => node.textContent = '');

  for (let i = 0; i < textNodes.length; i++) {
    for (const char of originalTexts[i]) {
      textNodes[i].textContent += char;
      if (!isCustom) output.scrollTop = output.scrollHeight;
      await new Promise(r => setTimeout(r, speed));
    }
  }
}

// Scramble effect for high-impact labels
function scrambleText(el, final, duration, settleTrigger = null) {
  return new Promise((resolve) => {
    el.style.opacity = '0';
    const chars = "!@#$%^&*()_+{}:\"<>?|;',./`~[]=-";
    const colors = ["#666665", "#cffc00", "#a8d400", "#f4ffc8", "#121212"];
    const length = final.length;
    let frame = 0;
    const intervalTime = 40;
    const totalFrames = duration / intervalTime;

    // Stagger character resolution frames (between 50% and 100% of the duration)
    const resolveFrames = Array.from({ length }, () =>
      Math.floor((Math.random() * 0.5 + 0.5) * totalFrames)
    );

    let isSettling = !settleTrigger;
    if (settleTrigger) {
      settleTrigger.then(() => isSettling = true);
    }

    const interval = setInterval(() => {
      let currentHTML = "";

      // Gradually increase overall opacity even during the noise phase
      const currentOp = parseFloat(el.style.opacity) || 0;
      if (currentOp < 1) {
        el.style.opacity = (currentOp + (isSettling ? 0.05 : 0.02)).toFixed(2);
      }

      for (let i = 0; i < length; i++) {
        // Individualized resolution for a "smoother" reveal
        if (isSettling && frame >= resolveFrames[i]) {
          currentHTML += final[i];
        } else {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          currentHTML += `<span style="color:${color}; opacity: 0.7">${char}</span>`;
        }
      }

      el.innerHTML = currentHTML;
      if (isSettling) frame++;

      // Wait until the global duration ends AND all characters are resolved
      if (frame >= totalFrames && resolveFrames.every(f => frame >= f)) {
        clearInterval(interval);
        el.innerHTML = final;
        el.style.opacity = '1';
        resolve();
      }
    }, intervalTime);
  });
}

// Orchestrates typing multiple lines based on the command typed
async function typeAllLines(lines, cmd = '') {
  if (!lines || lines.length === 0) return;

  isTyping = true;
  input.disabled = true;

  let speed;

  switch (cmd) {
    case 'boot':
      speed = SPEEDS.slow;
      break;
    case 'skills':
      speed = SPEEDS.fast;
      break;
    case 'help':
      speed = SPEEDS.med;
      break;
    case 'contact':
      speed = SPEEDS.slow;
      break;
    case 'status':
      speed = SPEEDS.med;
      break;
    case 'whoami':
      speed = SPEEDS.fast;
      break;
    case 'error':
      speed = SPEEDS.slow;
      break;
    case 'ls':
      speed = SPEEDS.fast
    case 'cat':
      speed = SPEEDS.fast
    default:
      speed = SPEEDS.fast;
  }

  for (const line of lines) {
    await typeLine(line, speed);
  }

  isTyping = false;
  input.disabled = false;
  input.focus();
}

// Boot sequence — called on start or via 'sudo boot' command
function runBoot(autoType) {
  const initLines = [
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Verifying integrity checksums...</span>',
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Loading the terminal...</span>',
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Preparing to run whoami ...</span>',
  ];

  if (autoType) {
    // Coordinated typing sequence for the boot animation
    (async () => {
      await typeAllLines(initLines, 'boot');
      await runCmd('whoami');
    })();
    return null;
  }

  return [
    ...initLines,
    '<span class="t-prompt-color">&gt;&gt;</span> whoami',
    ...COMMANDS.whoami()
  ];
}

// Public helper used by hint spans in the HTML
async function runCmd(cmd) {
  if (isTyping) return;
  appendLine('<span class="t-prompt-color">&gt;&gt;</span> ' + cmd);
  const fn = COMMANDS[cmd];
  if (fn) {
    const result = fn();
    if (result) await typeAllLines(result, cmd);
  }
  input.focus();
}

// Keyboard input handler
input.addEventListener('keydown', async function (e) {
  if (e.key !== 'Enter' || isTyping) return;
  const cmd = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!cmd) return;

  const rawCmd = input.value.trim().toLowerCase(); // keep exact spacing for display if desired, but better to just use raw input or space normalized
  appendLine('<span class="t-prompt-color">&gt;&gt;</span> ' + input.value.trim()); // display exactly what was typed, without leading/trailing edge spaces
  input.value = '';

  if (cmd === 'clear') { output.innerHTML = ''; return; }

  let fn = COMMANDS[cmd];
  
  // Support for "cat <invalid_file>"
  if (!fn && cmd.startsWith('cat ')) {
    const filename = cmd.substring(4);
    fn = () => ['<span class="t-err">cat: ' + filename + ': No such file or directory</span>'];
  }

  if (fn) {
    const result = fn();
    if (result) await typeAllLines(result, cmd);
  } else {
    await typeAllLines(['<span class="t-err">command not found: ' + cmd + ' — try <span style="color:var(--neon)">help</span></span>'], 'error');
  }
});

// ── HERO INITIALIZATION ──
async function runHeroIntro() {
  const label = document.getElementById('hero-label');
  const name = document.getElementById('hero-name');
  const btn = document.getElementById('start-btn');

  if (!label || !name || !btn) return;

  const labelText = label.textContent;
  const nameText = name.textContent;

  // Preserve heights to prevent layout jumping while text is cleared
  const labelH = label.offsetHeight;
  const nameH = name.offsetHeight;
  label.style.minHeight = labelH + 'px';
  name.style.minHeight = nameH + 'px';

  label.textContent = "";
  name.textContent = "";

  // Trigger setup for staggered resolution
  let triggerResolve;
  const settleTrigger = new Promise(resolve => triggerResolve = resolve);

  // Start both in parallel: 
  // 1. Label starts typing
  // 2. Name starts noise/fade-in but DOES NOT settle until settleTrigger resolves
  const scramblePromise = scrambleText(name, nameText, 1500, settleTrigger);

  await typeLine(labelText, 30, label);

  // Label is done! Signal the name to start settling
  triggerResolve();
  await scramblePromise;

  // Clear temporary heights
  label.style.minHeight = '';
  name.style.minHeight = '';

  // Added delay after intro is complete
  await new Promise(r => setTimeout(r, 500));

  // 3. Automated loot revelation immediately after the intro
  await runLootReveal(btn, {
    eyeCount: 2,
    eyeLayout: 'row',
    crosshairCount: 2,
    crosshairLayout: 'row',
    gridRows: 4,
    gridCols: 13,
    finalHTML: 'ENTER',
    finalBackground: 'var(--neon)',
    finalColor: 'var(--void)',
    finalClasses: ['btn-looted', 'is-active'],
  });
}

// ── MODULAR LOOT REVEAL ANIMATION ──
// Reusable reveal sequence: dash → eyes → crosshairs → grid dissolve → final content
async function runLootReveal(el, opts = {}) {
  const {
    eyeCount = 2,
    eyeLayout = 'row',       // 'row' | 'grid'
    crosshairCount = 2,
    crosshairLayout = 'row', // 'row' | 'grid'
    gridRows = 4,
    gridCols = 13,
    finalHTML = '',
    finalBackground = 'var(--neon)',
    finalColor = 'var(--void)',
    finalClasses = [],
    lockedClassToRemove = '', // pass a class to remove right before resolving
    onComplete = null,
  } = opts;

  // Save original content to restore if needed
  const originalStyles = el.getAttribute('style') || '';

  // Lock dimensions so the element never resizes during animation
  const rect = el.getBoundingClientRect();
  const lockedWidth = rect.width + 'px';
  const lockedHeight = rect.height + 'px';
  el.style.width = lockedWidth;
  el.style.height = lockedHeight;
  el.style.boxSizing = 'border-box';

  // 1. Initial State: Dark grey with a dash
  el.textContent = "-";
  el.style.opacity = "1";
  el.style.background = "#2a2a2a";
  el.style.color = "#eee";
  el.style.fontSize = "18px";

  await new Promise(r => setTimeout(r, 500));

  // 2. Eye Scan Phase
  el.style.display = "flex";
  el.style.justifyContent = "center";
  el.style.alignItems = "center";
  el.style.flexWrap = eyeLayout === 'grid' ? 'wrap' : 'nowrap';
  el.style.gap = eyeLayout === 'grid' ? '10px 40px' : '80px';

  // Size eyes relative to container
  const eyeW = eyeLayout === 'grid' ? 40 : 50;
  const eyeH = eyeLayout === 'grid' ? 24 : 30;

  const eyeSvg = `
    <svg width="${eyeW}" height="${eyeH}" viewBox="0 0 100 60" style="width: ${eyeW}px; height: ${eyeH}px;">
      <path d="M10 30 L30 10 L70 10 L90 30 L70 50 L30 50 Z" 
            fill="none" stroke="#666" stroke-width="3"/>
      <circle cx="50" cy="30" r="10" fill="#666" class="eye-pupil"/>
    </svg>
  `;
  el.innerHTML = Array(eyeCount).fill(eyeSvg).join('');

  // Animate pupils left-to-right
  const pupils = el.querySelectorAll('.eye-pupil');
  pupils.forEach(p => {
    p.style.transition = 'cx 0.15s ease-in-out';
  });

  await new Promise(r => setTimeout(r, 50));
  pupils.forEach(p => p.setAttribute('cx', '35'));
  await new Promise(r => setTimeout(r, 300));
  pupils.forEach(p => p.setAttribute('cx', '65'));
  await new Promise(r => setTimeout(r, 300));

  // 3. Crosshair Phase: Lavender grey
  el.style.background = "#989cab";
  el.style.color = "#1a1a1a";
  el.style.flexWrap = crosshairLayout === 'grid' ? 'wrap' : 'nowrap';
  el.style.gap = crosshairLayout === 'grid' ? '4px 30px' : '80px';

  const chSize = crosshairLayout === 'grid' ? 35 : 60;
  const crosshair = `
    <svg width="${chSize}" height="${chSize}" viewBox="0 0 100 100" style="width: ${chSize}px; height: ${chSize}px;">
      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-width="3" />
      <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" stroke-width="3" />
    </svg>
  `;
  el.innerHTML = Array(crosshairCount).fill(crosshair).join('');

  await new Promise(r => setTimeout(r, 200));

  // 4. Grid-Dissolve Phase
  // Reset flex layouts so original content acts normal
  el.setAttribute('style', originalStyles);
  
  // Re-apply dimension locks and force opacity to 1 (prevents hero button disappearing)
  el.style.width = lockedWidth;
  el.style.height = lockedHeight;
  el.style.boxSizing = 'border-box';
  el.style.opacity = '1';

  if (finalBackground !== 'transparent') {
    el.style.background = finalBackground;
  }
  if (finalColor) {
    el.style.color = finalColor;
  }
  
  if (lockedClassToRemove) {
    el.classList.remove(lockedClassToRemove);
  }
  
  el.innerHTML = finalHTML;
  finalClasses.forEach(cls => el.classList.add(cls));

  const overlay = document.createElement('div');
  overlay.className = 'button-fill-grid';
  overlay.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
  overlay.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;

  const revealTargets = [];

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const s = document.createElement('div');
      overlay.appendChild(s);

      if ((r + c) % 2 !== 0) {
        s.style.opacity = '0';
      } else {
        s.style.opacity = '1';
        revealTargets.push(s);
      }
    }
  }
  el.appendChild(overlay);

  await new Promise(r => setTimeout(r, 300));

  revealTargets.sort(() => Math.random() - 0.5);

  for (let i = 0; i < revealTargets.length; i++) {
    revealTargets[i].style.opacity = '0';
    const remaining = revealTargets.length - 1 - i;
    const delay = remaining < 5 ? 5 : 30;
    await new Promise(r => setTimeout(r, delay));
  }

  await new Promise(r => setTimeout(r, 150));
  overlay.remove();

  // Final activation
  finalClasses.forEach(cls => el.classList.add(cls));

  if (onComplete) onComplete(el);
}

window.addEventListener('DOMContentLoaded', runHeroIntro);

// ── HERO START BUTTON ──
function handleStart() {
  const btn = document.getElementById('start-btn');

  // Clean exit for the button
  btn.style.opacity = '0';
  btn.style.pointerEvents = 'none';
  btn.style.animation = 'crtFlicker 0.05s 3';

  setTimeout(() => {
    output.innerHTML = '';
    document.getElementById('terminal-section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => runBoot(true), 700);
  }, 220);
}

// ── SKILL BAR SCROLL ANIMATION ──
// Bars animate in once the about section enters the viewport
let skillBars = [];
let skillPctEls = [];

function initSkillsHTML() {
  const panel = document.querySelector('.skills-panel');
  if (!panel) return;
  
  MY_SKILLS.forEach(skill => {
    const row = document.createElement('div');
    row.className = 'skill-row';
    row.innerHTML = `
      <div class="skill-header"><span>${skill.name.toUpperCase()}</span><span class="skill-pct-label">0%</span></div>
      <div class="skill-bar-bg">
        <div class="skill-bar-fill" data-val="${skill.val}"></div>
      </div>
    `;
    panel.appendChild(row);
  });
  
  skillBars = document.querySelectorAll('.skill-bar-fill');
  skillPctEls = document.querySelectorAll('.skill-pct-label');
}

// Initialize the DOM elements before the observer runs
initSkillsHTML();

function animateBars() {
  skillBars.forEach((bar, i) => {
    const val = parseInt(bar.dataset.val, 10);
    bar.style.width = val + '%';

    // Count-up the percentage label
    const el = skillPctEls[i];
    if (!el) return;
    let cur = 0;
    const tick = () => {
      cur = Math.min(cur + 2, val);
      el.textContent = cur + '%';
      if (cur < val) requestAnimationFrame(tick);
    };
    tick();
  });
}

const skillObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateBars();
    skillObserver.disconnect();
  }
}, { threshold: 0.25 });

skillObserver.observe(document.getElementById('about-section'));

// ── HOBBY CARD LOOT REVEAL ──
// Cards start as a "-" dash and reveal their content on hover
function initHobbyCards() {
  const cards = document.querySelectorAll('.hobby-card');

  cards.forEach(card => {
    // Store the real content
    const originalContent = card.innerHTML;

    // Replace with dash placeholder
    card.classList.add('hobby-locked');

    let isRevealing = false;
    let hasRevealed = false;

    card.addEventListener('mouseenter', async () => {
      if (isRevealing || hasRevealed) return;
      isRevealing = true;

      card.classList.add('hobby-unlocked');

      await runLootReveal(card, {
        eyeCount: 4,
        eyeLayout: 'grid',
        crosshairCount: 4,
        crosshairLayout: 'grid',
        gridRows: 4,
        gridCols: 8,
        finalHTML: originalContent,
        finalBackground: 'var(--s1)',
        finalColor: 'var(--text)',
        finalClasses: ['hobby-revealed'],
        lockedClassToRemove: 'hobby-locked',
      });

      // Clean up inline styles from the reveal animation
      card.removeAttribute('style');
      card.innerHTML = originalContent;
      card.classList.remove('hobby-locked');
      card.classList.add('hobby-revealed');

      isRevealing = false;
      hasRevealed = true;
    });
  });
}

initHobbyCards();
