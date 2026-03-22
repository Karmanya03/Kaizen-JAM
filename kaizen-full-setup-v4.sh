#!/data/data/com.termux/files/usr/bin/bash
# ═══════════════════════════════════════════════════════════
#  Kaizen-JAM Full Setup Script for Termux (v4)
#  Zero native compilation — fully pure JS compatible
# ═══════════════════════════════════════════════════════════

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

BOT_DIR="$HOME/Kaizen-JAM"

echo ""
echo "═══════════════════════════════════════════"
echo "  🎶 Kaizen-JAM Termux Setup v4"
echo "  Architecture: $(uname -m) — $(nproc) cores"
echo "═══════════════════════════════════════════"
echo ""

# ── STEP 1: Install system packages ──────────────────────
echo "── Step 1/10: Installing system packages ──"
pkg update -y && pkg upgrade -y
pkg install -y nodejs-lts git tmux cronie termux-services termux-api ffmpeg
log "System packages installed (includes native ffmpeg)"

# ── STEP 2: Verify project files exist ───────────────────
echo ""
echo "── Step 2/10: Checking project files ──"
if [ ! -d "$BOT_DIR" ]; then
  err "Kaizen-JAM folder not found at $BOT_DIR — copy it first!"
fi
if [ ! -f "$BOT_DIR/package.json" ]; then
  err "package.json not found in $BOT_DIR"
fi
if [ ! -f "$BOT_DIR/.env" ]; then
  warn ".env not found — you'll need to create it before running"
fi
if [ ! -f "$BOT_DIR/cookies.txt" ]; then
  warn "cookies.txt not found — you'll need to add it before running"
fi
log "Project files verified"

# ── STEP 3: Clean old install ────────────────────────────
echo ""
echo "── Step 3/10: Cleaning old install ──"
cd "$BOT_DIR"
rm -rf node_modules package-lock.json
log "Cleaned node_modules and lockfile"

# ── STEP 4: Rewrite package.json for Termux ─────────────
echo ""
echo "── Step 4/10: Rewriting package.json for Termux compatibility ──"
cd "$BOT_DIR"

