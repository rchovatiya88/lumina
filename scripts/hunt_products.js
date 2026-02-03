
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Combinatorial Mass Generation Config ---
const MASS_GEN_STYLES = ['Japandi', 'Mid-Century Modern', 'Industrial', 'Boho', 'Minimalist', 'Art Deco', 'Scandinavian', 'Rustic', 'Modern Farmhouse', 'Eclectic'];
const MASS_GEN_COLORS = ['Cream', 'Charcoal', 'Olive Green', 'Cognac Leather', 'Navy Blue', 'Terracotta', 'White Boucle', 'Walnut Wood', 'Brass', 'Matte Black'];
const MASS_GEN_ITEMS = [
    { name: 'Sofa', category: 'sofa', priceBase: 1200 },
    { name: 'Lounge Chair', category: 'chair', priceBase: 400 },
    { name: 'Coffee Table', category: 'table', priceBase: 300 },
    { name: 'Floor Lamp', category: 'lamp', priceBase: 150 },
    { name: 'Area Rug', category: 'rug', priceBase: 200 },
    { name: 'Pendant Light', category: 'lamp', priceBase: 250 },
    { name: 'Sideboard', category: 'table', priceBase: 800 },
    { name: 'Bookshelf', category: 'decor', priceBase: 450 },
    { name: 'Wall Art', category: 'decor', priceBase: 120 },
    { name: 'Planter', category: 'decor', priceBase: 80 }
];

const THEMES = {
    japandi: [
        { query: 'japandi low profile sofa cream linen', category: 'sofa', priceRange: [1200, 3500] },
        { query: 'japandi wood coffee table organic shape', category: 'table', priceRange: [300, 900] },
        { query: 'japandi wool area rug beige textured', category: 'rug', priceRange: [200, 800] },
        { query: 'noguchi style paper floor lamp', category: 'lamp', priceRange: [150, 400] },
        { query: 'minimalist beige abstract canvas art', category: 'decor', priceRange: [80, 250] },
        { query: 'japandi dining chair wood weave', category: 'chair', priceRange: [180, 450] }
    ],
    // ... (Keep existing THEMES as fallbacks/presets if needed, but we focus on mass gen)
};

const STORES = ['West Elm', 'CB2', 'Crate & Barrel', 'Anthropologie', 'Lulu and Georgia', 'Wayfair', 'AllModern', 'Article', 'Target'];

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
            if (res.statusCode !== 200) {
                 // consume response to free memory
                 res.resume();
                 return reject(new Error(`Status ${res.statusCode}`));
            }
            
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
        req.setTimeout(8000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
};

function generateMassQueries(count = 20) {
    const queries = [];
    const maxCombinations = MASS_GEN_STYLES.length * MASS_GEN_COLORS.length * MASS_GEN_ITEMS.length;
    console.log(`🧮 Total possible unique combinations: ${maxCombinations}`);

    for (let i = 0; i < count; i++) {
        const style = MASS_GEN_STYLES[Math.floor(Math.random() * MASS_GEN_STYLES.length)];
        const item = MASS_GEN_ITEMS[Math.floor(Math.random() * MASS_GEN_ITEMS.length)];
        // Pick 1-2 colors
        const colors = MASS_GEN_COLORS.sort(() => 0.5 - Math.random()).slice(0, Math.random() > 0.7 ? 2 : 1);
        
        const queryText = `${style} ${colors.join(' ')} ${item.name} furniture product white background`;
        
        queries.push({
            query: queryText,
            category: item.category,
            priceRange: [item.priceBase * 0.8, item.priceBase * 1.6],
            style: style.toLowerCase(),
            originalQuery: `${style} ${item.name}`
        });
    }
    return queries;
}

// --- Main ---

