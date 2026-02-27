/**
 * Format scraped data into MONPlayer provider JSON (VBTV-compatible)
 */
export function formatForMONPlayer(scrapedData, provider) {
    const { channels } = scrapedData;

    // Group channels
    const groupMap = new Map();
    channels.forEach((ch) => {
        const gName = ch.isLive ? '🔴 LIVE' : (ch.group || 'Upcoming');
        if (!groupMap.has(gName)) groupMap.set(gName, []);

        const entry = {
            id: ch.id,
            name: ch.name,
            type: 'single',
            logo: ch.logo || '',
        };

        if (ch.blv) {
            entry.labels = [{
                text: `👨‍💼 BLV ${ch.blv}`,
                position: 'bottom-left',
                color: provider.color,
                text_color: '#ffffff',
            }];
        }

        // Stream URL for live matches
        if (ch.url) {
            entry.sources = [{
                contents: [{
                    streams: [{
                        id: 'default',
                        name: ch.blv ? `BLV ${ch.blv}` : 'Stream',
                        stream_links: [{
                            id: 'hls',
                            type: 'hls',
                            url: ch.url,
                        }],
                    }],
                }],
            }];
        } else {
            entry.sources = [];
            entry.enable_detail = false;
        }

        groupMap.get(gName).push(entry);
    });

    const groups = Array.from(groupMap.entries())
        .sort(([a], [b]) => {
            if (a.includes('LIVE')) return -1;
            if (b.includes('LIVE')) return 1;
            return a.localeCompare(b, 'vi');
        })
        .map(([name, chs]) => ({
            id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            name,
            channels: chs,
            display: 'vertical',
        }));

    return {
        id: provider.id,
        name: provider.name,
        description: provider.description,
        color: provider.color,
        url: '',
        image: { type: 'cover', url: provider.logo },
        groups,
        option: { save_history: false, save_search_history: false, save_wishlist: false },
    };
}
