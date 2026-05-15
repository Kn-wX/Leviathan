const { EmbedBuilder, WebhookClient } = require('discord.js')
const { values } = require('lodash')



module.exports = async (client) => {
    const logChannelId = '1452127574741356645';
    client.on('guildCreate', async (guild) => {
        const channel = client.channels.cache.get(logChannelId) || await client.channels.fetch(logChannelId).catch(() => null);
        const ser = await client.cluster

    .broadcastEval(`this.guilds.cache.size`)

    .then(results => results.reduce((prev, val) => prev + val, 0));


       

    const results = await client.cluster.broadcastEval(client => {

      return client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    });

    const use = results.reduce((acc, count) => acc + count, 0);

  



      /*  const use = client.guilds.cache
            .filter((guild) => guild.available)
            .reduce((prev, guild) => prev + guild.memberCount, 0)
*/
      //  const channel = client.channels.cache.get(join) ? client.channels.cache.get(join) : await client.channels.fetch(join).catch((err) => { })
        var emoji = ''
        let own = await guild.fetchOwner()
        let links = guild.bannerURL({ dynamic: true, size: 1024 })
        if (guild.partnered && guild.verified)
            emoji = `<:partner:1181495977413185596><:verified:1181495980525363220>`
        else if (guild.partnered && !guild.verified)
            emoji = '<:partner:1181495977413185596>'
        else if (!guild.partnered && guild.verified)
            emoji = '<:verified:1181495980525363220>'
        else if (!guild.partnered && !guild.verified)
            emoji = `${client.emoji.cross}`
        const embed = client.util.embed()
            .setDescription(
                `Id: **${guild.id}**\nName: **${
                    guild.name
                }**\nDiscord Level: ${emoji}\nMemberCount: \`${
                    guild.memberCount + 1
                }\`\nCreated At: <t:${Math.round(
                    guild.createdTimestamp / 1000
                )}> (<t:${Math.round(
                    guild.createdTimestamp / 1000
                )}:R>)\nJoined At: <t:${Math.round(
                    guild.joinedTimestamp / 1000
                )}> (<t:${Math.round(guild.joinedTimestamp / 1000)}:R>)`
            )
            .addFields({ name : 
                `**Owner**`,
               value :  `Info: **${
                    guild.members.cache.get(own.id)
                        ? guild.members.cache.get(own.id).user.tag
                        : 'Unknown user'
                } (${own.id})**\nMentions: <@${
                    own.id
                }>\nCreated At: <t:${Math.round(
                    own.user.createdTimestamp / 1000
                )}> (<t:${Math.round(own.user.createdTimestamp / 1000)}:R>)`
    })
            .addFields({ name : 
                `**${client.user.username}'s Total Servers**`,
              value  : `\`\`\`js\n${ser}\`\`\``},
                true)
            .addFields({ name : 
                `**${client.user.username}'s Total Users**`,
              value :  `\`\`\`js\n${use}\`\`\``},
                true
            )
            .addFields({name : `**Shard Id**`, value :  `\`\`\`js\n${guild.shardId}\`\`\``}, true)
            .setTitle(guild.name)
            .setThumbnail(
                guild.iconURL({
                    dynamic: true,
                    size: 1024
                })
            )
            .setColor(client.color)
        if (guild.vanityURLCode) {
            let temp = `https://discord.gg/` + guild.vanityURLCode
            embed.setURL(temp)
        } else {
            embed.setURL('https://discord.gg/W2bgPVMnEg')
        }
        if (guild.banner) embed.setImage(links)
        if (channel) await channel.send({ embeds: [embed] })
    })

    client.on('guildDelete', async (guild) => {
        const ser = client.guilds.cache.size

        const use = client.guilds.cache
            .filter((guild) => guild.available)
            .reduce((prev, guild) => prev + guild.memberCount, 0)

        const channel = client.channels.cache.get(logChannelId) || await client.channels.fetch(logChannelId).catch(() => null);
        let links = guild.bannerURL({ dynamic: true, size: 1024 })
        const embed = client.util.embed()
            .setDescription(
                `Id: **${guild.id}**\nName: **${guild.name}**\nMemberCount: \`${
                    guild.memberCount + 1
                }\`\nCreated At: <t:${Math.round(
                    guild.createdTimestamp / 1000
                )}> (<t:${Math.round(
                    guild.createdTimestamp / 1000
                )}:R>)\nJoined At: <t:${Math.round(
                    guild.joinedTimestamp / 1000
                )}> (<t:${Math.round(guild.joinedTimestamp / 1000)}:R>)`
            )
            .addFields({ name : 
                `**${client.user.username}'s Total Servers**`,
               value : `\`\`\`js\n${ser}\`\`\``},
                true
            )
            .addFields({ name : 
                `**${client.user.username}'s Total Users**`,
                value : `\`\`\`js\n${use}\`\`\``},
                true
            )
        if (guild.available) embed.setTitle(guild.name)
        embed.setThumbnail(
            guild.iconURL({
                dynamic: true,
                size: 1024
            })
        )
        embed.setColor(client.color)
        if (guild.vanityURLCode) {
            let temp = `https://discord.gg/` + guild.vanityURLCode
            embed.setURL(temp)
        } else {
            embed.setURL('https://discord.gg/W2bgPVMnEg')
        }
        if (guild.banner) embed.setImage(links)

        await channel.send({ embeds: [embed] })
    })
}
