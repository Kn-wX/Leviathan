const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Giveaway = require('../../models/giveaway');

const parseDuration = (str) => {
    const timeRegex = /(\d+)([mhd])/i;
    const match = str.match(timeRegex);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
};

const formatDuration = (ms) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    let result = [];
    if (days > 0) result.push(`${days}d`);
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0) result.push(`${minutes}m`);
    
    return result.join(' ') || 'Less than a minute';
};

module.exports = {
    name: 'gstart',
    usage: 'Manage gstart settings',
    aliases: ['gwy'],
    category: 'giveaway',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Messages\` permission!`)]
            });
        }

        if (args.length < 3) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Usage: \`gstart <name> <duration(10m/2h/1d)> <winners>\``)]
            });
        }

        const name = args[0];
        const durationStr = args[1];
        const winners = parseInt(args[2]);

        const duration = parseDuration(durationStr);
        if (!duration || isNaN(winners)) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Invalid duration format (use: 10m, 2h, 1d) or winners must be a number!`)]
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`gwy_enter_${Date.now()}`)
                .setLabel(' Enter Giveaway')
                .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${client.emoji.giveaway} ${name}`)
            .setDescription(`Click the button below to enter!\n\n**Prize:** ${name}\n**Winners:** ${winners}\n**Host:** ${message.author}\n**Participants:** 0`)
            .setFooter({ text: `Ends in ${formatDuration(duration)}`, iconURL: client.user.displayAvatarURL() })
            .setTimestamp(Date.now() + duration);

        const giveawayMsg = await message.channel.send({ embeds: [embed], components: [row] });
        
        const giveaway = new Giveaway({
            guildId: message.guildId,
            messageId: giveawayMsg.id,
            channelId: message.channelId,
            name,
            duration,
            winners,
            participants: [],
            endTime: new Date(Date.now() + duration),
            createdBy: message.author.id
        });

        await giveaway.save();

        message.react(client.emoji.tick.split(':')[2].slice(0, -1));
    }
};
