const { EmbedBuilder } = require('discord.js');
const ServerAnalytics = require('../../models/serveranalytics');

module.exports = {
    name: 'serverstats',
    usage: 'Manage serverstats settings',
    category: 'info',
    run: async (client, message, args) => {
        const guild = message.guild;
        const memberCount = guild.memberCount;
        const channelCount = guild.channels.cache.size;
        const roleCount = guild.roles.cache.size;
        const createdAt = Math.floor(guild.createdTimestamp / 1000);

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${guild.name} Statistics`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Owner:', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members:', value: `\`${memberCount}\``, inline: true },
                { name: 'Channels:', value: `\`${channelCount}\``, inline: true },
                { name: 'Roles:', value: `\`${roleCount}\``, inline: true },
                { name: 'Boosts:', value: `\`${guild.premiumSubscriptionCount}\``, inline: true },
                { name: 'Created:', value: `<t:${createdAt}:F>`, inline: true }
            )
            .setTimestamp();

        await ServerAnalytics.create({
            guildId: guild.id,
            memberCount,
            messageCount: 0,
            commandCount: 0
        });

        message.reply({ embeds: [embed] });
    }
};
