/**
 * Format scraped data into MONPlayer JSON
 */
export function formatForMONPlayer(scrapedData, provider) {
    const { channels, scrapedAt, stats } = scrapedData;

    const groupMap = new Map();
    channels.forEach((ch) => {
        const groupName = ch.isLive ? '🔴 ĐANG PHÁT TRỰC TIẾP' : (ch.group || 'Other');
        if (!groupMap.has(groupName)) groupMap.set(groupName, []);

        const monCh = { id: ch.id, name: ch.name, logo: ch.logo, group: groupName };
        if (ch.url) monCh.url = ch.url;
        groupMap.get(groupName).push(monCh);
    });

    const groups = Array.from(groupMap.entries())
        .sort(([a], [b]) => {
            if (a.includes('ĐANG PHÁT')) return -1;
            if (b.includes('ĐANG PHÁT')) return 1;
            return a.localeCompare(b, 'vi');
        })
        .map(([name, chs]) => ({ name, channels: chs }));

    return { provider, updated_at: scrapedAt, stats, groups };
}
