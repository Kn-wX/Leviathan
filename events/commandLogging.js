const { EmbedBuilder } = require('discord.js');
const SpamBlacklist = require('../models/spamblacklist');

const COMMAND_LOG_ID = '1443946784354472049';
const NO_PREFIX_LOG_ID = '1443946858522218497';
const BLACKLIST_LOG_ID = '1443946883021148361';
const PING_LOG_ID = '1443946969037930617';

const userCooldowns = new Map();
const SPAM_THRESHOLD = 5;
const SPAM_TIME_WINDOW = 5000;

module.exports = async (client) => {
    const logCommandUsage = async (message, command) => {
        try {
            const channel = client.channels.cache.get(COMMAND_LOG_ID);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Command Executed')
                .setDescription(`**User:** ${message.author.tag} (${message.author.id})\n**Guild:** ${message.guild?.name || 'DM'}\n**Command:** \`${command}\``)
                .addFields({ name: 'Prefix Used:', value: message.prefix || 'None' })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging command:', error);
        }
    };

    const logNoPrefixAddition = async (userId, noPrefixAdded, guildId) => {
        try {
            const channel = client.channels.cache.get(NO_PREFIX_LOG_ID);
            if (!channel) return;

            const user = await client.users.fetch(userId).catch(() => null);
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('No-Prefix Command Added')
                .setDescription(`**User:** ${user?.tag} (${userId})\n**Guild:** ${guildId}\n**No-Prefix Added:** ${noPrefixAdded}`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging NP addition:', error);
        }
    };

    const logNoPrefixRemoval = async (userId, noPrefixRemoved, guildId) => {
        try {
            const channel = client.channels.cache.get(NO_PREFIX_LOG_ID);
            if (!channel) return;

            const user = await client.users.fetch(userId).catch(() => null);
            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('No-Prefix Command Removed')
                .setDescription(`**User:** ${user?.tag} (${userId})\n**Guild:** ${guildId}\n**No-Prefix Removed:** ${noPrefixRemoved}`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging NP removal:', error);
        }
    };

    const logBlacklist = async (userId, guildId, reason) => {
        try {
            const channel = client.channels.cache.get(BLACKLIST_LOG_ID);
            if (!channel) return;

            const user = await client.users.fetch(userId).catch(() => null);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('User Blacklisted for Spam')
                .setDescription(`**User:** ${user?.tag || 'Unknown'} (${userId})\n**Guild:** ${guildId}\n**Reason:** ${reason}`)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging blacklist:', error);
        }
    };

    const logBotPing = async (message, ping) => {
        try {
            const channel = client.channels.cache.get(PING_LOG_ID);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Bot Ping Check')
                .setDescription(`**User:** ${message.author.tag}\n**Ping:** \`${ping}ms\``)
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error logging ping:', error);
        }
    };

    // Log ALL commands (with or without prefix)
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;
        
        const commandName = interaction.commandName;
        logCommandUsage({
            author: { tag: interaction.user.tag, id: interaction.user.id },
            guild: { name: interaction.guild?.name },
            prefix: 'slash'
        }, commandName);
    });

    // Log prefix-based commands
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        if (!message.guild) return;

        const prefix = message.guild.prefix || client.config.PREFIX;

        // Check for command with prefix
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/\s+/);
            const commandName = args[0]?.toLowerCase();

            if (commandName) {
                message.prefix = prefix;
                logCommandUsage(message, commandName);

                // Check for ping command
                if (commandName === 'ping' || commandName === 'latency') {
                    const ping = Math.round(client.ws.ping);
                    logBotPing(message, ping);
                }
            }
        }

        // Spam detection
        const userId = message.author.id;
        const now = Date.now();

        if (!userCooldowns.has(userId)) {
            userCooldowns.set(userId, []);
        }

        const userMessages = userCooldowns.get(userId);
        userMessages.push(now);

        const recentMessages = userMessages.filter(time => now - time < SPAM_TIME_WINDOW);
        userCooldowns.set(userId, recentMessages);

        if (recentMessages.length > SPAM_THRESHOLD) {
            let spamRecord = await SpamBlacklist.findOne({ userId, guildId: message.guildId });
            
            if (!spamRecord) {
                spamRecord = new SpamBlacklist({
                    userId,
                    guildId: message.guildId,
                    reason: 'Spam Detection',
                    blacklisted: true
                });
            } else {
                spamRecord.blacklisted = true;
                spamRecord.reason = 'Spam Detection';
            }

            await spamRecord.save();
            await logBlacklist(userId, message.guildId, 'Spam Detection - Too many messages');

            try {
                await message.author.send(`You have been blacklisted from using commands in ${message.guild.name} for spam.`).catch(() => {});
            } catch (error) {
                console.error('Could not DM user:', error);
            }
        }
    });

    // Export logging functions for external use (NP commands)
    client.logNoPrefixAddition = logNoPrefixAddition;
    client.logNoPrefixRemoval = logNoPrefixRemoval;
};
