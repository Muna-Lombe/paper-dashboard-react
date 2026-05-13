// import { DurableObject } from 'cloudflare:workers';
import { DurableObject, DurableObjectNamespace, DurableObjectState } from '@cloudflare/workers-types/experimental';
import { Env } from '..';
import CourseScraperService from '../../services/courseScraper';
import { LogHogClient } from '../services/loggerService';

/**
 * CourseScraperDurableObject - Manages stateful course scraping operations
 * 
 * Each user gets their own Durable Object instance, which:
 * - Maintains persistent WebSocket connections to ProgressMe
 * - Stores authentication tokens
 * - Caches book data
 * - Handles long-running scraping operations
 */
export class CourseScraperDurableObject implements DurableObject {
    private ctx: DurableObjectState;
    private env: Env;
    private scraper: typeof CourseScraperService;
    private authToken: string | null = null;
    private progressMeToken: string | null = null;
    private userId: string | null = null;
    private logger: LogHogClient | null = null;

    constructor(ctx: DurableObjectState, env: Env) {
        this.ctx = ctx;
        this.env = env;
        this.scraper = CourseScraperService;
        
        
        // Initialize logger if available
        if (env.LOG_API && env.LOGHOG_APP_TOKEN) {
            this.logger = new LogHogClient(
                env.LOG_API,
                env.LOGHOG_APP_TOKEN,
                (promise) => Promise.all([promise]) // Simple waitUntil for DO
            );
        }
    }

    /**
     * Handle incoming requests to the Durable Object
     */
    // @ts-ignore - Type mismatch between Cloudflare Workers Request and standard Request
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const pathname = url.pathname;

