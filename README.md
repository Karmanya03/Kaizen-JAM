<div align="center">

<img src="assets/Kaizen-JAM-Banner.png" alt="Kaizen-JAM Banner" width="100%">

### continuous improvement, applied to sound.

<br>

**Crystal-clear audio streaming. Seamless queue management. Zero bloat. Zero compromises.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Vibes](https://img.shields.io/badge/Vibes-Immaculate-ff69b4?style=for-the-badge)](#)

---

*The standalone JavaScript music bot spinoff of the main [Kaizen](https://github.com/Karmanya03) Rust-based PRIVATE bot.*
*Think of it as the acoustic unplugged version of the metal album.*

</div>

<br>

## So what is this thing?

Kaizen-JAM is a Discord music bot that actually works. I know, groundbreaking.

The main Kaizen bot is written in Rust because apparently I enjoy suffering and fighting the borrow checker at 3 AM. This one's pure JavaScript -- lightweight, fast to deploy, and won't make you mass question your career choices.

It joins your voice channel. It plays music. It manages a queue. That's literally it. One job, done well. Unlike that one group project member we all know.

<br>

## What can it do?

| Command | What it does | Real talk |
|---------|-------------|----------|
| `/play` | Play a song from YouTube URL or search | The whole point of this bot |
| `/skip` | Skip current track (vote-skip support) | Democracy. In a Discord bot. |
| `/stop` | Stop playback, nuke the queue | Party killer command |
| `/queue` | View the queue with pagination | For when you need to see how bad everyone's taste is |
| `/nowplaying` | Shows current track + progress bar | The "what song is this" preventer |
| `/join` | Summon bot to your voice channel | *teleports behind you* nothing personnel kid |
| `/leave` | Disconnect the bot | See ya |
| `/avatar` | Grab anyone's pfp in full HD | Totally not for stalking purposes |
| `/ping` | Check latency | Is this thing on? |
| `/serverinfo` | Server stats | For flexing your member count |
| `/help` | List all commands | You're reading the README but okay |
| `/ban` | Ban a user | Goodbye. Forever. |
| `/kick` | Kick a user | Politely shown the door |
| `/purge` | Bulk delete messages | Evidence destruction tool |

<br>

## Project structure (for the curious)

```
Kaizen-JAM/
|-- src/
|   |-- commands/
|   |   |-- music/          # the good stuff - play, skip, queue, etc.
|   |   |-- moderation/     # ban hammer and friends
|   |   +-- utility/        # ping, avatar, help - the boring essentials
|   |-- events/             # discord event listeners
|   |-- handlers/           # command & event loading magic
|   |-- utils/              # embeds, buttons, security helpers
|   |-- config.js           # emojis, limits, vibes configuration
|   |-- deploy-commands.js  # slash command registration
|   +-- index.js            # where it all begins
|-- .env.example            # template for your secrets
|-- setup.sh                # one-click setup script
+-- package.json            # dependencies & scripts
```

<br>

## Getting started

### You will need

- **Node.js** v18 or higher. ([download](https://nodejs.org))
- **ffmpeg** installed on your system. Raw bytes don't sound great, trust me.
- **A Discord Bot Token.** Go to the [Developer Portal](https://discord.com/developers/applications) and make one.
- An internet connection. Hopefully.
- Basic reading comprehension.

### The lazy way (recommended)

```bash
git clone https://github.com/Karmanya03/Kaizen-JAM.git
cd Kaizen-JAM

chmod +x setup.sh
./setup.sh
```

The script figures out your OS (Linux, macOS, WSL, even Termux because we don't discriminate), installs dependencies, sets up your `.env`, installs npm packages, and optionally deploys slash commands. It does everything short of making you coffee.

### The manual way (for people who don't trust shell scripts, fair enough)

```bash
git clone https://github.com/Karmanya03/Kaizen-JAM.git
cd Kaizen-JAM

npm install

cp .env.example .env
# go edit .env with your actual token and client ID

npm run deploy    # register slash commands
npm start         # run the bot
npm run dev       # or this, if you want auto-restart on changes
```

<br>

## Environment variables

| Variable | Required? | What it is |
|----------|-----------|------------|
| `DISCORD_TOKEN` | yes | Your bot token. Treat this like a password. Because it is one. |
| `CLIENT_ID` | yes | Your application's client ID from the developer portal |
| `GUILD_ID` | nah | Only for dev testing. Makes slash commands update instantly in one server. |
| `OWNER_IDS` | nah | Comma-separated Discord user IDs. For owner-only commands. |

> **Seriously.** Do not commit your `.env` file. The `.gitignore` is already set up to save you from yourself, but I'm telling you anyway.

<br>

## What's under the hood

| Package | Why it's here |
|---------|---------------|
| **discord.js v14** | The backbone. The OG. If you're making a Discord bot in JS, you're using this. |
| **@discordjs/voice** | Voice connection handling that doesn't make you want to mass cry |
| **@discordjs/opus** | Opus encoding. Makes audio not sound like it's coming through a tin can. |
| **discord-player** | High-level music player so I don't have to write one from scratch |
| **discord-player-youtubei** | YouTube extraction that doesn't break every other Tuesday |
| **mediaplex** | Media utilities |
| **ffmpeg-static** | Bundled ffmpeg so you don't need it system-wide |
| **sodium-native** | Voice encryption. Discord requires it. |
| **dotenv** | Loads `.env` files. Because hardcoding tokens is a federal crime. |

<br>

## How to actually use it

1. Invite the bot to your server (OAuth2 URL from Developer Portal, you know the drill)
2. Join a voice channel
3. Type `/play never gonna give you up`
4. Congratulations, you just rickrolled yourself
5. Sit there in silence questioning your choices
6. Notice the audio quality is actually really good though
7. Play something you actually want to listen to this time

<br>

## Want to contribute?

Pull requests are welcome. Found a bug? Open an issue. Want a feature? Open an issue. Want to just complain about something? Honestly, still open an issue, I respect the energy.

1. Fork it
2. Branch it (`git checkout -b feature/something-cool`)
3. Commit it (`git commit -m 'added something cool'`)
4. Push it (`git push origin feature/something-cool`)
5. PR it
6. Wait for me to review it at some ungodly hour

<br>

## License

MIT. Do whatever you want with it. I am not responsible when your Discord server inevitably becomes a 24/7 lofi hip hop radio - beats to mass relax/study to.

<br>

---

<div align="center">

**______________**

*Built on mass sleep deprivation, mass caffeine, and mass mass vibes.*

*[Karmanya03](https://github.com/Karmanya03)*

**Today better than yesterday. Tomorrow better than today.**

______________

</div>