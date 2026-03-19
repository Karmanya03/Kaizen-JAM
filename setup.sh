#!/usr/bin/env bash
#  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Kaizen-JAM Setup Script
#  Universal installer — works on Linux, macOS, WSL, Termux
#  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[X]${NC} $1"; exit 1; }
info() { echo -e "${CYAN}[~]${NC} $1"; }

echo ""
echo -e "${CYAN}"
echo "  _  __     _                     _   _   __  __ "
echo " | |/ /__ _(_)_______  _ __      | | / | |  \\/  |"
echo " | ' // _\` | |_  / _ \\| '_ \\ _  | |/ _ \\| |\\/| |"
echo " | . \\ (_| | |/ /  __/| | | |_| |_| / ___ \\ |  | |"
echo " |_|\\_\\__,_|_/___\\___||_| |_|\\___/ /_/   \\_\\_|  |_|"
echo -e "${NC}"
echo -e "  ${YELLOW}Continuous improvement, applied to sound.${NC}"
echo ""

# ━━━ Detect platform ━━━
detect_platform() {
    if [ -d "/data/data/com.termux" ]; then
        PLATFORM="termux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        PLATFORM="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PLATFORM="linux"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        PLATFORM="windows"
    else
        PLATFORM="unknown"
    fi
    log "Detected platform: $PLATFORM"
}

# ━━━ Install system dependencies ━━━
install_deps() {
    info "Installing system dependencies..."

    case $PLATFORM in
        termux)
            pkg update -y && pkg upgrade -y
            pkg install -y nodejs python git ffmpeg
            ;;
        linux)
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y nodejs npm python3 git ffmpeg
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y nodejs npm python3 git ffmpeg
            elif command -v pacman &> /dev/null; then
                sudo pacman -Syu --noconfirm nodejs npm python3 git ffmpeg
            else
                warn "Unknown package manager. Please install Node.js, npm, Python3, git, and ffmpeg manually."
            fi
            ;;
        macos)
            if ! command -v brew &> /dev/null; then
                warn "Homebrew not found. Install it from https://brew.sh"
                err "Cannot proceed without a package manager."
            fi
            brew install node python3 git ffmpeg
            ;;
        *)
            warn "Auto-install not supported for this platform."
            warn "Please ensure Node.js (v18+), npm, Python3, git, and ffmpeg are installed."
            ;;
    esac
}

# ━━━ Verify required tools ━━━
check_requirements() {
    info "Checking requirements..."

    local missing=0

    if ! command -v node &> /dev/null; then
        err "Node.js is not installed. Please install Node.js v18+."
        missing=1
    else
        NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
        if [ "$NODE_VER" -lt 18 ]; then
            err "Node.js v18+ required. Found: $(node -v)"
            missing=1
        fi
        log "Node.js $(node -v)"
    fi

    if ! command -v npm &> /dev/null; then
        err "npm is not installed."
        missing=1
    else
        log "npm $(npm -v)"
    fi

    if ! command -v ffmpeg &> /dev/null; then
        warn "ffmpeg not found — audio streaming won't work without it!"
    else
        log "ffmpeg found"
    fi

    if [ $missing -eq 1 ]; then
        err "Missing required dependencies. Aborting."
    fi
}

# ━━━ Setup environment ━━━
setup_env() {
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            warn ".env created from .env.example — EDIT IT with your bot token!"
            warn "  -> Open .env and add your DISCORD_TOKEN and CLIENT_ID"
        else
            err ".env.example not found. Something's wrong with the repo."
        fi
    else
        log ".env already exists, skipping."
    fi
}

# ━━━ Install node dependencies ━━━
install_packages() {
    info "Installing npm packages..."
    npm install
    log "All packages installed!"
}

# ━━━ Deploy slash commands ━━━
deploy_commands() {
    echo ""
    info "Do you want to deploy slash commands now? (y/n)"
    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        if grep -q "your_bot_token_here" .env 2>/dev/null; then
            warn "You haven't configured .env yet! Edit it first, then run:"
            echo -e "  ${CYAN}npm run deploy${NC}"
        else
            npm run deploy
            log "Slash commands deployed!"
        fi
    else
        warn "Skipped. Deploy later with: npm run deploy"
    fi
}

# ━━━ Done! ━━━
finish() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Kaizen-JAM is ready to jam!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${CYAN}Quick start:${NC}"
    echo -e "    1. Edit ${YELLOW}.env${NC} with your bot token & client ID"
    echo -e "    2. Deploy commands:  ${YELLOW}npm run deploy${NC}"
    echo -e "    3. Start the bot:    ${YELLOW}npm start${NC}"
    echo -e "    4. Dev mode:         ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "  ${CYAN}Pro tip:${NC} Use tmux/screen to keep it running in background"
    echo ""
}

# ━━━ Main ━━━
detect_platform
install_deps
check_requirements
setup_env
install_packages
deploy_commands
finish