import djs from 'discord.js';
const { SlashCommandBuilder } = djs;
import { useMainPlayer } from 'discord-player';
import { trackAddedEmbed } from '../../utils/embeds.js';
import { sanitizeInput } from '../../utils/security.js';
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist from YouTube/Spotify/SoundCloud')
        .addStringOption(o => o.setName('query').setDescription('Song name, URL, or playlist URL').setRequired(true).setAutocomplete(true)),
    cooldown: 3,
    async autocomplete(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getFocused();
        if (!query || query.length < 2) return interaction.respond([]);
        try {
            const results = await player.search(sanitizeInput(query));
            const choices = results.tracks.slice(0, 10).map(t => ({
                name: `${t.title} - ${t.author}`.slice(0, 100),
                value: t.url,
            }));
            return interaction.respond(choices);
        } catch {
            return interaction.respond([]);
        }
    },
    async execute(interaction) {
        const vc = interaction.member?.voice?.channel;
        if (!vc) return interaction.reply({ content: '\u274C Join a voice channel first!', ephemeral: true });

        const query = sanitizeInput(interaction.options.getString('query', true));
        if (!query) return interaction.reply({ content: '\u274C Provide a search query or URL.', ephemeral: true });

        await interaction.deferReply();

        const player = useMainPlayer();

        try {
            const { track, searchResult } = await player.play(vc, query, {
                requestedBy: interaction.user,
                nodeOptions: {
                    metadata: { channel: interaction.channel, interaction },
                    volume: config.defaultVolume,
                    leaveOnEmpty: true,
                    leaveOnEmptyDelay: 60000,
                    leaveOnEnd: true,
                    leaveOnEndDelay: 60000,
                },
            });

            if (searchResult.playlist) {
                return interaction.editReply({
                    content: `${config.emojis.music} **Playlist queued:** ${searchResult.playlist.title} (${searchResult.tracks.length} tracks)`,
                });
            }

            const queue = player.queues.get(interaction.guildId);
            const pos = queue?.tracks?.size ?? 1;
            const embed = trackAddedEmbed(track, pos);
            return interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error('[PLAY ERR]', err);
            return interaction.editReply({ content: `\u274C Error: ${err.message}` });
        }
    },
};