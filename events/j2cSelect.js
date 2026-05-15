const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/guildconfig');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.customId.startsWith('j2c_select_')) return;

        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) return;

        const userVoiceChannel = interaction.member.voice.channel;
        if (!userVoiceChannel || userVoiceChannel.parentId !== config.categoryId) {
            return interaction.reply({
                content: 'You must be in a voice channel!',
                ephemeral: true
            });
        }

        const isOwner = userVoiceChannel.ownerId === interaction.user.id || interaction.member.permissions.has('Administrator');

        try {
            // Select Region
            if (interaction.customId === 'j2c_select_region') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const region = interaction.values[0];
                await userVoiceChannel.setRTCRegion(region);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Voice region changed to **${region}**!`);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                await interaction.message.delete().catch(() => {});
            }

            // Select Block - Ask for Duration
            if (interaction.customId === 'j2c_select_block') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const userId = interaction.values[0];
                const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

                const modal = new ModalBuilder()
                    .setCustomId(`j2c_modal_blockduration_${userId}`)
                    .setTitle('Block Duration');

                const secondsInput = new TextInputBuilder()
                    .setCustomId('j2c_block_seconds')
                    .setLabel('Seconds (0-59)')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(2)
                    .setRequired(false)
                    .setPlaceholder('0');

                const minutesInput = new TextInputBuilder()
                    .setCustomId('j2c_block_minutes')
                    .setLabel('Minutes (0-59)')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(2)
                    .setRequired(false)
                    .setPlaceholder('0');

                const hoursInput = new TextInputBuilder()
                    .setCustomId('j2c_block_hours')
                    .setLabel('Hours (0-23)')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(2)
                    .setRequired(false)
                    .setPlaceholder('0');

                const daysInput = new TextInputBuilder()
                    .setCustomId('j2c_block_days')
                    .setLabel('Days')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(5)
                    .setRequired(false)
                    .setPlaceholder('0');

                const lifetimeInput = new TextInputBuilder()
                    .setCustomId('j2c_block_lifetime')
                    .setLabel('Enter 0 for Lifetime (Permanent)')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(1)
                    .setRequired(true)
                    .setPlaceholder('0 = Lifetime');

                modal.addComponents(
                    new ActionRowBuilder().addComponents(secondsInput),
                    new ActionRowBuilder().addComponents(minutesInput),
                    new ActionRowBuilder().addComponents(hoursInput),
                    new ActionRowBuilder().addComponents(daysInput),
                    new ActionRowBuilder().addComponents(lifetimeInput)
                );

                await interaction.showModal(modal);
            }

            // Select Unblock
            if (interaction.customId === 'j2c_select_unblock') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const userId = interaction.values[0];
                const user = await client.users.fetch(userId).catch(() => null);

                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }

                // Remove from blocked list
                await GuildConfig.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    { $pull: { blockedUsers: { userId: userId, channelId: userVoiceChannel.id } } },
                    { new: true }
                );

                await userVoiceChannel.permissionOverwrites.delete(userId);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} **${user.tag}** has been unblocked!`);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                await interaction.message.delete().catch(() => {});
            }

            // Select Claim
            if (interaction.customId === 'j2c_select_claim') {
                if (userVoiceChannel.members.size !== 1) {
                    return interaction.reply({ content: 'Channel is not empty!', ephemeral: true });
                }

                const userId = interaction.values[0];
                const user = await client.users.fetch(userId).catch(() => null);

                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }

                await userVoiceChannel.edit({ owner: userId });
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Ownership claimed! Channel transferred to **${user.tag}**!`);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                await interaction.message.delete().catch(() => {});
            }

            // Select Transfer
            if (interaction.customId === 'j2c_select_transfer') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const userId = interaction.values[0];
                const user = await client.users.fetch(userId).catch(() => null);

                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }

                const member = userVoiceChannel.members.get(userId);
                if (!member) {
                    return interaction.reply({ content: 'User is not in the voice channel!', ephemeral: true });
                }

                await userVoiceChannel.edit({ owner: userId });
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Ownership transferred to **${user.tag}**!`);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                await interaction.message.delete().catch(() => {});
            }
        } catch (error) {
            console.error('J2C Select Error:', error);
            return interaction.reply({ content: 'An error occurred!', ephemeral: true }).catch(() => {});
        }
    });
};
