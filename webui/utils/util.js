import { exec, toast } from 'kernelsu-alt';
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

/**
 * Redirect to a link with am command
 * @param {string} link - The link to redirect in browser
 */
export function linkRedirect(link) {
    toast("Redirecting to " + link);
    setTimeout(() => {
        exec(`am start -a android.intent.action.VIEW -d ${link}`, { env: { PATH: '/system/bin' }})
            .then(({ errno }) => {
                if (errno !== 0) {
                    toast("Failed to open link with exec");
                    window.open(link, "_blank");
                }
            });
    }, 100);
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
 * set status of global vairable: footerClick
 * @param {boolean} status 
 */
export function setFooterClick(status) {
    footerClick = status;
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
    let input;
    typeof translations[key] === 'undefined' ? input = key : input = translations[key];
    const prompt = document.getElementById('prompt');
    const message = `${preValue} ${input} ${postValue}`.trim();
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
 * @param {HTMLElement} cover - Cover element
 * @returns {void}
 */
export function setupSwipeToClose(element, cover) {
    let startX = 0, currentX = 0, startY = 0, isDragging = false, isScrolling = false;
    const bodyContent = document.querySelector('.body-content');
    const backButton = document.querySelector('.back-button');

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

let em;
let isScrolling = false;
let lastScrollY = 0;
let scrollTimeout;
const scrollThreshold = 25;

// Scroll event
export function setupScrollEvent() {
    em?.removeAll();
    em = createEventManager();

    const content = document.querySelector('.body-content');
    const floatBtn = document.querySelector('.float');
    const forceUpdateButton = document.getElementById('force-update-btn');
    const isNotTcpBtn = floatBtn && !floatBtn.classList.contains('tcpdump-btn');

    lastScrollY = content.scrollTop;

    em.on(content, 'scroll', () => {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 200);

        // Scroll down
        if (content.scrollTop > lastScrollY && content.scrollTop > scrollThreshold) {
            if (isNotTcpBtn) floatBtn.classList.remove('show');
            forceUpdateButton?.classList.remove('show');
        // Scroll up
        } else if (content.scrollTop < lastScrollY) {
            if (isNotTcpBtn) floatBtn.classList.add('show');
            setTimeout(() => forceUpdateButton?.classList.add('show'), 200);
        }

        // Hide remove button on scroll
        document.querySelectorAll('.scrollable-list').forEach(el => {
            el.scrollTo({ left: 0, behavior: 'smooth' });
        });

        lastScrollY = content.scrollTop;
    });

    if (!floatBtn) return;

    document.querySelectorAll('.terminal').forEach(terminal => {
        em.on(terminal, 'scroll', () => {
            isScrolling = true;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 200);

            if (!floatBtn.classList.contains('inTerminal')) return;

            // At top
            if (terminal.scrollTop === 0 && floatBtn.classList.contains('tcpdump-btn')) {
                setTimeout(() => floatBtn.classList.remove('show'), 100); // Hide go-top button
            } else {
                floatBtn.classList.add('show'); // Show button on scroll
            }
            lastScrollY = terminal.scrollTop;
        });
    });
}

/**
 * Event listener manager to simplify the process of registering and cleaning up event listeners.
 * 
 * Example usage:
 * const events = createEventManager();
 * 
 * const button = document.getElementById('myBtn');
 * events.on(button, 'click', () => console.log('clicked'));
 * 
 * events.removeAll();
 * 
 * @returns {{
*   on: (target: EventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void,
*   off: (target: EventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => void,
*   removeAll: () => void
* }} An object with methods to register 'on', remove 'off', and batch remove 'removeAll' event listeners.
*/
export function createEventManager() {
    const listeners = [];

    function on(target, type, handler, options) {
        if (!target || typeof target.addEventListener !== 'function') return;

        target.addEventListener(type, handler, options);
        listeners.push({ target, type, handler, options });
    }

    function off(target, type, handler, options) {
        target.removeEventListener(type, handler, options);
    }

    function removeAll() {
        for (const { target, type, handler, options } of listeners) {
            target.removeEventListener(type, handler, options);
        }
        listeners.length = 0;
    }

    return { on, off, removeAll };
}
