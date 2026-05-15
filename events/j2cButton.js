const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const GuildConfig = require('../models/guildconfig');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('j2c_')) return;

        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) {
            return interaction.reply({
                content: 'Join to Create is not setup in this server!',
                ephemeral: true
            });
        }

        const userVoiceChannel = interaction.member.voice.channel;
        if (!userVoiceChannel || userVoiceChannel.parentId !== config.categoryId) {
            return interaction.reply({
                content: 'You must be in a voice channel!',
                ephemeral: true
            });
        }

        const isOwner = userVoiceChannel.ownerId === interaction.user.id || interaction.member.permissions.has('Administrator');

        try {
            // Change Channel Name
            if (interaction.customId === 'j2c_changename') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('j2c_modal_changename')
                    .setTitle('Change Channel Name');

                const nameInput = new TextInputBuilder()
                    .setCustomId('j2c_name_input')
                    .setLabel('New Channel Name')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(100)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
                return interaction.showModal(modal);
            }

            // Toggle Private/Public - Show 2 Buttons
            if (interaction.customId === 'j2c_toggleprivacy') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const makePrivateBtn = new ButtonBuilder()
                    .setCustomId('j2c_makeprivate')
                    .setLabel('Make Private')
                    .setStyle(ButtonStyle.Danger);

                const makePublicBtn = new ButtonBuilder()
                    .setCustomId('j2c_makepublic')
                    .setLabel('Make Public')
                    .setStyle(ButtonStyle.Success);

                const row = new ActionRowBuilder().addComponents(makePrivateBtn, makePublicBtn);

                return interaction.reply({
                    content: 'Select privacy setting:',
                    components: [row],
                    ephemeral: true
                });
            }

            // Make Private
            if (interaction.customId === 'j2c_makeprivate') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                await userVoiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Channel is now **Private**!`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                await interaction.message.delete().catch(() => {});
                return;
            }

            // Make Public
            if (interaction.customId === 'j2c_makepublic') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                await userVoiceChannel.permissionOverwrites.delete(interaction.guild.id);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Channel is now **Public**!`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                await interaction.message.delete().catch(() => {});
                return;
            }

            // Set User Limit
            if (interaction.customId === 'j2c_userlimit') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('j2c_modal_userlimit')
                    .setTitle('Set User Limit');

                const limitInput = new TextInputBuilder()
                    .setCustomId('j2c_limit_input')
                    .setLabel('User Limit (0-99, 0 = Unlimited)')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(2)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(limitInput));
                return interaction.showModal(modal);
            }

            // Add Trusted User
            if (interaction.customId === 'j2c_addtrusted') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('j2c_modal_addtrusted')
                    .setTitle('Add Trusted User');

                const userInput = new TextInputBuilder()
                    .setCustomId('j2c_trusted_user_input')
                    .setLabel('User ID or Mention')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                return interaction.showModal(modal);
            }

            // Remove Trusted User
            if (interaction.customId === 'j2c_removetrusted') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('j2c_modal_removetrusted')
                    .setTitle('Remove Trusted User');

                const userInput = new TextInputBuilder()
                    .setCustomId('j2c_untrusted_user_input')
                    .setLabel('User ID or Mention')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                return interaction.showModal(modal);
            }

            // Kick User
            if (interaction.customId === 'j2c_kick') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                const modal = new ModalBuilder()
                    .setCustomId('j2c_modal_kick')
                    .setTitle('Kick User');

                const userInput = new TextInputBuilder()
                    .setCustomId('j2c_kick_user_input')
                    .setLabel('User ID or Mention')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(userInput));
                return interaction.showModal(modal);
            }

            // Change Voice Region - Show Dropdown
            if (interaction.customId === 'j2c_region') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const regions = [
                    { label: 'US West', value: 'us-west' },
                    { label: 'US Central', value: 'us-central' },
                    { label: 'US East', value: 'us-east' },
                    { label: 'EU Central', value: 'eu-central' },
                    { label: 'EU West', value: 'eu-west' },
                    { label: 'Singapore', value: 'singapore' },
                    { label: 'Hong Kong', value: 'hongkong' },
                    { label: 'Sydney', value: 'sydney' },
                    { label: 'Japan', value: 'japan' },
                    { label: 'Brazil', value: 'brazil' }
                ];

                const regionSelect = new StringSelectMenuBuilder()
                    .setCustomId('j2c_select_region')
                    .setPlaceholder('Select a region')
                    .addOptions(regions);

                const row = new ActionRowBuilder().addComponents(regionSelect);

                return interaction.reply({
                    content: 'Select a voice region:',
                    components: [row],
                    ephemeral: true
                });
            }

            // Block User - Show Dropdown
            if (interaction.customId === 'j2c_block') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const members = userVoiceChannel.members
                    .filter(m => m.id !== interaction.user.id && !m.user.bot)
                    .map(m => ({
                        label: m.user.tag,
                        value: m.id
                    }))
                    .slice(0, 25);

                if (members.length === 0) {
                    return interaction.reply({ content: 'No members to block!', ephemeral: true });
                }

                const userSelect = new StringSelectMenuBuilder()
                    .setCustomId('j2c_select_block')
                    .setPlaceholder('Select user to block')
                    .addOptions(members);

                const row = new ActionRowBuilder().addComponents(userSelect);

                return interaction.reply({
                    content: 'Select a user to block:',
                    components: [row],
                    ephemeral: true
                });
            }

            // Unblock User - Show Dropdown
            if (interaction.customId === 'j2c_unblock') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const members = userVoiceChannel.members
                    .filter(m => m.id !== interaction.user.id && !m.user.bot)
                    .map(m => ({
                        label: m.user.tag,
                        value: m.id
                    }))
                    .slice(0, 25);

                if (members.length === 0) {
                    return interaction.reply({ content: 'No members to unblock!', ephemeral: true });
                }

                const userSelect = new StringSelectMenuBuilder()
                    .setCustomId('j2c_select_unblock')
                    .setPlaceholder('Select user to unblock')
                    .addOptions(members);

                const row = new ActionRowBuilder().addComponents(userSelect);

                return interaction.reply({
                    content: 'Select a user to unblock:',
                    components: [row],
                    ephemeral: true
                });
            }

            // Claim Abandoned Channel - Show Dropdown or Direct Action
            if (interaction.customId === 'j2c_claim') {
                if (userVoiceChannel.members.size !== 1) {
                    return interaction.reply({ content: 'Channel is not empty!', ephemeral: true });
                }

                const members = interaction.guild.members.cache
                    .filter(m => !m.user.bot)
                    .map(m => ({
                        label: m.user.tag,
                        value: m.id
                    }))
                    .slice(0, 25);

                const claimSelect = new StringSelectMenuBuilder()
                    .setCustomId('j2c_select_claim')
                    .setPlaceholder('Select who to transfer to')
                    .addOptions(members);

                const row = new ActionRowBuilder().addComponents(claimSelect);

                return interaction.reply({
                    content: 'Select who to transfer ownership to:',
                    components: [row],
                    ephemeral: true
                });
            }

            // Transfer Ownership - Show Dropdown
            if (interaction.customId === 'j2c_transfer') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }

                const members = userVoiceChannel.members
                    .filter(m => m.id !== interaction.user.id && !m.user.bot)
                    .map(m => ({
                        label: m.user.tag,
                        value: m.id
                    }))
                    .slice(0, 25);

                if (members.length === 0) {
                    return interaction.reply({ content: 'No members in the channel!', ephemeral: true });
                }

                const userSelect = new StringSelectMenuBuilder()
                    .setCustomId('j2c_select_transfer')
                    .setPlaceholder('Select user to transfer to')
                    .addOptions(members);

                const row = new ActionRowBuilder().addComponents(userSelect);

                return interaction.reply({
                    content: 'Select a user to transfer ownership to:',
                    components: [row],
                    ephemeral: true
                });
            }

            // Delete Channel
            if (interaction.customId === 'j2c_delete') {
                if (!isOwner) {
                    return interaction.reply({ content: 'Only the channel owner can use this!', ephemeral: true });
                }
                await interaction.reply({ content: 'Deleting channel...', ephemeral: true });
                await userVoiceChannel.delete();
            }
        } catch (error) {
            console.error('J2C Button Error:', error);
            return interaction.reply({ content: 'An error occurred!', ephemeral: true }).catch(() => {});
        }
    });
};
