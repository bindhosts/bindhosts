import { exec, toast } from 'kernelsu-alt';
import { WebUI, Intent } from 'webuix'
import { getString } from './language.js';

export let developerOption = false;
export function setDeveloperOption(value) { developerOption = value; }

export const filePaths = {
    custom: 'custom.txt',
    sources: 'sources.txt',
    blacklist: 'blacklist.txt',
    whitelist: 'whitelist.txt',
    sources_whitelist: 'sources_whitelist.txt',
    customCSS: '.webui_config/custom.css',
};

export const basePath = "/data/adb/bindhosts";
export const moduleDirectory = "/data/adb/modules/bindhosts";

/**
 * Fetch a file and return its content as text, with a fallback to `exec cat`.
 * @param {string} url - The URL to fetch
 * @param {string} fallbackPath - The path to use with `exec cat` if fetch fails
 * @returns {Promise<string>}
 */
export async function fetchText(url, fallbackPath) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.text();
    } catch {
        const result = await exec(`cat "${fallbackPath}"`);
        if (result.errno === 0) {
            return result.stdout;
        }
        throw new Error(`Failed to fetch ${url} and fallback exec failed: ${result.stderr}`);
    }
}

/**
 * Redirect to a link with am command
 * @param {string} link - The link to redirect in browser
 */
export function linkRedirect(link) {
    toast("Redirecting to " + link);

    setTimeout(() => {
        if (typeof $bindhosts !== 'undefined' && Object.keys($bindhosts).length > 0) {
            const webui = new WebUI();
            const intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(link);
            webui.startActivity(intent);
        } else {
            exec(`am start -a android.intent.action.VIEW -d ${link}`, { env: { PATH: '/system/bin' }})
                .then(({ errno }) => {
                    if (errno !== 0) {
                        toast("Failed to open link with exec");
                        window.open(link, "_blank");
                    }
                });
        }
    }, 100);
}

/**
 * Show the prompt with a success or error message
 * @param {string} message - Text message to display
 * @param {boolean} isSuccess - Whether the message indicates success
 * @param {number} [duration=2000] - Duration to display the message
 * @param {string} callbackName - Function name to show in prompt button
 * @param {Function} [callback=() => {}] - Callback funtion
 * @returns {void}
 */
export function showPrompt(message, isSuccess = true, duration = 2000, callbackName = '', callback = null) {
    const prompt = document.getElementById('prompt');
    const promtpBtn = prompt.querySelector('.prompt-btn');
    prompt.querySelector('.prompt-text').textContent = message.trim();
    prompt.classList.toggle('error', !isSuccess);

    const hasCallback = typeof callback === 'function';
    promtpBtn.textContent = hasCallback ? callbackName : '';
    promtpBtn.onclick = callback || null;
    promtpBtn.classList.toggle('show', hasCallback);

    if (window.promptTimeout) {
        clearTimeout(window.promptTimeout);
    }
    setTimeout(() => {
        prompt.classList.add('show');
        window.promptTimeout = setTimeout(() => {
            prompt.classList.remove('show');
        }, duration);
    }, 10);
}

/**
 * Reboot device in two second
 * @returns {void}
 */
export function reboot() {
    setTimeout(() => showPrompt(getString('global_rebooting')), 200);
    setTimeout(() => exec("svc power reboot").catch(() => {}), 2000);
}

/**
 * Check if running in MMRL
 * @returns {void}
 */
export async function checkMMRL() {
    if (typeof $bindhosts !== 'undefined' && Object.keys($bindhosts).length > 0) {
        // Set status bars theme based on device theme
        try {
            $bindhosts.setLightStatusBars(!window.matchMedia('(prefers-color-scheme: dark)').matches)
        } catch (error) {
            console.log("Error setting status bars theme:", error)
        }
    }
}

/**
 * Setup swipe to close for slide-in panels
 * @param {HTMLElement} element - Element to swipe
 * @returns {void}
 */
