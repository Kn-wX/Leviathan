const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../../models/giveaway');

module.exports = {
    name: 'giveawaylist',
    usage: 'Manage giveawaylist settings',
    aliases: ['gwy'],
    category: 'giveaway',
    run: async (client, message, args) => {
        const giveaways = await Giveaway.find({ guildId: message.guildId, ended: false });

        if (giveaways.length === 0) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setTitle(`${client.emoji.giveaway} Active Giveaways`).setDescription('There are no active giveaways in this server')]
            });
        }

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${client.emoji.giveaway} Active Giveaways (${giveaways.length})`)
            .setDescription(giveaways.map((g, i) => 
                `**${i + 1}. ${g.name}**\n• Participants: ${g.participants.length}\n• Winners: ${g.winners}\n• ID: ${g.messageId}`
            ).join('\n\n'));

        message.reply({ embeds: [embed] });
    }
};
