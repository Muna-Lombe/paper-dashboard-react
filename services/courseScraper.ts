// Types and Interfaces
// Note: This file is designed to work in Cloudflare Workers environment
// It uses the global WebSocket API available in Workers, not the Node.js 'ws' package
interface SocketUrls {
    books: string;
    socket: string;
    debug: string;
    auth: string;
}

interface ControllerMessage {
    Controller: string;
    Method: string;
    ProjectName: string;
    RequestId: string;
    Value: string;
}

interface SimpleControllerMessage {
    controller: string;
    metod: string;
    value: string;
}

interface ActiveWebSocket {
    socket: WebSocket;
    url: string;
    token?: string;
}

interface ActiveWsManager {
    list: ActiveWebSocket[];
    setNewActive: (ws: ActiveWebSocket) => void;
    removeActive: (ws: ActiveWebSocket) => void;
    getActive: () => ActiveWebSocket[];
    clear: () => void;
    getActiveCount: () => number;
    getActiveSockets: () => WebSocket[];
}

interface BookData {
    id?: number;
    code?: string;
    [key: string]: any;
}

interface XHRData {
    [key: string]: any;
}

/**
 * CourseScraperService - Handles scraping courses from ProgressMe platform
 * 
 * NOTE: This service uses WebSocket connections to interact with ProgressMe.
 * It is NOT suitable for use in Cloudflare Workers due to:
 * - 30-second CPU time limit
 * - Long-lived WebSocket connections
 * - Multi-step operations that exceed timeout
 * 
 * For production use, this should be deployed as an external service.
 */
class CourseScraperService {
    private urlRegex: RegExp;
    private socketUrls: SocketUrls;
    private browser: any; // Puppeteer (not used in Workers)
    private page: any; // Puppeteer (not used in Workers)
    private currentXHR: XHRData;
    private activeWs: ActiveWsManager;
    private currentBook: BookData;
    public currentAuthToken: string | null; // Make public for DO access
    private controllerTemplates: {
        Login: (email: string, password: string, authToken: string, userRole: number, accountRole: number) => ControllerMessage;
        IsCanSharingMaterialMessage: (bookId: number, userId: number) => ControllerMessage;
        GetSharingMaterialMessage: (bookId: number) => ControllerMessage;
        GetIdMaterialMessage: (code: string) => ControllerMessage;
        GetBookMessage: (bookId: number) => ControllerMessage;
        CopySharedBookMessage: (bookId: number, sharingMaterialId: string) => ControllerMessage;
        GetCurrentUserMessage: SimpleControllerMessage;
        GetUserMessage: SimpleControllerMessage;
        GetDebugMessage: SimpleControllerMessage;
        GetAccountRole:(email: string, password: string) => ControllerMessage;
    };

