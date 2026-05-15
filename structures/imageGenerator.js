const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = async () => {
    try {
        const backgroundPath = path.join(__dirname, '../images/background.png');
        const outputPath = path.join(__dirname, '../images/leviathan_embed.png');

        // Note: For text rendering without canvas, sharp can use SVG overlays.
        // This is a more performant way to handle images in cloud environments.
        const width = 1200;
        const height = 400;

        const svgText = `
        <svg width="${width}" height="${height}">
            <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#001F3F;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#41729F;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#E1F1FF;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="12" />
                    <feOffset dx="4" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.8" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-weight="bold" font-size="75" text-anchor="middle" dominant-baseline="middle" fill="url(#textGradient)" filter="url(#shadow)">LEVIATHAN</text>
            <text x="50%" y="85%" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#FFFFFF">Versatile Bot</text>
        </svg>`;

        const roundedCorners = Buffer.from(
            `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="30" ry="30"/></svg>`
        );

        await sharp(backgroundPath)
            .resize(width, height)
            .composite([
                { input: roundedCorners, blend: 'dest-in' },
                { input: Buffer.from(svgText), top: 0, left: 0 }
            ])
            .png()
            .toFile(outputPath);

        return outputPath;
    } catch (error) {
        console.error('Error generating image:', error);
        return null;
    }
};
