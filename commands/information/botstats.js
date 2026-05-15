const { EmbedBuilder } = require('discord.js');
const BotStatistics = require('../../models/botstatistics');

module.exports = {
    name: 'botstats',
    usage: 'Manage botstats settings',
    category: 'info',
    run: async (client, message, args) => {
        const uptime = client.uptime;
        const serverCount = client.guilds.cache.size;
        const userCount = client.users.cache.size;
        const ping = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle('Bot Statistics')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Ping:', value: `\`${ping}ms\``, inline: true },
                { name: 'Uptime:', value: `\`${client.util.formatMs(uptime)}\``, inline: true },
                { name: 'Servers:', value: `\`${serverCount}\``, inline: true },
                { name: 'Users:', value: `\`${userCount}\``, inline: true },
                { name: 'Commands:', value: `\`${client.util.countCommandsAndSubcommands(client)}\``, inline: true },
                { name: 'Memory:', value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\``, inline: true }
            )
            .setTimestamp();

        await BotStatistics.create({
            commandsExecuted: 0,
            messagesProcessed: 0,
            serversCount: serverCount,
            usersCount: userCount,
            uptime,
            ping
        });

        message.reply({ embeds: [embed] });
    }
};
