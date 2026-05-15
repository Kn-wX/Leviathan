const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'restart',
    usage: 'Manage restart settings',
    aliases: ['reboot', 'rs'],
    category: 'owner',
    run: async (client, message, args) => {
        if (!client.config.owner.includes(message.author.id)) return;

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`${client.emoji.tick} | Restarting the bot... Please wait.`);

        await message.channel.send({ embeds: [embed] });

        client.logger.log(`Bot restart initiated by ${message.author.tag}`, 'warn');

        setTimeout(async () => {
            try {
                await client.destroy();
                process.exit(0);
            } catch (error) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | Failed to restart: ${error.message}`);
                
                await message.channel.send({ embeds: [errorEmbed] });
            }
        }, 1000);
    }
};
