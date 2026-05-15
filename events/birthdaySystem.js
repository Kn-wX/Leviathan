const { EmbedBuilder, ChannelType } = require('discord.js');
const Birthday = require('../models/birthday');

module.exports = async (client) => {
    setInterval(async () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        const birthdays = await Birthday.find({ month, day, notified: false });

        for (const birthday of birthdays) {
            try {
                const guild = client.guilds.cache.get(birthday.guildId);
                if (!guild) continue;

                let channel = birthday.channelId ? guild.channels.cache.get(birthday.channelId) : null;

                if (!channel) {
                    const channels = guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText);
                    channel = channels.first();
                }

                if (!channel) continue;

                const user = await client.users.fetch(birthday.userId).catch(() => null);
                if (!user) continue;

                const embed = new EmbedBuilder()
                    .setColor('Gold')
                    .setTitle('🎂 Birthday Alert!')
                    .setDescription(`Today is ${user.tag}'s birthday!${birthday.year ? ` They're turning ${now.getFullYear() - birthday.year}!` : ''}`)
                    .setThumbnail(user.displayAvatarURL())
                    .setTimestamp();

                await channel.send({ embeds: [embed], content: `Happy Birthday <@${birthday.userId}>! 🎉` });

                birthday.notified = true;
                await birthday.save();
            } catch (error) {
                console.error('Error in birthday system:', error);
            }
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        await Birthday.updateMany(
            { month: yesterday.getMonth() + 1, day: yesterday.getDate() },
            { notified: false }
        );
    }, 60 * 60 * 1000);
};