    constructor() {
        this.urlRegex =
            /^https?:\/\/(?:www\.)?(?:new\.)?(?:progressme\.ru|edvibe\.com)\/(?:sharing-material|SharingMaterial)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\/book\/\d+)?$|https:\/\/progressme\.ru\/cabinet\/school\/materials\/book\/\d+\/content$/;
        this.socketUrls = {
            books: "wss://proxy.progressme.ru/websocket",
            socket: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx",
            debug: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx",
            auth: "wss://proxy.progressme.ru/websocket",
        };
        this.browser = null;
        this.page = null;
        this.currentXHR = {};
        this.activeWs = {
            list: [],
            setNewActive: function (ws: ActiveWebSocket) {
                this.list.push(ws);
            },
            removeActive: function (ws: ActiveWebSocket) {
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
        this.currentBook = {};
        this.currentAuthToken = null;
        this.controllerTemplates = {
            Login: (email: string, password: string, authToken: string, userRole: number, accountRole: number) => ({
                Controller: "AccountWsController",
                Method: "Login",
                ProjectName: "Users",
                RequestId: this.generateAuthToken(),
                Value: JSON.stringify({
                    Email: `${email}`,
                    Password: `${password}`,
                    RememberMe: true,
                    UserRole: userRole, // From first response
                    AccountRole: accountRole, // Added from original JS implementation
                    AuthToken: authToken,
                    CurrentDomain: "progressme.ru",
                }),
            }),
            IsCanSharingMaterialMessage: (bookId: number, userId: number) => ({
                Controller: "BookWsController",
                Method: "IsCanSharingMaterial",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value: `{"BookId":${bookId}, "UserId":${userId}, "SchoolId":null}`,
            }),
            GetSharingMaterialMessage: (bookId: number) => ({
                Controller: "SharingMaterialWsController",
                Method: "GetSharingMaterial",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value: `{"BookId":${bookId}, "IsInitIfEmpty":true}`,
            }),
            GetIdMaterialMessage: (code: string) => ({
                Controller: "SharingMaterialWsController",
                Method: "GetIdMaterial",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value: `{"Code":${code}}`,
            }),
            GetBookMessage: (bookId: number) => ({
                Controller: "SharingMaterialWsController",
                Method: "GetBook",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value: `{"BookId":${bookId}}`,
            }),
            CopySharedBookMessage: (bookId: number, sharingMaterialId: string) => ({
                Controller: "BookWsController",
                Method: "CopyBook",
                ProjectName: "Books",
                RequestId: this.generateAuthToken(),
                Value:
                    '{"BookId":' +
                    bookId +
                    ',"IsVisible":false,"IsProtectedCopyright":false, "SharingMaterialId":"' +
                    sharingMaterialId +
                    '"}',
            }),
            GetAccountRole: (email:string, password:string) =>({
                Controller: "AccountWsController",
                Method: "GetAccountRoles",
                RequestId: this.generateAuthToken(),
                ProjectName: "Users",
                Value: `{\"Email\":\"${email}\",\"Password\":\"${password}\",\"Domain\":\"progressme.ru\"}`,
                
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

    /**
     * Create a WebSocket connection to the specified URL
     * This uses the global WebSocket API available in Cloudflare Workers
     */
    async createWebSocketConnection(url: string, maxRetries: number = 3): Promise<WebSocket> {
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                // Use the global WebSocket constructor available in Cloudflare Workers
                // Note: Custom headers are not supported in the standard WebSocket constructor
                // For custom headers, use fetch() with Upgrade header instead
                const ws = new WebSocket(url);

                return await new Promise<WebSocket>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        ws.close();
                        reject(new Error("Connection timeout"));
                    }, 30000);

                    ws.addEventListener("open", () => {
                        clearTimeout(timeout);
                        resolve(ws);
                    });

                    ws.addEventListener("error", (event: Event) => {
                        clearTimeout(timeout);
                        reject(new Error("WebSocket error"));
                    });

                    ws.addEventListener("close", (event: CloseEvent) => {
                        if (!timeout) return; // Already resolved
                        clearTimeout(timeout);
                        reject(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
                    });
                });
            } catch (error: any) {
                console.log(
                    `Connection attempt ${retryCount + 1} failed:`,
                    error.message,
                );
                retryCount++;
                if (retryCount === maxRetries) {
                    throw error;
                }
                // Exponential backoff
                await new Promise((resolve) =>
                    setTimeout(
                        resolve,
                        Math.min(1000 * Math.pow(2, retryCount), 10000),
                    ),
                );
            }
        }
        throw new Error("Max retries reached");
    }

