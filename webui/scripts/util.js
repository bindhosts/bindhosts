import { translations } from './language.js';

export let developerOption = false;
export let learnMore = false;
let footerClick = false;

export function setDeveloperOption(value) { developerOption = value; }
export function setLearnMore(value) { learnMore = value; }

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
const actionContainer = document.querySelector('.float');
const forceUpdateButton = document.getElementById('force-update-btn');
const content = document.querySelector('.content');

/**
 * Executes a shell command with KernelSU privileges
 * @param {string} command - The shell command to execute
 * @returns {Promise<string>} A promise that resolves with stdout content
 * @throws {Error} If command execution fails with:
 *   - stderr in error message
 */
export async function exec(command) {
    return new Promise((resolve, reject) => {
        const callbackName = `exec_callback_${Date.now()}`;
        window[callbackName] = (errno, stdout, stderr) => {
            delete window[callbackName];
            if (errno === 0) {
                resolve(stdout);
            } else {
                console.error(`Error executing command: ${stderr}`);
                reject(stderr);
            }
        };
        try {
            ksu.exec(command, "{}", callbackName);
        } catch (error) {
            console.error(`Execution error: ${error}`);
            reject(error);
        }
    });
}

/**
 * Spawns shell process with ksu spawn
 * @param {string} command - The command to execute
 * @param {string[]} [args=[]] - Array of arguments to pass to the command
 * @param {Object{}} [options={}] - Array of options with:
 *   - cwd <string> - Current working directory of the child process
 *   - env <Object> - Environment key-value pairs
 * @returns {Object} A child process object with:
 *   - stdout: Stream for standard output
 *   - stderr: Stream for standard error
 *   - stdin: Stream for standard input
 *   - on(event, listener): Attach event listener ('exit', 'error')
 *   - emit(event, ...args): Emit events internally
 */
export function spawn(command, args = [], options = {}) {
    const child = {
        listeners: {},
        stdout: new Stdio(),
        stderr: new Stdio(),
        stdin: new Stdio(),
        on(event, listener) {
            if (!this.listeners[event]) this.listeners[event] = [];
            this.listeners[event].push(listener);
        },
        emit(event, ...args) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(listener => listener(...args));
            }
        }
    };
    function Stdio() {
        this.listeners = {};
    }
    Stdio.prototype.on = function(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    };
    Stdio.prototype.emit = function(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(listener => listener(...args));
        }
    };
    const callbackName = `spawn_callback_${Date.now()}`;
    window[callbackName] = child;
    child.on("exit", () => delete window[callbackName]);
    try {
        ksu.spawn(command, JSON.stringify(args), JSON.stringify(options), callbackName);
    } catch (error) {
        child.emit("error", error);
        delete window[callbackName];
    }
    return child;
}

/**
 * Show toast with ksu
 * @param {string} message - Message to display
 * @returns {void}
 */
export function toast(message) {
    try {
        ksu.toast(message);
    } catch (error) {
        console.error("Failed to show toast:", error);
    }
}

/**
 * Redirect link on external browser
 * @param {string} link - URL to redirect
 * @returns {Promise<void>}
 */
export async function linkRedirect(link) {
    try {
        await exec(`am start -a android.intent.action.VIEW -d ${link}`);
    } catch (error) {
        console.error('Error redirect link:', error);
    }
}

/**
 * Simulate MD3 ripple animation
 * Usage: class="ripple-element" style="position: relative; overflow: hidden;"
 * Note: Require background-color to work properly
 * @return {void}
 */
export function applyRippleEffect() {
    document.querySelectorAll('.ripple-element, .reboot').forEach(element => {
        if (element.dataset.rippleListener !== "true") {
            element.addEventListener("pointerdown", async (event) => {
                // Pointer up event
                const handlePointerUp = () => {
                    ripple.classList.add("end");
                    setTimeout(() => {
                        ripple.classList.remove("end");
                        ripple.remove();
                    }, duration * 1000);
                    element.removeEventListener("pointerup", handlePointerUp);
                    element.removeEventListener("pointercancel", handlePointerUp);
                };
                element.addEventListener("pointerup", () => setTimeout(handlePointerUp, 80));
                element.addEventListener("pointercancel", () => setTimeout(handlePointerUp, 80));

                const ripple = document.createElement("span");
                ripple.classList.add("ripple");

                // Calculate ripple size and position
                const rect = element.getBoundingClientRect();
                const width = rect.width;
                const size = Math.max(rect.width, rect.height);
                const x = event.clientX - rect.left - size / 2;
                const y = event.clientY - rect.top - size / 2;

                // Determine animation duration
                let duration = 0.2 + (width / 800) * 0.4;
                duration = Math.min(0.8, Math.max(0.2, duration));

                // Set ripple styles
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.animationDuration = `${duration}s`;
                ripple.style.transition = `opacity ${duration}s ease`;

                // Get effective background color (traverse up if transparent)
                const getEffectiveBackgroundColor = (el) => {
                    while (el && el !== document.documentElement) {
                        const bg = window.getComputedStyle(el).backgroundColor;
                        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
                            return bg;
                        }
                        el = el.parentElement;
                    }
                    return "rgba(255, 255, 255, 1)";
                };

                const bgColor = getEffectiveBackgroundColor(element);
                const isDarkColor = (color) => {
                    const rgb = color.match(/\d+/g);
                    if (!rgb) return false;
                    const [r, g, b] = rgb.map(Number);
                    return (r * 0.299 + g * 0.587 + b * 0.114) < 96; // Luma formula
                };
                ripple.style.backgroundColor = isDarkColor(bgColor) ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";

                // Append ripple if not scrolling
                await new Promise(resolve => setTimeout(resolve, 80));
                if (isScrolling || footerClick) return;
                element.appendChild(ripple);
            });
            element.dataset.rippleListener = "true";
        }
    });
}

