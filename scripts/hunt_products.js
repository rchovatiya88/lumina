
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---

const THEMES = {
    japandi: [
        { query: 'japandi low profile sofa cream linen', category: 'sofa', priceRange: [1200, 3500] },
        { query: 'japandi wood coffee table organic shape', category: 'table', priceRange: [300, 900] },
        { query: 'japandi wool area rug beige textured', category: 'rug', priceRange: [200, 800] },
        { query: 'noguchi style paper floor lamp', category: 'lamp', priceRange: [150, 400] },
        { query: 'minimalist beige abstract canvas art', category: 'decor', priceRange: [80, 250] },
        { query: 'japandi dining chair wood weave', category: 'chair', priceRange: [180, 450] }
    ],
    industrial: [
        { query: 'cognac leather sofa modern industrial', category: 'sofa', priceRange: [1500, 4000] },
        { query: 'industrial concrete coffee table metal legs', category: 'table', priceRange: [400, 1100] },
        { query: 'distressed vintage turkish rug dark', category: 'rug', priceRange: [150, 600] },
        { query: 'black metal floor lamp industrial', category: 'lamp', priceRange: [100, 300] },
        { query: 'industrial metal shelving unit', category: 'decor', priceRange: [200, 600] },
        { query: 'black leather arm chair metal frame', category: 'chair', priceRange: [300, 900] }
    ],
    boho: [
        { query: 'boho rattan sofa daybed', category: 'sofa', priceRange: [800, 1800] },
        { query: 'moroccan pouf leather ottoman', category: 'chair', priceRange: [100, 300] },
        { query: 'colorful vintage kilim rug', category: 'rug', priceRange: [150, 700] },
        { query: 'rattan pendant light', category: 'lamp', priceRange: [80, 250] },
        { query: 'macrame wall hanging large', category: 'decor', priceRange: [40, 150] },
        { query: 'peacock chair rattan', category: 'chair', priceRange: [200, 600] }
    ],
    modern: [
        { query: 'curved velvet sofa boucle white', category: 'sofa', priceRange: [1800, 5000] },
        { query: 'travertine coffee table', category: 'table', priceRange: [600, 1500] },
        { query: 'modern geometric wool rug', category: 'rug', priceRange: [300, 1200] },
        { query: 'modern brass floor lamp globe', category: 'lamp', priceRange: [200, 600] },
        { query: 'modern sculptural vase ceramic', category: 'decor', priceRange: [50, 200] },
        { query: 'boucle accent chair swivel', category: 'chair', priceRange: [400, 1200] }
    ],
    mcm: [
        { query: 'mid century modern walnut sideboard', category: 'table', priceRange: [800, 2500] },
        { query: 'eames style lounge chair black leather', category: 'chair', priceRange: [800, 1500] },
        { query: 'mid century modern tripod floor lamp', category: 'lamp', priceRange: [150, 400] },
        { query: 'geometric mid century rug orange', category: 'rug', priceRange: [200, 600] },
        { query: 'mid century modern sofa tapered legs', category: 'sofa', priceRange: [1000, 3000] },
        { query: 'sunburst clock mid century', category: 'decor', priceRange: [100, 300] }
    ],
    scandi: [
        { query: 'scandinavian light wood dining table', category: 'table', priceRange: [500, 1500] },
        { query: 'wishbone chair natural wood', category: 'chair', priceRange: [200, 600] },
        { query: 'scandi grey wool rug woven', category: 'rug', priceRange: [150, 500] },
        { query: 'minimalist white pendant light', category: 'lamp', priceRange: [100, 300] },
        { query: 'scandinavian ceramic vase set', category: 'decor', priceRange: [40, 150] },
        { query: 'light grey fabric sofa wooden legs', category: 'sofa', priceRange: [800, 2000] }
    ]
};

const STORES = ['West Elm', 'CB2', 'Crate & Barrel', 'Anthropologie', 'Lulu and Georgia', 'Wayfair', 'AllModern', 'Article'];

// --- Helpers ---

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomStore = () => STORES[Math.floor(Math.random() * STORES.length)];

const downloadImage = (url, filepathWithoutExt) => {
    return new Promise((resolve, reject) => {
        if (url.startsWith('data:image')) {
            const matches = url.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) return reject(new Error('Invalid base64'));
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            fs.writeFileSync(`${filepathWithoutExt}.${ext}`, buffer);
            resolve(ext);
            return;
        }

        const req = https.get(url, (res) => {
            if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
            
            const contentType = res.headers['content-type'] || '';
            let ext = 'jpg';
            if (contentType.includes('webp')) ext = 'webp';
            else if (contentType.includes('png')) ext = 'png';
            
            const file = fs.createWriteStream(`${filepathWithoutExt}.${ext}`);
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(ext));
            });
        });
        
        req.on('error', (err) => reject(err));
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
};

