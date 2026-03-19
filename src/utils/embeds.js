import djs from 'discord.js';
const { EmbedBuilder } = djs;
import { config } from '../config.js';
import { nowPlayingRow, nowPlayingRow2 } from './buttons.js';
import { useQueue } from 'discord-player';

export function makeEmbed({ title, description, color, thumbnail, footer, fields }) {
    const embed = new EmbedBuilder()
        .setColor(color || config.embedColor)
        .setTimestamp();
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter(typeof footer === 'string' ? { text: footer } : footer);
    if (fields) embed.addFields(fields);
    return embed;
}

export function buildProgressBar(current, total, length = config.progressBarLength) {
    if (!total || total === 0) return '▬'.repeat(length);
    const progress = Math.round((current / total) * length);
    const filled = '▬'.repeat(Math.min(progress, length));
    const empty = '▬'.repeat(length - Math.min(progress, length));
    return `${filled}🔘${empty}`;
}

export function formatDuration(ms) {
    if (!ms || ms === 0) return 'LIVE';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function buildNowPlayingEmbed(queue, track) {
    const progress = queue.node.getTimestamp();
    const currentMs = progress?.current?.value || 0;
    const totalMs   = progress?.total?.value   || track.durationMS || 0;
    const bar       = buildProgressBar(currentMs, totalMs);
    const vol       = queue.node.volume;           // always live read
    const loopMode  = queue.repeatMode;
    const loopText  = loopMode === 1 ? '🔂 Track' : loopMode === 2 ? '🔁 Queue' : '❌ Off';

    return makeEmbed({
        title: `${config.emojis.nowPlaying} Now Playing`,
        description: [
            `**[${track.title}](${track.url})**`,
            `by **${track.author || 'Unknown'}**`,
            '',
            `${formatDuration(currentMs)} ${bar} ${formatDuration(totalMs)}`,
            '',
            `${config.emojis.volume} **Volume:** ${vol}% | **Loop:** ${loopText}`,
        ].join('\n'),
        thumbnail: track.thumbnail || null,
        color: config.embedColor,
        footer: { text: `Requested by ${track.requestedBy?.username || 'Unknown'}` },
    });
}

export async function sendNowPlayingCard(queue, track, client) {
    const channel = queue.metadata?.channel;
    if (!channel) return;

    const embed    = buildNowPlayingEmbed(queue, track);
    const isPaused = queue.node.isPaused();
    const loopMode = queue.repeatMode;
    const row1     = nowPlayingRow(isPaused, loopMode);
    const row2     = nowPlayingRow2();

    const oldMsg = client.nowPlayingMessages.get(queue.guild.id);
    if (oldMsg) { try { await oldMsg.delete(); } catch {} }

    const msg = await channel.send({ embeds: [embed], components: [row1, row2] });
    client.nowPlayingMessages.set(queue.guild.id, msg);

    // Auto-refresh every 15s — also catches volume/loop changes
    const interval = setInterval(async () => {
        try {
            const q = useQueue(queue.guild.id);
            if (!q || !q.isPlaying() || !q.currentTrack) {
                clearInterval(interval);
                return;
            }
            const updatedEmbed = buildNowPlayingEmbed(q, q.currentTrack);
            const updatedRow1  = nowPlayingRow(q.node.isPaused(), q.repeatMode);
            await msg.edit({ embeds: [updatedEmbed], components: [updatedRow1, row2] });
        } catch {
            clearInterval(interval);
        }
    }, 15000);

    // FIX: queue.node is NOT an EventEmitter in dp v7 — use player.events instead
    const cleanup = (q) => {
        if (q?.guild?.id === queue.guild.id || q?.id === queue.guild.id) {
            clearInterval(interval);
        }
    };
    queue.player.events.on('playerSkip',   cleanup);
    queue.player.events.on('disconnect',   cleanup);
    queue.player.events.on('emptyQueue',   cleanup);
    queue.player.events.once('playerFinish', (q) => {
        if (q?.guild?.id === queue.guild.id) clearInterval(interval);
        queue.player.events.off('playerSkip', cleanup);
        queue.player.events.off('disconnect',  cleanup);
        queue.player.events.off('emptyQueue',  cleanup);
    });
}

// Call this from volume button handlers instead of sending an ephemeral
export async function updateNowPlayingVolume(queue, client) {
    const msg = client.nowPlayingMessages.get(queue.guild.id);
    if (!msg || !queue.currentTrack) return;
    try {
        const embed = buildNowPlayingEmbed(queue, queue.currentTrack);
        const row1  = nowPlayingRow(queue.node.isPaused(), queue.repeatMode);
        const { nowPlayingRow2 } = await import('./buttons.js');
        await msg.edit({ embeds: [embed], components: [row1, nowPlayingRow2()] });
    } catch (e) {
        console.error('[VOL UPDATE]', e.message);
    }
}

export function trackAddedEmbed(track, position) {
    return makeEmbed({
        title: `${config.emojis.music} Added to Queue`,
        description: `**[${track.title}](${track.url})**\nby **${track.author}**\nDuration: ${track.duration} | Position: #${position}`,
        thumbnail: track.thumbnail || null,
        footer: `Requested by ${track.requestedBy?.username || 'Unknown'}`,
    });
}

export function queueEmbed(tracks, page, totalPages, currentTrack) {
    const list   = tracks.map((t, i) => `**${page * 10 + i + 1}.** [${t.title}](${t.url}) - ${t.duration}`).join('\n');
    const header = currentTrack ? `**Now Playing:** [${currentTrack.title}](${currentTrack.url})\n\n` : '';
    return makeEmbed({
        title: `${config.emojis.queue} Queue (Page ${page + 1}/${totalPages})`,
        description: `${header}${list}`,
        footer: `${tracks.length} track${tracks.length !== 1 ? 's' : ''} in queue`,
    });
}