/**
 * Show the prompt with a success or error message
 * @param {string} key - Translation key for the message
 * @param {boolean} isSuccess - Whether the message indicates success
 * @param {number} [duration=2000] - Duration to display the message
 * @param {string} [preValue=""] - Text to prepend to the message
 * @param {string} [postValue=""] - Text to append to the message
 * @returns {void}
 */
export function showPrompt(key, isSuccess = true, duration = 2000, preValue = "", postValue = "") {
    const prompt = document.getElementById('prompt');
    const message = `${preValue} ${translations[key]} ${postValue}`.trim();
    prompt.textContent = message;
    prompt.classList.toggle('error', !isSuccess);

    if (window.promptTimeout) {
        clearTimeout(window.promptTimeout);
    }
    if (message.includes("Reboot to take effect")) {
        prompt.classList.add('reboot');
        applyRippleEffect();
        let countdownActive = false;
        prompt.onclick = () => {
            if (countdownActive) return;
            countdownActive = true;
            let countdown = 3;
            prompt.textContent = `Rebooting in ${countdown}...`;
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    prompt.textContent = `Rebooting in ${countdown}...`;
                } else {
                    clearInterval(countdownInterval);
                    countdownActive = false;
                    exec("svc power reboot").catch(error => {
                        console.error("Failed to execute reboot command:", error);
                    });
                }
            }, 1000);
        };
    } else {
        prompt.classList.remove('reboot');
    }

    setTimeout(() => {
        prompt.classList.add('show');
        window.promptTimeout = setTimeout(() => {
            prompt.classList.remove('show');
        }, duration);
    }, 100);
}

/**
 * Check if running in MMRL
 * @returns {void}
 */
export async function checkMMRL() {
    if (Object.keys($bindhosts).length > 0) {
        // Set status bars theme based on device theme
        try {
            $bindhosts.setLightStatusBars(!window.matchMedia('(prefers-color-scheme: dark)').matches)
        } catch (error) {
            console.log("Error setting status bars theme:", error)
        }
    }
}

/**
 * Add loaded class and transition for links
 * @returns {void}
 */
export function initialTransition() {
    const content = document.querySelector('.constant-height');
    const title = document.querySelector('.title-container');
    const modeBtn = document.getElementById('mode-btn');
    const saveBtn = document.getElementById('edit-save-btn');
    const actionBtn = document.querySelector('.action-container');
    const backBtn = document.querySelector('.back-button');
    const focusedFooterBtn = document.querySelector('.focused-footer-btn');
    
    // Add loaded class after a short delay to trigger the animation
    focusedFooterBtn.classList.add('loaded');
    setTimeout(() => {
        content.classList.add('loaded');
        title.classList.add('loaded');
        if (modeBtn) modeBtn.classList.add('loaded');
        if (actionBtn) actionContainer.classList.add('show');
        if (forceUpdateButton) setTimeout(() => forceUpdateButton.classList.add('show'), 200);
    }, 10);

    // Quit transition on switching page
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.href && link.href.startsWith(window.location.origin)) {
                footerClick = true;
                e.preventDefault();
                content.classList.add('exiting');
                title.classList.remove('loaded');
                focusedFooterBtn.classList.remove('loaded');
                if (actionBtn) setTimeout(() => actionContainer.classList.remove('show'), 50);
                if (forceUpdateButton) forceUpdateButton.classList.remove('show');
                if (modeBtn) modeBtn.classList.remove('loaded');
                if (saveBtn) saveBtn.style.transform = 'translateX(calc(105% + 15px))';
                if (backBtn) backBtn.click();
                setTimeout(() => {
                    window.location.href = link.href;
                }, 100);
            }
        });
    });
}

/**
 * Setup swipe to close for slide-in panels
 * @param {HTMLElement} element - Element to swipe
 * @param {HTMLElement} cover - Cover element
 * @param {HTMLElement} backButton - Back button element
 * @returns {void}
 */
