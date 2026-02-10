/**
 * Log catcher utility to intercept console logs and global errors.
 */

const capturedLogs = [];

/**
 * Capture a log entry.
 * @param {string} level - Log level (L/E/W/I)
 * @param {any[]} args - Log arguments
 */
function capture(level, args) {
    const entry = {
        timestamp: new Date().toISOString(),
        level: level,
        message: String(args[0]),
        detail: args.length > 1 ? args.slice(1).map(arg => {
            try {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch {
                return '[Un-stringifiable Object]';
            }
        }).join(' ') : ''
    };
    capturedLogs.push(entry);
}

/**
 * Initialize the log catcher.
 */
function initializeLogCatcher() {
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
    };

    const levelMap = { log: 'L', warn: 'W', error: 'E', info: 'I' };

    ['log', 'warn', 'error', 'info'].forEach(method => {
        console[method] = (...args) => {
            capture(levelMap[method], args);
            originalConsole[method].apply(console, args);
        };
    });

    window.onerror = (message, source, lineno, colno, error) => {
        capture('E', [`Global Error: ${message}`, { source, lineno, colno, error }]);
        return false; // Don't suppress original behavior
    };

    window.onunhandledrejection = (event) => {
        capture('E', [`Unhandled Rejection: ${event.reason}`]);
    };
}

/**
 * Format captured logs into a user-readable string.
 * @returns {string} Formatted logs
 */
function formatCapturedLogs() {
    return capturedLogs.map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        return `[${time}] [${log.level}] ${log.message}${log.detail ? ' | ' + log.detail : ''}`;
    }).join('\n');
}

export { initializeLogCatcher, formatCapturedLogs, capturedLogs };
