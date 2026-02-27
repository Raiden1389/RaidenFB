// Config
const _e = 'api-gavang';
const _h = 'gvtv1.com';
const _p = '/matches/graph';
const _r = 'xem1.gavang05.live';

const CONFIG = {
    api: {
        baseUrl: `https://${_e}.${_h}`,
        endpoint: _p,
        headers: {
            'Content-Type': 'application/json',
            'Referer': `https://${_r}/`,
            'Origin': `https://${_r}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
    },
    provider: {
        id: 'rfb',
        name: '⚽ RaidenFB',
        description: 'Sports data feed',
        color: '#FFD700',
        logo: 'https://cdn.fastestcdn-global.com/seo-gavangtv-v4/icons/logo.png',
    },
    output: { dir: 'public', filename: 'index.json' },
};

export default CONFIG;
