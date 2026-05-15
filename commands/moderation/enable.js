const { EmbedBuilder } = require('discord.js');
const DisabledCommands = require('../../models/disabledcommands');

module.exports = {
    name: 'enable',
    category: 'moderation',
    aliases: [],
    usage: 'enable {command}',
    premium: false,

    run: async (client, message, args) => {
        // Only server owner can use this command
        if (message.author.id !== message.guild.ownerId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`${client.emoji.cross} Only the server owner can use this command.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        }

        if (!args[0]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`${client.emoji.cross} Please provide a command name to enable.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        }

        const cmdName = args[0].toLowerCase();

        try {
            const result = await DisabledCommands.deleteOne({
                guildId: message.guild.id,
                commandName: cmdName
            });

            if (result.deletedCount === 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`⚠️ Command **${cmdName}** is not disabled.`)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.tick} Command **${cmdName}** has been enabled in this server.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            console.error('Enable Command Error:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`${client.emoji.cross} An error occurred while enabling the command.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        }
    }
};
