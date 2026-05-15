const {
    Message,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js')

module.exports = {
    name: 'nuke',
    usage: 'Manage nuke settings',
    category: 'mod',
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageChannels')) {
            let error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Manage Channels\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (!client.util.hasHigher(message.member)) {
            let error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `Your highest role must be higher than my highest role to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        try {
            let row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('YES')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Yes'),
                new ButtonBuilder()
                    .setCustomId('NO')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('No')
            )
            const embed = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `Are you sure that you want to nuke this channel?`
                )
            let msg = await message.channel.send({
                embeds: [embed],
                components: [row]
            })
            const filter = (interaction) => {
                if (interaction.user.id === message.author.id) return true
                return interaction.reply({
                    content: `Only ${message.author.username} can use these buttons`,
                    ephemeral: true
                })
            }
            const collector = message.channel.createMessageComponentCollector({
                filter,
                max: 1
            })

            collector.on('collect', async (buttonInteraction) => {
                await buttonInteraction.deferUpdate();
                const id = buttonInteraction.customId
                if (id === 'YES') {
                    try {
                        const channelName = message.channel.name;
                        const clonedChannel = await message.channel.clone();
                        
                        await clonedChannel.setParent(message.channel.parent);
                        await clonedChannel.setPosition(message.channel.position);
                        
                        let embed = new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(
                                `-# ${client.emoji.reply1} Nuked Channel: ${channelName}\n` +
                                `-# ${client.emoji.reply2} Nuked By: ${message.author.username}\n` +
                                `-# ${client.emoji.reply3} Nuked At: <t:${Math.floor(Date.now() / 1000)}:F>`
                            )
                        
                        await message.channel.delete();
                        const nukeMsg = await clonedChannel.send({ embeds: [embed] });
                        setTimeout(() => nukeMsg.delete().catch(() => {}), 10000);
                    } catch (err) {
                        console.error('Nuke error:', err);
                    }
                }
                if (id === 'NO') {
                    msg.delete().catch((e) => {})
                }
            })
        } catch (err) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`I was unable to nuke this channel.`)
                ]
            })
        }
    }
}
