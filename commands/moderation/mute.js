const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'mute',
    usage: 'Mute a user temporarily',
    aliases: ['timeout', 'stfu'],
    category: 'mod',
    premium: false,
    run: async (client, message, args) => {
        let role = await client.db.get(`modrole_${message.guild.id}`) || null;

        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers) && (!role || !message.member.roles.cache.has(role))) {
            return message.reply({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You must have \`Timeout Members\` permissions to use this command.`)
                ]
            });
        }
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | I must have \`Timeout Members\` permissions to run this command.`)
                ]
            });
        }
        if (!client.util.hasHigher(message.member) && (!role || !message.member.roles.cache.has(role))) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You must have a higher role than me to use this command.`)
                ]
            });
        }
        if(!args[0]) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You didn't mention the member or provide a valid ID to mute.\n${message.guild.prefix}mute \`<member>\` \`<time>\` \`<reason>\``)
                ]
            });
        }
        let user = await getUserFromMention(message, args[0]);
        if (!user) {
            try {
                user = await message.guild.members.fetch(args[0]);
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | You didn't mention the member or provide a valid ID to mute.\n${message.guild.prefix}mute \`<member>\` \`<time>\` \`<reason>\``)
                    ]
                });
            }
        }

        let reason = args.slice(2).join(' ');
        if (!reason) reason = 'No reason given';

        let time = args[1];
        if (!time) time = '27d';

        let dur = ms(time);

        if (!dur) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | Invalid time format.\n${message.guild.prefix}mute \`<member>\` \`<time>\` \`<reason>\``)
                ]
            });
        }
        if (user.isCommunicationDisabled()) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | <@${user.user.id}> is already muted!`)
                ]
            });
        }
        if (user.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | <@${user.user.id}> has \`Administrator\` permissions!`)
                ]
            });
        }
        if (user.id === client.user.id) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You can't mute me.`)
                ]
            });
        }
        if (user.id === message.guild.ownerId) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You can't mute the server owner!`)
                ]
            });
        }
        if (user.id === message.member.id) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You can't mute yourself.`)
                ]
            });
        }
        if (!user.manageable) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | I don't have enough permissions to mute <@${user.user.id}>.`)
                ]
            });
        }

        const muteMessage = new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
                `-# ${client.emoji.reply1} You've Been Timed Out From ${message.guild.name}\n` +
                `-# ${client.emoji.reply2} For The Reason: \`${reason}\`\n` +
                `-# ${client.emoji.reply3} Command Executed By: ${message.author.username}`
            );

        try {
            await user.send({ embeds: [muteMessage] }).catch(() => null);
            await user.timeout(dur, `${message.author.tag} | ${reason}`);
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.tick} | Successfully muted <@${user.user.id}>!`)
                ]
            });
        } catch (error) {
            console.error('Error muting user:', error);
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | An error occurred while trying to mute <@${user.user.id}>.`)
                ]
            });
        }
    }
};

async function getUserFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    try {
        return await message.guild.members.fetch(id);
    } catch (error) {
        return null;
    }
}
