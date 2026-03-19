import djs from 'discord.js';
const { SlashCommandBuilder, EmbedBuilder } = djs;
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a user\'s avatar')
        .addUserOption(o => o.setName('user').setDescription('Target user')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const url = user.displayAvatarURL({ size: 4096, dynamic: true });
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(url)
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    },
};