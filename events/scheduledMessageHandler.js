const ScheduledMessage = require('../models/scheduledmessage');

module.exports = async (client) => {
    setInterval(async () => {
        const now = new Date();
        const messages = await ScheduledMessage.find({ scheduledTime: { $lte: now }, sent: false });

        for (const msg of messages) {
            try {
                const channel = client.channels.cache.get(msg.channelId);
                if (!channel) continue;

                await channel.send(msg.message);

                if (msg.recurring.enabled) {
                    const nextTime = new Date(msg.scheduledTime);
                    if (msg.recurring.interval === 'daily') {
                        nextTime.setDate(nextTime.getDate() + 1);
                    } else if (msg.recurring.interval === 'weekly') {
                        nextTime.setDate(nextTime.getDate() + 7);
                    } else if (msg.recurring.interval === 'monthly') {
                        nextTime.setMonth(nextTime.getMonth() + 1);
                    }

                    msg.scheduledTime = nextTime;
                    msg.sent = false;
                } else {
                    msg.sent = true;
                }

                await msg.save();
            } catch (error) {
                console.error('Error sending scheduled message:', error);
            }
        }
    }, 60 * 1000);
};
