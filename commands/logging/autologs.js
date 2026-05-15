const { EmbedBuilder, ChannelType } = require('discord.js');
const LoggingConfig = require('../../models/loggingconfig');

module.exports = {
    name: 'autologs',
    usage: 'Manage autologs settings',
    category: 'logging',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageChannels')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Channels\` permission!`)]
            });
        }

        const existingConfig = await LoggingConfig.findOne({ guildId: message.guildId });
        if (existingConfig && existingConfig.categoryId) {
            const existingCategory = message.guild.channels.cache.get(existingConfig.categoryId);
            if (existingCategory) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Logging is already setup! Use \`logreset\` to reset it.`)]
                });
            }
        }

        try {
            const category = await message.guild.channels.create({
                name: 'Leviathan Logs',
                type: ChannelType.GuildCategory
            });

            const logChannelNames = ['channellog', 'memberlog', 'messagelog', 'modlog', 'rolelog', 'vclog'];
            const channels = {};
            const webhooks = {};

            for (const channelName of logChannelNames) {
                const channel = await message.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [{ id: message.guild.id, deny: ['SendMessages'] }]
                });
                channels[channelName] = channel.id;

                const webhook = await channel.createWebhook({
                    name: client.user.username,
                    avatar: client.user.displayAvatarURL()
                });
                webhooks[channelName] = webhook.url;
            }

            let loggingConfig = await LoggingConfig.findOne({ guildId: message.guildId });
            if (!loggingConfig) {
                loggingConfig = new LoggingConfig({
                    guildId: message.guildId,
                    categoryId: category.id,
                    channels,
                    webhooks,
                    enabledLogs: {
                        channellog: true,
                        memberlog: true,
                        messagelog: true,
                        modlog: true,
                        rolelog: true,
                        vclog: true
                    }
                });
            } else {
                loggingConfig.categoryId = category.id;
                loggingConfig.channels = channels;
                loggingConfig.webhooks = webhooks;
                Object.keys(loggingConfig.enabledLogs).forEach(key => loggingConfig.enabledLogs[key] = true);
            }
            await loggingConfig.save();

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(`${client.emoji.leviathanlog} Logging System Activated`)
                .setDescription(`${client.emoji.tick} | Successfully created Leviathan Logs category with all logging channels and webhooks!`)
                .addFields({ name: 'Channels Created:', value: logChannelNames.map(ch => `\`${ch}\``).join(', ') });

            return message.reply({ embeds: [embed] });
        } catch (error) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Error: ${error.message}`)]
            });
        }
    }
};
