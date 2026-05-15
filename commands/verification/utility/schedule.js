const { EmbedBuilder } = require('discord.js');
const ScheduledMessage = require('../../models/scheduledmessage');

module.exports = {
    name: 'schedule',
    usage: 'Manage schedule settings',
    category: 'utility',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Messages\` permission!`)]
            });
        }

        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'add') {
            if (!args[1] || !args[2]) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Usage: \`schedule add <channel> <time_in_minutes> <message>\``)]
                });
            }

            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            const minutes = parseInt(args[2]);
            const messageText = args.slice(3).join(' ');

            if (!channel || !messageText || isNaN(minutes)) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Invalid arguments!`)]
                });
            }

            const scheduledTime = new Date(Date.now() + minutes * 60 * 1000);

            await ScheduledMessage.create({
                guildId: message.guildId,
                channelId: channel.id,
                message: messageText,
                scheduledTime,
                createdBy: message.author.id
            });

            message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | Message scheduled for <t:${Math.floor(scheduledTime / 1000)}:F>!`)]
            });
        }
    }
};
