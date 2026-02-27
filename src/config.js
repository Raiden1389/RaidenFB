// GaVangTV IPTV Scraper Configuration
const CONFIG = {
    // GaVangTV API
    api: {
        baseUrl: 'https://api-gavang.gvtv1.com',
        endpoints: {
            matches: '/matches/graph',
        },
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://xem1.gavang05.live/',
            'Origin': 'https://xem1.gavang05.live',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
    },

    // MONPlayer provider info
    provider: {
        id: 'gavangtv-scraper',
        name: '⚽ GaVangTV Live',
        description: 'Trực tiếp bóng đá từ GaVangTV - Auto updated',
        color: '#FFD700',
        logo: 'https://cdn.fastestcdn-global.com/seo-gavangtv-v4/icons/logo.png',
    },

    // Output
    output: {
        dir: 'public',
        filename: 'index.json',
    },

    // Category mapping
    categories: {
        football: { emoji: '⚽', keywords: ['football', 'soccer', 'premier', 'liga', 'serie', 'bundesliga', 'ligue', 'champions', 'europa', 'cup', 'campeonato', 'super league'] },
        basketball: { emoji: '🏀', keywords: ['basketball', 'nba', 'euroleague'] },
        tennis: { emoji: '🎾', keywords: ['tennis', 'atp', 'wta'] },
        esports: { emoji: '🎮', keywords: ['esport', 'lol', 'dota', 'csgo', 'valorant'] },
        other: { emoji: '🏆', keywords: [] },
    },
};

export default CONFIG;
