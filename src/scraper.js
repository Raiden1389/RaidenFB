import CONFIG from './config.js';

/**
 * Fetch matches from GaVangTV API
 */
async function fetchMatches(queries = []) {
    const url = `${CONFIG.api.baseUrl}${CONFIG.api.endpoint}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: CONFIG.api.headers,
        body: JSON.stringify({ queries }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get all live matches
 */
async function getLiveMatches() {
    const result = await fetchMatches([
        { field: 'is_live', type: 'equal', value: true },
    ]);
    console.log(`  🔴 Live matches: ${result.total}`);
    return result.data || [];
}

/**
 * Get upcoming matches (next 24 hours)
 */
async function getUpcomingMatches() {
    const result = await fetchMatches([]);

    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = (result.data || []).filter((match) => {
        if (match.is_live) return false;
        const startDate = new Date(match.start_date);
        return startDate >= now && startDate <= next24h;
    });

    console.log(`  📅 Upcoming (24h): ${upcoming.length} / ${result.total} total in DB`);
    return upcoming;
}

/**
 * Detect category from match data
 */
function detectCategory(match) {
    const searchText = `${match.league || ''} ${match.desc || ''}`.toLowerCase();

    for (const [key, cat] of Object.entries(CONFIG.categories)) {
        if (key === 'other') continue;
        if (cat.keywords.some((kw) => searchText.includes(kw))) {
            return { key, ...cat };
        }
    }

    if ((match.desc || '').toUpperCase() === 'FOOTBALL') {
        return { key: 'football', ...CONFIG.categories.football };
    }

    return { key: 'other', ...CONFIG.categories.other };
}

/**
 * Build channel object from match data
 */
function buildChannel(match) {
    const category = detectCategory(match);
    const isLive = match.is_live && match.source_live;

    // Build title
    let title = '';
    if (match.is_live) {
        title += '🔴 ';
        if (match.team_1_score !== null && match.team_2_score !== null) {
            title += `${match.team_1} ${match.team_1_score}-${match.team_2_score} ${match.team_2}`;
        } else {
            title += `${match.team_1} vs ${match.team_2}`;
        }
    } else {
        const startDate = new Date(match.start_date);
        const timeStr = startDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh',
        });
        title += `⏰ ${timeStr} | ${match.team_1} vs ${match.team_2}`;
    }

    if (match.blv) title += ` 🎙${match.blv}`;

    const channel = {
        id: match.id,
        name: title,
        logo: match.team_1_logo || CONFIG.provider.logo,
        group: match.league || 'Khác',
        isLive: !!match.is_live,
        startTime: match.start_date,
    };

    if (isLive) {
        channel.url = match.source_live;
    }

    return channel;
}

/**
 * Main scrape function
 */
export async function scrapeAll() {
    console.log('\n🐔 GaVangTV Scraper Starting...');
    console.log(`📡 API: ${CONFIG.api.baseUrl}`);

    const [liveMatches, upcomingMatches] = await Promise.all([
        getLiveMatches(),
        getUpcomingMatches(),
    ]);

    // Deduplicate
    const allMap = new Map();
    liveMatches.forEach((m) => allMap.set(m.id, m));
    upcomingMatches.forEach((m) => { if (!allMap.has(m.id)) allMap.set(m.id, m); });

    const channels = Array.from(allMap.values()).map(buildChannel);

    // Sort: live first, then by start time
    channels.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return new Date(a.startTime) - new Date(b.startTime);
    });

    const liveCount = channels.filter((c) => c.isLive).length;

    console.log(`\n✅ Total: ${channels.length} | 🔴 Live: ${liveCount} | ⏰ Upcoming: ${channels.length - liveCount}`);

    return { channels, scrapedAt: new Date().toISOString(), stats: { total: channels.length, live: liveCount, upcoming: channels.length - liveCount } };
}
