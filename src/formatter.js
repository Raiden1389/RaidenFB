/**
 * Format scraped data into MONPlayer JSON
 */
export function formatForMONPlayer(scrapedData, provider) {
    const { channels, scrapedAt, stats } = scrapedData;

    const monChannels = channels.map((ch) => {
        const entry = {
            id: ch.id,
            name: ch.name,
            logo: ch.logo || '',
            group: ch.isLive ? '🔴 LIVE' : (ch.group || 'Other'),
        };
        if (ch.url) entry.url = ch.url;
        return entry;
    });

    return {
        name: provider.name,
        author: 'RaidenFB',
        channels: monChannels,
    };
}
