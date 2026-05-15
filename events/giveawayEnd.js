const Giveaway = require('../models/giveaway');
const { EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = async (client) => {
    setInterval(async () => {
        const giveaways = await Giveaway.find({ ended: false });

        for (const giveaway of giveaways) {
            if (Date.now() >= giveaway.endTime.getTime()) {
                const channel = client.channels.cache.get(giveaway.channelId);
                if (!channel) continue;

                const winners = [];
                for (let i = 0; i < Math.min(giveaway.winners, giveaway.participants.length); i++) {
                    const randomWinner = giveaway.participants[Math.floor(Math.random() * giveaway.participants.length)];
                    if (randomWinner && !winners.includes(randomWinner)) winners.push(randomWinner);
                }

                giveaway.ended = true;
                giveaway.selectedWinners = winners;
                await giveaway.save();

                const hostUser = await client.users.fetch(giveaway.createdBy).catch(() => null);
                const winnersText = winners.length > 0 ? winners.map(w => `<@${w}>`).join(', ') : 'No winners (not enough participants)';
                
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle(`${client.emoji?.giveaway || '🎁'} Giveaway Ended: ${giveaway.name}`)
                    .setDescription(`**Prize:** ${giveaway.name}\n**Host:** ${hostUser?.tag || 'Unknown User'}\n**Winners:** ${winnersText}`)
                    .addFields({ name: 'Total Participants:', value: `${giveaway.participants.length}` })
                    .setTimestamp();

                const message = await channel.send({ 
                    content: winners.length > 0 ? winners.map(w => `<@${w}>`).join(' ') : '',
                    embeds: [embed] 
                });
            }
        }
    }, 5000);
};