node -e "
import { readFileSync, writeFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// REMOVE all native modules
const removeList = ['ffmpeg-static', 'sodium-native', 'mediaplex', '@discordjs/opus'];
for (const mod of removeList) {
  if (pkg.dependencies[mod]) {
    delete pkg.dependencies[mod];
    console.log('Removed: ' + mod);
  }
}

// ADD pure JS replacements
pkg.dependencies['opusscript'] = '^0.1.1';
pkg.dependencies['libsodium-wrappers'] = '^0.7.15';
console.log('Added: opusscript');
console.log('Added: libsodium-wrappers');

// OVERRIDE to block @discordjs/opus from being pulled by sub-dependencies
if (!pkg.overrides) pkg.overrides = {};
pkg.overrides['@discordjs/opus'] = 'npm:opusscript@^0.1.1';
console.log('Override: @discordjs/opus -> opusscript');

writeFileSync('package.json', JSON.stringify(pkg, null, 4) + '\n');
console.log('package.json updated for Termux');
"
log "package.json rewritten — zero native modules"

# ── STEP 5: Install npm dependencies ────────────────────
echo ""
echo "── Step 5/10: Installing npm packages ──"
cd "$BOT_DIR"

# Pass 1: Install with --ignore-scripts to skip ALL native builds
npm install --ignore-scripts
log "Pass 1: Packages downloaded (scripts skipped)"

# Pass 2: Nuke any leftover @discordjs/opus that snuck in
if [ -d "node_modules/@discordjs/opus" ]; then
  rm -rf node_modules/@discordjs/opus
  log "Removed leftover @discordjs/opus"
fi

# Pass 3: Rebuild only safe packages (skip native ones)
npm rebuild --ignore-scripts 2>/dev/null || true
log "Pass 2: Safe rebuild complete"

echo ""
echo "  Verifying opus provider..."
node -e "
try { require('opusscript'); console.log('  ✓ opusscript loaded') }
catch(e) { console.log('  ✗ opusscript MISSING') }
" 2>/dev/null || node -e "
import('opusscript').then(() => console.log('  ✓ opusscript loaded')).catch(() => console.log('  ✗ opusscript MISSING'))
"

log "npm packages installed successfully"

# ── STEP 6: Update youtubei.js to latest ────────────────
echo ""
echo "── Step 6/10: Updating youtubei.js to latest ──"
cd "$BOT_DIR/node_modules/discord-player-youtubei"
npm install youtubei.js@latest --ignore-scripts
cd "$BOT_DIR"
log "youtubei.js updated"

# ── STEP 7: Apply language: "original" patches ──────────
echo ""
echo "── Step 7/10: Patching audio language fix ──"
DIST_FILE="$BOT_DIR/node_modules/discord-player-youtubei/dist/index.js"

if [ ! -f "$DIST_FILE" ]; then
  err "dist/index.js not found — npm install may have failed"
fi

node -e "
import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('$DIST_FILE', 'utf8');
let patches = 0;

// Patch 1: DEFAULT_DOWNLOAD_OPTIONS
code = code.replace(
  /var DEFAULT_DOWNLOAD_OPTIONS\s*=\s*\{([^}]*?)type:\s*['\"]audio['\"]\s*\}/s,
  (match) => {
    if (match.includes('language')) return match;
    patches++;
    return match.replace(/type:\s*['\"]audio['\"]/, 'type: \"audio\",\n  language: \"original\"');
  }
);

// Patch 2: All chooseFormat calls
code = code.replace(
  /chooseFormat\(\s*\{([^}]*?)type:\s*['\"]audio['\"]([^}]*?)\}/gs,
  (match) => {
    if (match.includes('language')) return match;
    patches++;
    return match.replace(/type:\s*['\"]audio['\"]/, 'type: \"audio\",\n      language: \"original\"');
  }
);

writeFileSync('$DIST_FILE', code);
console.log('Applied ' + patches + ' language patches');
"
log "Audio language patches applied"

# ── STEP 8: Create ffmpeg path helper ────────────────────
echo ""
echo "── Step 8/10: Setting up ffmpeg path ──"

# Ensure discord-player can find Termux ffmpeg
FFMPEG_PATH=$(which ffmpeg)
echo "  ffmpeg found at: $FFMPEG_PATH"

# Create a tiny shim so any code looking for ffmpeg-static gets the right path
mkdir -p "$BOT_DIR/node_modules/ffmpeg-static"
cat > "$BOT_DIR/node_modules/ffmpeg-static/index.js" << FFSHIM
module.exports = "$FFMPEG_PATH";
FFSHIM
cat > "$BOT_DIR/node_modules/ffmpeg-static/package.json" << FFPKG
{"name":"ffmpeg-static","version":"5.2.0","main":"index.js"}
FFPKG

log "ffmpeg shim created → $FFMPEG_PATH"

# ── STEP 9: Set up watchdog cron ─────────────────────────
echo ""
echo "── Step 9/10: Setting up watchdog cron ──"

cat > "$HOME/kaizen-watchdog.sh" << 'WATCHDOG'
#!/data/data/com.termux/files/usr/bin/bash
BOT_DIR="$HOME/Kaizen-JAM"
SESSION="Kaizen-JAM"
LOG_FILE="$BOT_DIR/watchdog.log"
MAX_LOG_SIZE=1048576

export UV_THREADPOOL_SIZE=4

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt $MAX_LOG_SIZE ]; then
  mv "$LOG_FILE" "$LOG_FILE.old"
fi

if tmux has-session -t "$SESSION" 2>/dev/null; then
  if pgrep -f "node.*src/index.js" > /dev/null 2>&1; then
    log "OK — bot is running (PID $(pgrep -f 'node.*src/index.js'))"
    exit 0
  else
    log "WARN — bot crashed inside tmux. Restarting..."
    tmux send-keys -t "$SESSION" C-c "" 2>/dev/null
    sleep 2
    tmux send-keys -t "$SESSION" "cd $BOT_DIR && UV_THREADPOOL_SIZE=4 node --no-deprecation src/index.js" Enter
    log "RESTARTED inside existing session"
  fi
else
  log "WARN — no tmux session found. Creating new one..."
  tmux new-session -d -s "$SESSION" -c "$BOT_DIR" \
    "UV_THREADPOOL_SIZE=4 node --no-deprecation src/index.js; bash"
  log "STARTED new tmux session"
fi

termux-wake-lock 2>/dev/null
WATCHDOG

chmod +x "$HOME/kaizen-watchdog.sh"

sv-enable crond 2>/dev/null || true
sv up crond 2>/dev/null || true

(crontab -l 2>/dev/null | grep -v "kaizen-watchdog"; echo "*/2 * * * * $HOME/kaizen-watchdog.sh") | crontab -

log "Watchdog cron installed (checks every 2 minutes)"

# ── STEP 10: Acquire wakelock ───────────────────────────
echo ""
echo "── Step 10/10: Acquiring wakelock ──"
termux-wake-lock 2>/dev/null || true
log "Wakelock acquired"

# ── DONE ─────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo -e "  ${GREEN}🎶 Kaizen-JAM setup complete!${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Start the bot:                         │"
echo "  │                                         │"
echo "  │  tmux new -s Kaizen-JAM                 │"
echo "  │  cd ~/Kaizen-JAM                        │"
echo "  │  UV_THREADPOOL_SIZE=4 \                  │"
echo "  │    node --no-deprecation src/index.js   │"
echo "  │                                         │"
echo "  │  Detach: Ctrl+B then D                  │"
echo "  │  Reattach: tmux attach -t Kaizen-JAM    │"
echo "  │                                         │"
echo "  │  Watchdog auto-restarts if bot crashes   │"
echo "  │  Logs: tail -f ~/Kaizen-JAM/watchdog.log│"
echo "  └─────────────────────────────────────────┘"
echo ""
