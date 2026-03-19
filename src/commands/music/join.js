import djs from 'discord.js';
const { SlashCommandBuilder, EmbedBuilder } = djs;
import { useMainPlayer } from 'discord-player';
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your voice channel'),
    async execute(interaction) {
        const vc = interaction.member?.voice?.channel;
        if (!vc) return interaction.reply({ content: '\u274C Join a voice channel first!', ephemeral: true });

        try {
            const player = useMainPlayer();
            player.queues.create(vc.guild, {
                metadata: { channel: interaction.channel },
                volume: config.defaultVolume,
                leaveOnEmpty: true,
                leaveOnEmptyDelay: 300000,
            });
            const queue = player.queues.get(vc.guild);
            if (queue && !queue.connection) {
                await queue.connect(vc);
            }

            const embed = new EmbedBuilder()
                .setColor(config.embedColor)
                .setAuthor({ name: 'Kaizen-JAM', iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle('\uD83D\uDD0A Connected to Voice')
                .setDescription(`Joined **${vc.name}**\nReady to play music!`)
                .addFields(
                    { name: 'Channel', value: `\uD83D\uDD0A ${vc.name}`, inline: true },
                    { name: 'Bitrate', value: `${vc.bitrate / 1000}kbps`, inline: true },
                    { name: 'Members', value: `${vc.members.size}`, inline: true },
                )
                .setFooter({ text: `Requested by ${interaction.user.username} \u2022 Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[JOIN ERR]', err);
            return interaction.reply({ content: '\u274C Failed to join: ' + err.message, ephemeral: true });
        }
    },
};