// --- Main ---

(async () => {
    // 1. Determine Theme
    const args = process.argv.slice(2);
    const themeKey = args[0] ? args[0].toLowerCase() : 'modern';
    
    // Fallback to "search" if theme not found
    let huntList = [];
    if (THEMES[themeKey]) {
        console.log(`🎨 Theme selected: ${themeKey.toUpperCase()}`);
        huntList = THEMES[themeKey];
    } else {
        console.log(`🔍 Custom search: "${args.join(' ')}"`);
        huntList = [{ query: args.join(' '), category: 'scraped', priceRange: [100, 1000] }];
    }

    // 2. Setup Browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const productsFound = [];

    // 3. Hunt Loop
    for (const item of huntList) {
        console.log(`   Hunting for: ${item.query}...`);
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Search Google Images
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(item.query)}&tbm=isch`, { waitUntil: 'networkidle2' });

        // Scroll a bit
        await page.evaluate(async () => {
            window.scrollBy(0, 1000);
            await new Promise(r => setTimeout(r, 1000));
        });

        // Extract Candidate Images
        const candidates = await page.evaluate(() => {
            // Google Images specific selector
            // 'rg_i' is the classic class for grid images
            const imgs = Array.from(document.querySelectorAll('img.rg_i, img.Q4LuWd'));
            
            return imgs
                .filter(img => img.src && img.src.startsWith('http')) // Only HTTP images (skip base64 previews if possible, or accept them)
                .slice(0, 8)
                .map(img => ({
                    src: img.src,
                    alt: img.alt || ''
                }));
        });
        
        // If selectors fail, fallback to all images
        if (candidates.length === 0) {
             const allImgs = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('img'))
                    .filter(img => img.width > 150 && img.height > 150)
                    .slice(0, 8)
                    .map(img => ({ src: img.src, alt: img.alt || '' }));
             });
             productsFound.push(...allImgs.slice(0, 3).map((c, idx) => ({
                ...c,
                originalQuery: item.query,
                category: item.category,
                priceRange: item.priceRange
            })));
        } else {
             const selected = candidates.slice(0, 3).map((c, idx) => ({
                ...c,
                originalQuery: item.query,
                category: item.category,
                priceRange: item.priceRange
            }));
            productsFound.push(...selected);
        }
        await page.close();
    }

    await browser.close();
    console.log(`✅ Found ${productsFound.length} items total.`);

    // 4. Download & Persist
    const dataDir = path.join(__dirname, '../src/data');
    const publicImgDir = path.join(__dirname, '../public/products/scraped');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(publicImgDir)) fs.mkdirSync(publicImgDir, { recursive: true });

    const outputPath = path.join(dataDir, 'imported_products.json');
    let existingData = [];
    if (fs.existsSync(outputPath)) existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

    console.log("⬇️  Downloading images...");
    const newItems = [];

    for (let i = 0; i < productsFound.length; i++) {
        const p = productsFound[i];
        const id = `scraped-${Date.now()}-${i}`;
        const localPathBase = path.join(publicImgDir, id);

        try {
            const ext = await downloadImage(p.src, localPathBase);
            const fileName = `${id}.${ext}`;
            const publicUrl = `products/scraped/${fileName}`;

            // Generate realistic metadata
            const price = getRandomInt(p.priceRange[0], p.priceRange[1]);
            // Clean title: Remove special chars, keep it short
            let cleanName = p.alt.substring(0, 60).replace(/[^\w\s]/gi, '').trim();
            if (cleanName.length < 5) cleanName = p.originalQuery; // Fallback

            newItems.push({
                id: id,
                name: cleanName,
                price: price,
                image: publicUrl,
                category: p.category,
                style: themeKey !== 'search' ? themeKey : 'eclectic',
                store: getRandomStore(),
                buyUrl: `https://www.google.com/search?q=${encodeURIComponent(p.originalQuery)}`,
                dimensions: { width: 1.5, depth: 0.8, height: 0.8 }, // Default for 3D
                rotation: 0
            });
        } catch (err) {
            // console.error(`Skipped: ${err.message}`);
        }
    }

    // Merge (Keep newest at top)
    const finalData = [...newItems, ...existingData];
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    
    console.log(`💾 Saved ${newItems.length} curated items.`);
    console.log(`📚 Library Size: ${finalData.length}`);
})();
