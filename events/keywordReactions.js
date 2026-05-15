module.exports = async (client) => {
    const LEVIATHAN_EMOJI = '<:93aa168a85d9121372606685ddcc2dca:1480125070209847479>';
    const keywords = ['leviathan', 'r3tract0', 'retracto'];
    
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        try {
            const messageText = message.content.toLowerCase();
            
            if (keywords.some(keyword => messageText.includes(keyword))) {
                await message.react('1452843675792052255');
            }

            if (message.mentions.has(client.user.id)) {
                const isMentioningDeveloper = message.mentions.has('1419277675440115853');
                if (isMentioningDeveloper) {
                    await message.react('1452843675792052255');
                }
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    });
};
