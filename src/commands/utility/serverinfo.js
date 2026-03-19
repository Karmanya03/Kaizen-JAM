import djs from 'discord.js';
const { SlashCommandBuilder, EmbedBuilder } = djs;
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display server information'),
    cooldown: 5,
    async execute(interaction) {
        const { guild } = interaction;
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ size: 256 }))
            .addFields(
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
            )
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    },
};