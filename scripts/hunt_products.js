
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Arguments
const args = process.argv.slice(2);
const query = args[0] || 'modern furniture';
const limit = 20;

console.log(`🔍 Hunting for: "${query}"...`);

const inferCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes('sofa') || t.includes('couch')) return 'sofa';
    if (t.includes('chair') || t.includes('seat')) return 'chair';
    if (t.includes('table') || t.includes('desk')) return 'table';
    if (t.includes('lamp') || t.includes('light')) return 'lamp';
    if (t.includes('rug') || t.includes('carpet')) return 'rug';
    return 'scraped';
};

// Helper to download image and return extension
const downloadImage = (url, filepathWithoutExt) => {
    return new Promise((resolve, reject) => {
        // Handle Base64 directly
        if (url.startsWith('data:image')) {
            const matches = url.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return reject(new Error('Invalid base64 string'));
            }
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fullPath = `${filepathWithoutExt}.${ext}`;
            fs.writeFileSync(fullPath, buffer);
            resolve(ext);
            return;
        }

        // Handle HTTPS URLs
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                 reject(new Error(`Failed to consume '${url}' status: ${response.statusCode}`));
                 return;
            }
            
            // Detect extension from Content-Type
            const contentType = response.headers['content-type'];
            let ext = 'jpg'; // Default
            if (contentType) {
                if (contentType.includes('webp')) ext = 'webp';
                else if (contentType.includes('png')) ext = 'png';
                else if (contentType.includes('jpeg')) ext = 'jpg';
                else if (contentType.includes('gif')) ext = 'gif';
            }

            const fullPath = `${filepathWithoutExt}.${ext}`;
            const file = fs.createWriteStream(fullPath);
            
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(ext));
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

(async () => {
    // Launch with evasion args
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
        ]
    });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`, {
        waitUntil: 'networkidle2'
    });

    try {
        await page.evaluate(async () => {
            window.scrollBy(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2000));
        });
    } catch (e) { console.log("Scroll error ignored"); }

    const products = await page.evaluate((limit, query) => {
        const results = [];
        const images = Array.from(document.querySelectorAll('img'));
        
        for (let img of images) {
            if (img.src && (img.src.startsWith('http') || img.src.startsWith('data:image'))) {
                if (img.width > 50 && img.height > 50) {
                     results.push({
                        image: img.src,
                        name: (img.alt || query).substring(0, 40),
                        store: 'Google Search',
                        price: 0,
                     });
                }
            }
            if (results.length >= limit) break;
        }
        return results;
    }, limit, query);

    await browser.close();

    console.log(`✅ Found ${products.length} potential products.`);

    if (products.length === 0) return;

    // --- Persistence & Downloading Logic ---

    // 1. Prepare Directories
    const dataDir = path.join(__dirname, '../src/data');
    const publicImgDir = path.join(__dirname, '../public/products/scraped');
    
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(publicImgDir)) fs.mkdirSync(publicImgDir, { recursive: true });

    const outputPath = path.join(dataDir, 'imported_products.json');

    // 2. Read Existing
    let existingData = [];
    if (fs.existsSync(outputPath)) {
        try {
            existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        } catch (e) {
            console.error("Error reading existing data, starting fresh.");
        }
    }

    // 3. Process & Download Images
    console.log("⬇️  Downloading images...");
    
    const newItems = [];
    
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const id = `scraped-${Date.now()}-${i}`;
        const localPathBase = path.join(publicImgDir, id);

        try {
            // downloadImage now appends the extension and returns it
            const ext = await downloadImage(p.image, localPathBase);
            const fileName = `${id}.${ext}`;
            const publicUrl = `/products/scraped/${fileName}`;
            
            newItems.push({
                id: id,
                name: p.name || `Item ${i}`,
                price: p.price,
                image: publicUrl, // Reference LOCAL path with correct extension
                category: inferCategory(query), 
                store: p.store,
                dimensions: { width: 1.5, depth: 0.8, height: 0.8 },
                rotation: 0
            });
        } catch (err) {
            console.error(`❌ Failed to download image for ${p.name}: ${err.message}`);
        }
    }

    // 4. Merge & Save
    // Filter duplicates by name since URLs change
    const existingNames = new Set(existingData.map(p => p.name));
    const uniqueNewItems = newItems.filter(p => !existingNames.has(p.name));

    if (uniqueNewItems.length === 0) {
        console.log("⚠️ No unique items found.");
    } else {
        const finalData = [...uniqueNewItems, ...existingData];
        fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
        console.log(`💾 Saved ${uniqueNewItems.length} new items locally.`);
        console.log(`📚 Total Library Size: ${finalData.length} items`);
    }

})();
