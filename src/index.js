import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeAll } from './scraper.js';
import { formatForMONPlayer } from './formatter.js';
import CONFIG from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    console.log('='.repeat(50));
    console.log('🐔 GaVangTV → MONPlayer IPTV Scraper');
    console.log(`⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    console.log('='.repeat(50));

    const scrapedData = await scrapeAll();
    const monPlayerJson = formatForMONPlayer(scrapedData);

    // Write output
    const outputDir = path.resolve(__dirname, '..', CONFIG.output.dir);
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, CONFIG.output.filename);
    fs.writeFileSync(outputPath, JSON.stringify(monPlayerJson, null, 2), 'utf-8');

    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    const totalCh = monPlayerJson.groups.reduce((s, g) => s + g.channels.length, 0);

    console.log(`\n📁 Output: ${outputPath}`);
    console.log(`📦 Size: ${sizeKB} KB`);
    console.log(`📺 Groups: ${monPlayerJson.groups.length} | Channels: ${totalCh}`);
    console.log('\n✅ Done! Upload to GitHub → add source URL in MONPlayer');
}

main().catch((err) => {
    console.error('\n💀 Fatal:', err.message);
    process.exit(1);
});
