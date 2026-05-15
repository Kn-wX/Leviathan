const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../../models/giveaway');

module.exports = {
    name: 'gend',
    usage: 'Manage gend settings',
    aliases: ['gwy'],
    category: 'giveaway',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Messages\` permission!`)]
            });
        }

        if (!args[0]) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Usage: \`gend <message_id>\``)]
            });
        }

        const giveaway = await Giveaway.findOne({ messageId: args[0], guildId: message.guildId });

        if (!giveaway) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Giveaway not found!`)]
            });
        }

        const winners = [];
        for (let i = 0; i < Math.min(giveaway.winners, giveaway.participants.length); i++) {
            const randomWinner = giveaway.participants[Math.floor(Math.random() * giveaway.participants.length)];
            if (randomWinner && !winners.includes(randomWinner)) winners.push(randomWinner);
        }

        giveaway.ended = true;
        giveaway.selectedWinners = winners;
        await giveaway.save();

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${client.emoji.giveaway} Giveaway Ended`)
            .setDescription(`**Prize:** ${giveaway.name}\n**Total Participants:** ${giveaway.participants.length}\n**Winners:** ${winners.length > 0 ? winners.map(w => `<@${w}>`).join(', ') : 'No winners (not enough participants)'}`)
            .setFooter({ text: `Ended by ${message.author.tag}` });

        message.reply({ embeds: [embed] });
    }
};