export function setupSwipeToClose(element) {
    let startX = 0, currentX = 0, startY = 0, isDragging = false;
    const backButton = document.querySelector('.back-button');
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    const multiplier = isRTL ? -1 : 1;

    const handleStart = (e) => {
        const preElements = document.querySelectorAll('.documents *');
        const bodyContent = document.querySelector('.body-content[data-active="true"]');

        // Get client coordinates from either touch or mouse event
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Check if the event is within a scrolled sub element
        // Prevent setupSwipeToClose when browsing within sub-element
        const isTouchInScrolledPre = Array.from(preElements).some(pre => {
            return pre.contains(e.target) && pre.scrollLeft > 0;
        });

        if (element.id === 'edit-content' || isTouchInScrolledPre) {
            return;
        }

        isDragging = true;
        isScrolling = false;
        startX = clientX;
        startY = clientY;
        element.classList.remove('animation');
        bodyContent.classList.remove('animation');
        e.stopPropagation();
    };

    const handleMove = (e) => {
        if (!isDragging) return;

        // Get client coordinates from either touch or mouse event
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const deltaX = (clientX - startX) * multiplier;
        const deltaY = clientY - startY;
        
        // If vertical movement is greater than horizontal, assume scrolling
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            isScrolling = true;
            return;
        }
        if (isScrolling) return;
        
        currentX = clientX - startX;
        const distance = Math.max(0, deltaX - 50);
        const adjustedX = distance * multiplier;

        const bodyContent = document.querySelector('.body-content[data-active="true"]');
        element.style.transform = `translateX(${adjustedX}px)`;
        bodyContent.style.transform = `translateX(calc(${adjustedX}px / 5 ${isRTL ? '+' : '-'} 20vw))`;
        // Calculate opacity based on position
        const progress = Math.min(1, Math.abs(adjustedX) / window.innerWidth);
        bodyContent.style.opacity = progress;
        e.stopPropagation();
    };

    const handleEnd = () => {
        if (!isDragging) return;
        const bodyContent = document.querySelector('.body-content[data-active="true"]');

        isDragging = false;
        element.classList.add('animation');
        bodyContent.classList.add('animation');

        const threshold = window.innerWidth * 0.25 + 50;
        element.style.transform = '';
        bodyContent.style.transform = '';
        bodyContent.style.opacity = '';
        if (currentX * multiplier > threshold) {
            backButton.click();
        }
        startX = 0;
        currentX = 0;
    };

    // Touch events
    element.ontouchstart = handleStart;
    element.ontouchmove = handleMove;
    element.ontouchend = handleEnd;
    
    // Mouse events
    element.onmousedown = handleStart;
    element.onmousemove = handleMove;
    element.onmouseup = handleEnd;
}

/**
 * Setup slide-in menu
 * @returns {void}
 */
export function setupSlideMenu() {
    const slideMenus = document.querySelectorAll('.slide-menu');

    slideMenus.forEach(menu => {
        menu.open = () => {
            const bodyContent = document.querySelector('.body-content[data-active="true"]');
            menu.classList.add('animation');
            bodyContent.classList.add('animation');

            menu.classList.add('open');
            bodyContent.classList.add('menu-open');
            updateUIVisibility(menu.id, true);
        };

        menu.close = () => {
            const bodyContent = document.querySelector('.body-content[data-active="true"]');
            menu.classList.add('animation');
            bodyContent.classList.add('animation');

            menu.classList.remove('open');
            bodyContent.classList.remove('menu-open');
            updateUIVisibility(menu.id, false);
        };

        setupSwipeToClose(menu);
    });
}

let isScrolling = false;
let lastScrollY = 0;
let scrollTimeout;
const scrollThreshold = 25;

/**
 * Configuration for different pages and their associated UI components.
 */
export const PAGE_CONFIG = {
    'page-hosts': {
        container: '.action-container',
        main: ['#action-btn', '#force-update-btn'],
        terminals: {
            'action-terminal': {
                buttons: ['#close-terminal'],
                title: 'global_action'
            },
            'edit-content': {
                buttons: ['#save-btn'],
                title: ''
            }
        },
        title: 'footer_hosts'
    },
    'page-more': {
        container: '.tcpdump-btn',
        main: [],
        terminals: {
            'tcpdump-terminal': {
                buttons: ['#stop-tcpdump'],
                title: 'control_panel_monitor_network_activity'
            },
            'logs-terminal': {
                buttons: ['#save-btn'],
                title: 'more_support_view_webui_log'
            }
        },
        title: 'footer_more'
    },
    'default': {
        container: null,
        main: [],
        title: 'footer_home'
    }
};

/**
 * Update UI visibility for buttons and titles based on the active terminal.
 * @param {string} [terminalId=null] - ID of the active terminal
 * @param {boolean} [isOpen=false] - Whether the terminal is open
 */
