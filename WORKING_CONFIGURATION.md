# Kaizen-JAM Working Configuration Backup

This document contains all package versions and system requirements that are currently working for the Kaizen-JAM Discord music bot.

## System Requirements

- **Node.js**: >= 22.12.0
- **Operating System**: Windows (tested), Linux/macOS compatible
- **FFmpeg**: Required (installed via ffmpeg-static package)

## Package Dependencies

### Core Discord Packages
```json
"discord.js": "^14.16.3"
"discord-api-types": "^0.38.42"
"@discordjs/voice": "^0.18.0"
"@discordjs/opus": "^0.10.0"
```

### Discord Player & Extractors
```json
"discord-player": "^7.2.0"
"discord-player-youtubei": "^2.0.0"
"discord-player-youtubedlp": "^1.1.8"
"@discord-player/extractor": "^7.2.0"
```

### Audio Processing (DAVE - Discord Audio Voice Engine)
```json
"@snazzah/davey": "^0.1.9"
"mediaplex": "^1.0.0"
"sodium-native": "^4.3.3"
"libsodium-wrappers": "^0.8.2"
"opusscript": "^0.0.8"
```

### YouTube Integration
```json
"youtubei.js": "^13.4.0"
"youtube-dl-exec": "^3.1.4"
```

### Utilities
```json
"dotenv": "^16.4.5"
"ffmpeg-static": "^5.2.0"
"undici": "^7.24.4"
```

## Package Overrides (Critical for Stability)

These overrides are **required** to prevent dependency conflicts and ensure compatibility:

```json
"overrides": {
    "discord-player-youtubei": {
        "youtubei.js": "^13.4.0"
    },
    "discord-voip": {
        "discord-api-types": "0.37.97"
    },
    "@sapphire/shapeshift": "^4.0.0"
}
```

### Why These Overrides?

1. **youtubei.js v13.4.0**: Version 14.0.0 has breaking API parsing errors. v13.4.0 is stable.
2. **discord-api-types 0.37.97**: Prevents version conflicts with discord-voip
3. **@sapphire/shapeshift v4.0.0**: Ensures compatibility with discord-player

## Extractor Configuration

### YoutubeiExtractor (Primary - DAVE Compatible)
```javascript
await player.extractors.register(YoutubeiExtractor, {
    cookie: cookieString || undefined,
    streamOptions: {
        useClient: 'IOS',
        highWaterMark: 1 << 25,
    },
    slicePlaylist: false, // Parse all playlist tracks
    innertubeConfigRaw: {
        lang: 'en',
        location: 'US',
    },
});
```

### Other Extractors
```javascript
await player.extractors.register(SpotifyExtractor, {});
await player.extractors.register(SoundCloudExtractor, {});
await player.extractors.register(AttachmentExtractor, {});
```

## Known Working Features

✅ Individual YouTube videos  
✅ Spotify playlists (full support)  
✅ SoundCloud tracks  
✅ Audio file attachments  
✅ Queue management  
✅ Skip/Stop controls  
✅ Volume control  
✅ Now playing cards  
✅ Voice channel management  

## Known Limitations

⚠️ **YouTube Playlists**: May have audio stream caching issues (library limitation)
- Tracks are detected and queued correctly
- Same audio may play for different tracks
- **Workaround**: Use Spotify playlists instead

## Installation Command

```bash
npm install
```

This will install all dependencies with the correct versions as specified in package.json.

## Environment Variables Required

Create a `.env` file with:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

## Backup Date

**Last Updated**: March 22, 2026  
**Bot Version**: 1.0.0  
**Configuration Status**: ✅ Stable and Working

## Restoration Instructions

To restore this exact configuration:

1. Copy `package.json` from this backup
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install`
4. Ensure Node.js version >= 22.12.0
5. Configure `.env` file with your bot credentials
6. Run `npm start`

## Critical Notes

- **Do NOT upgrade youtubei.js** beyond v13.4.0 without testing
- **YoutubeiExtractor is required** for DAVE compatibility on Windows
- **YouTubeDlpExtractor causes EPIPE errors** and is not DAVE-compatible
- Keep `slicePlaylist: false` for playlist support
- Cookies file (`cookies.txt`) is optional but recommended for age-restricted content
