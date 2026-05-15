const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

function hasCodeBlock(text) {
  return /```[\s\S]*?```/.test(text) || /`[^`]+`/.test(text);
}

function extractCode(text) {
  const codeBlocks = text.match(/```([\s\S]*?)```/g);
  if (codeBlocks) {
    return codeBlocks.map(block => block.replace(/```/g, '')).join('\n\n');
  }
  return null;
}

module.exports = {
  name: 'ask',
  aliases: ['ai', 'question'],
  category: 'info',
  cooldown: 3,
  usage: 'ask <question>',
  run: async (client, message, args) => {
    if (args.length === 0) {
      return message.reply(`Please provide a question! Usage: \`ask <your question>\``);
    }

    const question = args.join(' ');

    try {
      // Get API key
      const apiKey = process.env.GROQ_API_KEY || process.env.AI_INTEGRATIONS_GROQ_API_KEY;
      if (!apiKey) {
        return message.reply(`AI service is not configured`);
      }

      // Show loading state
      const loadingEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${client.emoji.process} Thinking...`);

      const loadingMsg = await message.reply({ embeds: [loadingEmbed] });

      // Call Groq API directly via HTTP
      let response;
      try {
        const groqResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'user',
                content: question
              }
            ],
            max_tokens: 1024
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        response = groqResponse.data.choices[0]?.message?.content || 'No response received';
      } catch (apiErr) {
        console.error('Groq API call error:', apiErr.response?.data || apiErr.message);
        const errorMsg = apiErr.response?.data?.error?.message || apiErr.message || 'Unknown API error';
        await loadingMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setDescription(`AI API error: ${errorMsg}`)
          ]
        });
        return;
      }

      // Check if response contains code
      const hasCode = hasCodeBlock(response);
      const code = hasCode ? extractCode(response) : null;

      // Split response if too long for embed
      const maxLength = 4096;
      let displayText = response;
      if (displayText.length > maxLength) {
        displayText = displayText.substring(0, maxLength - 3) + '...';
      }

      // Create response embed
      const responseEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTitle(`AI Response`)
        .setDescription(displayText)
        .setFooter({
          text: 'Powered by Groq AI',
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      // Create buttons
      const buttons = [];

      buttons.push(
        new ButtonBuilder()
          .setCustomId(`copy_response_${message.author.id}_${Date.now()}`)
          .setLabel('Copy Response')
          .setStyle(ButtonStyle.Secondary)
      );

      if (hasCode && code) {
        buttons.push(
          new ButtonBuilder()
            .setCustomId(`copy_code_${message.author.id}_${Date.now()}`)
            .setLabel('Copy Code')
            .setStyle(ButtonStyle.Success)
        );
      }

      const buttonRow = new ActionRowBuilder().addComponents(buttons);

      // Edit loading message with response
      await loadingMsg.edit({
        embeds: [responseEmbed],
        components: [buttonRow]
      });

      // Store response data for button handlers
      global.responseCache = global.responseCache || {};
      const cacheKey = `${message.author.id}_${Date.now()}`;
      global.responseCache[cacheKey] = {
        response: response,
        code: code,
        question: question,
        userId: message.author.id,
        expiresAt: Date.now() + 3600000
      };

      // Button interaction handler
      const collector = loadingMsg.createMessageComponentCollector({
        time: 3600000
      });

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: `Only ${message.author.tag} can use these buttons`,
            ephemeral: true
          });
        }

        const [action, userId, timestamp] = interaction.customId.split('_');
        const cache = global.responseCache[`${userId}_${timestamp}`];

        if (!cache) {
          return interaction.reply({
            content: `Response data expired`,
            ephemeral: true
          });
        }

        if (action === 'copy_response') {
          try {
            await interaction.reply({
              content: '```\n' + cache.response + '\n```',
              ephemeral: true
            });
          } catch (error) {
            const buffer = Buffer.from(cache.response, 'utf-8');
            await interaction.reply({
              files: [{ attachment: buffer, name: 'response.txt' }],
              ephemeral: true
            });
          }
        } else if (action === 'copy_code') {
          if (!cache.code) {
            return interaction.reply({
              content: `No code found in response`,
              ephemeral: true
            });
          }

          try {
            await interaction.reply({
              content: '```\n' + cache.code + '\n```',
              ephemeral: true
            });
          } catch (error) {
            const buffer = Buffer.from(cache.code, 'utf-8');
            await interaction.reply({
              files: [{ attachment: buffer, name: 'code.txt' }],
              ephemeral: true
            });
          }
        }
      });

      collector.on('end', () => {
        setTimeout(() => {
          delete global.responseCache[cacheKey];
        }, 3600000);
      });

    } catch (error) {
      console.error('Ask command error:', error.message);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription(`Error: ${error.message}`);

      return message.reply({ embeds: [errorEmbed] });
    }
  }
};
