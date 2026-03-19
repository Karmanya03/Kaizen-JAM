import djs from 'discord.js';
const { SlashCommandBuilder, PermissionFlagsBits } = djs;

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete messages')
        .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
        .addUserOption(o => o.setName('target').setDescription('Filter by user'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    cooldown: 5,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getUser('target');

        let messages = await interaction.channel.messages.fetch({ limit: amount });
        if (target) messages = messages.filter(m => m.author.id === target.id);

        const deleted = await interaction.channel.bulkDelete(messages, true);
        return interaction.editReply({ content: `\u2705 Deleted **${deleted.size}** messages.` });
    },
};