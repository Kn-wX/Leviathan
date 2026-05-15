const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/guildconfig');

module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isModalSubmit()) return;

        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) return;

        const modalId = interaction.customId;
        const userVoiceChannel = interaction.member.voice.channel;

        if (!userVoiceChannel || userVoiceChannel.parentId !== config.categoryId) {
            return interaction.reply({
                content: 'You must be in a voice channel!',
                ephemeral: true
            });
        }

        try {
            // Change Channel Name
            if (modalId === 'j2c_modal_changename') {
                const newName = interaction.fields.getTextInputValue('j2c_name_input');
                await userVoiceChannel.setName(newName);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Channel name changed to **${newName}**!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Set User Limit
            if (modalId === 'j2c_modal_userlimit') {
                const limit = parseInt(interaction.fields.getTextInputValue('j2c_limit_input'));
                if (isNaN(limit) || limit < 0 || limit > 99) {
                    return interaction.reply({ content: 'Please enter a valid number between 0 and 99!', ephemeral: true });
                }
                await userVoiceChannel.setUserLimit(limit);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} User limit set to **${limit === 0 ? 'Unlimited' : limit}**!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Add Trusted User
            if (modalId === 'j2c_modal_addtrusted') {
                const userInput = interaction.fields.getTextInputValue('j2c_trusted_user_input');
                const user = await client.users.fetch(userInput.replace(/[<@!>]/g, '')).catch(() => null);
                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }
                await userVoiceChannel.permissionOverwrites.edit(user.id, { Connect: true, Speak: true });
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} **${user.tag}** has been added to trusted users!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Remove Trusted User
            if (modalId === 'j2c_modal_removetrusted') {
                const userInput = interaction.fields.getTextInputValue('j2c_untrusted_user_input');
                const user = await client.users.fetch(userInput.replace(/[<@!>]/g, '')).catch(() => null);
                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }
                await userVoiceChannel.permissionOverwrites.delete(user.id);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} **${user.tag}** has been removed from trusted users!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Kick User
            if (modalId === 'j2c_modal_kick') {
                const userInput = interaction.fields.getTextInputValue('j2c_kick_user_input');
                const user = await client.users.fetch(userInput.replace(/[<@!>]/g, '')).catch(() => null);
                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }
                const member = userVoiceChannel.members.get(user.id);
                if (!member) {
                    return interaction.reply({ content: 'User is not in the voice channel!', ephemeral: true });
                }
                await member.voice.disconnect();
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} **${user.tag}** has been kicked!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Change Voice Region
            if (modalId === 'j2c_modal_region') {
                const region = interaction.fields.getTextInputValue('j2c_region_input');
                await userVoiceChannel.setRTCRegion(region);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Voice region changed to **${region}**!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Block User
            if (modalId === 'j2c_modal_block') {
                const userInput = interaction.fields.getTextInputValue('j2c_block_user_input');
                const user = await client.users.fetch(userInput.replace(/[<@!>]/g, '')).catch(() => null);
                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }
                await userVoiceChannel.permissionOverwrites.edit(user.id, { Connect: false });
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} **${user.tag}** has been blocked!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Unblock User
            if (modalId === 'j2c_modal_unblock') {
                const userInput = interaction.fields.getTextInputValue('j2c_unblock_user_input');
                const user = await client.users.fetch(userInput.replace(/[<@!>]/g, '')).catch(() => null);
                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }
                await userVoiceChannel.permissionOverwrites.delete(user.id);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} **${user.tag}** has been unblocked!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Transfer Ownership
            if (modalId === 'j2c_modal_transfer') {
                const userInput = interaction.fields.getTextInputValue('j2c_transfer_user_input');
                const user = await client.users.fetch(userInput.replace(/[<@!>]/g, '')).catch(() => null);
                if (!user) {
                    return interaction.reply({ content: 'User not found!', ephemeral: true });
                }
                const member = userVoiceChannel.members.get(user.id);
                if (!member) {
                    return interaction.reply({ content: 'User is not in the voice channel!', ephemeral: true });
                }
                await userVoiceChannel.edit({ owner: user.id });
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} Ownership transferred to **${user.tag}**!`);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {
            return interaction.reply({ content: 'An error occurred!', ephemeral: true });
        }
    });
};
