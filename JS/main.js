/* ═══════════════════════════════════════════════
   LENN TERMINAL — main.js
   Handles: hero start, terminal commands, skill bar
   animations, scroll observer.
═══════════════════════════════════════════════ */

const output = document.getElementById('terminal-output');
const input = document.getElementById('t-input');

let isTyping = false;

// Typing speed configuration (ms per character)
const SPEEDS = {
  slow: 15,
  med: 8,
  fast: 4,
  turbo: 2
};

// ── COMMAND DEFINITIONS ──
const COMMANDS = {
  help: () => [
    '<span class="t-muted">Available commands:</span>',
    '  <span class="t-bright">whoami</span>    — system entity identification',
    '  <span class="t-bright">skills</span>    — list loaded skill modules',
    '  <span class="t-bright">status</span>    — current operational status',
    '  <span class="t-bright">contact</span>   — uplink parameters',
    '  <span class="t-bright">clear</span>     — flush terminal buffer',
    '  <span class="t-bright">sudo boot</span> — run full boot sequence',
  ],

  whoami: () => [
    '<span class="t-muted">I am LENN. Microsoft 365 engineer and enterprise infrastructure operator.</span>',
    '<span class="t-muted">My methodology prioritizes tenant security, identity governance, and automation.</span>',
    '<span class="t-warn">Primary stack: Entra ID // Active Directory // M365 // SharePoint // Intune</span>',
  ],

  skills: () => [
    '<span class="t-muted">Loading skill modules...</span>',
    '  <span class="t-bright">[ 95% ]</span> <span class="t-muted">Microsoft Entra ID</span>',
    '  <span class="t-bright">[ 90% ]</span> <span class="t-muted">Active Directory</span>',
    '  <span class="t-bright">[ 92% ]</span> <span class="t-muted">Office 365 / M365</span>',
    '  <span class="t-bright">[ 88% ]</span> <span class="t-muted">SharePoint / OneDrive</span>',
    '  <span class="t-bright">[ 80% ]</span> <span class="t-muted">Azure / Intune</span>',
    '  <span class="t-bright">[ 85% ]</span> <span class="t-muted">PowerShell / VBA</span>',
    '<span class="t-muted">All modules online.</span>',
  ],

  status: () => [
    '<span class="t-warn">&gt;&gt; status --current</span>',
    '<span class="t-muted">Open to high-impact enterprise collaborations.</span>',
    '<span class="t-muted">Currently building cross-org M365 automation solutions.</span>',
    '<span class="t-bright">[ AVAILABLE FOR CONTACT ]</span>',
  ],

  contact: () => [
    '<span class="t-muted">Uplink parameters:</span>',
    '  <span class="t-bright">LINKEDIN</span>  linkedin.com/in/lenn-crochart',
    '  <span class="t-bright">GITHUB</span>    github.com/lennskie',
    '  <span class="t-bright">EMAIL</span>     lenn.crochart@gmail.com',
  ],

  clear: () => { output.innerHTML = ''; return null; },

  'sudo boot': () => runBoot(false),
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
    // Shades of grey and neon for the "noise" effect
    const colors = ["#666665", "#cffc00", "#a8d400", "#f4ffc8", "#121212"];
    const length = final.length;
    let frame = 0;
    const intervalTime = 40;
    const totalFrames = duration / intervalTime;

    let isSettling = !settleTrigger;
    if (settleTrigger) {
      settleTrigger.then(() => isSettling = true);
    }

    const interval = setInterval(() => {
      let currentHTML = "";
      const progress = isSettling ? (frame / totalFrames) : 0;

      // Gradually increase overall opacity even during the noise phase
      const currentOp = parseFloat(el.style.opacity) || 0;
      if (currentOp < 1) {
        el.style.opacity = (currentOp + (isSettling ? 0.05 : 0.02)).toFixed(2);
      }

      for (let i = 0; i < length; i++) {
        // Only settle characters if we are in the "settling" phase
        if (isSettling && Math.random() < progress) {
          currentHTML += final[i];
        } else {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          currentHTML += `<span style="color:${color}; opacity: 0.7">${char}</span>`;
        }
      }
      
      el.innerHTML = currentHTML;
      if (isSettling) frame++;

      if (frame > totalFrames) {
        clearInterval(interval);
        el.innerHTML = final;
        el.style.opacity = '1';
        resolve();
      }
    }, intervalTime);
  });
}

