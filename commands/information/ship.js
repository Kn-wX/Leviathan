const { EmbedBuilder } = require('discord.js');
const sharp = require('sharp');
const axios = require('axios');

module.exports = {
    name: 'ship',
    usage: 'Manage ship settings',
    aliases: ['shiprandom'],
    category: 'info',
    cooldown: 8,
    premium: false,

    run: async (client, message, args) => {
        try {
            let member;
            const relationshipDescriptions = [
                "A relationship is plausible!",
                "Sparks are definitely flying!",
                "Maybe better as friends?",
                "True love is in the air!",
                "Opposites attract!",
                "A fiery passion awaits!",
                "The beginning of something magical!",
                "A perfect match made in heaven!",
                "They can't keep their eyes off each other!",
                "Love isn't always easy...",
                "They're each other's better half!",
                "Destined to be together!",
                "They'll be the funniest couple around!",
                "They complete each other!",
                "A cosmic connection!",
                "Love at first sight!",
                "They bring out the best in each other!",
                "Party couple vibes!",
                "Fingers crossed for a fairytale ending!",
                "They're bound to make memories together!",
                "Love like no other!",
                "A wholesome, sweet connection!",
                "A subtle yet powerful bond!",
                "Sparks of excitement fill the air!"
            ];

            if (args[0]) {
                if (args[0].toLowerCase() === 'random') {
                    const members = message.guild.members.cache
                        .filter(m => !m.user.bot && m.user.id !== message.author.id)
                        .toJSON();
                    
                    if (members.length === 0) {
                        return message.channel.send('❌ No other members found to ship with!');
                    }
                    
                    member = members[Math.floor(Math.random() * members.length)];
                } else {
                    member = await getUserFromMention(message, args[0]);
                    if (!member) {
                        try {
                            member = await message.guild.members.fetch(args[0]);
                        } catch (error) {
                            return message.channel.send('❌ User not found!');
                        }
                    }
                }
            } else {
                const members = message.guild.members.cache
                    .filter(m => !m.user.bot && m.user.id !== message.author.id)
                    .toJSON();
                
                if (members.length === 0) {
                    return message.channel.send('❌ No other members found to ship with!');
                }
                
                member = members[Math.floor(Math.random() * members.length)];
            }

            if (!member) {
                return message.channel.send('❌ Could not find a valid member!');
            }

            const lovePercentage = Math.floor(Math.random() * 100);
            const mention = member.user?.username || member.username || 'Unknown User';
            const randomLine = relationshipDescriptions[Math.floor(Math.random() * relationshipDescriptions.length)];
            
            const authorAvatarUrl = message.author.displayAvatarURL({ forceStatic: true, extension: 'png', size: 256 });
            const memberAvatarUrl = (member.user || member).displayAvatarURL({ forceStatic: true, extension: 'png', size: 256 });
            
            // Generate ship image using sharp
            const width = 600;
            const height = 250;
            
            const backgroundUrl = 'https://cdn.discordapp.com/attachments/1189308460072960140/1303644352270041129/OIP_22.png?ex=672c80ea&is=672b2f6a&hm=78f9226530ffe9f80268c323af6601158be37bf9f205e157f36bb2a03ed85914&';
            
            const [bgRes, authorAvRes, memberAvRes] = await Promise.all([
                axios.get(backgroundUrl, { responseType: 'arraybuffer' }),
                axios.get(authorAvatarUrl, { responseType: 'arraybuffer' }),
                axios.get(memberAvatarUrl, { responseType: 'arraybuffer' })
            ]);

            const circleMask = Buffer.from(`<svg><circle cx="64" cy="64" r="64"/></svg>`);
            
            const authorAv = await sharp(Buffer.from(authorAvRes.data))
                .resize(128, 128)
                .composite([{ input: circleMask, blend: 'dest-in' }])
                .png()
                .toBuffer();
                
            const memberAv = await sharp(Buffer.from(memberAvRes.data))
                .resize(128, 128)
                .composite([{ input: circleMask, blend: 'dest-in' }])
                .png()
                .toBuffer();

            const heartSvg = Buffer.from(`
                <svg width="${width}" height="${height}">
                    <text x="50%" y="50%" font-family="Arial" font-size="60" text-anchor="middle" dominant-baseline="middle">❤️</text>
                    <text x="50%" y="75%" font-family="Arial" font-weight="bold" font-size="30" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${lovePercentage}%</text>
                </svg>
            `);

            const shipImage = await sharp(Buffer.from(bgRes.data))
                .resize(width, height)
                .composite([
                    { input: authorAv, left: 70, top: 61 },
                    { input: memberAv, left: 402, top: 61 },
                    { input: heartSvg, left: 0, top: 0 }
                ])
                .png()
                .toBuffer();

            message.reply({
                files: [{
                    attachment: shipImage,
                    name: 'ship-image.png'
                }],
                content: `**${message.author.tag}** + **${mention}** = ${lovePercentage}% 💗\n${randomLine}`
            });
        } catch (error) {
            console.error('Ship command error:', error);
            message.channel.send('❌ Something went wrong while generating the ship image.');
        }
    }
};

// Helper function to get user from mention or ID
async function getUserFromMention(message, mention) {
    if (!mention) return null;
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;
    const id = matches[1];
    return await message.guild.members.fetch(id).catch(() => null);
}


// Helper function to get user from mention or ID
async function getUserFromMention(message, mention) {
    if (!mention) return null;
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;
    const id = matches[1];
    return await message.guild.members.fetch(id).catch(() => null);
}
