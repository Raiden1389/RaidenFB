// Sources config
const _e = 'api-gavang';
const _h = 'gvtv1.com';
const _r = 'xem1.gavang05.live';

const SOURCES = {
    gavang: {
        name: 'GaVangTV',
        api: {
            baseUrl: `https://${_e}.${_h}`,
            endpoint: '/matches/graph',
            headers: {
                'Content-Type': 'application/json',
                'Referer': `https://${_r}/`,
                'Origin': `https://${_r}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        },
        provider: {
            id: 'gavang',
            name: '⚽ GaVangTV',
            description: 'Trực tiếp bóng đá GaVangTV',
            color: '#FFD700',
            logo: 'https://cdn.fastestcdn-global.com/seo-gavangtv-v4/icons/logo.png',
        },
        output: 'gavang',
        enabled: true,
    },

    hoiquan: {
        name: 'HoiQuanTV',
        api: {
            baseUrl: '', // TODO: fill khi tìm được API
            endpoint: '',
            headers: {},
        },
        provider: {
            id: 'hoiquan',
            name: '⚽ HoiQuanTV',
            description: 'Trực tiếp bóng đá HoiQuanTV',
            color: '#FF4444',
            logo: '',
        },
        output: 'hoiquan',
        enabled: false, // Bật khi có API
    },

    cakhia: {
        name: 'CaKhiaTV',
        api: {}, // HTML scraper, no API
        provider: {
            id: 'cakhia',
            name: '⚽ CaKhiaTV',
            description: 'Trực tiếp bóng đá CaKhia TV',
            color: '#ff6600',
            logo: 'https://cakhia.ink/favicon.ico',
        },
        output: 'cakhia',
        enabled: true,
    },
};

export default SOURCES;
