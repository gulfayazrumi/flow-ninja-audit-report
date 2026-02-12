const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const config = require('./config');

/**
 * Generate a unique UID for the scan
 */
function generateUID() {
    return uuidv4();
}

/**
 * Construct the Foresight scan URL
 */
function buildScanURL(websiteUrl, industry, goal, uid) {
    const baseUrl = config.flowNinja.scanUrl;
    const params = new URLSearchParams({
        website_url: websiteUrl,
        industry: industry,
        goal: goal,
        uid: uid
    });
    return `${baseUrl}?${params.toString()}`;
}

/**
 * Main automation function to generate audit report
 */
async function generateAuditReport(websiteUrl, industry, goal, userInfo = {}) {
    let browser = null;

    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: 'new',
            protocolTimeout: 120000, // 120 seconds for slow scans
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const page = await browser.newPage();

        // Use a realistic User-Agent to avoid being blocked
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        // Advanced Stealth: Mask the webdriver property
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        // Forward page logs and monitor network for debugging
        // Forward page logs and monitor network for debugging
        // Enable request interception to handle authentication/405 issues
        await page.setRequestInterception(true);
        page.on('request', request => {
            const url = request.url();
            const headers = request.headers();

            // Force Origin and Referer for all staging backend requests
            if (url.includes('web-stagingv2')) {
                // If it's the main report endpoint that we know 405s, 
                // we can optionally try to redirect it to /short if we want 
                // but let's first try just adding the Origin header which might be missing.

                const newHeaders = {
                    ...headers,
                    'origin': 'https://foresight.flowninja.com',
                    'referer': 'https://foresight.flowninja.com/'
                };

                // EXPERIMENT: If it's the report GET request, try to use the short one instead
                if (request.method() === 'GET' && url.match(/\/report\/[a-z0-9-]+$/)) {
                    console.log(`[INTERCEPT] Redirecting main report request to /short: ${url}`);
                    request.continue({
                        url: url + '/short',
                        headers: newHeaders
                    });
                } else {
                    request.continue({ headers: newHeaders });
                }
            } else {
                request.continue();
            }
        });

        page.on('console', msg => console.log(`[BROWSER LOG] ${msg.type().toUpperCase()}: ${msg.text()}`));
        page.on('pageerror', err => console.error(`[BROWSER ERROR] ${err.toString()}`));

        page.on('response', async response => {
            const status = response.status();
            if (status >= 400) {
                let body = '';
                try {
                    body = await response.text();
                } catch (e) {
                    body = '[Could not read body]';
                }
                const log = `[NETWORK ERROR] ${status} ${response.url()} Body: ${body.substring(0, 500)}\n`;
                console.log(`[NETWORK ERROR] ${status} ${response.url()}`);
                fs.appendFileSync('debug-network.txt', log);
            }
        });

        page.on('request', request => {
            if (request.url().includes('web-stagingv2')) {
                const log = `[REQUEST] ${request.method()} ${request.url()} Headers: ${JSON.stringify(request.headers())}\n`;
                fs.appendFileSync('debug-network.txt', log);
            }
        });

        // Set viewport for consistent rendering
        await page.setViewport({ width: 1920, height: 1080 });

        // Generate UID and construct URL
        const uid = generateUID();
        const scanUrl = buildScanURL(websiteUrl, industry, goal, uid);

        console.log(`Navigating to scan URL: ${scanUrl}`);
        await page.goto(scanUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for scan to complete - look for multiple indicators
        console.log('Waiting for scan to complete...');

        const maxWaitTime = config.flowNinja.scanTimeout;
        const startTime = Date.now();
        let attempts = 0;
        let scanComplete = false;

        // Wait for scan completion indicators (score display OR "Access full report" button)
        while (!scanComplete && (Date.now() - startTime) < maxWaitTime) {
            attempts++;
            const elapsed = Math.floor((Date.now() - startTime) / 1000);

            // Log less frequently to avoid spam
            if (attempts % 5 === 0) {
                console.log(`Waiting for scan completion... (${elapsed}s elapsed)`);
            }

            try {
                // Check if scan is complete by looking for score or report content
                scanComplete = await page.evaluate(() => {
                    // Check for definitive success indicators
                    const scoreElement = document.querySelector('.report-score, [class*="score"], [data-color]');
                    const reportContent = document.querySelector('.improvements-box, .report-main-content');

                    // Most reliable indicator: "Access full report" button
                    const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"], .button'));
                    const accessButton = buttons.find(btn =>
                        btn.textContent && btn.textContent.toLowerCase().includes('access full report')
                    );

                    // Also check if we're stuck safely
                    // If errors are visible, we should probably stop (but maybe retry?)
                    const errorMsg = document.querySelector('.error-message, .alert-danger');
                    if (errorMsg) return 'ERROR';

                    // If we see the access button, we are DEFINITELY done
                    if (accessButton) return true;

                    // If we see report content, we are likely done
                    return !!(scoreElement && reportContent);
                });

                if (scanComplete === 'ERROR') {
                    console.log('Detected error on page during scan.');
                    // Consider it failed but maybe retry? For now, let's treat it as not complete
                    scanComplete = false;
                }

                if (scanComplete === true) {
                    console.log('✓ Scan completed! Report access detected.');
                    break;
                }
            } catch (e) {
                // Ignore transient evaluation errors
            }

            if (!scanComplete) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (!scanComplete) {
            console.log('Scan timed out. Saving debug screenshot...');
            try {
                await page.screenshot({ path: 'debug-timeout.png', fullPage: true });
            } catch (e) { console.error('Screenshot failed:', e); }
            throw new Error('Scan did not complete after waiting 300 seconds. The Flow Ninja service is very slow or unavailable.');
        }

        console.log('Scan finished. Looking for "Access full report" button...');

        // Stabilize page before clicking
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Click the button to open the popup - Robust handling using specific classes from user HTML
        const buttonClicked = await page.evaluate(() => {
            // Priority 1: The specific class user identified
            const specificButton = document.querySelector('.FinalCta_button__4cCPh');
            if (specificButton) {
                specificButton.click();
                return 'Specific Class .FinalCta_button__4cCPh';
            }

            // Priority 2: Text content specific to the "Access full report" CTA
            const buttons = Array.from(document.querySelectorAll('a, button, div[role="button"]'));
            const accessButton = buttons.find(btn =>
                btn.textContent && btn.textContent.toLowerCase().includes('access full report')
            );

            if (accessButton) {
                accessButton.click();
                return 'Text Match "Access full report"';
            }

            // Priority 3: Fallback specific to "Unlock full audit" section
            const unlockSection = document.querySelector('.FinalCta_cta-content__a__vk');
            if (unlockSection) {
                const btn = unlockSection.querySelector('a, button');
                if (btn) {
                    btn.click();
                    return 'Unlock Section Button';
                }
            }

            return false;
        });

        if (!buttonClicked) {
            console.log('Could not find "Access full report" button. Taking screenshot...');
            await page.screenshot({ path: 'debug-no-button.png', fullPage: true });
        } else {
            console.log(`Clicked "Access full report" button via strategy: ${buttonClicked}`);
        }

        // Wait for popup to appear
        console.log('Waiting for popup form to appear...');
        try {
            await page.waitForSelector('.popup-form-fields', { visible: true, timeout: 10000 });
            console.log('Popup form appeared!');
        } catch (e) {
            console.log('Popup form NOT found by class .popup-form-fields within 10s. Taking screenshot...');
            await page.screenshot({ path: 'debug-no-popup.png', fullPage: true });

            // Try generic form fallback
            try {
                await page.waitForSelector('form', { visible: true, timeout: 5000 });
                console.log('Found generic form.');
            } catch (e2) {
                console.log('No form found at all.');
            }
        }

        // Fill in the popup form - improved selector logic
        console.log('Filling popup form with user information...');

        const formData = {
            fullName: userInfo.fullName || 'Website Audit User',
            email: userInfo.email || 'audit@example.com',
            jobTitle: userInfo.position || 'Marketing Manager'
        };

        // Fill the form fields targeting the popup specifically
        await page.evaluate((info) => {
            const form = document.querySelector('.popup-form-fields');
            if (!form) return;

            const fullNameInput = form.querySelector('input[name="fullName"]');
            const emailInput = form.querySelector('input[name="businessEmail"]');
            const jobTitleInput = form.querySelector('input[name="jobTitle"]');

            if (fullNameInput) { fullNameInput.focus(); fullNameInput.value = info.fullName; fullNameInput.dispatchEvent(new Event('input', { bubbles: true })); fullNameInput.dispatchEvent(new Event('change', { bubbles: true })); }
            if (emailInput) { emailInput.focus(); emailInput.value = info.email; emailInput.dispatchEvent(new Event('input', { bubbles: true })); emailInput.dispatchEvent(new Event('change', { bubbles: true })); }
            if (jobTitleInput) { jobTitleInput.focus(); jobTitleInput.value = info.jobTitle; jobTitleInput.dispatchEvent(new Event('input', { bubbles: true })); jobTitleInput.dispatchEvent(new Event('change', { bubbles: true })); }
        }, formData);

        // Take a screenshot of the filled form BEFORE submitting
        await page.screenshot({ path: 'debug-form-filled.png' });

        // Take a screenshot of the filled form BEFORE submitting
        await page.screenshot({ path: 'debug-form-filled.png' });

        console.log('Submitting popup form...');

        // Set up listener for new targets (tabs/windows) BEFORE clicking submit
        const newTargetPromise = new Promise(resolve => browser.once('targetcreated', resolve));

        // Submit the form
        await page.evaluate(() => {
            const form = document.querySelector('.popup-form-fields');
            if (form) {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.click();
                } else {
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            }
        });

        // Wait for navigation or new tab
        console.log('Waiting for navigation or new tab after form submission...');

        try {
            // Wait for EITHER creating a new tab OR navigating the current one
            const result = await Promise.race([
                newTargetPromise,
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
                // Check if current URL changes manually
                page.waitForFunction((originalUrl) => window.location.href !== originalUrl, { timeout: 60000 }, page.url())
            ]);

            // Check if we have a new target (new tab)
            if (result && result.page) {
                console.log('New tab detected! Switching context...');
                const newPage = await result.page();
                await newPage.bringToFront();
                page = newPage; // Switch our main page reference to the new tab!
                console.log(`Switched to new tab: ${page.url()}`);
            } else {
                console.log('Navigation detected on current tab!');
                console.log(`Current URL: ${page.url()}`);
            }

        } catch (e) {
            console.log('Warning: Navigation timed out. Checking for AJAX content load on same page...');
            // Check if we are already on the right page?
            await page.screenshot({ path: 'debug-navigation-timeout.png', fullPage: true });
        }

        // Wait for navigation and verify URL change
        // CRITICAL: User says it navigates to a new page
        console.log('Waiting for navigation after form submission...');
        const initialUrl = page.url();
        console.log(`Current URL: ${initialUrl}`);

        try {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 45000 }), // Longer timeout for navigation
                page.waitForFunction((originalUrl) => window.location.href !== originalUrl, { timeout: 45000 }, initialUrl)
            ]);
            console.log('Navigation detected!');
            console.log(`New URL: ${page.url()}`);
        } catch (e) {
            console.log('Warning: Navigation timed out or URL did not change. Checking for AJAX content load...');
            await page.screenshot({ path: 'debug-navigation-timeout.png', fullPage: true });
        }

        // Wait specifically for content to appear on the NEW page
        console.log('Waiting for report content/score to stabilize...');

        // Wait for specific elements that indicate a loaded report
        try {
            await page.waitForFunction(() => {
                // Check if "Loading" container is present and visible
                const loadingContainer = Array.from(document.querySelectorAll('h3')).find(h3 => h3.textContent.includes('Loading Report'));
                if (loadingContainer) return false;

                // Check if we have actual content sections (like improvements boxes or specific report grids)
                const hasImprovements = document.querySelectorAll('.improvements-box, [class*="improvement"], .report-main-content').length > 0;

                // Check if we have a score (even if 0, it should be rendered)
                const scoreEl = document.querySelector('.report-score');
                const hasScore = scoreEl && scoreEl.textContent.trim().length > 0;

                // We are done if we no longer see the loading indicator AND we have some content
                return !loadingContainer && (hasImprovements || hasScore);
            }, { timeout: 180000, polling: 2000 }); // Increase to 3 minutes, poll every 2s

            console.log('Report content fully loaded!');
        } catch (e) {
            console.log('TIMED OUT waiting for report content. Proceeding with caution...');
            await page.screenshot({ path: 'debug-report-wait-timeout.png', fullPage: true });
        }

        // Take a screenshot of what we are about to scrape for debugging
        await page.screenshot({ path: 'debug-before-scrape.png', fullPage: true });

        console.log('Scraping report HTML...');

        // Extract the full report HTML including hero section
        let reportHTML = await page.evaluate(() => {
            // Target the main wrapper to get EVERYTHING including Navbar and Footer
            const container = document.querySelector('#__next') ||
                document.querySelector('.page-wrapper')?.parentElement ||
                document.body;

            if (!container) return document.body.innerHTML;

            // Clone to avoid side effects
            const clones = container.cloneNode(true);

            // Remove only truly problematic interactive/nuisance elements
            // We KEEP NavbarForesight and FooterUpdated as requested for "same result"
            const trash = clones.querySelectorAll('script, style, .cookie-banner, .popup, .modal, .chat-widget, .side-cta-box-responsive, .w-nav-overlay, .toc-toggle-header, .ShareWidget_share-banner__MrfZJ, .audit-side-cta-desktop, .BgDotImage_bg-dot-image__KDBCM');
            trash.forEach(el => el.remove());

            return clones.innerHTML;
        });

        // REBRANDING: Replace all instances of Flow Ninja / Foresight with Sun Skill Techs
        console.log('Applying rebranding: Flow Ninja -> Sun Skill Techs');
        reportHTML = reportHTML
            .replace(/Flow\s*Ninja/gi, 'Sun Skill Techs')
            .replace(/FlowNinja/gi, 'SunSkillTechs')
            .replace(/Foresight™/gi, 'Sun Skill Techs')
            .replace(/Foresight/gi, 'Sun Skill Techs')
            .replace(/Sun Skill Techs Team/gi, 'Sun Skill Techs Team') // Ensure team references are correct
            .replace(/Your Company Name/gi, 'Sun Skill Techs');

        // Special case for "AI written flow or ninja" -> "Sun Skill Techs Team"
        // The user specifically mentioned replacing names with Sun Skill Techs Team
        reportHTML = reportHTML.replace(/AI written flow or ninja/gi, 'Sun Skill Techs Team')
            .replace(/Sun Skill Techs Team/gi, 'Sun Skill Techs Team') // Ensure consistent team naming
            .replace(/Uros Mikic/gi, 'Sun Skill Techs Team') // Specific person on the site
            .replace(/Mihajlo Djokic/gi, 'Sun Skill Techs Team')
            .replace(/Lucija Jaksic/gi, 'Sun Skill Techs Team');

        // DEBUG: Save the REBRANDED HTML to a file for inspection
        fs.writeFileSync('debug-rebranded.html', reportHTML);
        console.log('Saved debug-rebranded.html for inspection');

        // Extract all styles from the page
        const styles = await page.evaluate(() => {
            const styleSheets = Array.from(document.styleSheets);
            let allStyles = '';

            styleSheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules);
                    rules.forEach(rule => {
                        allStyles += rule.cssText + '\n';
                    });
                } catch (e) {
                    // Cross-origin stylesheets may throw errors
                }
            });

            // Also get inline styles
            const styleTags = Array.from(document.querySelectorAll('style'));
            styleTags.forEach(tag => {
                allStyles += tag.innerHTML + '\n';
            });

            return allStyles;
        });

        console.log('Report HTML scraped successfully');

        await browser.close();

        return {
            success: true,
            reportHTML,
            styles
        };

    } catch (error) {
        console.error('Error in automation:', error);

        if (browser) {
            await browser.close();
        }

        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    generateAuditReport,
    generateUID,
    buildScanURL
};
