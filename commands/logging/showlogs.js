const { EmbedBuilder } = require('discord.js');
const LoggingConfig = require('../../models/loggingconfig');

module.exports = {
    name: 'showlogs',
    usage: 'Manage showlogs settings',
    category: 'logging',
    run: async (client, message, args) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: message.guildId });

        if (!loggingConfig) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setTitle(`${client.emoji.leviathanlog} Logging Configuration`).setDescription('No logging configured for this server. Use `autologs` to set up logging.')]
            });
        }

        const enabledLogs = Object.entries(loggingConfig.enabledLogs)
            .filter(([_, enabled]) => enabled)
            .map(([log]) => `${client.emoji.enable} \`${log}\``)
            .join('\n') || 'None enabled';

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${client.emoji.leviathanlog} Active Logging`)
            .addFields(
                { name: 'Enabled Logs:', value: enabledLogs },
                { name: 'Logging Category:', value: `<#${loggingConfig.categoryId}>` }
            );

        message.reply({ embeds: [embed] });
    }
};
