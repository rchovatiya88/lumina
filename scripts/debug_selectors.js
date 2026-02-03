import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto('https://www.google.com/search?q=West+Elm+Sofa&tbm=isch', { waitUntil: 'networkidle2' });

    // Dump a snippet of the HTML where we found links
    const debugInfo = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="westelm.com"]'));
        return anchors.slice(0, 2).map(a => ({
            href: a.href,
            html: a.outerHTML,
            parentClass: a.parentElement.className,
            hasImg: !!a.querySelector('img')
        }));
    });

    console.log(JSON.stringify(debugInfo, null, 2));
    await browser.close();
})();
