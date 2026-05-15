const { EmbedBuilder } = require('discord.js');
const Birthday = require('../../models/birthday');

module.exports = {
    name: 'birthday',
    usage: 'Manage birthday settings',
    category: 'utility',
    run: async (client, message, args) => {
        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'set') {
            if (!args[1] || !args[2]) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Usage: \`birthday set <month> <day>\` (e.g., birthday set 3 15)`)]
                });
            }

            const month = parseInt(args[1]);
            const day = parseInt(args[2]);
            const year = args[3] ? parseInt(args[3]) : null;

            if (month < 1 || month > 12 || day < 1 || day > 31) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Invalid date!`)]
                });
            }

            let birthday = await Birthday.findOne({ guildId: message.guildId, userId: message.author.id });
            if (!birthday) {
                birthday = new Birthday({
                    guildId: message.guildId,
                    userId: message.author.id,
                    month,
                    day,
                    year
                });
            } else {
                birthday.month = month;
                birthday.day = day;
                birthday.year = year;
            }

            await birthday.save();
            message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | Your birthday has been set to ${month}/${day}${year ? `/${year}` : ''}!`)]
            });
        }
    }
};
