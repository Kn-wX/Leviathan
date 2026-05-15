const { 
    MessageFlags, 
    TextDisplayBuilder, 
    ContainerBuilder, 
    SectionBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

module.exports = {
    name: 'thelp',
    aliases: ['th'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        const prefix = message.guild?.prefix || '&';

        // 1. Initial Loading Message (Basic V2 Container)
        const loadingText = new TextDisplayBuilder().setContent('**Loading help menu...**');
        const loadingContainer = new ContainerBuilder().addComponents(loadingText);
        
        const loadingMessage = await message.channel.send({
            components: [loadingContainer],
            flags: MessageFlags.IsComponentsV2
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        // 2. Components Setup (Select Menus & Buttons)
        const mainCategories = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('mainCategories')
                .setPlaceholder('Main Modules')
                .addOptions([
                    { label: 'All Commands', value: 'all', description: 'Show all available commands', emoji: '📂' },
                    { label: 'AntiNuke', value: 'antinuke', description: 'Server protection commands', emoji: '🛡️' },
                    { label: 'Moderation', value: 'mod', description: 'Moderation tools', emoji: '🔨' },
                    { label: 'Utility', value: 'info', description: 'Utility commands', emoji: '⚙️' },
                    { label: 'Sticky Messages', value: 'sticky', description: 'Sticky message system', emoji: '📌' },
                    { label: 'Welcomer', value: 'welcomer', description: 'Welcome/goodbye system', emoji: '👋' }
                ])
        );

        const extraFeatures = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('extraFeatures')
                .setPlaceholder('Extra Features')
                .addOptions([
                    { label: 'Logging', value: 'logging', description: 'Server logging system', emoji: '📑' },
                    { label: 'Automod', value: 'automod', description: 'Automatic moderation', emoji: '🤖' },
                    { label: 'Custom Role', value: 'customrole', description: 'Custom role management', emoji: '🎭' },
                    { label: 'Autoresponder', value: 'autoresponder', description: 'Automatic responses', emoji: '💬' },
                    { label: 'Ticket', value: 'ticket', description: 'Ticket system', emoji: '🎟️' },
                    { label: 'Fun', value: 'fun', description: 'Fun commands', emoji: '🎈' }
                ])
        );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Support Server').setStyle(ButtonStyle.Link).setURL('https://discord.gg/W2bgPVMnEg'),
            new ButtonBuilder().setLabel('Home').setCustomId('homeButton').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel('Delete').setCustomId('deleteButton').setStyle(ButtonStyle.Danger)
        );

        // 3. Main V2 Dashboard Layout
        const authorSection = new SectionBuilder()
            .setContent(`**${client.user.username} Help Menu** ${client.user.displayAvatarURL()}`);

        const mainDisplay = new TextDisplayBuilder()
            .setContent(
                `**Hey there! I'm ${client.user.username}, ready to protect and serve your server!**\n\n` +
                `• **Prefix:** \`${prefix}\`\n` +
                `• **Total Commands:** \`${client.commands.size}\`\n\n` +
                `**Quick Start:**\n` +
                `\`${prefix}antinuke enable\` - Activate protection\n` +
                `\`${prefix}help <command>\` - Command info\n\n` +
                `*Select a category below to explore commands*`
            );

        const footerDisplay = new TextDisplayBuilder()
            .setContent(`**Developed by Team Vorlentis**`);

        const mainContainer = new ContainerBuilder()
            .addComponents(authorSection, mainDisplay, footerDisplay);

        // Update to Main Menu
        await loadingMessage.edit({
            components: [mainContainer, mainCategories, extraFeatures, buttons],
            flags: MessageFlags.IsComponentsV2
        });

        // 4. Collector Handling
        const collector = loadingMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'deleteButton') return await loadingMessage.delete();

            if (i.customId === 'homeButton') {
                return await i.update({
                    components: [mainContainer, mainCategories, extraFeatures, buttons],
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const category = i.values[0];
            let title = '';
            let commandText = '';

            // Category Logic
            if (category === 'all') {
                title = 'All Commands';
                commandText = client.commands.map(cmd => `\`${cmd.name}\``).join(', ');
            } else {
                title = `${category.charAt(0).toUpperCase() + category.slice(1)} Module`;
                const filtered = client.commands.filter(cmd => cmd.category === category || cmd.category === category.replace('mod', 'moderation'));
                commandText = filtered.size > 0 
                    ? filtered.map(cmd => `\`${cmd.name}\``).join(', ') 
                    : 'No commands found in this category.';
            }

            // Create Category V2 View
            const categoryText = new TextDisplayBuilder()
                .setContent(`## ❯ ${title}\n\n${commandText}\n\n*Use ${prefix}help <command> for details*`);

            const categoryContainer = new ContainerBuilder().addComponents(categoryText);

            await i.update({
                components: [categoryContainer, mainCategories, extraFeatures, buttons],
                flags: MessageFlags.IsComponentsV2
            });
        });

        collector.on('end', async () => {
            if (loadingMessage.editable) {
                // Optional: Strip components or disable them on timeout
                await loadingMessage.edit({ components: [] }).catch(() => {});
            }
        });
    }
};
