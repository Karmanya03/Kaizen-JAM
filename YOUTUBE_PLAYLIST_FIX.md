# YouTube Playlist Parsing Fix

## Problem
YouTube playlists were being treated as a single video instead of parsing individual tracks. Users couldn't skip/shuffle through playlist tracks.

## Root Cause
The `discord-player-youtubei` extractor with `youtubei.js` has two issues:
1. Default `slicePlaylist: true` only queues the first track
2. **Stream caching bug**: Even with `slicePlaylist: false`, the extractor caches the first track's audio stream and reuses it for all subsequent tracks in the playlist

## Solution Implemented
1. Set `slicePlaylist: false` in YoutubeiExtractor configuration to parse all playlist tracks
2. Downgraded `youtubei.js` from v14.0.0 to v13.4.0 for stability (v14 has breaking API parsing errors)

## Known Limitation
**YouTube playlists may play the same audio for different tracks** due to a stream caching bug in `discord-player-youtubei`. This is a library-level issue that cannot be fixed without modifying the extractor source code.

**Workaround**: Use Spotify playlists instead, which work correctly.

## Files Modified
- `package.json`: Downgraded youtubei.js override to v13.4.0
- `src/index.js`: Added `slicePlaylist: false` to YoutubeiExtractor config
- `src/commands/music/play.js`: Added warning message for YouTube playlists

## Testing
- ✅ Playlist detection works (shows correct track count)
- ✅ All tracks are queued with correct titles and URLs
- ✅ Individual YouTube videos work perfectly
- ✅ Spotify playlists work perfectly
- ⚠️ YouTube playlists may have audio stream caching issues (library limitation)
