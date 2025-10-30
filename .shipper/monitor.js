(function() {
  'use strict';

  const CONFIG = {
    ALLOWED_ORIGINS: ["https://app.shipper.now/","https://app.shipper.app"],
    DEBOUNCE_DELAY: 250,
    MAX_STRING_LENGTH: 10000,
  };

  // Post message to parent window
  function postToParent(message) {
    CONFIG.ALLOWED_ORIGINS.forEach(origin => {
      try {
        if (!window.parent) return;
        window.parent.postMessage({
          ...message,
          timestamp: new Date().toISOString(),
        }, origin);
      } catch (err) {
        console.error(`Failed to send message to ${origin}:`, err);
      }
    });
  }

  // Detect blank screen
  function isBlankScreen() {
    const root = document.querySelector('div#root');
    return root ? root.childElementCount === 0 : false;
  }

  // Serialize complex objects for transmission
  function serializeValue(value, depth = 0, seen = new WeakMap()) {
    if (depth > 5) return '[Max Depth Reached]';

    if (value === undefined) return { _type: 'undefined' };
    if (value === null) return null;
    if (typeof value === 'string') {
      return value.length > CONFIG.MAX_STRING_LENGTH
        ? value.slice(0, CONFIG.MAX_STRING_LENGTH) + '...'
        : value;
    }
    if (typeof value === 'number') {
      if (Number.isNaN(value)) return { _type: 'NaN' };
      if (!Number.isFinite(value)) return { _type: value > 0 ? 'Infinity' : '-Infinity' };
      return value;
    }
    if (typeof value === 'boolean') return value;
    if (typeof value === 'bigint') return { _type: 'BigInt', value: value.toString() };
    if (typeof value === 'symbol') return { _type: 'Symbol', value: value.toString() };
    if (typeof value === 'function') {
      return {
        _type: 'Function',
        name: value.name || 'anonymous',
        stringValue: value.toString().slice(0, 100)
      };
    }

    if (value && typeof value === 'object') {
      if (seen.has(value)) return { _type: 'Circular', ref: seen.get(value) };
      seen.set(value, 'ref_' + depth);
    }

    if (value instanceof Error) {
      return {
        _type: 'Error',
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (value instanceof Date) {
      return { _type: 'Date', iso: value.toISOString() };
    }

    if (value instanceof RegExp) {
      return { _type: 'RegExp', source: value.source, flags: value.flags };
    }

    if (Array.isArray(value)) {
      return value.slice(0, 100).map(item => serializeValue(item, depth + 1, seen));
    }

    if (value && typeof value === 'object') {
      const result = {};
      const keys = Object.keys(value).slice(0, 100);
      keys.forEach(key => {
        try {
          result[key] = serializeValue(value[key], depth + 1, seen);
        } catch (err) {
          result[key] = { _type: 'Error', message: 'Failed to serialize' };
        }
      });
      return result;
    }

    return value;
  }

  // ===== Runtime Error Tracking =====
  function setupErrorTracking() {
    const errorCache = new Set();
    const getCacheKey = (msg, file, line, col) => `${msg}|${file}|${line}|${col}`;

    window.addEventListener('error', (event) => {
      const cacheKey = getCacheKey(
        event.message,
        event.filename,
        event.lineno,
        event.colno
      );

      if (errorCache.has(cacheKey)) return;
      errorCache.add(cacheKey);
      setTimeout(() => errorCache.delete(cacheKey), 5000);

      postToParent({
        type: 'RUNTIME_ERROR',
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          blankScreen: isBlankScreen(),
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const stack = event.reason?.stack || String(event.reason);
      if (errorCache.has(stack)) return;
      errorCache.add(stack);
      setTimeout(() => errorCache.delete(stack), 5000);

      postToParent({
        type: 'UNHANDLED_PROMISE_REJECTION',
        data: {
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack || String(event.reason),
        },
      });
    });
  }

  // ===== Network Monitoring =====
  function setupNetworkMonitoring() {
    const originalFetch = window.fetch;

    window.fetch = async function(...args) {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      const method = args[1]?.method || 'GET';

      let requestBody;
      if (args[1]?.body) {
        try {
          if (typeof args[1].body === 'string') {
            requestBody = args[1].body;
          } else if (args[1].body instanceof FormData) {
            requestBody = 'FormData: ' + Array.from(args[1].body.entries())
              .map(([k, v]) => `${k}=${v}`).join('&');
          } else if (args[1].body instanceof URLSearchParams) {
            requestBody = args[1].body.toString();
          } else {
            requestBody = JSON.stringify(args[1].body);
          }
        } catch {
          requestBody = 'Could not serialize request body';
        }
      }

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        let responseBody;
        try {
          if (response.clone) {
            responseBody = await response.clone().text();
          }
        } catch (err) {
          responseBody = '[Clone failed]';
        }

        postToParent({
          type: 'NETWORK_REQUEST',
          data: {
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            requestBody,
            responseBody: responseBody?.slice(0, CONFIG.MAX_STRING_LENGTH),
            duration,
            timestamp: new Date().toISOString(),
          },
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;

        postToParent({
          type: 'NETWORK_REQUEST',
          data: {
            url,
            method,
            requestBody,
            duration,
            timestamp: new Date().toISOString(),
            error: {
              message: error?.message || 'Unknown error',
              stack: error?.stack,
            },
          },
        });

        throw error;
      }
    };
  }

  // ===== Console Output Capture =====
  function setupConsoleCapture() {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    const consoleBuffer = [];
    let consoleFlushTimer = null;

    const levelMap = {
      log: 'info',
      warn: 'warning',
      error: 'error',
    };

    function flushConsoleBuffer() {
      if (consoleBuffer.length === 0) {
        consoleFlushTimer = null;
        return;
      }

      const messages = [...consoleBuffer];
      consoleBuffer.length = 0;
      consoleFlushTimer = null;

      postToParent({
        type: 'CONSOLE_OUTPUT',
        data: { messages },
      });
    }

    ['log', 'warn', 'error'].forEach(level => {
      console[level] = (...args) => {
        // Call original console method
        originalConsole[level].apply(console, args);

        // Serialize arguments
        const serialized = args.map(arg => serializeValue(arg));
        const messageText = args
          .map(arg => typeof arg === 'string' ? arg : JSON.stringify(serializeValue(arg), null, 2))
          .join(' ')
          .slice(0, CONFIG.MAX_STRING_LENGTH);

        consoleBuffer.push({
          level: levelMap[level],
          message: messageText,
          logged_at: new Date().toISOString(),
          raw: serialized,
        });

        // Debounce flush
        if (consoleFlushTimer === null) {
          consoleFlushTimer = setTimeout(flushConsoleBuffer, CONFIG.DEBOUNCE_DELAY);
        }
      };
    });
  }

  // ===== URL Change Tracking =====
  function setupNavigationTracking() {
    let currentUrl = document.location.href;

    const observer = new MutationObserver(() => {
      if (currentUrl !== document.location.href) {
        currentUrl = document.location.href;
        postToParent({
          type: 'URL_CHANGED',
          data: { url: currentUrl },
        });
      }
    });

    const body = document.querySelector('body');
    if (body) {
      observer.observe(body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // ===== Content Load Detection =====
  function checkContentLoaded() {
    const root = document.querySelector('#root, [id*="root"], [class*="root"], body > div:first-child');
    const rootElementExists = !!root;
    const rootHasChildren = root ? root.childElementCount > 0 : false;

    // Check if HMR is complete (Vite-specific)
    const hmrComplete = !window.__vite_plugin_react_preamble_installed__ ||
                        (window.import && window.import.meta && !window.import.meta.hot?.data?.pending);

    // Check if React is ready (look for React root or hydration)
    const reactReady = rootHasChildren &&
                       (!!root?.querySelector('[data-reactroot], [data-react-helmet]') ||
                        root?.textContent?.trim().length > 0);

    const hasContent = rootElementExists && rootHasChildren && hmrComplete && reactReady;

    return {
      hasContent,
      rootElementExists,
      rootHasChildren,
      hmrComplete,
      reactReady,
    };
  }

  function setupContentDetection() {
    let lastContentState = checkContentLoaded();
    let contentLoadNotified = false;

    // Check immediately
    const initialState = checkContentLoaded();
    if (initialState.hasContent && !contentLoadNotified) {
      postToParent({
        type: 'CONTENT_LOADED',
        data: initialState,
      });
      contentLoadNotified = true;
    }

    // Watch for content changes
    const observer = new MutationObserver(() => {
      const currentState = checkContentLoaded();

      // Notify when content becomes available
      if (currentState.hasContent && !contentLoadNotified) {
        postToParent({
          type: 'CONTENT_LOADED',
          data: currentState,
        });
        contentLoadNotified = true;
      }

      // Also notify if content disappears (blank screen)
      if (!currentState.hasContent && lastContentState.hasContent) {
        postToParent({
          type: 'BLANK_SCREEN_DETECTED',
          data: currentState,
        });
        contentLoadNotified = false;
      }

      lastContentState = currentState;
    });

    // Observe the entire document for changes
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    // Also check after a short delay for HMR scenarios
    setTimeout(() => {
      const state = checkContentLoaded();
      if (state.hasContent && !contentLoadNotified) {
        postToParent({
          type: 'CONTENT_LOADED',
          data: state,
        });
        contentLoadNotified = true;
      }
    }, 1000);

    // Check periodically during first 10 seconds (for slow HMR)
    let checkCount = 0;
    const periodicCheck = setInterval(() => {
      checkCount++;
      const state = checkContentLoaded();

      // If content is loaded and we haven't notified yet, send event and stop
      if (state.hasContent && !contentLoadNotified) {
        postToParent({
          type: 'CONTENT_LOADED',
          data: state,
        });
        contentLoadNotified = true;
        clearInterval(periodicCheck);
        return;
      }

      // If we've already notified (from mutation observer or timeout), stop checking
      if (contentLoadNotified) {
        clearInterval(periodicCheck);
        return;
      }

      // Stop after 10 seconds (20 checks × 500ms)
      if (checkCount >= 20) {
        clearInterval(periodicCheck);
      }
    }, 500);
  }

  // ===== Initialize All Monitoring =====
  function init() {
    setupErrorTracking();
    setupNetworkMonitoring();
    setupConsoleCapture();
    setupNavigationTracking();
    setupContentDetection();

    // Notify parent that monitoring is active
    postToParent({
      type: 'MONITOR_INITIALIZED',
      data: { url: window.location.href },
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();