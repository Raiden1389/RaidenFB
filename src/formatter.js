import CONFIG from './config.js';

/**
 * Format scraped data into MONPlayer JSON
 */
export function formatForMONPlayer(scrapedData) {
    const { channels, scrapedAt, stats } = scrapedData;

    // Group channels by league
    const groupMap = new Map();

    channels.forEach((ch) => {
        const groupName = ch.isLive ? '🔴 ĐANG PHÁT TRỰC TIẾP' : (ch.group || 'Khác');

        if (!groupMap.has(groupName)) {
            groupMap.set(groupName, []);
        }

        const monChannel = {
            id: ch.id,
            name: ch.name,
            logo: ch.logo || '',
            group: groupName,
        };

        if (ch.url) {
            monChannel.url = ch.url;
        }

        groupMap.get(groupName).push(monChannel);
    });

    // Sort groups: Live first
    const sortedGroups = Array.from(groupMap.entries())
        .sort(([a], [b]) => {
            if (a.includes('ĐANG PHÁT')) return -1;
            if (b.includes('ĐANG PHÁT')) return 1;
            return a.localeCompare(b, 'vi');
        })
        .map(([name, chs]) => ({ name, channels: chs }));

    return {
        provider: { ...CONFIG.provider },
        updated_at: scrapedAt,
        stats,
        groups: sortedGroups,
    };
}
