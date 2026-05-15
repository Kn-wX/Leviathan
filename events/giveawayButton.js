const Giveaway = require('../models/giveaway');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('gwy_enter_')) return;

        const giveaway = await Giveaway.findOne({ messageId: interaction.message.id });
        if (!giveaway) return;

        if (giveaway.bannedUsers.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You are banned from entering giveaways!', ephemeral: true });
        }

        const hasBannedRole = interaction.member.roles.cache.some(role => giveaway.bannedRoles.includes(role.id));
        if (hasBannedRole) {
            return interaction.reply({ content: 'Your role is banned from entering giveaways!', ephemeral: true });
        }

        if (giveaway.participants.includes(interaction.user.id)) {
            giveaway.participants = giveaway.participants.filter(p => p !== interaction.user.id);
            await giveaway.save();
            return interaction.reply({ content: ' You have been removed from the giveaway!', ephemeral: true });
        }

        giveaway.participants.push(interaction.user.id);
        await giveaway.save();

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${client.emoji.giveaway} ${giveaway.name}`)
            .setDescription(`Click the button below to enter!\n\n**Prize:** ${giveaway.name}\n**Winners:** ${giveaway.winners}\n**Participants:** ${giveaway.participants.length}`)
            .setFooter({ text: `Ends at`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp(giveaway.endTime);

        await interaction.message.edit({ embeds: [embed] });
        interaction.reply({ content: ' You have entered the giveaway!', ephemeral: true });
    });
};
