const { Message, Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const Restriction = require('../../models/restrictionModel')
this.config = require(`${process.cwd()}/config.json`)

module.exports = {
    name: 'blacklist',
    usage: 'Manage blacklist settings',
    aliases: ['bl'],
    category: 'owner',
    run: async (client, message, args) => {
        if (!this.config.admin.includes(message.author.id)) return
        const embed = client.util.embed().setColor(client.color)
        let prefix = message.guild.prefix

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `Please provide the required arguments.\n${prefix}blacklist \`<add/remove/list/reset>\` \`<user>\` [duration/reason]`
                        )
                ]
            })
        }

        if (args[0].toLowerCase() === `list`) {
            let listing = (await client.db.get(`blacklist_${client.user.id}`))
                ? await client.db.get(`blacklist_${client.user.id}`)
                : []

            if (listing.length < 1) {
                return message.channel.send({
                    embeds: [embed.setColor(client.color).setDescription('No Blacklist users.')]
                })
            }

            const pageSize = 10;
            const pages = [];
            for (let i = 0; i < listing.length; i += pageSize) {
                pages.push(listing.slice(i, i + pageSize));
            }

            let currentPage = 0;

            const getEmbed = async () => {
                const pageUsers = pages[currentPage];
                let desc = '';
                for (let i = 0; i < pageUsers.length; i++) {
                    const user = await client.users.fetch(pageUsers[i]).catch(() => null);
                    desc += `${i + 1}) ${user?.tag || pageUsers[i]} (${pageUsers[i]})\n`;
                }
                return new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle('Blacklist Users List')
                    .setDescription(desc)
                    .setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });
            };

            const buttons = [
                new ButtonBuilder().setCustomId('prev_bl').setLabel('◀').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('next_bl').setLabel('▶').setStyle(ButtonStyle.Primary),
            ];

            const row = new ActionRowBuilder().addComponents(...buttons);
            const msg = await message.channel.send({ embeds: [await getEmbed()], components: [row] });

            const filter = (i) => (i.customId === 'prev_bl' || i.customId === 'next_bl') && i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'prev_bl' && currentPage > 0) currentPage--;
                if (i.customId === 'next_bl' && currentPage < pages.length - 1) currentPage++;
                await i.update({ embeds: [await getEmbed()] });
            });

            return;
        }

        let opt = args[0].toLowerCase()

        if (opt == `reset`) {
            let added = (await client.db.get(`blacklist_${client.user.id}`))
                ? await client.db.get(`blacklist_${client.user.id}`)
                : []

            const resetReason = args.slice(1).join(' ') || 'Not Provided';
            let notifiedCount = 0;

            for (const userId of added) {
                // Skip if user is developer or owner
                if (this.config.developer.includes(userId) || this.config.owner.includes(userId)) {
                    continue;
                }

                try {
                    const user = await client.users.fetch(userId).catch(() => null);
                    const restriction = await Restriction.findOne({ botId: client.user.id, userId: userId, type: 'blacklist' });

                    if (user) {
                        const resetEmbed = new EmbedBuilder()
                            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            .setColor(client.color)
                            .setDescription(
                                `-# ${client.emoji.reply2} Reason: \`${resetReason}\`\n` +
                                `-# ${client.emoji.reply2} Was Executed By: \`${message.author.username}\`\n` +
                                `-# ${client.emoji.reply3} Reason For Blacklist: \`${restriction?.reasonForRestriction || 'Not Provided'}\``
                            )
                            .setFooter({ text: 'Blacklist Reset', iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                        await user.send({ embeds: [resetEmbed] }).catch(() => {});
                        notifiedCount++;
                    }
                } catch (error) {
                    console.error('Error notifying user of BL reset:', error);
                }
            }

            // Remove only non-protected users
            const newAdded = added.filter(id => this.config.developer.includes(id) || this.config.owner.includes(id));
            await client.db.set(`blacklist_${client.user.id}`, newAdded);
            await Restriction.deleteMany({ botId: client.user.id, type: 'blacklist', userId: { $nin: newAdded } });
            client.util.blacklist();

            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | **Blacklist** system has been reset. **${notifiedCount}** user(s) notified. **${newAdded.length}** user(s) protected.`
                        )
                ]
            })
        }

        if (!args[1]) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `Please provide the required arguments.\n${prefix}blacklist \`<add/remove/list/reset>\` \`<mention/user id/username>\` [duration/reason]`
                        )
                ]
            })
        }

        // Parse user input (mention, user id, or username)
        let userInput = args[1];
        let user = null;

        // Try to get user from mention
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (/^\d+$/.test(userInput)) {
            // Try to get user by ID
            user = await client.users.fetch(userInput).catch(() => null);
        } else {
            // Try to get user by username
            user = await client.users.cache.find(u => u.username.toLowerCase() === userInput.toLowerCase());
            if (!user) {
                user = await client.users.fetch({ username: userInput }).catch(() => null);
            }
        }

        if (!user) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} User not found. Please provide a valid mention, user ID, or username.`
                        )
                ]
            })
        }

        // Check if user is an owner (cannot be blacklisted)
        if (this.config.owner.includes(user.id)) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(0xFF0000)
                        .setDescription(
                            `${client.emoji.cross} **<@${user.id}>** is an owner and cannot be blacklisted!`
                        )
                ]
            })
        }

        let added = (await client.db.get(`blacklist_${client.user.id}`))
            ? await client.db.get(`blacklist_${client.user.id}`)
            : []

        if (opt == `add` || opt == `a` || opt == `+`) {
            // Parse duration from args[2]
            let durationStr = args[2] || '0';
            let expiresAt = null;
            let isLifetime = false;

            if (durationStr === '0') {
                isLifetime = true;
            } else {
                const durationMs = parseDuration(durationStr);
                if (durationMs === null) {
                    return message.channel.send({
                        embeds: [
                            embed
                                .setColor(0xFF0000)
                                .setDescription(`${client.emoji.cross} Invalid duration format.`)
                        ]
                    })
                }
                expiresAt = new Date(Date.now() + durationMs);
            }

            added.push(user.id);
            added = client.util.removeDuplicates2(added);
            await client.db.set(`blacklist_${client.user.id}`, added);
            client.util.blacklist();

            // Save to MongoDB
            const reasonForRestriction = args[3] ? args.slice(3).join(' ') : null;
            const restriction = await Restriction.findOneAndUpdate(
                { botId: client.user.id, userId: user.id, type: 'blacklist' },
                { expiresAt, isLifetime, addedBy: message.author.id, reasonForRestriction },
                { upsert: true, new: true }
            );

            const durationText = isLifetime ? '**Lifetime** (Permanent)' : expiresAt ? `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>` : 'error';

            // Send DM to user
            const dmEmbed = new EmbedBuilder()
                .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setColor(client.color)
                .setDescription(
                    `-# ${client.emoji.reply2} Added By: <@${message.author.id}>\n` +
                    `-# ${client.emoji.reply2} Duration: <t:${Math.floor(Date.now() / 1000)}:R> | <t:${Math.floor(Date.now() / 1000)}:F>\n` +
                    `-# ${client.emoji.reply3} Ending On: ${isLifetime ? '**Never**' : `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>`}`
                )
                .setFooter({ text: 'Blacklist Addition', iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            user.send({ embeds: [dmEmbed] }).catch(() => {});

            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | **<@${user.id}>** added as **Blacklist** user.\n**Duration:** ${durationText}`
                        )
                ]
            })
        }

        if (opt == `remove` || opt == `r` || opt == `-`) {
            added = added.filter((srv) => srv != `${user.id}`)
            added = client.util.removeDuplicates2(added)
            await client.db.set(`blacklist_${client.user.id}`, added)
            client.util.blacklist()

            // Remove from MongoDB
            await Restriction.deleteOne({ botId: client.user.id, userId: user.id, type: 'blacklist' });

            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | **<@${user.id}>** removed from **Blacklist** users.`
                        )
                ]
            })
        }

        message.channel.send({
            embeds: [
                embed
                    .setColor(client.color)
                    .setDescription(
                        `${prefix}blacklist \`<add/remove/list/reset>\` \`<user>\` [duration/reason]`
                    )
            ]
        })
    }
}

function parseDuration(str) {
    let value, unit;

    if (str.match(/^(\d+)min$/i)) {
        const match = str.match(/^(\d+)min$/i);
        value = parseInt(match[1]);
        unit = 'min';
    } else {
        const match = str.match(/^(\d+)([shdwmy])$/i);
        if (!match) return null;
        value = parseInt(match[1]);
        unit = match[2].toLowerCase();
    }

    const multipliers = {
        's': 1000,
        'min': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000,
        'm': 30 * 24 * 60 * 60 * 1000,
        'y': 365 * 24 * 60 * 60 * 1000
    };

    return value * (multipliers[unit] || 0);
}
