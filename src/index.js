import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SOURCES from './config.js';
import { scrapeSource } from './scraper.js';
import { formatForMONPlayer } from './formatter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '..', 'public');

async function processSource(key, source) {
    console.log(`\n🔧 [${key}] ${source.name}`);

    const data = await scrapeSource(source);
    const json = formatForMONPlayer(data, source.provider);

    // Output: public/{key}/index.json
    const outDir = path.join(PUBLIC, source.output);
    fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, 'index.json');
    fs.writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf-8');

    const size = (fs.statSync(outPath).size / 1024).toFixed(1);
    const total = json.groups.reduce((s, g) => s + g.channels.length, 0);
    console.log(`    📁 ${outPath} (${size} KB, ${total} channels)`);
}

async function main() {
    console.log('='.repeat(50));
    console.log('⚽ RaidenFB Multi-Source Scraper');
    console.log(`⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    console.log('='.repeat(50));

    const enabled = Object.entries(SOURCES).filter(([, s]) => s.enabled);
    console.log(`📡 Sources: ${enabled.map(([k]) => k).join(', ')}`);

    for (const [key, source] of enabled) {
        try {
            await processSource(key, source);
        } catch (err) {
            console.error(`  ❌ [${key}] Failed: ${err.message}`);
        }
    }

    console.log('\n✅ All done!');
}

main().catch((e) => { console.error('💀', e.message); process.exit(1); });
