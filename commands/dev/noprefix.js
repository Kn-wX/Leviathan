const { Message, Client, MessageEmbed, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const Restriction = require('../../models/restrictionModel')
this.config = require(`${process.cwd()}/config.json`)

module.exports = {
    name: 'noprefix',
    usage: 'Manage noprefix settings',
    aliases: ['np'],
    category: 'owner',
    run: async (client, message, args) => {
        if (!this.config.np.includes(message.author.id)) return
        const embed = client.util.embed().setColor(client.color)
        let prefix = message.guild.prefix

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `Please provide the required arguments.\n${prefix}noprefix \`<add/remove/list/reset/immune>\` \`<user>\` [duration/reason]`
                        )
                ]
            })
        }

        // Handle immune system
        if (args[0].toLowerCase() === 'immune') {
            if (!args[1]) {
                return message.channel.send({
                    embeds: [
                        embed
                            .setColor(client.color)
                            .setDescription(
                                `Please provide the required arguments.\n${prefix}noprefix \`immune\` \`<add/list/remove/reset>\` [user]`
                            )
                    ]
                })
            }

            const immuneOpt = args[1].toLowerCase();
            const immuneKey = `np_immune_${client.user.id}`;

            if (immuneOpt === 'list') {
                let immuneUsers = (await client.db.get(immuneKey)) || [];
                if (immuneUsers.length < 1) {
                    return message.channel.send({
                        embeds: [embed.setColor(client.color).setDescription('No immune users.')]
                    })
                }

                const pageSize = 10;
                const pages = [];
                for (let i = 0; i < immuneUsers.length; i += pageSize) {
                    pages.push(immuneUsers.slice(i, i + pageSize));
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
                        .setTitle('No-Prefix Immune Users')
                        .setDescription(desc)
                        .setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });
                };

                const buttons = [
                    new ButtonBuilder().setCustomId('prev_immune_np').setLabel('◀').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('next_immune_np').setLabel('▶').setStyle(ButtonStyle.Primary),
                ];

                const row = new ActionRowBuilder().addComponents(...buttons);
                const msg = await message.channel.send({ embeds: [await getEmbed()], components: [row] });

                const filter = (i) => (i.customId === 'prev_immune_np' || i.customId === 'next_immune_np') && i.user.id === message.author.id;
                const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async (i) => {
                    if (i.customId === 'prev_immune_np' && currentPage > 0) currentPage--;
                    if (i.customId === 'next_immune_np' && currentPage < pages.length - 1) currentPage++;
                    await i.update({ embeds: [await getEmbed()] });
                });

                return;
            }

            if (!args[2]) {
                return message.channel.send({
                    embeds: [
                        embed
                            .setColor(client.color)
                            .setDescription(`Please provide a user for this command.`)
                    ]
                })
            }

            // Parse user
            let userInput = args[2];
            let user = null;

            if (message.mentions.users.size > 0) {
                user = message.mentions.users.first();
            } else if (/^\d+$/.test(userInput)) {
                user = await client.users.fetch(userInput).catch(() => null);
            } else {
                user = await client.users.cache.find(u => u.username.toLowerCase() === userInput.toLowerCase());
                if (!user) {
                    user = await client.users.fetch({ username: userInput }).catch(() => null);
                }
            }

            if (!user) {
                return message.channel.send({
                    embeds: [embed.setColor(client.color).setDescription(`${client.emoji.cross} User not found.`)]
                })
            }

            let immuneUsers = (await client.db.get(immuneKey)) || [];

            if (immuneOpt === 'add') {
                if (immuneUsers.includes(user.id)) {
                    return message.channel.send({
                        embeds: [embed.setColor(client.color).setDescription(`${client.emoji.cross} **<@${user.id}>** is already immune.`)]
                    })
                }
                immuneUsers.push(user.id);
                await client.db.set(immuneKey, immuneUsers);
                return message.channel.send({
                    embeds: [embed.setColor(client.color).setDescription(`${client.emoji.tick} | **<@${user.id}>** is now immune to No-Prefix reset.`)]
                })
            }

            if (immuneOpt === 'remove') {
                immuneUsers = immuneUsers.filter(id => id !== user.id);
                await client.db.set(immuneKey, immuneUsers);
                return message.channel.send({
                    embeds: [embed.setColor(client.color).setDescription(`${client.emoji.tick} | **<@${user.id}>** is no longer immune.`)]
                })
            }

            if (immuneOpt === 'reset') {
                immuneUsers = [];
                await client.db.set(immuneKey, immuneUsers);
                return message.channel.send({
                    embeds: [embed.setColor(client.color).setDescription(`${client.emoji.tick} | No-Prefix immune list has been reset.`)]
                })
            }

            return message.channel.send({
                embeds: [embed.setColor(client.color).setDescription(`Invalid immune option. Use: add, remove, list, reset`)]
            })
        }

        if (args[0].toLowerCase() === `list`) {
            let listing = (await client.db.get(`noprefix_${client.user.id}`))
                ? await client.db.get(`noprefix_${client.user.id}`)
                : []

            if (listing.length < 1) {
                return message.channel.send({
                    embeds: [embed.setColor(client.color).setDescription('No No-Prefix users.')]
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
                    .setTitle('No-Prefix Users List')
                    .setDescription(desc)
                    .setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });
            };

            const buttons = [
                new ButtonBuilder().setCustomId('prev_np').setLabel('◀').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('next_np').setLabel('▶').setStyle(ButtonStyle.Primary),
            ];

            const row = new ActionRowBuilder().addComponents(...buttons);
            const msg = await message.channel.send({ embeds: [await getEmbed()], components: [row] });

            const filter = (i) => (i.customId === 'prev_np' || i.customId === 'next_np') && i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'prev_np' && currentPage > 0) currentPage--;
                if (i.customId === 'next_np' && currentPage < pages.length - 1) currentPage++;
                await i.update({ embeds: [await getEmbed()] });
            });

            return;
        }

        let opt = args[0].toLowerCase()

        if (opt == `reset`) {
            let added = (await client.db.get(`noprefix_${client.user.id}`))
                ? await client.db.get(`noprefix_${client.user.id}`)
                : []
            const immuneKey = `np_immune_${client.user.id}`;
            let immuneUsers = (await client.db.get(immuneKey)) || [];

            const resetReason = args.slice(1).join(' ') || 'Not Provided';
            let notifiedCount = 0;

            for (const userId of added) {
                // Skip if user is developer, owner, or immune
                if (this.config.developer.includes(userId) || this.config.owner.includes(userId) || immuneUsers.includes(userId)) {
                    continue;
                }

                try {
                    const user = await client.users.fetch(userId).catch(() => null);
                    const restriction = await Restriction.findOne({ botId: client.user.id, userId: userId, type: 'noprefix' });

                    if (user) {
                        const resetEmbed = new EmbedBuilder()
                            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            .setColor(client.color)
                            .setDescription(
                                `-# ${client.emoji.reply2} Reason: \`${resetReason}\`\n` +
                                `-# ${client.emoji.reply2} Was Executed By: \`${message.author.username}\`\n` +
                                `-# ${client.emoji.reply3} Reason For No-Prefix: \`${restriction?.reasonForRestriction || 'Not Provided'}\``
                            )
                            .setFooter({ text: 'No-Prefix Reset', iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                        await user.send({ embeds: [resetEmbed] }).catch(() => {});
                        notifiedCount++;
                    }
                } catch (error) {
                    console.error('Error notifying user of NP reset:', error);
                }
            }

            // Remove only non-immune users
            const newAdded = added.filter(id => this.config.developer.includes(id) || this.config.owner.includes(id) || immuneUsers.includes(id));
            await client.db.set(`noprefix_${client.user.id}`, newAdded);
            await Restriction.deleteMany({ botId: client.user.id, type: 'noprefix', userId: { $nin: newAdded } });
            client.util.noprefix();

            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | **No-Prefix** system has been reset. **${notifiedCount}** user(s) notified. **${newAdded.length}** user(s) immune/protected.`
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
                            `Please provide the required arguments.\n${prefix}noprefix \`<add/remove/list/reset/immune>\` \`<mention/user id/username>\` [duration/reason]`
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

        let added = (await client.db.get(`noprefix_${client.user.id}`))
            ? await client.db.get(`noprefix_${client.user.id}`)
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
            added = client.util.removeDuplicates(added);
            await client.db.set(`noprefix_${client.user.id}`, added);
            client.util.noprefix();

            // Save to MongoDB
            const reasonForRestriction = args[3] ? args.slice(3).join(' ') : null;
            const restriction = await Restriction.findOneAndUpdate(
                { botId: client.user.id, userId: user.id, type: 'noprefix' },
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
                .setFooter({ text: 'No-Prefix Addition', iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            user.send({ embeds: [dmEmbed] }).catch(() => {});

            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | **<@${user.id}>** added as **No Prefix** user.\n**Duration:** ${durationText}`
                        )
                ]
            })
        }

        if (opt == `remove` || opt == `r` || opt == `-`) {
            added = added.filter((srv) => srv != `${user.id}`)
            added = client.util.removeDuplicates(added)
            await client.db.set(`noprefix_${client.user.id}`, added)
            client.util.noprefix()

            // Remove from MongoDB
            await Restriction.deleteOne({ botId: client.user.id, userId: user.id, type: 'noprefix' });

            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | **<@${user.id}>** removed from **No Prefix** users.`
                        )
                ]
            })
        }

        message.channel.send({
            embeds: [
                embed
                    .setColor(client.color)
                    .setDescription(
                        `${prefix}noprefix \`<add/remove/list/reset/immune>\` \`<user>\` [duration/reason]`
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
