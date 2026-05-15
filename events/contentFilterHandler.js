const ContentFilter = require('../models/contentfilter');

const INVITE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:discord(?:gg)?|discordapp)\.com\/invite\/([^\s]+)/gi;
const URL_REGEX = /https?:\/\/[^\s]+/gi;

module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return;

        const filter = await ContentFilter.findOne({ guildId: message.guildId });
        if (!filter) return;

        let shouldDelete = false;
        let reason = '';

        if (filter.filters.urls && URL_REGEX.test(message.content)) {
            shouldDelete = true;
            reason = 'Contains URLs';
        }

        if (filter.filters.invites && INVITE_REGEX.test(message.content)) {
            shouldDelete = true;
            reason = 'Contains Discord invite';
        }

        if (filter.filters.customWords) {
            for (const word of filter.filters.customWords) {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                if (regex.test(message.content)) {
                    shouldDelete = true;
                    reason = `Contains filtered word: ${word}`;
                    break;
                }
            }
        }

        if (shouldDelete && filter.action === 'delete') {
            try {
                await message.delete();
                const reply = await message.channel.send(`${message.author}, your message was deleted. Reason: ${reason}`);
                setTimeout(() => reply.delete().catch(() => {}), 5000);
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    });
};
