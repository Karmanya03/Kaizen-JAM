import djs from 'discord.js';
const { SlashCommandBuilder, EmbedBuilder } = djs;

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot and API latency'),
    cooldown: 5,
    async execute(interaction) {
        const sent = await interaction.deferReply({ fetchReply: true });
        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
        const ws = interaction.client.ws.ping;
        const color = ws < 100 ? 0x00FF00 : ws < 300 ? 0xFFFF00 : 0xFF0000;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('\uD83C\uDFD3 Pong!')
            .addFields(
                { name: 'Roundtrip', value: `${roundtrip}ms`, inline: true },
                { name: 'WebSocket', value: `${ws}ms`, inline: true },
            )
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};