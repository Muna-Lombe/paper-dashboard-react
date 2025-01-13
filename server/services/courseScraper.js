const WebSocket = require('ws');
const axios = require('axios');

class CourseScraperService {
    constructor() {
        this.urlRegex = /^https?:\/\/(?:www\.)?(?:new\.)?(?:progressme\.ru|edvibe\.com)\/(?:sharing-material|SharingMaterial)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\/book\/\d+)?$/;
        this.socketUrls = {
            books: "wss://books.progressme.ru/websocket",
            socket: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx",
            debug: "wss://progressme.ru/ws/WebSockets/SocketHandler.ashx"
        };
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

    async authenticateWithProgressMe(email, password) {
        try {
            const response = await axios.post('https://new.progressme.ru/Account/Login', {
                Email: email,
                Password: password,
                UserRole: 0,
                ReturnUrl: ''
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Origin': 'https://progressme.ru',
                    'Referer': 'https://progressme.ru/Account/Login',
                    'Cache-Control': 'no-cache',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'User-Agent': 'PostmanRuntime/7.42.0'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error('Authentication failed: ' + error.message);
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

    generateAuthToken() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

module.exports = new CourseScraperService(); 