(async () => {
    const args = process.argv.slice(2);
    let huntList = [];
    
    // Parse args
    const isMass = args.includes('--mass');
    let massCount = 10;
    if (isMass) {
        const countIdx = args.indexOf('--mass') + 1;
        if (args[countIdx]) massCount = parseInt(args[countIdx]);
        console.log(`🏭 MASS MODE ACTIVATED: Generating ${massCount} unique concepts...`);
        huntList = generateMassQueries(massCount);
    } else {
        // Legacy Mode
        const themeKey = args[0] ? args[0].toLowerCase() : 'modern';
        if (THEMES[themeKey]) {
            console.log(`🎨 Theme selected: ${themeKey.toUpperCase()}`);
            huntList = THEMES[themeKey];
        } else {
            console.log(`🔍 Custom search: "${args.join(' ')}"`);
            huntList = [{ query: args.join(' '), category: 'scraped', priceRange: [100, 1000] }];
        }
    }

    // 2. Setup Browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const productsFound = [];

    // 3. Hunt Loop
    console.log("🕵️  Starting search loop...");
    
    // Process in chunks to avoid memory issues if massive
    for (const item of huntList) {
        // Small delay to be nice to Google
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
        
        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // console.log(`   Searching: ${item.query}`);
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(item.query)}&tbm=isch`, { waitUntil: 'networkidle2', timeout: 30000 });

            // Scroll a bit
            await page.evaluate(async () => {
                window.scrollBy(0, 500);
            });

            // Extract Candidate Images
            const candidates = await page.evaluate(() => {
                const results = [];
                
                // Strategy 1: Look for Shopping Results (PLAs) - High Quality, Direct Links
                // Google often puts these in a carousel or sidebar
                const shoppingCards = Array.from(document.querySelectorAll('.pla-unit-container, .plantl, .v7iOyd')); // Added .v7iOyd (common class)
                shoppingCards.forEach(card => {
                    const anchor = card.closest('a') || card.querySelector('a');
                    const img = card.querySelector('img');
                    
                    if (anchor && img && img.src && img.src.startsWith('http')) {
                        results.push({
                            src: img.src,
                            alt: img.alt || 'Shopping Item',
                            link: anchor.href,
                            isShopping: true
                        });
                    }
                });

                // Strategy 2: Standard Image Grid (Fallback)
                // Use a broader selector for images in the main area
                // 'div[data-tbnid] img' is a very stable way to find result images
                const imgs = Array.from(document.querySelectorAll('div[data-tbnid] img'));
                
                imgs.slice(0, 15).forEach(img => {
                    if (img.src && img.src.startsWith('http')) {
                        const parentLink = img.closest('a');
                        results.push({
                            src: img.src,
                            alt: img.alt || 'Furniture Design',
                            link: parentLink ? parentLink.href : null,
                            isShopping: false
                        });
                    }
                });
                
                return results;
            });
            
            // Pick the best one
            // Prioritize Shopping results if available
            if (candidates.length > 0) {
                 const shoppingResults = candidates.filter(c => c.isShopping);
                 const pool = shoppingResults.length > 0 ? shoppingResults : candidates;
                 
                 const bestIdx = Math.floor(Math.random() * Math.min(pool.length, 3));
                 const best = pool[bestIdx];
                 
                 productsFound.push({
                    ...best,
                    originalQuery: item.originalQuery || item.query,
                    category: item.category,
                    priceRange: item.priceRange,
                    style: item.style
                 });
                 process.stdout.write(best.isShopping ? '$' : '.'); // $ = Found a shopping link!
            } else {
                 process.stdout.write('x');
            }
            await page.close();
        } catch (e) {
            console.error(`Error hunting ${item.query}:`, e.message);
        }
    }

    await browser.close();
    console.log(`\n✅ Found ${productsFound.length} items total.`);

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
        const id = `mass-${Date.now()}-${i}`;
        const localPathBase = path.join(publicImgDir, id);

        try {
            const ext = await downloadImage(p.src, localPathBase);
            const fileName = `${id}.${ext}`;
            const publicUrl = `products/scraped/${fileName}`;

            // Generate realistic metadata
            const price = getRandomInt(p.priceRange[0], p.priceRange[1]);
            // Clean title
            let cleanName = p.alt.split('|')[0].split('-')[0].trim(); // Take first part of title
            if (cleanName.length > 40) cleanName = cleanName.substring(0, 40) + '...';
            if (cleanName.length < 5) cleanName = p.originalQuery;

            const store = getRandomStore();
            let smartBuyUrl = `https://www.google.com/search?q=${encodeURIComponent(p.originalQuery)}`;
            
            // Affiliate / Smart Link Logic
            // If we found a real link from the scraper, use it!
            if (p.link && !p.link.includes('google.com/search') && !p.link.startsWith('javascript')) {
                smartBuyUrl = p.link;
            } else {
                // Fallback to smart search
                if (store === 'West Elm') smartBuyUrl = `https://www.westelm.com/search/results.html?words=${encodeURIComponent(p.originalQuery)}`;
                else if (store === 'CB2') smartBuyUrl = `https://www.cb2.com/search?query=${encodeURIComponent(p.originalQuery)}`;
                else if (store === 'Crate & Barrel') smartBuyUrl = `https://www.crateandbarrel.com/search?query=${encodeURIComponent(p.originalQuery)}`;
                else if (store === 'Wayfair') smartBuyUrl = `https://www.wayfair.com/keyword.php?keyword=${encodeURIComponent(p.originalQuery)}`;
                else if (store === 'Article') smartBuyUrl = `https://www.article.com/search?q=${encodeURIComponent(p.originalQuery)}`;
            }

            newItems.push({
                id: id,
                name: cleanName,
                price: price,
                image: publicUrl,
                category: p.category,
                style: p.style || 'eclectic',
                store: store,
                buyUrl: smartBuyUrl,
                dimensions: { width: 1.5, depth: 0.8, height: 0.8 }, 
                rotation: 0,
                isPro: Math.random() > 0.8 
            });
        } catch (err) {
             // console.error(`Skipped: ${err.message}`);
        }
    }

    // Merge (Keep newest at top)
    const finalData = [...newItems, ...existingData];
    // De-duplicate by name to avoid clutter
    const uniqueData = Array.from(new Map(finalData.map(item => [item.name, item])).values());
    
    fs.writeFileSync(outputPath, JSON.stringify(uniqueData, null, 2));
    
    console.log(`💾 Saved ${newItems.length} new items.`);
    console.log(`📚 Total Library Size: ${uniqueData.length}`);
})();
