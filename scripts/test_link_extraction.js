import puppeteer from 'puppeteer';

(async () => {
    // Test URL
    const url = 'https://www.google.com/search?q=West+Elm+Mid-Century+Sofa&tbm=isch';

    console.log(`🌐 Testing access to: ${url}`);
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Check if we can find the "Visit" button or link structure
        const links = await page.evaluate(() => {
            // Google Images structure changes often. 
            // We look for anchor tags that might lead out.
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => href && !href.includes('google.com') && !href.startsWith('javascript'));
        });

        console.log(`🔗 Found ${links.length} potential outbound links.`);
        if (links.length > 0) console.log('Sample:', links.slice(0, 3));
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    }

    await browser.close();
})();
