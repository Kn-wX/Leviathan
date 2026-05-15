const { EmbedBuilder } = require('discord.js');
const LoggingConfig = require('../../models/loggingconfig');

module.exports = {
    name: 'logreset',
    usage: 'Manage logreset settings',
    category: 'logging',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageChannels')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Channels\` permission!`)]
            });
        }

        const loggingConfig = await LoggingConfig.findOne({ guildId: message.guildId });

        if (!loggingConfig || !loggingConfig.categoryId) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | No logging setup found!`)]
            });
        }

        try {
            const category = message.guild.channels.cache.get(loggingConfig.categoryId);
            
            if (category) {
                const channelsToDelete = category.children.cache.map(ch => ch);
                for (const channel of channelsToDelete) {
                    await channel.delete('Logging system reset');
                }
                await category.delete('Logging system reset');
            }

            await LoggingConfig.deleteOne({ guildId: message.guildId });

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(`${client.emoji.leviathanlog} Logging System Reset`)
                .setDescription(`${client.emoji.tick} | Successfully deleted all logging channels and reset the system!`);

            return message.reply({ embeds: [embed] });
        } catch (error) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Error: ${error.message}`)]
            });
        }
    }
};
