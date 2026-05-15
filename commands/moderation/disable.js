const { EmbedBuilder } = require('discord.js');
const DisabledCommands = require('../../models/disabledcommands');

module.exports = {
    name: 'disable',
    category: 'moderation',
    aliases: [],
    usage: 'disable {command}',
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
                        .setDescription(`${client.emoji.cross} Please provide a command name to disable.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        }

        const cmdName = args[0].toLowerCase();
        const cmd = client.commands.get(cmdName);

        if (!cmd) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`${client.emoji.cross} Command **${cmdName}** does not exist.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        }

        try {
            const existing = await DisabledCommands.findOne({
                guildId: message.guild.id,
                commandName: cmdName
            });

            if (existing) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setDescription(`⚠️ Command **${cmdName}** is already disabled.`)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            }

            await DisabledCommands.create({
                guildId: message.guild.id,
                commandName: cmdName
            });

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.tick} Command **${cmdName}** has been disabled in this server.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            console.error('Disable Command Error:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setDescription(`${client.emoji.cross} An error occurred while disabling the command.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        }
    }
};
