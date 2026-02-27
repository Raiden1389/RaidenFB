/**
 * CaKhiaTV Scraper — parse HTML + sportdb live scores
 */

const CAKHIA_URL = 'https://artbyciara.com/';
const SCORE_API = 'https://live.sportdb.live/api/v1/matchs/realtime';

async function fetchCakhiaHTML() {
    const res = await fetch(CAKHIA_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html',
            'Accept-Language': 'vi-VN,vi;q=0.9',
        },
    });
    if (!res.ok) throw new Error(`CaKhia ${res.status}`);
    return res.text();
}

async function fetchLiveScores() {
    try {
        const res = await fetch(SCORE_API);
        if (!res.ok) return {};
        const data = await res.json();
        const map = {};
        (data.result || []).forEach((s) => { map[s.id] = s; });
        return map;
    } catch { return {}; }
}

function parseMatchesFromHTML(html) {
    const match = html.match(/<script[^>]*id="matches-data"[^>]*>(\[.*?\])<\/script>/s);
    if (!match) throw new Error('CaKhia: no matches-data in HTML');
    return JSON.parse(match[1]);
}

export async function scrapeCakhia(provider) {
    console.log(`\n  📡 CaKhiaTV (${CAKHIA_URL})`);

    const [html, scores] = await Promise.all([
        fetchCakhiaHTML(),
        fetchLiveScores(),
    ]);

    const data = parseMatchesFromHTML(html);
    console.log(`    📦 Raw matches: ${data.length}`);

    const channels = data.map((m) => {
        const md = m.match_data || {};
        const anchors = md.anchors || [];
        const anchor = anchors[0] || {};
        const streamUrl = anchor.uid ? `https://live.inplyr.com/room/${anchor.uid}.m3u8` : '';
        const blv = anchor.nickName || '';

        // Check live score
        const liveScore = scores[m.ls_id];
        const isLive = !!(liveScore && (liveScore.status === 'inprogress' || liveScore.status === 'playing'));
        const team1Score = liveScore?.home_score ?? null;
        const team2Score = liveScore?.away_score ?? null;

        let title = '';
        if (isLive && team1Score !== null && team2Score !== null) {
            title = `${m.home_name} ${team1Score} - ${team2Score} ${m.away_name}`;
        } else {
            title = `${m.home_name} vs ${m.away_name}`;
        }

        if (blv) title += ` | ${blv}`;

        return {
            id: m.id,
            name: title,
            logo: md.home_logo || '',
            group: md.competition_full || 'Other',
            isLive,
            startTime: m.time ? new Date(m.time * 1000).toISOString() : '',
            blv,
            url: streamUrl,
        };
    });

    // Sort: live first, then by time
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
