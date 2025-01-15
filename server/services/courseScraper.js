const WebSocket = require('ws');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

puppeteer.default.use(StealthPlugin());

class CourseScraperService {
    constructor() {
        this.urlRegex = /^https?:\/\/(?:www\.)?(?:new\.)?(?:progressme\.ru|edvibe\.com)\/(?:sharing-material|SharingMaterial)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\/book\/\d+)?$/;
        this.socketUrls = {
            books: "wss://books.progressme.ru/websocket",
            socket: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx",
            debug: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx"
        };
        this.browser = null;
        this.page = null;
        this.currentXHR={}
    }

    validateUrl(url) {
        const cleanUrl = url.trim()
            .replace("new.", "")
            .replace("edvibe.com", "progressme.ru")
            .replace("sharing-material", "SharingMaterial")
            .replace("course", "SharingMaterial")
            .replace(/\/book\/[0-9]{6}/, "");

        return this.urlRegex.test(cleanUrl) ? cleanUrl : null;
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.default.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();
            
            // Set random viewport size
            await this.page.setViewport({
                width: 1920 + Math.floor(Math.random() * 100),
                height: 3000 + Math.floor(Math.random() * 100),
                deviceScaleFactor: 1,
                hasTouch: false,
                isLandscape: false,
                isMobile: false,
            });

            // Set random user agent
            const userAgent = randomUseragent.getRandom();
            await this.page.setUserAgent(userAgent);

            // Skip unnecessary resource types
            await this.page.setRequestInterception(true);
            this.page.on('request', (req) => {
                if(['stylesheet', 'font', 'image'].indexOf(req.resourceType()) !== -1) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Listen for specific network responses
            this.page.on('response', async response => {
                const url = response.url();
                const method = response.request().method()
                // console.log("tick points", url, method);
                
                // You can check for specific endpoints
                if (url.includes('https://progressme.ru/Account/Login') && method === "POST") {
                    try {
                        const responseData = await response.json();
                        console.log('Response data:', responseData);
                        this.currentXHR[`${this.page.title.toString()}`].res = responseData;

                    } catch (e) {
                        // Handle non-JSON responses
                        console.log('Non-JSON response:', await response.text());
                    }
                }
            });

            

            // Add anti-detection scripts
            await this.page.evaluateOnNewDocument(() => {
                // Pass webdriver check
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });

                // Pass chrome check
                window.chrome = {
                    runtime: {},
                };

                // Pass notifications check
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );


                // Pass plugins check
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });

                // Pass languages check
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
            });
        }
    }

    async handleCaptcha(page=this.page) {
        try {
            // Wait for network to be idle first
            await page.waitForNetworkIdle({ 
                timeout: 60000,
                idleTime: 500
            });

            // Check if we're on a captcha page - FIXED VERSION
            const pageContainsCaptchaButton = await page.evaluate(() => {
                return document.querySelector('.CheckboxCaptcha-Button') !== null;
            });
            const pageHasCaptchaInUrl = page.url().startsWith('https://progressme.ru/showcaptcha?');
            
            console.log("page is captcha page", pageHasCaptchaInUrl, pageContainsCaptchaButton);
            
            if (!pageHasCaptchaInUrl) return true;
            
            console.log("Page is captcha page");
            
            // Wait for iframe to load
            // if the iframe doesn't appear after 3sec, reload the page
            // repeat 3 times
            const frameHandle = await page.waitForSelector('iframe[title="SmartCaptcha checkbox widget"]').then(res=>res).catch(async(err) => {
                await page.reload();
                // return void;
            });
            const frame = await frameHandle.contentFrame();
            
            // Get the button dimensions and position within the iframe
            const button = await frame.$('.CheckboxCaptcha-Button');
            const box = await button.boundingBox();

            console.log("IMNR Button is found at coordinates", box);

            // Generate "human-like" mouse movement
            const points = this.generateMousePath(
                { x: 0, y: 0 }, 
                { x: box.x + box.width/2, y: box.y + box.height/2 }
            );

            // Simulate mouse movement
            for (const point of points) {
                await page.mouse.move(point.x, point.y, {
                    steps: 10 // Make movement smoother
                });
            }

            // Random delay before clicking (between 100ms and 300ms)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));


            // Click the button
            await button.click({ delay: 50 }); // Small click delay

            // Wait for navigation or success with multiple conditions
            await Promise.race([
                page.waitForNetworkIdle({
                    timeout: 60000,
                    idleTime: 500
                }),
                page.waitForNavigation({
                    timeout: 60000,
                    waitUntil: ['networkidle0', 'load', 'domcontentloaded']
                })
            ]).catch(() => {}); // Ignore timeout

            console.log("Captcha is solved");
            
            return true;
        } catch (error) {
            console.error('Captcha handling failed:', error);
            return false;
        }
    }

    generateMousePath(start, end) {
        const points = [];
        const numPoints = Math.floor(Math.random() * 10) + 10; // 10-20 points
        
        // Generate control points for bezier curve
        const cp1 = {
            x: start.x + (Math.random() - 0.5) * 100,
            y: start.y + (Math.random() - 0.5) * 100
        };
        const cp2 = {
            x: end.x + (Math.random() - 0.5) * 100,
            y: end.y + (Math.random() - 0.5) * 100
        };

        // Generate points along a bezier curve
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            points.push({
                x: Math.pow(1-t, 3) * start.x + 
                   3 * Math.pow(1-t, 2) * t * cp1.x + 
                   3 * (1-t) * Math.pow(t, 2) * cp2.x + 
                   Math.pow(t, 3) * end.x,
                y: Math.pow(1-t, 3) * start.y + 
                   3 * Math.pow(1-t, 2) * t * cp1.y + 
                   3 * (1-t) * Math.pow(t, 2) * cp2.y + 
                   Math.pow(t, 3) * end.y
            });
        }

        return points;
    }

    async authenticateWithProgressMe(email, password) {
        try {
            await this.initBrowser();
            
            // Navigate to login page with increased timeout
            await this.page.goto('https://progressme.ru/Account/Login', {
                waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
                timeout: 60000
            });

            console.log("Page is loaded");

            // await this.monitorEndpoint(this.page, "POST","https://progressme.ru/Account/Login")
            // Handle any initial captcha
            await this.handleCaptcha(this.page);

            // Find the form
            const fieldsFound = await this.page.evaluate(() => {
                console.log("email:", document.querySelector('input[name="Email"]').tagName);
                console.log("pw:", document.querySelector('input[name="Password"]').tagName);
                console.log("btn:", document.querySelector('button[data-bind="click:GetRoles"]').tagName);
                
                return (document.querySelector('input[name="Email"]').type !== null) && (document.querySelector('input[name="Password"]') !== null) && (document.querySelector('button[data-bind="click:GetRoles"]') !== null);
            });
            

            //// Fill in login form
            console.log("creds", email, password);
            
            console.log("fields found:? ", fieldsFound);
            
            await this.page.type('input[name="Email"]', email);
            await this.page.type('input[name="Password"]', password);
            await this.page.click('button[data-bind="click:GetRoles"]'),
            
            // Click login button and wait for navigation with multiple conditions
            await Promise.race([
                this.page.waitForNavigation({
                    timeout: 60000,
                    waitUntil: ['networkidle0', 'load', 'domcontentloaded']
                }),
                this.page.waitForNetworkIdle({
                    timeout: 60000,
                    idleTime: 500
                })
            ]);
            
            console.log("XHR::", this.currentXHR);
            
            const response = this.currentXHR[`${this.page.title.toString()}`].res;

            // Handle any post-login captcha
            await this.handleCaptcha(this.page);

            // Get cookies for WebSocket connection
            const cookies = await this.browser.cookies();
            const debugInfo = this.browser.debugInfo
            
            
            // const authCookie = cookies.find(cookie => cookie.name === '.ASPXAUTH');
            const authToken = cookies.find(cookie => cookie.name === 'Auth-Token');
            console.log("cookies", authToken);

            console.log("debugInfo", response);
            
        

            if ( !authToken?.value) {
                throw new Error('Authentication failed: No auth cookie found');
            }

            return {
                token: authToken.value,
                data: this.currentXHR[`${this.page.title.toString()}`]
                // cookies: cookies
            };
        } catch (error) {
            throw new Error('Authentication failed: ' + error.message);
        }
    }

    async cleanup() {
        if (this.page) {
            await this.page.close();
            this.page = null;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    generateSocketMessages(targetUrl, bookId, userId) {
        return {
            GetIdMaterial: {
                controller: "SharingMaterialWsController",
                method: "GetIdMaterial",
                value: JSON.stringify({ Code: targetUrl.split("SharingMaterial/")[1] || "" })
            },
            GetBook: {
                controller: "SharingMaterialWsController",
                method: "GetBook",
                value: JSON.stringify({ BookId: bookId, UserId: null })
            },
            CopyBook: {
                controller: "BookWsController",
                method: "CopyBook",
                value: JSON.stringify({ BookId: bookId, UserId: userId })
            }
        };
    }

    async connectToWebSocket(url, token, messageHandler) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${url}?Page=TeacherProfile&isSharing=True&token=${token}`);
            
            ws.on('open', () => {
                resolve(ws);
            });

            ws.on('message', (data) => {
                messageHandler(data);
            });

            ws.on('error', (error) => {
                reject(error);
            });
        });
    }

    async copyCourse(bookId, userId, token) {
        try {
            const ws = await this.connectToWebSocket(this.socketUrls.books, token, (data) => {
                console.log('Received:', data);
            });

            const message = this.generateSocketMessages(null, bookId, userId).CopyBook;
            ws.send(JSON.stringify(message));

            return new Promise((resolve) => {
                ws.on('message', (data) => {
                    const response = JSON.parse(data);
                    if (response.success) {
                        ws.close();
                        resolve(response);
                    }
                });
            });
        } catch (error) {
            throw new Error('Failed to copy course: ' + error.message);
        }
    }

    async monitorEndpoint(page, targetMethod, endpointUrl) {
        return new Promise((resolve, reject) => {
            const responseHandler = async response => {

                const url = response.url();
                const method = response.request().method()
                if (url.includes(endpointUrl) && method === targetMethod) {
                    try {
                        const responseData = await response.json();
                        page.removeListener('response', responseHandler);
                        this.currentXHR[`${this.page.title.toString()}`] = responseData;
                        resolve(responseData);
                    } catch (e) {
                        reject(e);
                    }
                }
            };

            page.on('response', responseHandler);

            // Optional timeout
            // setTimeout(() => {
            //     page.removeListener('response', responseHandler);
            //     reject(new Error('Endpoint monitoring timed out'));
            // }, 30000);
        });
    }

    generateAuthToken() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}


// Make sure to clean up when the process exits
process.on('SIGINT', async () => {
    const scraper = new CourseScraperService();
    await scraper.cleanup();
    process.exit();
});

module.exports = new CourseScraperService(); 