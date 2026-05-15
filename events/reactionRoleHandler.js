const ReactionRole = require('../models/reactionrole');

module.exports = async (client) => {
    client.on('messageReactionAdd', async (reaction, user) => {
        if (user.bot) return;

        try {
            const rrConfig = await ReactionRole.findOne({
                guildId: reaction.message.guildId,
                messageId: reaction.message.id
            });

            if (!rrConfig) return;

            const reactionConfig = rrConfig.reactions.find(r => r.emoji === reaction.emoji.toString() || r.emoji === reaction.emoji.id);
            if (!reactionConfig) return;

            const member = await reaction.message.guild.members.fetch(user.id);
            const role = reaction.message.guild.roles.cache.get(reactionConfig.roleId);

            if (role) {
                await member.roles.add(role);
            }
        } catch (error) {
            console.error('Error adding reaction role:', error);
        }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
        if (user.bot) return;

        try {
            const rrConfig = await ReactionRole.findOne({
                guildId: reaction.message.guildId,
                messageId: reaction.message.id
            });

            if (!rrConfig) return;

            const reactionConfig = rrConfig.reactions.find(r => r.emoji === reaction.emoji.toString() || r.emoji === reaction.emoji.id);
            if (!reactionConfig) return;

            const member = await reaction.message.guild.members.fetch(user.id);
            const role = reaction.message.guild.roles.cache.get(reactionConfig.roleId);

            if (role) {
                await member.roles.remove(role);
            }
        } catch (error) {
            console.error('Error removing reaction role:', error);
        }
    });
};
