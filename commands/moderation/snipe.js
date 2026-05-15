const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');
const axios = require('axios');

module.exports = {
    name: 'snipe',
    aliases: [],
    category: 'info',
    usage: 'snipe',
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`You must have \`Manage Messages\` permissions to run this command.`)
                ]
            });
        }

        const getSnipe = client.snipe.prepare('SELECT * FROM snipes WHERE guildId = ? AND channelId = ?');
        const snipe = getSnipe.get(message.guild.id, message.channel.id);

        if (!snipe) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`There are no deleted messages to snipe in this channel.`)
                ]
            });
        }

        try {
            const width = 1200;
            const height = 400;

            const displayName = (snipe.displayName || snipe.userName || 'Unknown').substring(0, 30);
            const userName = (snipe.userName || 'unknown').substring(0, 20);
            const content = (snipe.content || 'No content').substring(0, 100);
            const date = snipe.timestamp ? new Date(snipe.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Unknown';

            let overlays = [];

            // PFP handling
            if (snipe.pfp) {
                try {
                    const response = await axios.get(snipe.pfp, { responseType: 'arraybuffer', timeout: 5000 });
                    const pfpBuffer = await sharp(Buffer.from(response.data))
                        .resize(110, 110)
                        .composite([{
                            input: Buffer.from(`<svg><circle cx="55" cy="55" r="55"/></svg>`),
                            blend: 'dest-in'
                        }])
                        .png()
                        .toBuffer();
                    
                    overlays.push({ input: pfpBuffer, top: 15, left: 15 });
                } catch (err) {
                    console.error('Error loading PFP:', err);
                }
            }

            // SVG for Text
            const svgText = `
            <svg width="${width}" height="${height}">
                <text x="140" y="70" font-family="Arial" font-weight="bold" font-size="36" fill="#FFFFFF">${displayName}</text>
                <text x="140" y="100" font-family="Arial" font-size="20" fill="#E0E0E0">@${userName}</text>
                <text x="140" y="125" font-family="Arial" font-size="16" fill="#D0D0D0">${date}</text>
                <text x="140" y="160" font-family="Arial" font-size="22" fill="#FFFFFF">${content}</text>
                ${snipe.hasEmoji ? '<text x="140" y="350" font-family="Arial" font-weight="bold" font-size="20" fill="#FFD700">Emoji</text>' : ''}
                ${snipe.isGif ? `<text x="${snipe.hasEmoji ? 290 : 140}" y="350" font-family="Arial" font-weight="bold" font-size="20" fill="#FF1493">GIF</text>` : ''}
            </svg>`;

            overlays.push({ input: Buffer.from(svgText), top: 0, left: 0 });

            const buffer = await sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: { r: 0, g: 31, b: 63, alpha: 1 } // Approximating the gradient start
                }
            })
            .composite(overlays)
            .png()
            .toBuffer();

            const attachment = new AttachmentBuilder(buffer, { name: 'sniped-message.png' });

            // Build detailed fields
            const fields = [];
            
            // Field 1: Author Info (with reply1 emoji)
            fields.push({
                name: `${client.emoji.reply1} Author Information`,
                value: `**Username:** ${snipe.userName}\n**Tag:** ${snipe.userTag}\n**User ID:** ${snipe.userId}`,
                inline: false
            });

            // Field 2: Message Details (with reply2 emoji)
            fields.push({
                name: `${client.emoji.reply2} Message Details`,
                value: `**Content Length:** ${content.length} characters\n**Timestamp:** ${snipe.timestamp ? new Date(snipe.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Unknown'}\n**Contains Emoji:** ${snipe.hasEmoji ? 'Yes' : 'No'}`,
                inline: false
            });

            // Field 3: Full Message Content (with reply2 emoji)
            fields.push({
                name: `${client.emoji.reply2} Message Content`,
                value: `\`\`\`${content.substring(0, 300)}\`\`\`${content.length > 300 ? '\n*Content truncated...*' : ''}`,
                inline: false
            });

            // Field 4: Attachments & Media (with reply2 emoji if not last)
            if (snipe.imageUrl || snipe.isGif) {
                fields.push({
                    name: `${client.emoji.reply2} Attachments`,
                    value: `**Type:** ${snipe.isGif ? 'GIF' : 'Image'}\n**Link:** [View Media](${snipe.imageUrl})`,
                    inline: false
                });
            }

            // Use reply3 emoji for the last field
            if (fields.length > 0) {
                const lastField = fields[fields.length - 1];
                lastField.name = lastField.name.replace(client.emoji.reply2, client.emoji.reply3);
            }

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(' Sniped Message Details')
                .setImage('attachment://sniped-message.png')
                .addFields(...fields)
                .setFooter({ text: `Sniped by ${message.author.username} • Channel: #${message.channel.name}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.channel.send({ embeds: [embed], files: [attachment] });

        } catch (err) {
            console.error('Error in snipe command:', err);
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor('#FF0000')
                        .setDescription(`Error processing snipe.`)
                ]
            });
        }
    },
};
