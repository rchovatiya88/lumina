
import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Search for "modern sofa" on Google Shopping
    const query = "modern sofa";
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Generic strategy: Find prices, walk up to container
    const results = await page.evaluate(() => {
        const items = [];
        const priceElements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.children.length === 0 && 
            el.innerText && 
            /^\$\d{1,3}(,\d{3})*(\.\d{2})?$/.test(el.innerText) // Matches "$123" or "$1,234.99"
        );

        priceElements.forEach(priceEl => {
            // Walk up to find a container that likely holds the whole card
            // usually ~4-5 levels up has an image and H3/div title
            let container = priceEl.parentElement;
            let foundTitle = null;
            let foundImg = null;
            
            for (let i = 0; i < 7; i++) {
                if (!container) break;
                
                const title = container.querySelector('h3, .tAxDx'); // Common title classes
                const img = container.querySelector('img');
                
                if (title && img && img.width > 50) {
                    foundTitle = title.innerText;
                    foundImg = img.src;
                    break;
                }
                container = container.parentElement;
            }

            if (foundTitle && foundImg) {
                // Avoid duplicates
                if (!items.find(x => x.title === foundTitle)) {
                     // Try to find store name (usually adjacent to price)
                    const textContent = container.innerText;
                    const lines = textContent.split('\n');
                    const store = lines.find(l => l.length < 30 && !l.includes('$') && l !== foundTitle) || 'Google Shopping';

                    items.push({
                        title: foundTitle,
                        price: priceEl.innerText,
                        image: foundImg,
                        store: store
                    });
                }
            }
        });
        return items;
    });

    console.log(`Found ${results.length} items.`);
    if (results.length > 0) {
        console.log("Sample:", results[0]);
    } else {
        // Fallback debug: print body to see what we got (truncated)
        // console.log(await page.content());
    }

    await browser.close();
})();
