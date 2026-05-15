const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType } = require('discord.js');
const mongoose = require('mongoose');
const GuildConfig = require('../../models/guildconfig');

module.exports = {
    name: 'jointocreate',
    usage: 'Manage jointocreate settings',
    aliases: ['jtc', 'j2c'],
    category: 'jointocreate',
    subcommand: ['setup', 'view', 'reset'],
    premium: false,
    run: async (client, message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You must have \`Administrator\` permissions to use this command.`)
                ]
            });
        }

        if (!message.guild.members.me.permissions.has('Administrator')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | I don't have \`Administrator\` permissions to execute this command.`)
                ]
            });
        }

        if (!client.util.hasHigher(message.member)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You must have a higher role than me to use this command.`)
                ]
            });
        }

        const option = args[0];

        const infoEmbed = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle('__**Join To Create**__')
            .addFields([
                { name: '**Join To Create**', value: 'Configures the voice channel generation system.' },
                { name: '__**jointocreate setup**__', value: 'Sets up the voice channel generator in the server.' },
                { name: '__**jointocreate reset**__', value: 'Disables the voice channel generator in the server.' },
                { name: '__**jointocreate view**__', value: 'Displays the current voice channel generator configuration.' }
            ]);

        if (!option) {
            return message.channel.send({ embeds: [infoEmbed] });
        }

        if (option.toLowerCase() === 'setup') {
            const existingConfig = await GuildConfig.findOne({ guildId: message.guild.id });
            if (existingConfig) {
                const setupAlreadyCompleteEmbed = client.util.embed()
                    .setColor(client.color)
                    .setTitle('Setup Already Completed')
                    .setDescription('The setup process has already been completed for this server.');

                return message.reply({ embeds: [setupAlreadyCompleteEmbed] });
            }

            const category = await message.guild.channels.create({
                name: "Temporary Voice Channels",
                type: ChannelType.GuildCategory
            });

            const hubChannel = await message.guild.channels.create({
                name: "・Join to Create",
                type: ChannelType.GuildVoice,
                parent: category.id
            });

            const interfaceChannel = await message.guild.channels.create({
                name: "・interface",
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ['SendMessages', 'CreatePublicThreads', 'CreatePrivateThreads']
                    }
                ]
            });

            const abandonedCategory = await message.guild.channels.create({
                name: "Abandoned Channels",
                type: ChannelType.GuildCategory
            });

            await GuildConfig.findOneAndUpdate(
                { guildId: message.guild.id },
                { guildId: message.guild.id, hubChannelId: hubChannel.id, categoryId: category.id, interfaceChannelId: interfaceChannel.id, abandonedCategoryId: abandonedCategory.id },
                { upsert: true }
            );

            // Create buttons with emojis
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('j2c_changename')
                    .setEmoji(client.emoji.j2cName)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_toggleprivacy')
                    .setEmoji(client.emoji.j2cPrivacy)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_userlimit')
                    .setEmoji(client.emoji.j2cUserLimit)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_addtrusted')
                    .setEmoji(client.emoji.j2cTrusted)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_removetrusted')
                    .setEmoji(client.emoji.j2cUnTrusted)
                    .setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('j2c_kick')
                    .setEmoji(client.emoji.j2cKick)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_region')
                    .setEmoji(client.emoji.j2cRegion)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_block')
                    .setEmoji(client.emoji.j2cBlock)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_unblock')
                    .setEmoji(client.emoji.j2cUnBlock)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_claim')
                    .setEmoji(client.emoji.j2cClaim)
                    .setStyle(ButtonStyle.Secondary)
            );

            const row3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('j2c_transfer')
                    .setEmoji(client.emoji.j2cTransfer)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('j2c_delete')
                    .setEmoji(client.emoji.j2cDelete)
                    .setStyle(ButtonStyle.Danger)
            );

            // Create control embed with image
            const controlEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setImage('attachment://j2c_control.png')
                .setDescription(
                    `${client.emoji.j2cName} - Change Channel Name\n` +
                    `${client.emoji.j2cPrivacy} - Toggle Private/Public\n` +
                    `${client.emoji.j2cUserLimit} - Set User Limit\n` +
                    `${client.emoji.j2cTrusted} - Add Trusted User\n` +
                    `${client.emoji.j2cUnTrusted} - Remove Trusted User\n` +
                    `${client.emoji.j2cKick} - Kick a user\n` +
                    `${client.emoji.j2cRegion} - Change Voice Region\n` +
                    `${client.emoji.j2cBlock} - Block a user\n` +
                    `${client.emoji.j2cUnBlock} - Unblock a user\n` +
                    `${client.emoji.j2cClaim} - Claim Abandoned Channel\n` +
                    `${client.emoji.j2cTransfer} - Transfer Ownership\n` +
                    `${client.emoji.j2cDelete} - Delete The Channel`
                );

            await interfaceChannel.send({
                embeds: [controlEmbed],
                components: [row1, row2, row3],
                files: ['./images/j2c_control.png']
            });

            const setupCompleteEmbed = client.util.embed()
                .setColor(client.color)
                .setTitle('Setup Complete')
                .setDescription(`The setup is complete. Created category: **${category.name}**, hub channel: **${hubChannel.name}**, and interface channel: **${interfaceChannel.name}**.`);

            return message.reply({ embeds: [setupCompleteEmbed] });
        }

        if (option.toLowerCase() === 'reset') {
            const config = await GuildConfig.findOne({ guildId: message.guild.id });
            if (!config) {
                const noConfigEmbed = client.util.embed()
                    .setColor(client.color)
                    .setTitle('No Configuration Found')
                    .setDescription('No configuration was found for this server.');

                return message.reply({ embeds: [noConfigEmbed] });
            }

            try {
                const category = message.guild.channels.cache.get(config.categoryId) ? message.guild.channels.cache.get(config.categoryId) : await message.guild.channels.fetch(config.categoryId);
                if (category) await category.delete();

                const hubChannel = message.guild.channels.cache.get(config.hubChannelId);
                if (hubChannel) await hubChannel.delete();

                const interfaceChannel = message.guild.channels.cache.get(config.interfaceChannelId);
                if (interfaceChannel) await interfaceChannel.delete();

                await GuildConfig.deleteOne({ guildId: message.guild.id });

                const resetCompleteEmbed = client.util.embed()
                    .setColor(client.color)
                    .setTitle('Reset Complete')
                    .setDescription('The configuration has been reset and the channels have been deleted.');

                return message.reply({ embeds: [resetCompleteEmbed] });
            } catch (error) {
                const errorEmbed = client.util.embed()
                    .setColor(client.color)
                    .setTitle('Error')
                    .setDescription('An error occurred while resetting the configuration.');

                return message.reply({ embeds: [errorEmbed] });
            }
        }

        if (option.toLowerCase() === 'view') {
            const config = await GuildConfig.findOne({ guildId: message.guild.id });
            if (!config) {
                const noConfigEmbed = client.util.embed()
                    .setColor(client.color)
                    .setTitle('No Configuration Found')
                    .setDescription('No configuration was found for this server.');

                return message.reply({ embeds: [noConfigEmbed] });
            }

            const viewConfigEmbed = client.util.embed()
                .setColor(client.color)
                .setTitle('Current Configuration')
                .setDescription(`Category ID: <#${config.categoryId}> (${config.categoryId})\nHub Channel ID: <#${config.hubChannelId}> (${config.hubChannelId})\nInterface Channel ID: <#${config.interfaceChannelId}> (${config.interfaceChannelId})`);

            return message.reply({ embeds: [viewConfigEmbed] });
        }
    }
};