export function updateUIVisibility(terminalId = null, isOpen = false) {
    const activePage = document.querySelector('.body-content[data-active="true"]');
    if (!activePage) return;
    
    const pageId = activePage.id;
    const config = PAGE_CONFIG[pageId] || PAGE_CONFIG['default'];
    const container = document.querySelector(config.container);
    const titleControl = document.getElementById('title');
    const backBtn = document.querySelector('.back-button');

    // Hide ALL terminal buttons first to prevent "leaks"
    const allTerminalButtons = new Set();
    Object.values(PAGE_CONFIG).forEach(c => {
        if (c.terminals) {
            Object.values(c.terminals).forEach(t => {
                t.buttons?.forEach(b => allTerminalButtons.add(b));
            });
        }
    });
    allTerminalButtons.forEach(selector => {
        document.querySelector(selector)?.classList.remove('show');
    });

    if (isOpen && terminalId) {
        // Hiding all FAB containers
        document.querySelectorAll('.fab-container').forEach(c => c.classList.remove('show', 'inTerminal'));
        
        // Show correct container in terminal mode
        if (container) {
            container.classList.add('show', 'inTerminal');
        }

        // Hide main buttons
        (config.main || []).forEach(id => document.querySelector(id)?.classList.remove('show'));

        // Show terminal specific buttons from the current page config
        const terminalConfig = config.terminals?.[terminalId];
        if (terminalConfig) {
            terminalConfig.buttons?.forEach(id => document.querySelector(id)?.classList.add('show'));
            if (terminalConfig.title) {
                titleControl.textContent = getString(terminalConfig.title);
            }
        }
        if (backBtn) backBtn.classList.add('show');
    } else {
        // Closing terminal or Switching page
        document.querySelectorAll('.fab-container').forEach(c => c.classList.remove('show', 'inTerminal'));
        
        if (container) {
            container.classList.add('show');
        }

        // Show main buttons
        (config.main || []).forEach(id => document.querySelector(id)?.classList.add('show'));

        // Restore title
        if (config.title) {
            if (config.title === 'footer_home') {
                titleControl.textContent = 'bindhosts ';
            } else {
                titleControl.textContent = getString(config.title);
            }
        }
        if (backBtn) backBtn.classList.remove('show');
    }
}

// Scroll event
export function setupScrollEvent(content) {
    if (!content) return;
    
    // Find the actual scrollable element
    const scrollTarget = content.querySelector('.constant-height') || content;
    lastScrollY = scrollTarget.scrollTop;

    const config = PAGE_CONFIG[content.id] || PAGE_CONFIG['default'];
    const floatBtn = document.querySelector(config.container);

    scrollTarget.onscroll = () => {
        if (!floatBtn) return;
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 200);

        const isScrollDown = scrollTarget.scrollTop > lastScrollY && scrollTarget.scrollTop > scrollThreshold;
        const isScrollUp = scrollTarget.scrollTop < lastScrollY;

        if (isScrollDown) {
            floatBtn.classList.remove('show');
            (config.main || []).forEach(selector => {
                document.querySelector(selector)?.classList.remove('show');
            });
        } else if (isScrollUp) {
            floatBtn.classList.add('show');
            (config.main || []).forEach(selector => {
                document.querySelector(selector)?.classList.add('show');
            });
        }

        // Hide remove button on scroll
        document.querySelectorAll('.scrollable-list').forEach(el => {
            el.scrollTo({ left: 0, behavior: 'smooth' });
        });

        lastScrollY = scrollTarget.scrollTop;
    };

    // Terminal/SlideMenu scroll logic
    const slideMenus = document.querySelectorAll('.slide-menu');
    slideMenus.forEach(slideMenu => {
        slideMenu.onscroll = () => {
             const activePage = document.querySelector('.body-content[data-active="true"]');
             if (!activePage) return;
             
             // Scroll top button handling for tcpdump
             if (slideMenu.id === 'tcpdump-terminal') {
                 const scrollTopBtn = document.getElementById('scroll-top');
                 if (slideMenu.scrollTop === 0) {
                     scrollTopBtn?.classList.remove('show');
                 } else if (slideMenu.scrollHeight > 1.5 * slideMenu.clientHeight) {
                     scrollTopBtn?.classList.add('show');
                 }
             }

             lastScrollY = slideMenu.scrollTop;
        };
    });
}

