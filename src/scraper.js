/**
 * Generic scraper - works with any source config
 */

async function fetchMatches(api, queries = []) {
    const url = `${api.baseUrl}${api.endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: api.headers,
        body: JSON.stringify({ queries }),
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
}

async function getLiveMatches(api) {
    const result = await fetchMatches(api, [
        { field: 'is_live', type: 'equal', value: true },
    ]);
    console.log(`    🔴 Live: ${result.total}`);
    return result.data || [];
}

async function getUpcomingMatches(api) {
    const result = await fetchMatches(api, []);
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = (result.data || []).filter((m) => {
        if (m.is_live) return false;
        const d = new Date(m.start_date);
        return d >= now && d <= next24h;
    });

    console.log(`    📅 Upcoming: ${upcoming.length}`);
    return upcoming;
}

function buildChannel(match) {
    const isLive = match.is_live && match.source_live;

    let title = '';
    if (match.is_live) {
        title += '🔴 ';
        if (match.team_1_score !== null && match.team_2_score !== null) {
            title += `${match.team_1} ${match.team_1_score}-${match.team_2_score} ${match.team_2}`;
        } else {
            title += `${match.team_1} vs ${match.team_2}`;
        }
    } else {
        const d = new Date(match.start_date);
        const t = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
        title += `⏰ ${t} | ${match.team_1} vs ${match.team_2}`;
    }

    if (match.blv) title += ` 🎙${match.blv}`;

    const ch = {
        id: match.id,
        name: title,
        logo: match.team_1_logo || '',
        group: match.league || 'Other',
        isLive: !!match.is_live,
        startTime: match.start_date,
    };

    if (isLive) ch.url = match.source_live;
    return ch;
}

/**
 * Scrape a single source
 */
export async function scrapeSource(source) {
    console.log(`\n  📡 ${source.name} (${source.api.baseUrl})`);

    const [live, upcoming] = await Promise.all([
        getLiveMatches(source.api),
        getUpcomingMatches(source.api),
    ]);

    const allMap = new Map();
    live.forEach((m) => allMap.set(m.id, m));
    upcoming.forEach((m) => { if (!allMap.has(m.id)) allMap.set(m.id, m); });

    const channels = Array.from(allMap.values()).map(buildChannel);
    channels.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return new Date(a.startTime) - new Date(b.startTime);
    });

    const liveCount = channels.filter((c) => c.isLive).length;
    console.log(`    ✅ Total: ${channels.length} | Live: ${liveCount} | Upcoming: ${channels.length - liveCount}`);

    return {
        channels,
        scrapedAt: new Date().toISOString(),
        stats: { total: channels.length, live: liveCount, upcoming: channels.length - liveCount },
    };
}