    async authenticateWithWebSocket(email: string, password: string): Promise<any> {
        try {
            const authToken = this.generateAuthToken();
            this.currentAuthToken = authToken;

            const wsUrl = `wss://proxy.edvibe.com/websocket?token=${authToken}`;

            const ws = await this.createWebSocketConnection(wsUrl);



            return new Promise((resolve, reject) => {
                const getAccountRoleMessage = this.controllerTemplates.GetAccountRole(email, password) 
                const loginMessage: ControllerMessage = this.controllerTemplates.Login(email, password, authToken, 4, 1);
                
                console.log("Sending login message:", JSON.stringify(loginMessage, null, 2));

                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("Authentication timeout"));
                }, 30000);

                ws.addEventListener("message", (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        console.log("Auth response:", JSON.stringify(response, null, 2));
                        console.log("Auth response details:", {
                            Success: response.Success,
                            ErrorMessage: response.ErrorMessage,
                            ErrorCode: response.ErrorCode,
                            ResponseId: response.ResponseId,
                            RequestId: response.RequestId,
                            hasValue: !!response.Value
                        });

                        if (response.Success) {
                            clearTimeout(timeout);
                            this.activeWs.setNewActive({
                                socket: ws,
                                url: wsUrl,
                                token: authToken,
                            });
                            resolve({
                                success: true,
                                token: authToken,
                                ws: ws,
                                response: response,
                            });
                        } else {
                            clearTimeout(timeout);
                            ws.close();
                            const errorMsg = response.ErrorMessage || response.Error || "Authentication failed";
                            console.error("ProgressMe authentication rejected:", {
                                errorMessage: errorMsg,
                                errorCode: response.ErrorCode,
                                fullResponse: response
                            });
                            reject(
                                new Error(`Rejected with reason: ${errorMsg}`),
                            );
                        }
                    } catch (error: any) {
                        clearTimeout(timeout);
                        ws.close();
                        console.error("Failed to parse ProgressMe response:", {
                            error: error.message,
                            rawData: event.data
                        });
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });

                ws.addEventListener("error", (event: Event) => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket error during authentication"));
                });

                ws.addEventListener("close", (event: CloseEvent) => {
                    clearTimeout(timeout);
                    reject(new Error("Connection closed unexpectedly"));
                });

