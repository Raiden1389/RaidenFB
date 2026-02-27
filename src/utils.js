// ============================================================
// HTTP Utilities — Fetch with retry, timeout, error handling
// ============================================================

import { CONFIG } from './config.js';

/**
 * Fetch JSON from URL with retry logic
 */
export async function fetchJSON(url, options = {}) {
    const {
        timeout = CONFIG.scrape.timeout,
        retries = CONFIG.scrape.retries,
        retryDelay = CONFIG.scrape.retryDelay,
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': CONFIG.scrape.userAgent,
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
                },
            });

            clearTimeout(timer);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            return JSON.parse(text);
        } catch (err) {
            lastError = err;
            if (attempt < retries) {
                console.log(`  ⏳ Retry ${attempt + 1}/${retries} for ${url}...`);
                await sleep(retryDelay);
            }
        }
    }

    throw lastError;
}

/**
 * Sleep helper
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current time in Vietnam timezone
 */
export function vietnamTime() {
    return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}
