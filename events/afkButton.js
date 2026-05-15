module.exports = async (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        
        // AFK buttons removed - system now uses instant DMs
        // No button interactions needed for AFK system
    });
};