                // Send login message
                ws.send(JSON.stringify(loginMessage));
            });
        } catch (error: any) {
            throw new Error(`WebSocket authentication failed: ${error.message}`);
        }
    }

    generateSocketMessages(targetUrl: string, bookId: number, userId: number): ControllerMessage[] {
        const messages: ControllerMessage[] = [];

        if (targetUrl.includes("sharing-material") || targetUrl.includes("SharingMaterial")) {
            messages.push(this.controllerTemplates.IsCanSharingMaterialMessage(bookId, userId));
            messages.push(this.controllerTemplates.GetSharingMaterialMessage(bookId));
        }

        if (targetUrl.includes("/book/")) {
            messages.push(this.controllerTemplates.GetBookMessage(bookId));
        }

        return messages;
    }

    async connectToWebSocket(
        url: string,
        token: string,
        messageHandler: (data: any) => void
    ): Promise<WebSocket> {
        const ws = await this.createWebSocketConnection(url);

        ws.addEventListener("message", (event: MessageEvent) => {
            const response = JSON.parse(event.data as string);
            messageHandler(response);
        });

        ws.addEventListener("error", (event: Event) => {
            console.error("WebSocket error:", event);
        });

        return ws;
    }

    async getIdMaterial(code: string): Promise<any> {
        try {
            const wsUrl = `wss://proxy.progressme.ru/websocket?token=${this.currentAuthToken}`;
            const ws = await this.createWebSocketConnection(wsUrl);

            return new Promise((resolve, reject) => {
                const message = this.controllerTemplates.GetIdMaterialMessage(code);

                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("GetIdMaterial timeout"));
                }, 30000);

                ws.addEventListener("message", (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        if (response.Success) {
                            clearTimeout(timeout);
                            ws.close();
                            const result = JSON.parse(response.Result);
                            resolve(result);
                        } else {
                            clearTimeout(timeout);
                            ws.close();
                            reject(
                                new Error(
                                    response.ErrorMessage || "Failed to get material ID",
                                ),
                            );
                        }
                    } catch (error: any) {
                        clearTimeout(timeout);
                        ws.close();
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });

                ws.addEventListener("error", (event: Event) => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket error"));
                });

                ws.send(JSON.stringify(message));
            });
        } catch (error: any) {
            throw new Error(`getIdMaterial failed: ${error.message}`);
        }
    }

    async getBookById(bookId: number): Promise<any> {
        try {
            const wsUrl = `wss://proxy.progressme.ru/websocket?token=${this.currentAuthToken}`;
            const ws = await this.createWebSocketConnection(wsUrl);

            return new Promise((resolve, reject) => {
                const message = this.controllerTemplates.GetBookMessage(bookId);

                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("GetBookById timeout"));
                }, 30000);

                ws.addEventListener("message", (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        if (response.Success) {
                            clearTimeout(timeout);
                            ws.close();
                            const result = JSON.parse(response.Result);
                            resolve(result);
                        } else {
                            clearTimeout(timeout);
                            ws.close();
                            reject(
                                new Error(response.ErrorMessage || "Failed to get book"),
                            );
                        }
                    } catch (error: any) {
                        clearTimeout(timeout);
                        ws.close();
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });

                ws.addEventListener("error", (event: Event) => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket error"));
                });

                ws.send(JSON.stringify(message));
            });
        } catch (error: any) {
            throw new Error(`getBookById failed: ${error.message}`);
        }
    }

    async getBookByCode(bookCode: string): Promise<any> {
        try {
            const wsUrl = `wss://proxy.progressme.ru/websocket?token=${this.currentAuthToken}`;
            const ws = await this.createWebSocketConnection(wsUrl);

            return new Promise((resolve, reject) => {
                const message = this.controllerTemplates.GetIdMaterialMessage(bookCode);

                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("GetBookByCode timeout"));
                }, 30000);

                ws.addEventListener("message", (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        if (response.Success) {
                            const materialData = JSON.parse(response.Result);
                            // Now get the full book data
                            this.getBookById(materialData.BookId)
                                .then((bookData) => {
                                    clearTimeout(timeout);
                                    ws.close();
                                    resolve(bookData);
                                })
                                .catch((error: Error) => {
                                    clearTimeout(timeout);
                                    ws.close();
                                    reject(error);
                                });
                        } else {
                            clearTimeout(timeout);
                            ws.close();
                            reject(
                                new Error(
                                    response.ErrorMessage || "Failed to get book by code",
                                ),
                            );
                        }
                    } catch (error: any) {
                        clearTimeout(timeout);
                        ws.close();
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });

                ws.addEventListener("error", (event: Event) => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket error"));
                });

                ws.send(JSON.stringify(message));
            });
        } catch (error: any) {
            throw new Error(`getBookByCode failed: ${error.message}`);
        }
    }

    async isCanSharingMaterial(bookId: number, userId: number, token: string): Promise<any> {
        try {
            const wsUrl = `wss://proxy.progressme.ru/websocket?token=${token}`;
            const ws = await this.createWebSocketConnection(wsUrl);

            return new Promise((resolve, reject) => {
                const message = this.controllerTemplates.IsCanSharingMaterialMessage(
                    bookId,
                    userId
                );

                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("IsCanSharingMaterial timeout"));
                }, 30000);

                ws.addEventListener("message", (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        if (response.Success) {
                            clearTimeout(timeout);
                            ws.close();
                            const result = JSON.parse(response.Result);
                            resolve(result);
                        } else {
                            clearTimeout(timeout);
                            ws.close();
                            reject(
                                new Error(
                                    response.ErrorMessage ||
                                        "Failed to check sharing material",
                                ),
                            );
                        }
                    } catch (error: any) {
                        clearTimeout(timeout);
                        ws.close();
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });

                ws.addEventListener("error", (event: Event) => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket error"));
                });

                ws.send(JSON.stringify(message));
            });
        } catch (error: any) {
            throw new Error(`isCanSharingMaterial failed: ${error.message}`);
        }
    }

    async setSharingMaterialId(bookId: number, token: string): Promise<any> {
        try {
            const wsUrl = `wss://proxy.progressme.ru/websocket?token=${token}`;
            const ws = await this.createWebSocketConnection(wsUrl);

            return new Promise((resolve, reject) => {
                const message = this.controllerTemplates.GetSharingMaterialMessage(bookId);

                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("SetSharingMaterialId timeout"));
                }, 30000);

                ws.addEventListener("message", (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        if (response.Success) {
                            clearTimeout(timeout);
                            ws.close();
                            const result = JSON.parse(response.Result);
                            resolve(result);
                        } else {
                            clearTimeout(timeout);
                            ws.close();
                            reject(
                                new Error(
                                    response.ErrorMessage ||
                                        "Failed to set sharing material ID",
                                ),
                            );
                        }
                    } catch (error: any) {
                        clearTimeout(timeout);
                        ws.close();
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });

                ws.addEventListener("error", (event: Event) => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket error"));
                });

                ws.send(JSON.stringify(message));
            });
        } catch (error: any) {
            throw new Error(`setSharingMaterialId failed: ${error.message}`);
        }
    }

    async copyCourse(bookId: number, userId: number, token: string): Promise<any> {
        try {
            // First check if we can share the material
            const canShare = await this.isCanSharingMaterial(bookId, userId, token);
            if (!canShare) {
                throw new Error("Cannot share this material");
            }

            // Get sharing material ID
            const sharingMaterial = await this.setSharingMaterialId(bookId, token);
            if (!sharingMaterial || !sharingMaterial.Id) {
                throw new Error("Failed to get sharing material ID");
            }

            // Now copy the book
            const wsUrl = `wss://proxy.progressme.ru/websocket?token=${token}`;
            const ws = await this.createWebSocketConnection(wsUrl);

            return new Promise((resolve, reject) => {
                const message = this.controllerTemplates.CopySharedBookMessage(
                    bookId,
                    sharingMaterial.Id
                );

                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error("CopyCourse timeout"));
                }, 30000);

                ws.addEventListener("message", (event: MessageEvent) => {
                    try {
                        const response = JSON.parse(event.data as string);
                        if (response.Success) {
                            clearTimeout(timeout);
                            ws.close();
                            const result = JSON.parse(response.Result);
                            resolve(result);
                        } else {
                            clearTimeout(timeout);
                            ws.close();
                            reject(
                                new Error(response.ErrorMessage || "Failed to copy course"),
                            );
                        }
                    } catch (error: any) {
                        clearTimeout(timeout);
                        ws.close();
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });

                ws.addEventListener("error", (event: Event) => {
                    clearTimeout(timeout);
                    reject(new Error("WebSocket error"));
                });

                ws.send(JSON.stringify(message));
            });
        } catch (error: any) {
            throw new Error(`copyCourse failed: ${error.message}`);
        }
    }

    generateMousePath(
        start: { x: number; y: number },
        end: { x: number; y: number }
    ): { x: number; y: number }[] {
        const path: { x: number; y: number }[] = [];
        const steps = Math.floor(Math.random() * 10) + 10; // 10-20 steps

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            // Add some randomness to make it look more human
            const randomX = (Math.random() - 0.5) * 5;
            const randomY = (Math.random() - 0.5) * 5;

            path.push({
                x: start.x + (end.x - start.x) * t + randomX,
                y: start.y + (end.y - start.y) * t + randomY,
            });
        }
        return path;
    }

    async cleanup(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
        this.activeWs.clear();
    }

    validateUrl(url: string): boolean {
        if (!url) {
            console.error("URL is required");
            return false;
        }

        return this.urlRegex.test(url);
    }

    generateAuthToken(): string {
        // Generate UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        const chars = "0123456789abcdef";
        const segments = [8, 4, 4, 4, 12]; // Length of each segment
        
        let token = "";
        for (let i = 0; i < segments.length; i++) {
            if (i > 0) token += "-";
            for (let j = 0; j < segments[i]; j++) {
                token += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }
        return token;
    }

    // Note: The following methods (initBrowser, handleApiLogin, authenticateWithProgressMe, etc.)
    // use Puppeteer which is commented out in the original file.
    // These are intentionally omitted as they are not functional and would require
    // significant refactoring for production use.
}

// Export a singleton instance
export default new CourseScraperService();

