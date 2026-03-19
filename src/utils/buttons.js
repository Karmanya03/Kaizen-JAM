import djs from 'discord.js';
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = djs;

// Now Playing card buttons (row 1)
export function nowPlayingRow(isPaused, loopMode) {
    // loopMode: 0=off, 1=track, 2=queue
    const loopLabel = loopMode === 1 ? 'Loop: Track' : loopMode === 2 ? 'Loop: Queue' : 'Loop: Off';
    const loopStyle = loopMode > 0 ? ButtonStyle.Success : ButtonStyle.Secondary;
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('music_prev').setEmoji('\u23EE\uFE0F').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_pause').setEmoji(isPaused ? '\u25B6\uFE0F' : '\u23F8\uFE0F').setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('music_skip').setEmoji('\u23ED\uFE0F').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('music_stop').setEmoji('\u23F9\uFE0F').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('music_loop').setLabel(loopLabel).setStyle(loopStyle),
    );
}

// Now Playing card buttons (row 2)
export function nowPlayingRow2() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('music_shuffle').setEmoji('\uD83D\uDD00').setLabel('Shuffle').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_queue').setEmoji('\uD83D\uDCDC').setLabel('Queue').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_voldown').setEmoji('\uD83D\uDD09').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('music_volup').setEmoji('\uD83D\uDD0A').setStyle(ButtonStyle.Secondary),
    );
}

// Queue pagination
export function queuePaginationRow(page, totalPages) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`qpage_prev_${page}`).setLabel('\u25C0 Prev').setStyle(ButtonStyle.Secondary).setDisabled(page <= 0),
        new ButtonBuilder().setCustomId('qpage_info').setLabel(`${page + 1}/${totalPages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId(`qpage_next_${page}`).setLabel('Next \u25B6').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1),
    );
}

// Vote skip row
export function voteSkipRow(currentVotes, needed) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('music_voteskip').setLabel(`Skip (${currentVotes}/${needed})`).setEmoji('\u23ED\uFE0F').setStyle(ButtonStyle.Primary),
    );
}