const WebSocket = require("ws");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");
const dns = require("dns");
const { promisify } = require("util");

puppeteer.default.use(StealthPlugin());

class CourseScraperService {
    constructor() {
        this.urlRegex =
            /^https?:\/\/(?:www\.)?(?:new\.)?(?:progressme\.ru|edvibe\.com)\/(?:sharing-material|SharingMaterial)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\/book\/\d+)?$/;
        this.socketUrls = {
            books: "wss://proxy.progressme.ru/websocket",
            socket: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx",
            debug: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx",
            auth: "wss://proxy.progressme.ru/websocket",
        };
        this.browser = null;
        this.page = null;
        this.currentXHR = {};
        this.dnsServers = [
            "8.8.8.8", // Google DNS
            "1.1.1.1", // Cloudflare DNS
            "208.67.222.222", // OpenDNS
        ];
        this.activeWs = {
            list: [],
            setNewActive: function (ws) {
                this.list.push(ws);
            },
            removeActive: function (ws) {
                this.list.splice(this.list.indexOf(ws), 1);
            },
            getActive: function () {
                return this.list;
            },
            clear: function () {
                this.list = [];
            },
            getActiveCount: function () {
                return this.list.length;
            },
            getActiveSockets: function () {
                return this.list.map((ws) => ws.socket);
            },
        };
        this.currentAuthToken = null;
        this.controllerTemplates = {
            GetIdMaterialMessage: (code) => ({
                Controller: "SharingMaterialWsController",
                Method: "GetIdMaterial",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value: `{"Code":${code}}`,
            }),
            GetBookMessage: (bookId) => ({
                Controller: "SharingMaterialWsController",
                Method: "GetBook",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value: `{"BookId":${bookId}}`,
            }),
            CopySharedBookMessage: (bookId) => ({
                Controller: "BookWsController",
                Method: "CopyBook",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value:JSON.stringify({"BookId":bookId,"IsVisible":false,"IsProtectedCopyright":false}),
            }),
            GetCurrentUserMessage: {
                controller: "Auth",
                metod: "GetCurrentUser",
                value: '""',
            },
            GetUserMessage: {
                controller: "User",
                metod: "GetSettingsSource",
                value: '""',
            },
            GetDebugMessage: {
                controller: "Debug",
                metod: "Ping",
                value: '""',
            },
        };
    }

    validateUrl(url) {
        const cleanUrl = url
            .trim()
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
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-web-security",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--disable-site-isolation-trials",
                ],
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();

            // Set a more realistic viewport
            await this.page.setViewport({
                width: 1920 + Math.floor(Math.random() * 100),
                height: 3000 + Math.floor(Math.random() * 100),
                deviceScaleFactor: 1,
                hasTouch: false,
                isLandscape: false,
                isMobile: false,
            });

            // Set more browser-like settings
            await this.page.setExtraHTTPHeaders({
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-User": "?1",
                "Sec-Fetch-Dest": "document",
            });

            // Disable request interception (allow all resources)
            await this.page.setRequestInterception(false);

            // Set random user agent
            const userAgent = randomUseragent.getRandom();
            await this.page.setUserAgent(userAgent);

            // Add additional browser characteristics
            await this.page.evaluateOnNewDocument(() => {
                // Add common browser features
                Object.defineProperty(navigator, "plugins", {
                    get: () => [
                        {
                            0: {
                                type: "application/x-google-chrome-pdf",
                                suffixes: "pdf",
                                description: "Portable Document Format",
                            },
                            description: "Portable Document Format",
                            filename: "internal-pdf-viewer",
                            length: 1,
                            name: "Chrome PDF Plugin",
                        },
                    ],
                });

                // Listen for specific network responses
                // this.page.on('response', async response => {
                //     const url = response.url();
                //     const method = response.request().method()
                //     // // console.log("tick points", url, method);

                //     // You can check for specific endpoints
                //     if (url.includes('https://progressme.ru/Account/Login') && method === "POST") {
                //         try {
                //             const responseData = await response.json();
                //             // console.log('Response data:', responseData);
                //             this.currentXHR[`${this.page.title.toString()}`].res = responseData;

                //         } catch (e) {
                //             // Handle non-JSON responses
                //             // console.log('Non-JSON response:', await response.text());
                //         }
                //     }
                // });
                // Add language preferences
                Object.defineProperty(navigator, "languages", {
                    get: () => ["en-US", "en"],
                });

                // Add WebGL support
                Object.defineProperty(window, "WebGL2RenderingContext", {
                    get: () => true,
                });

                // // Pass chrome check
                // window.chrome = {
                //     runtime: {},
                // };

                // // Pass notifications check
                // const originalQuery = window.navigator.permissions.query;
                // window.navigator.permissions.query = (parameters) => (
                //     parameters.name === 'notifications' ?
                //         Promise.resolve({ state: Notification.permission }) :
                //         originalQuery(parameters)
                // );

                // // Pass plugins check
                // Object.defineProperty(navigator, 'plugins', {
                //     get: () => [1, 2, 3, 4, 5],
                // });

                // Add media devices
                Object.defineProperty(navigator, "mediaDevices", {
                    get: () => ({
                        enumerateDevices: () =>
                            Promise.resolve([
                                {
                                    kind: "audioinput",
                                    label: "Default",
                                    deviceId: "default",
                                    groupId: "default",
                                },
                                {
                                    kind: "videoinput",
                                    label: "Default",
                                    deviceId: "default",
                                    groupId: "default",
                                },
                            ]),
                    }),
                });
            });
        }
    }

    async handleNavigateToLogin(page = this.page) {
        try {
            // Wait for network to be idle first
            await page.waitForNetworkIdle({
                timeout: 60000,
                idleTime: 500,
            });

            // console.log("page is landing page");

            const loginBtn = await page.evaluate(() => {
                return document.querySelector('button[text="start_b_login"]');
            });

            if (!loginBtn) {
                return false;
            }

            const btnBox = loginBtn.getBoundingClientRect();

            this.page.mouse.click(btnBox.x, btnBox.y, {
                delay: 50,
            });

            await page.waitForNavigation({
                timeout: 60000,
                waitUntil: ["networkidle0", "load", "domcontentloaded"],
            });
            await page.waitForNetworkIdle({
                timeout: 60000,
                idleTime: 500,
            });
        } catch (error) {
            console.error("Login navigation handling failed:", error);
            return false;
        }
    }
    async handleCaptcha(page = this.page) {
        try {
            // Wait for network to be idle first
            await page.waitForNetworkIdle({
                timeout: 60000,
                idleTime: 500,
            });

            // Check if we're on a captcha page - FIXED VERSION
            const pageContainsCaptchaButton = await page.evaluate(() => {
                return (
                    document.querySelector(".CheckboxCaptcha-Button") !== null
                );
            });

            console.log(
                "page is captcha page",
                pageHasCaptchaInUrl,
                pageContainsCaptchaButton,
            );

            // // console.log("Page is captcha page");

            // Wait for iframe to load
            // if the iframe doesn't appear after 3sec, reload the page
            // repeat 3 times
            const frameHandle = await page
                .waitForSelector('iframe[title="SmartCaptcha checkbox widget"]')
                .then((res) => res)
                .catch(async (err) => {
                    await page.reload();
                    // return void;
                });
            const frame = await frameHandle.contentFrame();

            // Get the button dimensions and position within the iframe
            const button = await frame.$(".CheckboxCaptcha-Button");
            const box = await button.boundingBox();

            // console.log("IMNR Button is found at coordinates", box);

            // Generate "human-like" mouse movement
            const points = this.generateMousePath(
                { x: 0, y: 0 },
                { x: box.x + box.width / 2, y: box.y + box.height / 2 },
            );

            // Simulate mouse movement
            for (const point of points) {
                await page.mouse.move(point.x, point.y, {
                    steps: 10, // Make movement smoother
                });
            }

            // Random delay before clicking (between 100ms and 300ms)
            await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100),
            );

            this.page.mouse.click(box.x, box.y, {
                delay: 50,
            });
            // Click the button
            // await button.click({ delay: 50 }); // Small click delay

            // Wait for navigation or success with multiple conditions
            // await Promise.race([
            //     page.waitForNetworkIdle({
            //         timeout: 60000,
            //         idleTime: 500
            //     }),
            //     page.waitForNavigation({
            //         timeout: 60000,
            //         waitUntil: ['networkidle0', 'load', 'domcontentloaded']
            //     })
            // ]).catch(() => {}); // Ignore timeout

            await page.waitForNavigation({
                timeout: 60000,
                waitUntil: ["networkidle0", "load", "domcontentloaded"],
            });
            await page.waitForNetworkIdle({
                timeout: 60000,
                idleTime: 500,
            });

            console.log(
                "Captcha is solved and redirected. current url:",
                this.page.url(),
            );

            return true;
        } catch (error) {
            console.error("Captcha handling failed:", error);
            return false;
        }
    }

    async resolveHostname(hostname) {
        for (const dnsServer of this.dnsServers) {
            try {
                const resolver = new dns.Resolver();
                resolver.setServers([dnsServer]);
                const resolve4 = promisify(resolver.resolve4.bind(resolver));
                const addresses = await resolve4(hostname);
                console.log(
                    `Successfully resolved ${hostname} to ${addresses[0]} using ${dnsServer}`,
                );
                return addresses[0];
            } catch (error) {
                console.log(
                    `DNS resolution failed with ${dnsServer}:`,
                    error.message,
                );
                continue;
            }
        }
        throw new Error("Failed to resolve hostname with all DNS servers");
    }

    async createWebSocketConnection(url, maxRetries = 3) {
        const urlObj = new URL(url);
        let retryCount = 0;

        // First try to resolve the hostname
        try {
            // Use system DNS first
            try {
                const address = await new Promise((resolve, reject) => {
                    dns.lookup(urlObj.hostname, (err, address) => {
                        if (err) reject(err);
                        else {
                            console.log(
                                `Resolved ${urlObj.hostname} to ${address}`,
                            );
                            resolve(address);
                        }
                    });
                });
                // console.log("System DNS lookup succeeded:", address);
            } catch (error) {
                // console.log("System DNS lookup failed:", error.message);
                // If system DNS fails, try our custom DNS resolvers
                await this.resolveHostname(urlObj.hostname);
            }

            while (retryCount < maxRetries) {
                try {
                    // Create WebSocket connection with additional options
                    const ws = new WebSocket(url, {
                        headers: {
                            Host: urlObj.hostname,
                            Origin: "https://progressme.ru",
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36",
                            "Accept-Language": "en-US,en;q=0.9",
                            "Accept-Encoding": "gzip, deflate, br",
                            "Cache-Control": "no-cache",
                            Pragma: "no-cache",
                            Connection: "Upgrade",
                            Upgrade: "websocket",
                        },
                        timeout: 30000,
                        followRedirects: true,
                        handshakeTimeout: 30000,
                        rejectUnauthorized: false,
                        family: 4,
                        perMessageDeflate: false,
                    });

                    return await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            ws.close();
                            reject(new Error("Connection timeout"));
                        }, 30000);

                        ws.on("open", () => {
                            clearTimeout(timeout);
                            resolve(ws);
                        });

                        ws.on("error", (error) => {
                            clearTimeout(timeout);
                            reject(error);
                        });
                    });
                } catch (error) {
                    console.log(
                        `Connection attempt ${retryCount + 1} failed:`,
                        error.message,
                    );
                    retryCount++;
                    if (retryCount === maxRetries) {
                        throw error;
                    }
                    await new Promise((resolve) =>
                        setTimeout(
                            resolve,
                            Math.min(2000 * Math.pow(2, retryCount), 20000),
                        ),
                    );
                }
            }
        } catch (error) {
            throw new Error(`Failed to establish connection: ${error.message}`);
        }
    }

    async authenticateWithWebSocket(email, password) {
        try {
            const authToken = this.generateAuthToken();
            this.currentAuthToken = authToken;
            
            
            const wsUrl = `wss://proxy.progressme.ru/websocket?token=${authToken}`;

            const ws = await this.createWebSocketConnection(wsUrl);
            // console.log("WebSocket connected successfully");
            //

            return new Promise((resolve, reject) => {
                const loginMessage = {
                    Controller: "AccountWsController",
                    Method: "Login",
                    ProjectName: "Users",
                    RequestId: this.generateAuthToken(),
                    Value: JSON.stringify({
                        Email: email,
                        Password: password,
                        RememberMe: true,
                        UserRole: 4, // From first response
                        AuthToken: authToken,
                        CurrentDomain: "progressme.ru",
                        AccountRole: 1, // From first response
                    }),
                };

                ws.send(JSON.stringify(loginMessage));
                ws.on("message", async (data) => {
                    const response = JSON.parse(data.toString());
                    // console.log("Received:", response);

                    if (response.Method === "GetAccountRoles") {
                        // Send login message after getting roles
                    }

                    if (response.Method === "Login") {
                        if (response.IsSuccess) {
                            this.currentAuthToken = authToken;
                            resolve({
                                token: authToken,
                                data: {
                                    Value: {
                                        Id: response.Value.Id,
                                        AccountRole: response.Value.Role,
                                    },
                                },
                            });
                        } else {
                            reject(
                                new Error("Login failed: " + response.Message),
                            );
                        }
                    }
                });

                ws.on("error", (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                });

                this.activeWs.setNewActive(ws);
                // Add timeout
                setTimeout(() => {
                    this.activeWs.clear();
                    ws.close();
                    reject(new Error("WebSocket authentication timeout"));
                }, 300000);
            });
        } catch (error) {
            throw new Error(
                "WebSocket authentication failed: " + error.message,
            );
        }
    }

    generateMousePath(start, end) {
        const points = [];
        const numPoints = Math.floor(Math.random() * 10) + 10; // 10-20 points

        // Generate control points for bezier curve
        const cp1 = {
            x: start.x + (Math.random() - 0.5) * 100,
            y: start.y + (Math.random() - 0.5) * 100,
        };
        const cp2 = {
            x: end.x + (Math.random() - 0.5) * 100,
            y: end.y + (Math.random() - 0.5) * 100,
        };

        // Generate points along a bezier curve
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            points.push({
                x:
                    Math.pow(1 - t, 3) * start.x +
                    3 * Math.pow(1 - t, 2) * t * cp1.x +
                    3 * (1 - t) * Math.pow(t, 2) * cp2.x +
                    Math.pow(t, 3) * end.x,
                y:
                    Math.pow(1 - t, 3) * start.y +
                    3 * Math.pow(1 - t, 2) * t * cp1.y +
                    3 * (1 - t) * Math.pow(t, 2) * cp2.y +
                    Math.pow(t, 3) * end.y,
            });
        }

        return points;
    }

    async handleApiLogin(page) {
        try {
            // Create the login request payload
            const loginData = {
                Email: this.email,
                Password: this.password,
                RememberMe: true,
                ReturnUrl: null,
            };

            // Make direct API request to login endpoint
            const response = await page.evaluate(async (data) => {
                const response = await fetch(
                    "https://progressme.ru/Account/Login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(data),
                        credentials: "include",
                    },
                );

                return {
                    status: response.status,
                    ok: response.ok,
                    url: response.url,
                };
            }, loginData);

            if (response.ok) {
                // Wait for redirect/navigation after successful login
                await page.waitForNavigation({
                    waitUntil: ["networkidle0", "load", "domcontentloaded"],
                    timeout: 60000,
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error("API login failed:", error);
            return false;
        }
    }

    async authenticateWithProgressMe(email, password) {
        try {
            await this.initBrowser();

            // Navigate to login page with increased timeout
            await this.page.goto("https://progressme.ru/Account/Login", {
                waitUntil: ["networkidle0", "load", "domcontentloaded"],
                timeout: 60000,
            });

            // Navigate using keyboard instead of goto
            // await this.navigateWithKeyboard(this.page, 'https://progressme.ru/Account/Login');

            // console.log("Page is loaded", this.page.url());

            // Monitor the login endpoint for response
            // this.currentXHR = {};
            // const monitor = await this.monitorEndpoint(this.page, "POST","https://progressme.ru/Account/Login");
            // const monitorComplete = await monitor;

            const pageHasCaptchaInUrl = this.page
                .url()
                .startsWith("https://progressme.ru/showcaptcha?");
            const pageIsLandingPage =
                this.page.url() === "https://progressme.ru";
            if (pageIsLandingPage) {
                await this.handleNavigateToLogin(this.page);
            }

            if (pageHasCaptchaInUrl) {
                // Handle any initial captcha
                await this.handleCaptcha(this.page);
            }

            // const currentUrl = this.page.url();
            const newPage = this.page; //await this.createNewTabWithUrl(currentUrl);

            // Find the form
            const fieldsFound = await newPage.evaluate(() => {
                console.log(
                    "email:",
                    document.querySelector('input[name="Email"]')?.tagName,
                );
                console.log(
                    "pw:",
                    document.querySelector('input[name="Password"]')?.tagName,
                );
                console.log(
                    "btn:",
                    document.querySelector('button[data-bind="click:GetRoles"]')
                        ?.tagName,
                );

                return (
                    document.querySelector('input[name="Email"]')?.type !==
                        null &&
                    document.querySelector('input[name="Password"]')?.type !==
                        null &&
                    document.querySelector(
                        'button[data-bind="click:GetRoles"]',
                    ) !== null
                );
            });

            //// Fill in login form
            // console.log("creds", email, password);

            // console.log("fields found:? ", fieldsFound);

            if (!fieldsFound) {
                throw new Error("Authentication failed: No auth fields found");
                // const oldpage = this.page;
                // this.page = await this.browser.newPage();
                // await oldpage.close();
                // return this.authenticateWithProgressMe(email, password)
            }

            await newPage.type('input[name="Email"]', email);
            await newPage.type('input[name="Password"]', password);
            await newPage.click('button[data-bind="click:GetRoles"]'),
                // Wait for either navigation or network idle
                await Promise.race([
                    newPage.waitForNavigation({
                        timeout: 60000,
                        waitUntil: ["networkidle0", "load", "domcontentloaded"],
                    }),
                    newPage.waitForNetworkIdle({
                        timeout: 60000,
                        idleTime: 500,
                    }),
                ]);

            // console.log("XHR::", this.currentXHR);

            const response = this.currentXHR[`${newPage.title.toString()}`].res;

            // Handle any post-login captcha
            await this.handleCaptcha(newPage);

            // Get cookies for WebSocket connection
            const cookies = await this.browser.cookies();
            // const debugInfo = this.browser.debugInfo;

            // const authCookie = cookies.find(cookie => cookie.name === '.ASPXAUTH');
            const authToken = cookies.find(
                (cookie) => cookie.name === "Auth-Token",
            );
            // console.log("cookies", authToken);

            // console.log("debugInfo", response);

            if (!authToken?.value) {
                throw new Error("Authentication failed: No auth cookie found");
            }

            return {
                token: authToken.value,
                data: this.currentXHR[`${newPage.title.toString()}`],
                // cookies: cookies
            };
        } catch (error) {
            throw new Error("Authentication failed: " + error.message);
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
                value: JSON.stringify({
                    Code: targetUrl.split("SharingMaterial/")[1] || "",
                }),
            },
            GetBook: {
                controller: "SharingMaterialWsController",
                method: "GetBook",
                value: JSON.stringify({ BookId: bookId, UserId: null }),
            },
            CopyBook: {
                controller: "BookWsController",
                method: "CopyBook",
                value: JSON.stringify({ BookId: bookId, UserId: userId }),
            },
        };
    }

    async connectToWebSocket(url, token, messageHandler) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(
                `${url}?Page=TeacherProfile&isSharing=True&token=${token}`,
            );

            ws.on("open", () => {
                resolve(ws);
            });

            ws.on("message", (data) => {
                messageHandler(data);
            });

            ws.on("error", (error) => {
                reject(error);
            });
        });
    }

    async getBook(bookCode) {
        try {
            const wsUrl = `${this.socketUrls.books}?Page=TeacherProfile&isSharing=True&token=${this.currentAuthToken}`;
            // console.log(wsUrl);
            const ws = await this.createWebSocketConnection(wsUrl);
            const bookInfo = {
                bookId: "",
                bookName: "",
            };
            return new Promise((resolve, reject) => {
                const getBookIdStringed = JSON.stringify(
                    this.controllerTemplates.GetIdMaterialMessage(
                        `\"${bookCode}\"`
                    ),
                );
                // console.log("getBookIdStringed", getBookIdStringed);
                ws.send(getBookIdStringed);

                ws.on("message", async (data) => {
                    const response = JSON.parse(data.toString());
                    // console.log("Received:", response);
                    if (
                        response.Class === "SharingMaterialWsController" &&
                        response.Method === "GetIdMaterial"
                    ) {
                        // // console.log("book", response);
                        // const bookId = response.Value.;
                        bookInfo.bookId = response.Value.BookId;
                        ws.send(
                            JSON.stringify(
                                this.controllerTemplates.GetBookMessage(
                                    `\"${bookInfo.bookId}\"`,
                                ),
                            ),
                        );
                        // resolve({bookId:response.data.Value.BookId, bookName:""})
                    }

                    if (
                        response.Class === "SharingMaterialWsController" &&
                        response.Method === "GetBook"
                    ) {
                        // console.log("book", response);
                        bookInfo.bookName = response.Value.Name;
                        resolve({ ...bookInfo });
                    }
                });

                ws.on("error", (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                });

                this.activeWs.setNewActive(ws);
                // Add timeout
                setTimeout(() => {
                    this.activeWs.clear();
                    ws.close();
                    reject(new Error("WebSocket authentication timeout"));
                }, 300000);
            });
        } catch (error) {
            console.error("Error getting book:", error);
            throw error;
        }
    }

    async copyCourse(bookId, userId) {
        try {
            const wsUrl = `${this.socketUrls.books}?Page=TeacherProfile&isSharing=True&token=${this.currentAuthToken}`;
            // console.log(wsUrl);
            const ws = await this.createWebSocketConnection(wsUrl);
            
            return new Promise((resolve, reject) => {
                const copyBookStringed = JSON.stringify(
                    this.controllerTemplates.CopySharedBookMessage(
                        bookId
                    ),
                );
                // console.log("copyBookStringed", copyBookStringed);
                ws.send(copyBookStringed);

                ws.on("message", async (data) => {
                    const response = JSON.parse(data.toString());
                    // console.log("Received:", response);

                    if (
                        response.Class === "BookWsController" &&
                        response.Method === "CopyBook"
                    ) {
                        // console.log("book", response);
                        
                        resolve({ success: response.IsSuccess, message: "Book Saved!" });
                    }
                });
                

                ws.on("error", (error) => {
                    console.error("WebSocket error:", error);
                    reject(error);
                });

                this.activeWs.setNewActive(ws);
                // Add timeout
                setTimeout(() => {
                    this.activeWs.clear();
                    ws.close();
                    reject(new Error("WebSocket authentication timeout"));
                }, 300000);
            });
        } catch (error) {
            console.error("Error copying book:", error);
            throw error;
        }
    }

    async monitorEndpoint(page, targetMethod, endpointUrl) {
        return new Promise((resolve, reject) => {
            const responseHandler = async (response) => {
                const url = response.url();
                const method = response.request().method();
                if (url.includes(endpointUrl) && method === targetMethod) {
                    try {
                        const responseData = await response.json();
                        page.removeListener("response", responseHandler);
                        this.currentXHR[`${this.page.title.toString()}`] =
                            responseData;
                        resolve(responseData);
                    } catch (e) {
                        reject(e);
                    }
                }
            };

            page.on("response", responseHandler);
        });
    }

    generateAuthToken() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            },
        );
    }

    async createNewTabWithUrl(originalUrl) {
        try {
            // Create a new page/tab
            const newPage = await this.browser.newPage();

            // Apply the same settings as the original page
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

            // Navigate to the URL
            await this.page.goto(originalUrl, {
                waitUntil: ["networkidle0", "load", "domcontentloaded"],
                timeout: 60000,
            });

            // Close the old page
            if (this.page) {
                await this.page.close();
            }

            // Set the new page as the current page
            this.page = newPage;

            return newPage;
        } catch (error) {
            console.error("Error creating new tab:", error);
            throw error;
        }
    }

    async navigateWithKeyboard(page = this.page, url) {
        try {
            // console.log("navigate with keyboard");

            // Small delay before typing
            await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 2000 + 500),
            );
            // console.log("toggling address bar...");

            // Focus the address bar (Cmd/Ctrl + L)
            await page.keyboard.down(
                process.platform === "darwin" ? "MetaLeft" : "ControlLeft",
            );
            await page.keyboard.press("KeyL");
            await page.keyboard.up(
                process.platform === "darwin" ? "MetaLeft" : "ControlLeft",
            );

            // Small delay before typing
            await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100),
            );

            // console.log("emptying adressbar...");

            // Clear existing URL using proper key definitions
            await page.keyboard.down("ControlLeft");
            await page.keyboard.press("KeyA");
            await page.keyboard.up("ControlLeft");
            await page.keyboard.press("Backspace");

            // console.log("typing address...");

            // Type URL with random delays between characters
            // for (const char of url) {
            await page.keyboard.type(url, {
                delay: Math.random() * 100 + 30, // 30-130ms delay between keystrokes
            });
            // }

            // Small delay before pressing enter
            await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100),
            );

            // console.log("navigating...");

            // Press enter and wait for navigation
            await Promise.all([
                page.keyboard.press("Enter"),
                page.waitForNavigation({
                    waitUntil: ["networkidle0", "load", "domcontentloaded"],
                    timeout: 60000,
                }),
            ]);

            return true;
        } catch (error) {
            console.error("Navigation failed:", error);
            return false;
        }
    }
    // async handleCaptcha(page) {
    //     try {
    //         // Wait for network to be idle first
    //         await page.waitForNetworkIdle({
    //             timeout: 60000,
    //             idleTime: 500
    //         });

    //         // Check if we're on a captcha page
    //         const pageHasCaptchaInUrl = page.url().startsWith('https://progressme.ru/showcaptcha?');

    //         if (!pageHasCaptchaInUrl) return true;

    //         // console.log("Page is captcha page");

    //         // Create new tab with same URL if components seem disabled
    //         const currentUrl = page.url();
    //         // await this.createNewTabWithUrl(currentUrl);

    //         // Wait for iframe to load in new tab
    //         const frameHandle = await this.page.waitForSelector('iframe[title="SmartCaptcha checkbox widget"]');
    //         const frame = await frameHandle.contentFrame();

    //         // Get the button dimensions and position within the iframe
    //         const button = await frame.$('.CheckboxCaptcha-Button');
    //         const box = await button.boundingBox();

    //         // console.log("IMNR Button is found at coordinates", box);

    //         // Generate "human-like" mouse movement
    //         const points = this.generateMousePath(
    //             { x: 0, y: 0 },
    //             { x: box.x + box.width/2, y: box.y + box.height/2 }
    //         );

    //         // Simulate mouse movement
    //         for (const point of points) {
    //             await this.page.mouse.move(point.x, point.y, {
    //                 steps: 10 // Make movement smoother
    //             });
    //         }

    //         // Random delay before clicking (between 100ms and 300ms)
    //         await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

    //         // Click the button
    //         await button.click({ delay: 50 }); // Small click delay

    //         // Wait for navigation or success with multiple conditions
    //         await Promise.race([
    //             this.page.waitForNetworkIdle({
    //                 timeout: 60000,
    //                 idleTime: 500
    //             }),
    //             this.page.waitForNavigation({
    //                 timeout: 60000,
    //                 waitUntil: ['networkidle0', 'load', 'domcontentloaded']
    //             })
    //         ]).catch(() => {}); // Ignore timeout

    //         // console.log("Captcha is solved");

    //         return true;
    //     } catch (error) {
    //         console.error('Captcha handling failed:', error);
    //         return false;
    //     }
    // }
}

// Make sure to clean up when the process exits
process.on("SIGINT", async () => {
    const scraper = new CourseScraperService();
    await scraper.cleanup();
    process.exit();
});

module.exports = new CourseScraperService();
