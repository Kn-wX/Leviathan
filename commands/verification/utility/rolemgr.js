const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rolemgr',
    usage: 'Manage rolemgr settings',
    category: 'utility',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Roles\` permission!`)]
            });
        }

        const roles = message.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle('Role Hierarchy')
            .setDescription(roles.map((role, i) => `**${i + 1}.** ${role} - Position: ${role.position}`).join('\n'))
            .addFields(
                { name: 'Total Roles:', value: `${message.guild.roles.cache.size}` }
            );

        message.reply({ embeds: [embed] });
    }
};
