const { Message, Client, EmbedBuilder } = require('discord.js')
module.exports = {
    name: 'ban',
    usage: 'Ban a user from the server',
    aliases: ['hackban', 'fuckban', 'fuckoff'],
    category: 'mod',
    premium: false,

    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        if (message.member.permissions.has('BanMembers')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`Ban Members\` permissions to use this command.`
                        )
                ]
            })
        }
        if (!message.guild.members.me.permissions.has('BanMembers')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I must have \`Ban Members\` permissions to use this command.`
                        )
                ]
            })
        }
        let isown = message.author.id == message.guild.ownerId
        let user = await getUserFromMention(message, args[0])
        if (!user) {
            try {
                user = await client.users.fetch(args[0])
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Please Provide Valid user ID or Mention Member.`
                            )
                    ]
                })
            }
        }
        let rea = args.slice(1).join(' ') || 'No Reason Provided'
        rea = `${message.author.tag} (${message.author.id}) | ` + rea
        const emisai = client.util.embed()
            .setDescription(`${client.emoji.cross} | User Not Found`)
            .setColor(client.color)
        if (user === undefined)
            return message.channel.send({ embeds: [emisai] })

        if (user.id === client.user.id)
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | If You Ban Me Then Who Will Protect Your Server Dumb!?`
                        )
                ]
            })
        if (user.id === message.guild.ownerId)
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I can't ban the owner of this server.`
                        )
                ]
            })
        if (!saixd.includes(message.author.id) && !client.util.hasHigher(message.member)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have a higher role than me to use this command.`
                        )
                ]
            })
        }
        let check = message.guild.members.cache.has(user.id)
        if (check === true || user.banable) {
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(
                        `-# ${client.emoji.reply1} You've Been Banned From ${message.guild.name}\n` +
                        `-# ${client.emoji.reply2} For The Reason: \`${rea.replace(`${message.author.tag} (${message.author.id}) | `, '')}\`\n` +
                        `-# ${client.emoji.reply3} Command Executed By: ${message.author.username}`
                    )
                
                await user.send({ embeds: [dmEmbed] }).catch((err) => null)
                
                let member = await message.guild.members.fetch(user, true)
                await message.guild.members.ban(member.id, {
                    reason: rea
                })
            } catch (err) {
                const embed = client.util.embed()
                    .setDescription(
                        `${client.emoji.cross} |  My highest role is below **<@${user.id}>** `
                    )
                    .setColor(client.color)
                return message.channel.send({ embeds: [embed] })
            }
            const done = client.util.embed()
                .setDescription(
                    `${client.emoji.tick} | Successfully banned **<@${user.id}>** from the server.`
                )
                .setColor(client.color)
            return message.channel.send({ embeds: [done] })
        }
        if (check === false) {
            try {
                let member = await client.users.fetch(user, true)
                await message.guild.bans.create(member.id, {
                    reason: rea
                })
            } catch (err) {
                const embed = client.util.embed()
                    .setDescription(
                        `${client.emoji.cross} |  My highest role is below or same as **<@${user.id}>** `
                    )
                    .setColor(client.color)
                return message.channel.send({ embeds: [embed] })
            }
            const done = client.util.embed()
                .setDescription(
                    `${client.emoji.tick} | Successfully banned **<@${user.id}>** from the server.`
                )
                .setColor(client.color)
            return message.channel.send({ embeds: [done] })
        }
    }
}

function getUserFromMention(message, mention) {
    if (!mention) return null

    const matches = mention.match(/^<@!?(\d+)>$/)
    if (!matches) return null

    const id = matches[1]
    return message.client.users.fetch(id)
}