        try {
            // Restore state from storage
            if (!this.authToken && !this.progressMeToken) {
                await this.restoreState();
            }

            // Route to appropriate handler
            switch (pathname) {
                case '/authenticate':
                    return await this.handleAuthenticate(request);
                
                case '/validate-url':
                    return await this.handleValidateUrl(request);
                
                case '/get-book':
                    return await this.handleGetBook(request);
                
                case '/copy-course':
                    return await this.handleCopyCourse(request);
                
                case '/set-sharing-material':
                    return await this.handleSetSharingMaterial(request);
                
                case '/check-can-share':
                    return await this.handleCheckCanShare(request);
                
                case '/health':
                    return new Response(JSON.stringify({ 
                        status: 'ok',
                        authenticated: !!this.progressMeToken,
                        userId: this.userId
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                
                default:
                    return new Response(JSON.stringify({ 
                        error: 'Not found',
                        path: pathname 
                    }), { 
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    });
            }
        } catch (error: any) {
            this.logger?.error('Durable Object error', {
                body: {
                    error: error.message,
                    stack: error.stack,
                    pathname: pathname,
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '', // Durable Objects don't have trace_id by default
                span_id: '', // Durable Objects don't have span_id by default
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: pathname } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * Restore state from Durable Object storage
     */
    private async restoreState(): Promise<void> {
        const storedAuthToken = await this.ctx.storage.get<string>('authToken');
        const storedProgressMeToken = await this.ctx.storage.get<string>('progressMeToken');
        const storedUserId = await this.ctx.storage.get<string>('userId');

        if (storedAuthToken) this.authToken = storedAuthToken;
        if (storedProgressMeToken) {
            this.progressMeToken = storedProgressMeToken;
            this.scraper.currentAuthToken = storedProgressMeToken;
        }
        if (storedUserId) this.userId = storedUserId;

        this.logger?.info('State restored', {
            body: {
                hasAuthToken: !!this.authToken,
                hasProgressMeToken: !!this.progressMeToken,
                userId: this.userId,
            },
            source_ip: '',
            category: 'scraper',
            trace_id: '',
            span_id: '',
            template: { name: 'INFO', params: { statusCode: 200, method: 'INTERNAL', path: '/restore-state' } },
            tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
        });
    }

    /**
     * Save state to Durable Object storage
     */
    private async saveState(): Promise<void> {
        const batch: Record<string, string | null> = {};
        
        if (this.authToken) batch.authToken = this.authToken;
        if (this.progressMeToken) batch.progressMeToken = this.progressMeToken;
        if (this.userId) batch.userId = this.userId;

        await this.ctx.storage.put(batch);
    }

    /**
     * Handle authentication with ProgressMe
     */
    private async handleAuthenticate(request: Request): Promise<Response> {
        const { email, password, userId } = await request.json() as { 
            email: string; 
            password: string;
            userId: string;
        };

        this.logger?.info('Authenticating with ProgressMe', {
            body: { email, userId },
            source_ip: request.url,
            category: 'scraper',
            trace_id: '',
            span_id: '',
            template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/authenticate' } },
            tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
        });

        try {
            console.log(`[CourseScraperDO] Starting authentication for email: ${email}`);
            const authResponse = await this.scraper.authenticateWithWebSocket(email, password);
            console.log(`[CourseScraperDO] Authentication response received:`, {
                hasToken: !!authResponse.token,
                hasResponse: !!authResponse.response,
                success: authResponse.success
            });

            // Store tokens
            this.authToken = authResponse.token;
            this.progressMeToken = authResponse.token;
            this.userId = userId;
            this.scraper.currentAuthToken = authResponse.token;

            // Persist to storage
            await this.saveState();

            this.logger?.info('ProgressMe authentication successful', {
                body: { 
                    email, 
                    userId,
                    success: authResponse.success,
                    tokenLength: authResponse.token?.length || 0
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/authenticate' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                success: true,
                token: authResponse.token,
                response: authResponse.response 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            console.error(`[CourseScraperDO] Authentication error:`, {
                message: error.message,
                stack: error.stack,
                name: error.name,
                email: email
            });

            this.logger?.error('ProgressMe authentication failed', {
                body: { 
                    email, 
                    userId,
                    error: error.message,
                    errorType: error.name,
                    errorStack: error.stack?.substring(0, 500) // Limit stack trace length
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: '/authenticate' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            // Provide more specific error messages
            let errorMessage = error.message || 'Unknown error occurred';
            let statusCode = 500;

            if (error.message?.includes('WebSocket') || error.message?.includes('Connection')) {
                errorMessage = 'WebSocket connection failed. This service requires WebSocket support which may not be fully available in this environment.';
                statusCode = 503; // Service Unavailable
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'Authentication timed out. Please check your credentials and try again.';
                statusCode = 408; // Request Timeout
            } else if (error.message?.includes('Token')) {
                errorMessage = `ProgressMe authentication failed: ${error.message}. This may indicate invalid credentials or a server-side issue.`;
                statusCode = 401; // Unauthorized
            }

            return new Response(JSON.stringify({ 
                success: false,
                error: errorMessage,
                originalError: error.message // Include original for debugging
            }), { 
                status: statusCode,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * Handle URL validation
     */
    private async handleValidateUrl(request: Request): Promise<Response> {
        const { url } = await request.json() as { url: string };

        this.logger?.info('Validating URL', {
            body: { url },
            source_ip: request.url,
            category: 'scraper',
            trace_id: '',
            span_id: '',
            template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/validate-url' } },
            tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
        });

        try {
            const isValid = this.scraper.validateUrl(url);

            return new Response(JSON.stringify({ 
                valid: isValid,
                url: isValid ? url : null 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            return new Response(JSON.stringify({ 
                valid: false,
                error: error.message 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * Handle get book request
     */
    private async handleGetBook(request: Request): Promise<Response> {
        const { bookId, bookCode, puToken } = await request.json() as { 
            bookId?: number; 
            bookCode?: string;
            puToken?: string;
        };

        if (!puToken) {
            return new Response(JSON.stringify({ 
                error: 'Not authenticated',
                message: 'Please authenticate first' 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        this.logger?.info('Getting book', {
            body: { bookId, bookCode, token: this.progressMeToken || puToken },
            source_ip: request.url,
            category: 'scraper',
            trace_id: '',
            span_id: '',
            template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/get-book' } },
            tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
        });

        try {
            let book;
            this.progressMeToken??=puToken;
            this.scraper.currentAuthToken = this.progressMeToken;
            
            // console.log("getting book by:",bookId??bookCode)
            if (bookId) {
                book = await this.scraper.getBookById(bookId);
            } else if (bookCode) {
                book = await this.scraper.getBookByCode(bookCode);
            } else {
                return new Response(JSON.stringify({ 
                    error: 'Missing parameter',
                    message: 'Either bookId or bookCode is required' 
                }), { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            console.log("Book:", book)
            this.logger?.info('Book retrieved successfully', {
                body: { 
                    bookId, 
                    bookCode,
                    bookName: book?.bookName 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/get-book' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify(book), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            this.logger?.error('Failed to get book', {
                body: { 
                    bookId, 
                    bookCode,
                    error: error.message 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: '/get-book' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                error: 'Failed to get book',
                message: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * Handle copy course request
     */
    private async handleCopyCourse(request: Request): Promise<Response> {
        const { bookId, userId, token } = await request.json() as { 
            bookId: number; 
            userId: number;
            token: string;
        };

        if (!this.progressMeToken) {
            return new Response(JSON.stringify({ 
                error: 'Not authenticated',
                message: 'Please authenticate first' 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        this.logger?.info('Copying course', {
            body: { bookId, userId },
            source_ip: request.url,
            category: 'scraper',
            trace_id: '',
            span_id: '',
            template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/copy-course' } },
            tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
        });

        try {
            const result = await this.scraper.copyCourse(bookId, userId, token || this.progressMeToken);

            this.logger?.info('Course copied successfully', {
                body: { 
                    bookId, 
                    userId,
                    success: result 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/copy-course' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                success: true,
                result 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            this.logger?.error('Failed to copy course', {
                body: { 
                    bookId, 
                    userId,
                    error: error.message 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: '/copy-course' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                success: false,
                error: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * Handle set sharing material ID request
     */
    private async handleSetSharingMaterial(request: Request): Promise<Response> {
        const { bookId, token } = await request.json() as { 
            bookId: number;
            token?: string;
        };

        if (!this.progressMeToken && !token) {
            return new Response(JSON.stringify({ 
                error: 'Not authenticated',
                message: 'Please authenticate first' 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        this.logger?.info('Setting sharing material ID', {
            body: { bookId },
            source_ip: request.url,
            category: 'scraper',
            trace_id: '',
            span_id: '',
            template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/set-sharing-material' } },
            tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
        });

        try {
            const result = await this.scraper.setSharingMaterialId(
                bookId, 
                token || this.progressMeToken || ''
            );

            this.logger?.info('Sharing material ID set successfully', {
                body: { 
                    bookId,
                    sharingMaterialId: result 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/set-sharing-material' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                success: true,
                sharingMaterialId: result 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            this.logger?.error('Failed to set sharing material ID', {
                body: { 
                    bookId,
                    error: error.message 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: '/set-sharing-material' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                success: false,
                error: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    /**
     * Handle check if book can be shared
     */
    private async handleCheckCanShare(request: Request): Promise<Response> {
        const { bookId, userId, token } = await request.json() as { 
            bookId: number;
            userId: number;
            token?: string;
        };

        if (!this.progressMeToken && !token) {
            return new Response(JSON.stringify({ 
                error: 'Not authenticated',
                message: 'Please authenticate first' 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        this.logger?.info('Checking if book can be shared', {
            body: { bookId, userId },
            source_ip: request.url,
            category: 'scraper',
            trace_id: '',
            span_id: '',
            template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/check-can-share' } },
            tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
        });

        try {
            const canShare = await this.scraper.isCanSharingMaterial(
                bookId,
                userId,
                token || this.progressMeToken || ''
            );

            this.logger?.info('Can share check completed', {
                body: { 
                    bookId, 
                    userId,
                    canShare 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'INFO', params: { statusCode: 200, method: 'POST', path: '/check-can-share' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                canShare,
                bookId,
                userId 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error: any) {
            this.logger?.error('Failed to check if book can be shared', {
                body: { 
                    bookId, 
                    userId,
                    error: error.message 
                },
                source_ip: request.url,
                category: 'scraper',
                trace_id: '',
                span_id: '',
                template: { name: 'ERROR', params: { statusCode: 500, method: 'POST', path: '/check-can-share' } },
                tags: { service: 'course-scraper-do', region: 'global', env: this.env.NODE_ENV || 'production' }
            });

            return new Response(JSON.stringify({ 
                error: 'Failed to check sharing status',
                message: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
}

