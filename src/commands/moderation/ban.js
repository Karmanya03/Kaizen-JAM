import djs from 'discord.js';
const { SlashCommandBuilder, PermissionFlagsBits } = djs;

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member')
        .addUserOption(o => o.setName('target').setDescription('Member to ban').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    cooldown: 5,
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) return interaction.reply({ content: '\u274C User not found.', ephemeral: true });
        if (!target.bannable) return interaction.reply({ content: '\u274C Cannot ban this user.', ephemeral: true });
        await target.ban({ reason });
        return interaction.reply({ content: `\u2705 **${target.user.username}** has been banned. Reason: ${reason}` });
    },
};