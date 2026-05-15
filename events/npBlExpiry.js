const Restriction = require('../models/restrictionModel');
const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    // Check for expired NP/BL restrictions every minute
    setInterval(async () => {
        try {
            const expired = await Restriction.find({ 
                expiresAt: { $lt: new Date() }, 
                isLifetime: false,
                $or: [{ type: 'noprefix' }, { type: 'blacklist' }]
            });

            for (const restriction of expired) {
                const dbKey = restriction.type === 'noprefix' 
                    ? `noprefix_${restriction.botId}` 
                    : `blacklist_${restriction.botId}`;

                let added = await client.db.get(dbKey) || [];
                added = added.filter(id => id !== restriction.userId);
                await client.db.set(dbKey, added);

                restriction.type === 'noprefix' ? client.util.noprefix() : client.util.blacklist();

                // Notify user
                try {
                    const user = await client.users.fetch(restriction.userId).catch(() => null);
                    const adder = restriction.addedBy ? await client.users.fetch(restriction.addedBy).catch(() => null) : null;

                    if (user) {
                        const expiryEmbed = new EmbedBuilder()
                            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            .setColor(client.color)
                            .setDescription(
                                `-# ${client.emoji.reply2} Was Added By: ${adder ? `<@${adder.id}>` : restriction.addedBy ? `<@${restriction.addedBy}>` : 'System'}\n` +
                                `-# ${client.emoji.reply2} Duration: <t:${Math.floor(restriction.expiresAt.getTime() / 1000)}:R> | <t:${Math.floor(restriction.expiresAt.getTime() / 1000)}:F>\n` +
                                `-# ${client.emoji.reply3} Reason For Expiry: Duration Ended...`
                            )
                            .setFooter({ text: `No-Prefix Removal`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                        await user.send({ embeds: [expiryEmbed] }).catch(() => {});
                    }
                } catch (error) {
                    console.error('Error notifying user of expiry:', error);
                }

                // Remove from database
                await Restriction.deleteOne({ _id: restriction._id });
            }
        } catch (error) {
            console.error('NP/BL Expiry Cleanup Error:', error);
        }
    }, 60000); // Check every minute
};
