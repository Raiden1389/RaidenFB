/**
 * Format scraped data into MONPlayer provider JSON (VBTV-compatible)
 */
const LEAGUE_FILTER = [
    'english premier league',
    'la liga',
    'champions league',
    'uefa champions league',
];

function isAllowedLeague(group) {
    if (!group) return false;
    const lower = group.toLowerCase();
    return LEAGUE_FILTER.some((f) => lower === f || lower.includes(f));
}

export function formatForMONPlayer(scrapedData, provider) {
    const { channels } = scrapedData;

    // Filter to allowed leagues
    const filtered = channels.filter((ch) => ch.isLive || isAllowedLeague(ch.group));

    // Group channels
    const groupMap = new Map();
    filtered.forEach((ch) => {
        const gName = ch.isLive ? '🔴 LIVE' : (ch.group || 'Upcoming');
        if (!groupMap.has(gName)) groupMap.set(gName, []);

        // Build card image URL
        const cardParams = new URLSearchParams({ t1: ch.name.split(' vs ')[0]?.split(' | ')[0] || '', t2: ch.name.split(' vs ')[1]?.split(' | ')[0] || '' });
        if (ch.isLive) cardParams.set('live', '1');
        if (ch.blv) cardParams.set('blv', ch.blv);
        if (ch.group) cardParams.set('lg', ch.group);
        if (ch.logo) cardParams.set('l1', ch.logo);
        cardParams.set('s', 'vs');
        const cardUrl = `https://raidenfb-card.vercel.app/api/card?${cardParams}`;

        const entry = {
            id: ch.id,
            name: ch.name,
            type: 'single',
            display: 'thumbnail-only',
            image: {
                display: 'cover',
                shape: 'rectangle',
                url: cardUrl,
                width: 600,
                height: 320,
            },
        };

        // Labels
        entry.labels = [];
        if (ch.isLive) {
            entry.labels.push({ text: '🔴 LIVE', position: 'top-left', color: '#ff0000', text_color: '#ffffff' });
        } else if (ch.startTime) {
            const d = new Date(ch.startTime);
            const t = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
            const day = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
            entry.labels.push({ text: `⏰ ${t} ${day}`, position: 'top-left', color: '#333333', text_color: '#ffffff' });
        }
        if (ch.blv) {
            entry.labels.push({ text: `👨‍💼 ${ch.blv}`, position: 'bottom-left', color: provider.color, text_color: '#ffffff' });
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
            grid_number: 1,
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
