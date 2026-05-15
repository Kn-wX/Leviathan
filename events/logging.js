const { EmbedBuilder, WebhookClient } = require('discord.js');
const LoggingConfig = require('../models/loggingconfig');

module.exports = async (client) => {
    // Logging events
    client.on('guildMemberAdd', async (member) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: member.guild.id });
        if (!loggingConfig?.enabledLogs.memberlog || !loggingConfig?.webhooks.memberlog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.memberlog });
        if (!webhook) return;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Member Joined')
            .setDescription(`${member.user.tag} (${member.id})`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Member Leave
    client.on('guildMemberRemove', async (member) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: member.guild.id });
        if (!loggingConfig?.enabledLogs.memberlog || !loggingConfig?.webhooks.memberlog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.memberlog });
        if (!webhook) return;

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Member Left')
            .setDescription(`${member.user.tag} (${member.id})`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Message Delete
    client.on('messageDelete', async (message) => {
        if (!message.author || message.author.bot) return;
        
        try {
            const snipeData = {
                guildId: message.guild?.id,
                channelId: message.channelId,
                userId: message.author.id,
                userName: message.author.username,
                displayName: message.member?.displayName || message.author.username,
                userTag: message.author.tag,
                pfp: message.author.displayAvatarURL({ extension: 'png', size: 256 }),
                content: message.content || 'No content',
                timestamp: message.createdTimestamp,
                imageUrl: message.attachments.size > 0 ? message.attachments.first().url : null,
                hasEmoji: /\p{Emoji}/u.test(message.content || ''),
                isGif: message.attachments.size > 0 && message.attachments.first().url.includes('.gif')
            };

            const insert = client.snipe.prepare(
                `INSERT OR REPLACE INTO snipes (guildId, channelId, userId, userName, displayName, userTag, pfp, content, timestamp, imageUrl, hasEmoji, isGif) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );

            insert.run(
                snipeData.guildId,
                snipeData.channelId,
                snipeData.userId,
                snipeData.userName,
                snipeData.displayName,
                snipeData.userTag,
                snipeData.pfp,
                snipeData.content,
                snipeData.timestamp,
                snipeData.imageUrl,
                snipeData.hasEmoji ? 1 : 0,
                snipeData.isGif ? 1 : 0
            );
        } catch (err) {
            console.error('Error capturing snipe:', err);
        }

        const loggingConfig = await LoggingConfig.findOne({ guildId: message.guild.id });
        if (!loggingConfig?.enabledLogs.messagelog || !loggingConfig?.webhooks.messagelog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.messagelog });
        if (!webhook) return;

        const contentSnippet = message.content ? (message.content.length > 1024 ? message.content.substring(0, 1021) + '...' : message.content) : 'No text content';

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Message Deleted')
            .setDescription(`**Author:** ${message.author?.tag} (${message.author?.id})\n**Channel:** <#${message.channelId}>`)
            .addFields({ name: 'Message Content:', value: contentSnippet })
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Message Update
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (oldMessage.author?.bot || oldMessage.content === newMessage.content) return;
        
        const loggingConfig = await LoggingConfig.findOne({ guildId: oldMessage.guild.id });
        if (!loggingConfig?.enabledLogs.messagelog || !loggingConfig?.webhooks.messagelog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.messagelog });
        if (!webhook) return;

        const oldContentSnippet = oldMessage.content ? (oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1021) + '...' : oldMessage.content) : 'No content';
        const newContentSnippet = newMessage.content ? (newMessage.content.length > 1024 ? newMessage.content.substring(0, 1021) + '...' : newMessage.content) : 'No content';

        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('Message Edited')
            .setDescription(`**Author:** ${oldMessage.author?.tag} (${oldMessage.author?.id})\n**Channel:** <#${oldMessage.channelId}>`)
            .addFields(
                { name: 'Previous Message:', value: oldContentSnippet, inline: false },
                { name: 'Updated Message:', value: newContentSnippet, inline: false }
            )
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Channel Create
    client.on('channelCreate', async (channel) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: channel.guild.id });
        if (!loggingConfig?.enabledLogs.channellog || !loggingConfig?.webhooks.channellog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.channellog });
        if (!webhook) return;

        const auditLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: 10 });
        const entry = auditLogs.entries.first();
        const executor = entry?.executor?.tag || 'Unknown User';

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Channel Created')
            .setDescription(`${channel.name} (${channel.id})`)
            .addFields({ name: 'Created By:', value: executor })
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Channel Delete
    client.on('channelDelete', async (channel) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: channel.guild.id });
        if (!loggingConfig?.enabledLogs.channellog || !loggingConfig?.webhooks.channellog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.channellog });
        if (!webhook) return;

        const auditLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: 11 });
        const entry = auditLogs.entries.first();
        const executor = entry?.executor?.tag || 'Unknown User';

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Channel Deleted')
            .setDescription(`${channel.name} (${channel.id})`)
            .addFields({ name: 'Deleted By:', value: executor })
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Role Create
    client.on('roleCreate', async (role) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: role.guild.id });
        if (!loggingConfig?.enabledLogs.rolelog || !loggingConfig?.webhooks.rolelog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.rolelog });
        if (!webhook) return;

        const auditLogs = await role.guild.fetchAuditLogs({ limit: 1, type: 30 });
        const entry = auditLogs.entries.first();
        const executor = entry?.executor?.tag || 'Unknown User';

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Role Created')
            .setDescription(`${role.name} (${role.id})`)
            .addFields({ name: 'Created By:', value: executor })
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Role Delete
    client.on('roleDelete', async (role) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: role.guild.id });
        if (!loggingConfig?.enabledLogs.rolelog || !loggingConfig?.webhooks.rolelog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.rolelog });
        if (!webhook) return;

        const auditLogs = await role.guild.fetchAuditLogs({ limit: 1, type: 31 });
        const entry = auditLogs.entries.first();
        const executor = entry?.executor?.tag || 'Unknown User';

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Role Deleted')
            .setDescription(`${role.name} (${role.id})`)
            .addFields({ name: 'Deleted By:', value: executor })
            .setTimestamp();

        await webhook.send({ embeds: [embed] });
    });

    // Voice Channel Join/Leave
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const loggingConfig = await LoggingConfig.findOne({ guildId: newState.guild.id });
        if (!loggingConfig?.enabledLogs.vclog || !loggingConfig?.webhooks.vclog) return;

        const webhook = new WebhookClient({ url: loggingConfig.webhooks.vclog });
        if (!webhook) return;

        if (!oldState.channel && newState.channel) {
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Voice Channel Joined')
                .setDescription(`${newState.member.user.tag} (${newState.member.id}) joined ${newState.channel.name}`)
                .setTimestamp();
            await webhook.send({ embeds: [embed] });
        }

        if (oldState.channel && !newState.channel) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Voice Channel Left')
                .setDescription(`${oldState.member.user.tag} (${oldState.member.id}) left ${oldState.channel.name}`)
                .setTimestamp();
            await webhook.send({ embeds: [embed] });
        }
    });
};