export function setupSwipeToClose(element, cover, backButton) {
    let startX = 0, currentX = 0, startY = 0, isDragging = false, isScrolling = false;
    const bodyContent = document.querySelector('.content');

    const handleStart = (e) => {
        const preElements = document.querySelectorAll('.documents *');

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
        element.style.transition = 'none';
        bodyContent.style.transition = 'none';
        cover.style.transition = 'none';
        e.stopPropagation();
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        
        // Get client coordinates from either touch or mouse event
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        // Disable right-to-left swipe
        if (deltaX < 0) return;
        
        // If vertical movement is greater than horizontal, assume scrolling
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            isScrolling = true;
            return;
        }
        if (isScrolling) return;
        currentX = clientX - startX;
        if (currentX < 0) return;
        if (currentX > 50) {
            const adjustedX = currentX - 50; // 50px trigger threshold 
            element.style.transform = `translateX(${Math.max(adjustedX, -window.innerWidth)}px)`;
            bodyContent.style.transform = `translateX(calc(${Math.max(adjustedX, -window.innerWidth)}px / 5 - 20vw))`;
            // Calculate opacity based on position
            const opacity = 1 - (adjustedX / window.innerWidth);
            cover.style.opacity = Math.max(0, Math.min(1, opacity));
        }
        e.stopPropagation();
    };

    const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.transition = 'transform 0.3s ease';
        cover.style.transition = 'opacity 0.3s ease';
        bodyContent.style.transition = 'transform 0.3s ease';

        const threshold = window.innerWidth * 0.25 + 50;
        if (Math.abs(currentX) > threshold) {
            backButton.click();
        } else {
            element.style.transform = 'translateX(0)';
            bodyContent.style.transform = 'translateX(-20vw)';
            cover.style.opacity = '1';
        }
        startX = 0;
        currentX = 0;
    };

    // Touch events
    element.addEventListener('touchstart', handleStart);
    element.addEventListener('touchmove', handleMove);
    element.addEventListener('touchend', handleEnd);
    
    // Mouse events
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseup', handleEnd);
}

// Scroll event
let lastScrollY = content.scrollTop;
let isScrolling = false;
let scrollTimeout;
const scrollThreshold = 25;
content.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 200);
    if (content.scrollTop > lastScrollY && content.scrollTop > scrollThreshold) {
        if (actionContainer && !actionContainer.classList.contains('tcpdump-btn')) {
            setTimeout(() => actionContainer.classList.remove('show'), 100);
        }
        if (forceUpdateButton) forceUpdateButton.classList.remove('show');
    } else if (content.scrollTop < lastScrollY) {
        if (actionContainer && !actionContainer.classList.contains('tcpdump-btn')) {
            actionContainer.classList.add('show');
        }
        if (forceUpdateButton) setTimeout(() => forceUpdateButton.classList.add('show'), 200);
    }

    // Hide remove button on scroll
    const box = document.querySelector('.box li');
    if (box) {
        document.querySelectorAll('.box li').forEach(li => {
            li.scrollTo({ left: 0, behavior: 'smooth' });
        });
    }

    lastScrollY = content.scrollTop;
});

// Terminal scroll event
document.querySelectorAll('.terminal').forEach(terminal => {
    terminal.addEventListener('scroll', () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 200);
        if ((terminal.scrollTop > lastScrollY && terminal.scrollTop > scrollThreshold)
            || (terminal.scrollTop === 0 && actionContainer.classList.contains('tcpdump-btn'))) {
            if (actionContainer && actionContainer.classList.contains('inTerminal')) {
                if (terminal.scrollTop === 0 && actionContainer.classList.contains('tcpdump-btn')) {
                    setTimeout(() => actionContainer.classList.remove('show'), 100);
                } else {
                    actionContainer.classList.add('show');
                }
            }
        } else if (terminal.scrollTop < lastScrollY && terminal.scrollTop > terminal.clientHeight * 0.5) {
            if (actionContainer && actionContainer.classList.contains('inTerminal')) {
                actionContainer.classList.add('show');
            }
        }
        lastScrollY = terminal.scrollTop;
    });
});

export async function setupCustomBackground() {
    // custom background
    const bgContainer = document.getElementById("custom-bg");
    const bgImage = document.getElementById("custom-bg-img");
    const bgPaths = [
        "link/PERSISTENT_DIR/.webui_config/custom_background.webp",
        "link/PERSISTENT_DIR/.webui_config/custom_background.jpg",
        "link/PERSISTENT_DIR/.webui_config/custom_background.png"
    ];

    for (const path of bgPaths) {
        try {
            const response = await fetch(path, { method: "HEAD" });
            if (response.ok) {
                bgImage.src = path;
                bgContainer.style.display = "flex";
                break;
            }
        } catch (error) {
            console.error("Error checking background:", error);
        }
    }
}

document.addEventListener("DOMContentLoaded", setupCustomBackground);
