const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../../models/giveaway');

module.exports = {
    name: 'greroll',
    usage: 'Manage greroll settings',
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
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Usage: \`greroll <message_id>\``)]
            });
        }

        const giveaway = await Giveaway.findOne({ messageId: args[0], guildId: message.guildId });

        if (!giveaway) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Giveaway not found!`)]
            });
        }

        const newWinners = [];
        const availableParticipants = giveaway.participants.filter(p => !giveaway.selectedWinners.includes(p));

        for (let i = 0; i < Math.min(giveaway.winners, availableParticipants.length); i++) {
            const randomWinner = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
            if (randomWinner) newWinners.push(randomWinner);
        }

        giveaway.selectedWinners = newWinners;
        await giveaway.save();

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${client.emoji.giveaway} Giveaway Rerolled`)
            .setDescription(`**Prize:** ${giveaway.name}\n**New Winners:** ${newWinners.map(w => `<@${w}>`).join(', ')}`)
            .setFooter({ text: `Rerolled by ${message.author.tag}` });

        message.reply({ embeds: [embed] });
    }
};
