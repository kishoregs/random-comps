// Bearer Token Application Loader
// Execute this script in your browser console to load applications with bearer token authentication

(function() {
    'use strict';
    
    class BearerTokenLoader {
        constructor() {
            this.currentApp = null;
            this.token = null;
            this.baseUrl = null;
            this.observers = [];
        }

        // Main method to load a new application
        loadApp(url, bearerToken, options = {}) {
            try {
                this.validateInputs(url, bearerToken);
                
                this.token = bearerToken;
                this.baseUrl = new URL(url).origin;
                
                console.log('🔐 Bearer Token Loader - Loading application...');
                console.log('📍 URL:', url);
                console.log('🔑 Token:', bearerToken.substring(0, 10) + '...');
                
                this.setupTokenInjection();
                this.createAppContainer(url, options);
                
                return {
                    success: true,
                    message: 'Application loaded successfully',
                    url: url,
                    containerId: 'bearer-app-container'
                };
            } catch (error) {
                console.error('❌ Error loading application:', error.message);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        validateInputs(url, token) {
            if (!url || typeof url !== 'string') {
                throw new Error('URL is required and must be a string');
            }
            if (!token || typeof token !== 'string') {
                throw new Error('Bearer token is required and must be a string');
            }
            
            try {
                new URL(url);
            } catch {
                throw new Error('Invalid URL format');
            }
        }

        setupTokenInjection() {
            // Method 1: Intercept fetch requests
            this.interceptFetch();
            
            // Method 2: Intercept XMLHttpRequest
            this.interceptXHR();
            
            // Method 3: Inject into storage
            this.injectIntoStorage();
            
            // Method 4: Set as cookie
            this.setCookie();
        }

        interceptFetch() {
            const originalFetch = window.fetch;
            const self = this;
            
            window.fetch = function(...args) {
                const [url, options = {}] = args;
                const newOptions = {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${self.token}`,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                
                console.log('🔄 Fetch intercepted:', url);
                return originalFetch.apply(this, [url, newOptions]);
            };
        }

        interceptXHR() {
            const originalOpen = XMLHttpRequest.prototype.open;
            const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
            const self = this;
            
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                this._url = url;
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
                if (header.toLowerCase() === 'authorization') {
                    return; // Prevent duplicate Authorization headers
                }
                return originalSetRequestHeader.apply(this, [header, value]);
            };
            
            XMLHttpRequest.prototype.send = function(data) {
                if (this._url && this._url.includes(self.baseUrl)) {
                    originalSetRequestHeader.call(this, 'Authorization', `Bearer ${self.token}`);
                }
                return XMLHttpRequest.prototype.send.call(this, data);
            };
        }

        injectIntoStorage() {
            try {
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('bearer_token', this.token);
                sessionStorage.setItem('auth_token', this.token);
                sessionStorage.setItem('bearer_token', this.token);
                console.log('💾 Token injected into localStorage and sessionStorage');
            } catch (error) {
                console.warn('⚠️ Could not inject token into storage:', error.message);
            }
        }

        setCookie() {
            try {
                document.cookie = `auth_token=${this.token}; path=/; secure; samesite=strict`;
                document.cookie = `bearer_token=${this.token}; path=/; secure; samesite=strict`;
                console.log('🍪 Token set as cookie');
            } catch (error) {
                console.warn('⚠️ Could not set cookie:', error.message);
            }
        }

        createAppContainer(url, options = {}) {
            this.closeApp(); // Close any existing app
            
            const container = document.createElement('div');
            container.id = 'bearer-app-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999;
                background: #fff;
                display: flex;
                flex-direction: column;
            `;

            const header = this.createHeader(options);
            const iframe = this.createIframe(url, options);
            
            container.appendChild(header);
            container.appendChild(iframe);
            
            document.body.appendChild(container);
            this.currentApp = container;
            
            this.setupCloseHandler(container);
            this.setupResizeHandler(container);
        }

        createHeader(options) {
            const header = document.createElement('div');
            header.style.cssText = `
                background: #1a1a1a;
                color: white;
                padding: 10px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: Arial, sans-serif;
                font-size: 14px;
            `;

            const title = document.createElement('span');
            title.textContent = `Bearer Token App - ${this.baseUrl}`;
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕ Close';
            closeBtn.style.cssText = `
                background: #ff4444;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            `;
            closeBtn.onclick = () => this.closeApp();

            header.appendChild(title);
            header.appendChild(closeBtn);
            
            return header;
        }

        createIframe(url, options) {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.cssText = `
                flex: 1;
                width: 100%;
                border: none;
                background: white;
            `;
            
            if (options.timeout) {
                setTimeout(() => {
                    if (!iframe.contentDocument || iframe.contentDocument.readyState !== 'complete') {
                        console.warn('⏰ Iframe loading timeout');
                    }
                }, options.timeout);
            }
            
            return iframe;
        }

        setupCloseHandler(container) {
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeApp();
                }
            };
            
            document.addEventListener('keydown', handleEscape);
            this.observers.push(() => document.removeEventListener('keydown', handleEscape));
        }

        setupResizeHandler(container) {
            const handleResize = () => {
                container.style.height = window.innerHeight + 'px';
                container.style.width = window.innerWidth + 'px';
            };
            
            window.addEventListener('resize', handleResize);
            this.observers.push(() => window.removeEventListener('resize', handleResize));
        }

        closeApp() {
            if (this.currentApp) {
                this.currentApp.remove();
                this.currentApp = null;
            }
            
            // Clean up observers
            this.observers.forEach(cleanup => cleanup());
            this.observers = [];
            
            // Clean up storage
            try {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('bearer_token');
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('bearer_token');
            } catch (error) {
                console.warn('⚠️ Could not clean storage:', error.message);
            }
            
            console.log('✅ Application closed and cleaned up');
        }

        // Utility method to check if URL has query parameters for auto-loading
        checkAutoLoad() {
            const urlParams = new URLSearchParams(window.location.search);
            const loadUrl = urlParams.get('loadUrl');
            const token = urlParams.get('token');
            
            if (loadUrl && token) {
                console.log('🚀 Auto-loading from URL parameters');
                this.loadApp(loadUrl, token);
                return true;
            }
            return false;
        }
    }

    // Create global instance
    window.bearerLoader = new BearerTokenLoader();
    
    // Auto-load if URL parameters are present
    setTimeout(() => {
        window.bearerLoader.checkAutoLoad();
    }, 100);

    // Console helper methods
    console.log('📋 Bearer Token Loader initialized');
    console.log('Usage:');
    console.log('  bearerLoader.loadApp(url, token)');
    console.log('  bearerLoader.closeApp()');
    console.log('');
    console.log('Example:');
    console.log('  bearerLoader.loadApp("https://api.example.com", "your-bearer-token")');

})();
