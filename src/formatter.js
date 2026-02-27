/**
 * Format scraped data into MONPlayer JSON (VBTV format)
 */
export function formatForMONPlayer(scrapedData, provider) {
    const { channels, scrapedAt } = scrapedData;

    const groupMap = new Map();
    channels.forEach((ch) => {
        const gName = ch.isLive ? '🔴 LIVE' : (ch.group || 'Other');
        if (!groupMap.has(gName)) groupMap.set(gName, []);

        const entry = { id: ch.id, name: ch.name, logo: ch.logo || '' };
        if (ch.url) {
            entry.sources = [{
                contents: [{
                    streams: [{
                        id: 'default',
                        name: ch.name,
                        remote_data: { url: ch.url }
                    }]
                }]
            }];
        }
        groupMap.get(gName).push(entry);
    });

    const groups = Array.from(groupMap.entries())
        .sort(([a], [b]) => {
            if (a.includes('LIVE')) return -1;
            if (b.includes('LIVE')) return 1;
            return a.localeCompare(b, 'vi');
        })
        .map(([name, chs]) => ({ name, channels: chs }));

    return {
        id: provider.id,
        name: provider.name,
        description: provider.description,
        color: provider.color,
        url: '',
        image: { type: 'cover', url: provider.logo },
        groups,
    };
}
