/* ═══════════════════════════════════════════════
   LENN TERMINAL — main.js
   Handles: hero start, terminal commands, skill bar
   animations, scroll observer.
═══════════════════════════════════════════════ */

const output = document.getElementById('terminal-output');
const input  = document.getElementById('t-input');

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
function appendLine(html) {
  const div = document.createElement('div');
  div.className = 't-line';
  div.innerHTML = html;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

// Boot sequence — called on start or via 'sudo boot' command
function runBoot(autoType) {
  const lines = [
    '<span class="t-muted">&gt;&gt; sudo system_boot --force</span>',
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Verifying integrity checksums...</span>',
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Loading core visual modules...</span>',
    '<span class="t-bright">[ OK ]</span> <span class="t-muted">Calibrating human-machine interface...</span>',
    '<span class="t-warn">&gt;&gt; whoami</span>',
    '<span class="t-muted">I am LENN. M365 engineer & enterprise infrastructure operator.</span>',
    '<span class="t-muted">Type <span style="color:var(--neon)">help</span> for available commands.</span>',
  ];

  if (autoType) {
    // Staggered print for the boot animation
    lines.forEach((line, i) => setTimeout(() => appendLine(line), i * 200));
    return null;
  }

  return lines;
}

// Public helper used by hint spans in the HTML
function runCmd(cmd) {
  appendLine('<span class="t-prompt-color">&gt;&gt;</span> ' + cmd);
  const fn = COMMANDS[cmd];
  if (fn) {
    const result = fn();
    if (result) result.forEach(l => appendLine(l));
  }
  input.focus();
}

// Keyboard input handler
input.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const cmd = input.value.trim().toLowerCase();
  if (!cmd) return;

  appendLine('<span class="t-prompt-color">&gt;&gt;</span> ' + cmd);
  input.value = '';

  if (cmd === 'clear') { output.innerHTML = ''; return; }

  const fn = COMMANDS[cmd];
  if (fn) {
    const result = fn();
    if (result) result.forEach(l => appendLine(l));
  } else {
    appendLine('<span class="t-warn">command not found: ' + cmd + ' — try <span style="color:var(--neon)">help</span></span>');
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
const skillBars    = document.querySelectorAll('.skill-bar-fill');
const skillPctEls  = [
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
