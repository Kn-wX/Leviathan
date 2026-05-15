const { EmbedBuilder } = require('discord.js');
const ReactionRole = require('../../models/reactionrole');

module.exports = {
    name: 'reactionrole',
    usage: 'Manage reactionrole settings',
    aliases: ['rr'],
    category: 'utility',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Roles\` permission!`)]
            });
        }

        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'add') {
            if (!args[1] || !args[2] || !args[3]) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Usage: \`reactionrole add <messageId> <emoji> <role>\``)]
                });
            }

            const messageId = args[1];
            const emoji = args[2];
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);

            if (!role) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Role not found!`)]
                });
            }

            let rrConfig = await ReactionRole.findOne({ messageId, guildId: message.guildId });
            if (!rrConfig) {
                rrConfig = new ReactionRole({
                    guildId: message.guildId,
                    messageId,
                    channelId: message.channelId,
                    reactions: [{ emoji, roleId: role.id }]
                });
            } else {
                rrConfig.reactions.push({ emoji, roleId: role.id });
            }

            await rrConfig.save();
            message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | Reaction role added!`)]
            });
        }
    }
};
