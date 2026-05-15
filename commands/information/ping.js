const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    name: 'ping',
    usage: 'Check bot latency',
    category: 'info',
    premium: false,
    cooldown: 4,
    run: async (client, message, args) => {
        const botLatency = client.ws.ping;
        const apiLatency = Math.round(Date.now() - message.createdTimestamp);
        const dbLatency = await client.db.ping().catch(() => 'N/A');

        // Create Ping Embed
        const createPingEmbed = () => {
            const dbLatencyText = dbLatency !== 'N/A' ? `${dbLatency.toFixed(2)}` : 'N/A';
            
            const description = 
                `${client.emoji.leviathan} **Pong!**\n` +
                `${client.emoji.reply2} Bot Latency: \`${botLatency}ms\` (${(botLatency / 1000).toFixed(2)}s)\n` +
                `${client.emoji.reply2} API Latency: \`${apiLatency}ms\` (${(apiLatency / 1000).toFixed(2)}s)\n` +
                `${client.emoji.reply3} Database Latency: \`${dbLatencyText}ms\` (${(dbLatency / 1000).toFixed(2)}s)`;

            return new EmbedBuilder()
                .setDescription(description)
                .setColor(client.color);
        };

        // Create Uptime Embed
        const createUptimeEmbed = () => {
            const uptime = client.uptime || 0;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((uptime / (1000 * 60)) % 60);
            const seconds = Math.floor((uptime / 1000) % 60);

            const now = moment().tz('Asia/Kolkata');
            const timestamp = `<t:${Math.floor(Date.now() / 1000)}:t>`;
            const dateTimestamp = `<t:${Math.floor(Date.now() / 1000)}:F>`;

            const description = 
                `${client.emoji.leviathan} **Uptime Stats:**\n` +
                `${client.emoji.reply2} Static Uptime: \`${days}\` days, \`${hours}\` hr, \`${minutes}\` mins, \`${seconds}\` sec.\n` +
                `${client.emoji.reply3} Live Uptime: ${timestamp} | ${dateTimestamp}`;

            return new EmbedBuilder()
                .setDescription(description)
                .setColor(client.color);
        };

        // Create Buttons
        const refreshButton = new ButtonBuilder()
            .setLabel('Refresh')
            .setCustomId('pingRefresh')
            .setStyle(ButtonStyle.Secondary);

        const uptimeButton = new ButtonBuilder()
            .setLabel('Uptime')
            .setCustomId('pingUptime')
            .setStyle(ButtonStyle.Secondary);

        const backButton = new ButtonBuilder()
            .setLabel('Back To Ping')
            .setCustomId('pingBack')
            .setStyle(ButtonStyle.Secondary);

        const row1 = new ActionRowBuilder().addComponents(refreshButton, uptimeButton);
        const row2 = new ActionRowBuilder().addComponents(backButton);

        // Send initial ping embed
        const sentMessage = await message.channel.send({
            embeds: [createPingEmbed()],
            components: [row1]
        });

        // Handle button interactions
        const collector = sentMessage.createMessageComponentCollector({
            time: 60000 // 1 minute expiration
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: 'You can\'t use this button!',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'pingRefresh') {
                await interaction.update({
                    embeds: [createPingEmbed()],
                    components: [row1]
                });
            } else if (interaction.customId === 'pingUptime') {
                await interaction.update({
                    embeds: [createUptimeEmbed()],
                    components: [row2]
                });
            } else if (interaction.customId === 'pingBack') {
                await interaction.update({
                    embeds: [createPingEmbed()],
                    components: [row1]
                });
            }
        });

        // When collector ends, disable buttons
        collector.on('end', async () => {
            const disabledRow1 = new ActionRowBuilder().addComponents(
                refreshButton.setDisabled(true),
                uptimeButton.setDisabled(true)
            );
            const disabledRow2 = new ActionRowBuilder().addComponents(
                backButton.setDisabled(true)
            );

            try {
                await sentMessage.edit({ components: [disabledRow1] });
            } catch (error) {
                // Message may have been deleted
            }
        });
    },
};
