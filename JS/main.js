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

// Async typing output for a single line
async function typeLine(html, speed) {
  const div = document.createElement('div');
  div.className = 't-line';
  div.innerHTML = html;
  output.appendChild(div);

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
      output.scrollTop = output.scrollHeight;
      await new Promise(r => setTimeout(r, speed));
    }
  }
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

// ── HERO START BUTTON ──
function handleStart() {
  const btn = document.getElementById('start-btn');
  btn.style.animation = 'crtFlicker 0.05s 3';
  btn.disabled = true;

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
