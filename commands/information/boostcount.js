
module.exports = {
    name: 'boostcount',
    usage: 'Manage boostcount settings',
    aliases : ['bc'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        let count = message.guild.premiumSubscriptionCount
        return message.channel.send({
            embeds: [
                await client.util.embed()
                    .setAuthor({ name : `${message.author.displayName}` , iconURL : message.author.displayAvatarURL({ dynamic : true })})
                    .setTitle(`Boost Count For ${message.guild.name}`)
                    .setColor(client.color)
                    .setDescription(`**Boost Count : ${count}**`)
                .setFooter({ text : `Requested By ${message.author.displayName}`})
                .setFooter({ iconURL : message.author.displayAvatarURL({ dynamic : true})})
            ]
        })
    }
}
