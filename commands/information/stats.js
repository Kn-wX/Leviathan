const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const os = require('os');

module.exports = {
    name: 'stats',
    category: 'info',
    aliases: ['botinfo', 'bi', 'botstats'],
    usage: 'Display bot information and statistics',
    premium: false,

    run: async (client, message, args) => {
        const refreshButton = new ButtonBuilder()
            .setLabel('Refresh')
            .setCustomId('refreshStats')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder({
            components: [refreshButton]
        });

        const createStatsEmbed = async () => {
            const uptime = client.uptime || 0;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((uptime / (1000 * 60)) % 60);
            const seconds = Math.floor((uptime / 1000) % 60);

            const guilds = client.guilds.cache.size;
            const users = client.guilds.cache.reduce((x, y) => x + y.memberCount, 0);
            const channels = client.channels.cache.size;
            const commands = client.util.countCommandsAndSubcommands(client);

            // Memory info
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const usedMemory = totalMemory - freeMemory;
            const heapUsed = process.memoryUsage().heapUsed / (1024 * 1024);
            const heapTotal = process.memoryUsage().heapTotal / (1024 * 1024);
            const rssMemory = process.memoryUsage().rss / (1024 * 1024);

            // CPU and Database
            const platform = process.platform;
            const dbPing = await client.db.ping().catch(() => 'N/A');
            const dbStatus = dbPing !== 'N/A' ? `Connected (${dbPing}ms)` : 'Offline';

            // Get main developer
            const mainDev = await client.users.fetch(client.config.developer[0] || '1419277675440115853').catch(() => null);
            const devName = mainDev?.globalName || mainDev?.username || 'Unknown';

            const description = 
                `**General Information**\n` +
                `${client.emoji.reply2} **Version:** \`5.0.0\`\n` +
                `${client.emoji.reply2} **Developer:** \`${devName}\`\n` +
                `${client.emoji.reply2} **Library:** \`Discord.js v14\`\n` +
                `${client.emoji.reply2} **Node.js:** \`${process.version}\`\n` +
                `${client.emoji.reply3} **Platform:** \`${platform}\`\n\n` +
                
                `**Statistics**\n` +
                `${client.emoji.reply2} **Servers:** \`${guilds}\`\n` +
                `${client.emoji.reply2} **Users:** \`${users}\`\n` +
                `${client.emoji.reply2} **Channels:** \`${channels}\`\n` +
                `${client.emoji.reply3} **Commands:** \`${commands}\`\n\n` +
                
                `**System Information**\n` +
                `${client.emoji.reply2} **Memory (Heap):** \`${heapUsed.toFixed(2)}MB / ${heapTotal.toFixed(2)}MB\`\n` +
                `${client.emoji.reply2} **Memory (RSS):** \`${rssMemory.toFixed(2)}MB\`\n` +
                `${client.emoji.reply2} **CPU Load:** \`${(os.loadavg()[0]).toFixed(2)}\`\n` +
                `${client.emoji.reply3} **Database:** \`${dbStatus}\`\n\n` +
                
                `**Uptime**\n` +
                `${client.emoji.reply2} \`${days}d ${hours}h ${minutes}m ${seconds}s\`\n` +
                `${client.emoji.reply3} <t:${Math.floor(Date.now() / 1000)}:F>`;

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(description)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

            return embed;
        };

        const embed = await createStatsEmbed();
        const msg = await message.channel.send({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.customId === 'refreshStats' && i.user.id === message.author.id,
            time: 300000
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            const newEmbed = await createStatsEmbed();
            await msg.edit({ embeds: [newEmbed] });
        });

        collector.on('end', () => {
            refreshButton.setDisabled(true);
            const disabledRow = new ActionRowBuilder({ components: [refreshButton] });
            msg.edit({ components: [disabledRow] }).catch(() => {});
        });
    }
};
