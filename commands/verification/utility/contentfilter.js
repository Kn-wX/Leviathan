const { EmbedBuilder } = require('discord.js');
const ContentFilter = require('../../models/contentfilter');

module.exports = {
    name: 'contentfilter',
    usage: 'Manage contentfilter settings',
    category: 'utility',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You need \`Manage Guild\` permission!`)]
            });
        }

        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            const filter = await ContentFilter.findOne({ guildId: message.guildId });
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('Content Filter Settings')
                .setDescription('Current filter configuration')
                .addFields(
                    { name: 'URLs Filter:', value: filter?.filters.urls ? 'Enabled' : 'Disabled' },
                    { name: 'Invites Filter:', value: filter?.filters.invites ? 'Enabled' : 'Disabled' },
                    { name: 'Toxicity Filter:', value: filter?.filters.toxicity ? 'Enabled' : 'Disabled' },
                    { name: 'Action:', value: filter?.action || 'delete' }
                );
            return message.reply({ embeds: [embed] });
        }

        if (subcommand === 'enable') {
            const filterType = args[1]?.toLowerCase();
            if (!['urls', 'invites', 'toxicity', 'spam'].includes(filterType)) {
                return message.reply({
                    embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Valid filters: urls, invites, toxicity, spam`)]
                });
            }

            let filter = await ContentFilter.findOne({ guildId: message.guildId });
            if (!filter) {
                filter = new ContentFilter({ guildId: message.guildId });
            }

            filter.filters[filterType] = true;
            await filter.save();

            message.reply({
                embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | \`${filterType}\` filter enabled!`)]
            });
        }
    }
};
