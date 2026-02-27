# ⚽ RaidenFB

Live football streams auto-scraped from GaVangTV → MONPlayer-compatible JSON.

## 🚀 How it works

1. Scrapes **GaVangTV API** every 15 minutes via GitHub Actions
2. Outputs `public/index.json` with live + upcoming matches
3. Deploys to GitHub Pages automatically
4. Add the URL as a source in **MONPlayer**

## 📱 MONPlayer Source URL

```
https://YOUR_USERNAME.github.io/RaidenFB/index.json
```

## 🛠️ Manual Run

```bash
node src/index.js
```

Output → `public/index.json`

## 📡 API Source

- **GaVangTV API**: `https://api-gavang.gvtv1.com/matches/graph`
- **Stream CDN**: `live.alilicloud.com` (HLS `.m3u8`)

## 📊 Data

| Field | Description |
|-------|-------------|
| 🔴 Live matches | With HLS stream URLs |
| ⏰ Upcoming | Next 24 hours with kick-off time |
| 🎙 BLV | Vietnamese commentators |
| 🏆 Leagues | Auto-grouped by league |
