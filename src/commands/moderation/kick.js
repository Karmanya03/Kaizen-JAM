import djs from 'discord.js';
const { SlashCommandBuilder, PermissionFlagsBits } = djs;

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member')
        .addUserOption(o => o.setName('target').setDescription('Member to kick').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    cooldown: 5,
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) return interaction.reply({ content: '\u274C User not found.', ephemeral: true });
        if (!target.kickable) return interaction.reply({ content: '\u274C Cannot kick this user.', ephemeral: true });
        await target.kick(reason);
        return interaction.reply({ content: `\u2705 **${target.user.username}** has been kicked. Reason: ${reason}` });
    },
};