// Orchestrates typing multiple lines with adaptive speed
async function typeAllLines(lines) {
  if (!lines || lines.length === 0) return;

  isTyping = true;
  input.disabled = true;

  // Calculate speed based on total character length
  const totalText = lines.join('').replace(/<[^>]*>/g, '');
  const len = totalText.length;
  let speed = SPEEDS.med;

  if (len < 50) speed = SPEEDS.slow;
  else if (len > 300) speed = SPEEDS.turbo;
  else if (len > 150) speed = SPEEDS.fast;

  for (const line of lines) {
    await typeLine(line, speed);
  }

  isTyping = false;
  input.disabled = false;
  input.focus();
}

// Boot sequence — called on start or via 'sudo boot' command
function runBoot(autoType) {
  const lines = [
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Verifying integrity checksums...</span>',
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Loading the terminal...</span>',
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Preparing to run whoami ...</span>',
    '<span class="t-warn">&gt;&gt; whoami</span>',
    '<span class="t-muted">I am Lenn Crochart. IT Support engineer.</span>',
    '<span class="t-muted">Type <span style="color:var(--neon)">help</span> for available commands.</span>',
  ];

  if (autoType) {
    // Coordinated typing sequence for the boot animation
    typeAllLines(lines);
    return null;
  }

  return lines;
}

// Public helper used by hint spans in the HTML
async function runCmd(cmd) {
  if (isTyping) return;
  appendLine('<span class="t-prompt-color">&gt;&gt;</span> ' + cmd);
  const fn = COMMANDS[cmd];
  if (fn) {
    const result = fn();
    if (result) await typeAllLines(result);
  }
  input.focus();
}

// Keyboard input handler
input.addEventListener('keydown', async function (e) {
  if (e.key !== 'Enter' || isTyping) return;
  const cmd = input.value.trim().toLowerCase();
  if (!cmd) return;

  appendLine('<span class="t-prompt-color">&gt;&gt;</span> ' + cmd);
  input.value = '';

  if (cmd === 'clear') { output.innerHTML = ''; return; }

  const fn = COMMANDS[cmd];
  if (fn) {
    const result = fn();
    if (result) await typeAllLines(result);
  } else {
    await typeAllLines(['<span class="t-err">command not found: ' + cmd + ' — try <span style="color:var(--neon)">help</span></span>']);
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

  // 3. Reveal the start button in its un-looted state (-)
  btn.textContent = "-";
  btn.style.opacity = "1";
  btn.classList.add('is-active');
}

// Logic for the square "loot box" button reveal
async function animateLootButton(btn) {
  // 1. Trigger the ripple animation
  btn.classList.add('btn-rippling');
  
  // 2. Halfway through the 0.8s ripple, reveal the "obscured" text
  await new Promise(r => setTimeout(r, 400));
  btn.classList.add('text-obscured');
  btn.textContent = "ENTER";

  // 3. Complete the transition as the ripple spreads to the edges
  await new Promise(r => setTimeout(r, 400));
  btn.classList.remove('btn-rippling', 'text-obscured');
  btn.classList.add('btn-looted');
}

window.addEventListener('DOMContentLoaded', runHeroIntro);

// ── HERO START BUTTON ──
let isLooted = false;

async function handleStart() {
  const btn = document.getElementById('start-btn');
  
  // First click: Perform the "looting" reveal from Marathon
  if (!isLooted) {
    isLooted = true;
    await animateLootButton(btn);
    return;
  }

  // Second click: Proceed to Terminal
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
const skillBars = document.querySelectorAll('.skill-bar-fill');
const skillPctEls = [
  document.getElementById('s1pct'),
  document.getElementById('s2pct'),
  document.getElementById('s3pct'),
  document.getElementById('s4pct'),
  document.getElementById('s5pct'),
  document.getElementById('s6pct'),
];

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
