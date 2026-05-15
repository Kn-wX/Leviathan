const GuildConfig = require('../models/guildconfig');

module.exports = (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        // Only process when member leaves
        if (!oldState.channel) return;

        const channel = oldState.channel;
        const config = await GuildConfig.findOne({ guildId: channel.guild.id });

        if (!config) return;

        // Check if channel is in J2C category
        if (channel.parentId !== config.categoryId) return;

        // Check if it's the hub channel
        if (channel.id === config.hubChannelId) return;

        // Wait a bit to ensure member is fully disconnected
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if channel is empty
        if (channel.members.size === 0) {
            try {
                // Verify channel still exists
                const freshChannel = await channel.guild.channels.fetch(channel.id).catch(() => null);
                if (!freshChannel) {
                    return; // Channel was deleted, nothing to do
                }

                const abandonedCategory = channel.guild.channels.cache.get(config.abandonedCategoryId);

                // If abandoned category doesn't exist, create it
                let targetCategory = abandonedCategory;
                if (!targetCategory) {
                    const { ChannelType } = require('discord.js');
                    targetCategory = await channel.guild.channels.create({
                        name: "Abandoned Channels",
                        type: ChannelType.GuildCategory
                    });

                    // Update config with new abandoned category ID
                    await GuildConfig.findOneAndUpdate(
                        { guildId: channel.guild.id },
                        { abandonedCategoryId: targetCategory.id },
                        { new: true }
                    );
                }

                // Move channel to abandoned category
                await freshChannel.setParent(targetCategory.id);

                // Lock the channel (deny everyone from connecting)
                await freshChannel.permissionOverwrites.edit(channel.guild.id, { Connect: false });

                // Remove owner permission if exists
                if (freshChannel.ownerId) {
                    await freshChannel.permissionOverwrites.delete(freshChannel.ownerId).catch(() => {});
                }
            } catch (error) {
                if (error.code !== 10003) {
                    console.error('Error moving channel to abandoned:', error);
                }
            }
        }
    });
};
