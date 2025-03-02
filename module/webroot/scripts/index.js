import { initializeAvailableLanguages, detectUserLanguage, loadTranslations, translations } from './language.js';

const basePath = "/data/adb/bindhosts";

const filePaths = {
    custom: `${basePath}/custom.txt`,
    sources: `${basePath}/sources.txt`,
    blacklist: `${basePath}/blacklist.txt`,
    whitelist: `${basePath}/whitelist.txt`,
    sources_whitelist: `${basePath}/sources_whitelist.txt`,
};

const cover = document.querySelector('.cover');
const header = document.querySelector('.header');
const actionContainer = document.querySelector('.float');
const actionButton = document.querySelector('.action-button');
const inputs = document.querySelectorAll('textarea');
const focusClass = 'input-focused';
const tilesContainer = document.getElementById('tiles-container');
const toggleContainer = document.getElementById('update-toggle-container');
const toggleVersion = document.getElementById('toggle-version');
const actionRedirectContainer = document.getElementById('action-redirect-container');
const actionRedirectStatus = document.getElementById('action-redirect');
const cronContainer = document.getElementById('cron-toggle-container');
const cronToggle = document.getElementById('toggle-cron');
const rippleClasses = [];

let clickCount = 0;
let clickTimeout;
export let developerOption = false;
export let learnMore = false;

// Function to add material design style ripple effect
export function applyRippleEffect() {
    document.querySelectorAll('.ripple-element, .reboot').forEach(element => {
        if (element.dataset.rippleListener !== "true") {
            element.addEventListener("pointerdown", function (event) {
                if (isScrolling) return;
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

                // Adaptive color
                const computedStyle = window.getComputedStyle(element);
                const bgColor = computedStyle.backgroundColor || "rgba(0, 0, 0, 0)";
                const textColor = computedStyle.color;
                const isDarkColor = (color) => {
                    const rgb = color.match(/\d+/g);
                    if (!rgb) return false;
                    const [r, g, b] = rgb.map(Number);
                    return (r * 0.299 + g * 0.587 + b * 0.114) < 96; // Luma formula
                };
                ripple.style.backgroundColor = isDarkColor(bgColor) ? "rgba(255, 255, 255, 0.2)" : "";

                // Append ripple and handle cleanup
                element.appendChild(ripple);
                const handlePointerUp = () => {
                    ripple.classList.add("end");
                    setTimeout(() => {
                        ripple.classList.remove("end");
                        ripple.remove();
                    }, duration * 1000);
                    element.removeEventListener("pointerup", handlePointerUp);
                    element.removeEventListener("pointercancel", handlePointerUp);
                };
                element.addEventListener("pointerup", handlePointerUp);
                element.addEventListener("pointercancel", handlePointerUp);
            });
            element.dataset.rippleListener = "true";
        }
    });
}

// Function to read a file and display its content in the UI
async function loadFile(fileType) {
    try {
        const content = await execCommand(`
            [ -f ${filePaths[fileType]} ] || touch ${filePaths[fileType]}
            cat ${filePaths[fileType]}
        `);
        const lines = content
            .split("\n")
            .map(line => line.trim())
            .filter(line => line && !line.startsWith("#"));
        const listElement = document.getElementById(`${fileType}-list`);
        listElement.innerHTML = "";
        lines.forEach(line => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <span>${line}</span>
                <button class="delete-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M277.37-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-514.5h-45.5v-91H354.5v-45.5h250.52v45.5h214.11v91h-45.5v514.5q0 37.78-26.61 64.39t-64.39 26.61H277.37Zm78.33-168.37h85.5v-360h-85.5v360Zm163.1 0h85.5v-360h-85.5v360Z"/></svg>
                </button>
            `;
            listElement.appendChild(listItem);
            listItem.querySelector(".delete-btn").addEventListener("click", () => removeLine(fileType, line));
        });
    } catch (error) {
        console.error(`Failed to load ${fileType} file: ${error}`);
    }
}

// Function to check if running in Magisk
async function checkMagisk() {
    try {
        const magiskEnv = await execCommand(`command -v magisk >/dev/null 2>&1 && echo "true" || echo "false"`);
        if (magiskEnv.trim() === "true") {
            console.log("Running under magisk environment, displaying element.");
            actionRedirectContainer.style.display = "flex";
        } else {
            console.log("Not magisk, leaving action redirect element hidden.");
        }
    } catch (error) {
        console.error("Error while checking magisk", error);
    }
}

// Function to load current mode
async function getCurrentMode() {
    const modeElement = document.getElementById('mode-text');
    try {
        const command = "grep '^operating_mode=' /data/adb/modules/bindhosts/mode.sh | cut -d'=' -f2";
        const mode = await execCommand(command);
        modeElement.textContent = mode.trim();
    } catch (error) {
        console.error("Failed to read current mode from mode.sh:", error);
        modeElement.textContent = "Error";
    }
}

// Function to load the version from module.prop and load the version in the WebUI
async function loadVersionFromModuleProp() {
    const versionElement = document.getElementById('version-text');
    try {
        const command = "grep '^version=' /data/adb/modules/bindhosts/module.prop | cut -d'=' -f2";
        const version = await execCommand(command);
        versionElement.textContent = version.trim();
    } catch (error) {
        console.error("Failed to read version from module.prop:", error);
        versionElement.textContent = "Error";
    }
}

// Function to check module update status
async function checkUpdateStatus() {
    try {
        const result = await execCommand("grep -q '^updateJson' /data/adb/modules/bindhosts/module.prop");
        toggleVersion.checked = !result;
    } catch (error) {
        toggleVersion.checked = false;
        console.error('Error checking update status:', error);
    }
}

// Function to check action redirect WebUI status
async function checkRedirectStatus() {
    try {
        const result = await execCommand(`[ ! -f ${basePath}/webui_setting.sh ] || grep -q '^magisk_webui_redirect=1' ${basePath}/webui_setting.sh`);
        actionRedirectStatus.checked = !result;
    } catch (error) {
        actionRedirectStatus.checked = false;
        console.error('Error checking action redirect status:', error);
    }
}

// Function to check cron status
async function checkCronStatus() {
    try {
        const result = await execCommand(`grep -q "bindhosts.sh" ${basePath}/crontabs/root`);
        cronToggle.checked = !result;
    } catch (error) {
        cronToggle.checked = false;
        console.error('Error checking cron status:', error);
    }
}

// Function to get the status from module.prop and update the status in the WebUI
async function updateStatusFromModuleProp() {
    try {
        const command = "grep '^description=' /data/adb/modules/bindhosts/module.prop | sed 's/description=status: //'";
        const description = await execCommand(command);
        if (!description.trim()) {
            throw new Error("Description is empty");
        }
        updateStatus(description.trim());
    } catch (error) {
        console.error("Failed to read description from module.prop:", error);
        if (typeof ksu !== 'undefined' && ksu.mmrl) {
            updateStatus("Please enable JavaScript API in MMRL settings:\n1. Settings\n2. Security\n3. Allow JavaScript API\n4. Bindhosts\n5. Enable Allow Advanced KernelSU API");
        } else {
            updateStatus("Error reading description from module.prop");
        }
    }
}

// Function to update the status text dynamically in the WebUI
function updateStatus(statusText) {
    const statusElement = document.getElementById('status-text');
    statusElement.innerHTML = statusText.replace(/\n/g, '<br>');
}

// function to check the if user has installed bindhosts app
async function checkBindhostsApp() {
    try {
        const appInstalled = await execCommand(`pm path me.itejo443.bindhosts >/dev/null 2>&1 || echo "false"`);
        if (appInstalled.trim() === "false") {
            tilesContainer.style.display = "flex";
        }
    } catch (error) {
        console.error("Error while checking bindhosts app:", error);
    }
    tilesContainer.addEventListener('click', async () => {
        try {
            showPrompt("control_panel.installing", true, undefined, "[+]");
            await new Promise(resolve => setTimeout(resolve, 200));
            const output = await execCommand("sh /data/adb/modules/bindhosts/bindhosts-app.sh");
            const lines = output.split("\n");
            lines.forEach(line => {
                if (line.includes("[+]")) {
                    showPrompt("control_panel.installed", true, 5000, "[+]");
                    tilesContainer.style.display = "none";
                } else if (line.includes("[x] Failed to download")) {
                    showPrompt("control_panel.download_fail", false, undefined, "[×]");
                } else if (line.includes("[*]")) {
                    showPrompt("control_panel.install_fail", false, 5000, "[×]");
                }
            });
        } catch (error) {
            console.error("Execution failed:", error);
        }
    });
}

// Function to handle adding input to the file
async function handleAdd(fileType, prompt) {
    const inputElement = document.getElementById(`${fileType}-input`);
    const inputValue = inputElement.value.trim();
    console.log(`Input value for ${fileType}: "${inputValue}"`);
    if (inputValue === "") {
        console.error("Input is empty. Skipping add operation.");
        return;
    }
    const inputLines = inputValue.split('\n').map(line => line.trim()).filter(line => line !== "");
    try {
        const fileContent = await execCommand(`cat ${filePaths[fileType]}`);
        const existingLines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== "");

        for (const line of inputLines) {
            if (existingLines.includes(line)) {
                console.log(`"${line}" is already in ${fileType}. Skipping add operation.`);
                showPrompt(prompt, false, 2000, `${line}`);
                continue;
            }
            await execCommand(`echo "${line}" >> ${filePaths[fileType]}`);
            console.log(`Added "${line}" to ${fileType} successfully.`);
        }

        inputElement.value = "";
        console.log(`Input box for ${fileType} cleared.`);
        loadFile(fileType);
    } catch (error) {
        console.error(`Failed to process input for ${fileType}: ${error}`);
    }
}

// Function to remove a line from a file
async function removeLine(fileType, lineContent) {
    try {
        const content = await execCommand(`cat ${filePaths[fileType]}`);
        const updatedContent = content
            .split("\n")
            .filter(line => line.trim() !== lineContent)
            .join("\n");

        await execCommand(`echo "${updatedContent}" > ${filePaths[fileType]}`);
        loadFile(fileType);
    } catch (error) {
        console.error(`Failed to remove line from ${fileType}: ${error}`);
    }
}

// Help event listener
export let activeOverlay = null;
function setupHelpMenu() {
    const helpButtons = document.querySelectorAll(".help-btn");
    const overlays = document.querySelectorAll(".overlay");
    helpButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;
            const overlay = document.getElementById(`${type}-help`);
            if (overlay) {
                openOverlay(overlay);
            }
        });
    });
    overlays.forEach(overlay => {
        const closeButton = overlay.querySelector(".close-btn");
        const docsButtons = overlay.querySelector(".docs-btn");
        const languageContainer = document.getElementById('language-container');
        const language = document.getElementById('language-help');

        if (closeButton) {
            closeButton.addEventListener("click", () => closeOverlay(overlay));
        }

        if (docsButtons) {
            docsButtons.addEventListener("click", () => closeOverlay(overlay));
        }

        if (languageContainer) {
            languageContainer.addEventListener('click', () => {
            openOverlay(language);
            });
        }

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeOverlay(overlay);
            }
        });
    });
    function openOverlay(overlay) {
        if (activeOverlay) closeOverlay(activeOverlay);
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        activeOverlay = overlay;
    }
    function closeOverlay(overlay) {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
        activeOverlay = null;
        setTimeout(() => {
                learnMore = false;
        }, 50);
    }
}

// Run bindhosts.sh --action
async function executeActionScript() {
    try {
        showPrompt("global.executing", true, 50000);
        await new Promise(resolve => setTimeout(resolve, 200));
            const command = "sh /data/adb/modules/bindhosts/bindhosts.sh --action";
            const output = await execCommand(command);
            const lines = output.split("\n");
            lines.forEach(line => {
                if (line.includes("[+] hosts file reset!")) {
                    showPrompt("global.reset", true, undefined, "[+]");
                } else if (line.includes("[+]")) {
                    showPrompt(line, true);
                } else if (line.includes("[x] unwritable")) {
                    showPrompt("global.unwritable", false, undefined, "[×]");
                } else if (line.includes("[x]")) {
                    showPrompt(line, false);
                } else if (line.includes("[*] not running")) {
                    showPrompt("global.disabled", false, undefined, "[*]");
                } else if (line.includes("[*] please reset")) {
                    showPrompt("global.adaway", false, undefined, "[*]");
                } else if (line.includes("[*]")) {
                    showPrompt(line, false);
                }
            });
            await updateStatusFromModuleProp();
    } catch (error) {
        showPrompt("global.execute_error", false, undefined, undefined, error);
        console.error("Failed to execute action script:", error);
    }
}

// Funtion to determine state of developer option
async function checkDevOption() {
    try {
        const fileExists = await execCommand(`[ -f ${basePath}/mode_override.sh ] && echo 'true' || echo 'false'`);
        if (fileExists.trim() === "true") {
            developerOption = true;
        }
    } catch (error) {
        console.error("Error checking developer option:", error);
    }
}

// Determine mode button behavior of mode button depends on developer option
document.getElementById("mode-btn").addEventListener("click", async () => {
    await checkDevOption();
    if (developerOption) {
        openOverlay(document.getElementById("mode-menu"));
        learnMore = true;
    }
});

// Function to redirect link on external browser
export async function linkRedirect(link) {
    try {
        await execCommand(`am start -a android.intent.action.VIEW -d ${link}`);
    } catch (error) {
        console.error('Error redirect link:', error);
    }
}

// Event listener to enable developer option
document.getElementById("status-box").addEventListener("click", async (event) => {  
    clickCount++;
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
        clickCount = 0;
    }, 2000);
    if (clickCount === 5) {
        clickCount = 0;
        await checkDevOption();
        if (!developerOption) {
            try {
                developerOption = true;
                showPrompt("global.dev_opt", true);
            } catch (error) {
                console.error("Error enabling developer option:", error);
                showPrompt("global.dev_opt_fail", false);
            }
        } else {
            showPrompt("global.dev_opt_true", true);
        }
    }
});

// Save mode option
async function saveModeSelection(mode) {
    try {
        if (mode === "reset") {
            await execCommand(`rm -f ${basePath}/mode_override.sh`);
            closeOverlay("mode-menu");
            learnMore = false;
        } else {
            await execCommand(`echo "mode=${mode}" > ${basePath}/mode_override.sh`);
        }
        showPrompt("global.reboot", true, 4000);
        await updateModeSelection();
    } catch (error) {
        console.error("Error saving mode selection:", error);
    }
}

// Update radio button state based on current mode
async function updateModeSelection() {
    try {
        const fileExists = await execCommand(`[ -f ${basePath}/mode_override.sh ] && echo 'true' || echo 'false'`);
        if (fileExists.trim() === "false") {
            document.querySelectorAll("#mode-options input").forEach((input) => {
                input.checked = false;
            });
            return;
        }
        const content = await execCommand(`cat ${basePath}/mode_override.sh`);
        const currentMode = content.trim().match(/mode=(\d+)/)?.[1] || null;
        document.querySelectorAll("#mode-options input").forEach((input) => {
            input.checked = input.value === currentMode;
        });
    } catch (error) {
        console.error("Error updating mode selection:", error);
    }
}

// function to open and close mode option
function openOverlay(overlay) {
    updateModeSelection();
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}
document.getElementById("mode-menu").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        closeOverlay("mode-menu");
    }
});
async function closeOverlay(id) {
    const overlay = document.getElementById(id);
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    if (id === "mode-menu") {
        try {
            const content = await execCommand(`cat ${basePath}/mode_override.sh || echo ''`);
            if (content.trim() === "") {
                await execCommand(`rm -f ${basePath}/mode_override.sh`);
                console.log("Removed empty mode_override.sh file");
            }
        } catch (error) {
            console.error("Error checking or removing empty file:", error);
        }
    }
}

// Function to show the prompt with a success or error message
function showPrompt(key, isSuccess = true, duration = 2000, preValue = "", postValue = "") {
    const prompt = document.getElementById('prompt');
    const message = key.split('.').reduce((acc, k) => acc && acc[k], translations) || key;
    const finalMessage = `${preValue} ${message} ${postValue}`.trim();
    prompt.textContent = finalMessage;
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
                    execCommand("svc power reboot").catch(error => {
                        console.error("Failed to execute reboot command:", error);
                    });
                }
            }, 1000);
        };
    } else {
        prompt.classList.remove('reboot', 'ripple-element');
    }

    setTimeout(() => {
        if (typeof ksu !== 'undefined' && ksu.mmrl) {
            prompt.style.transform = 'translateY(calc((var(--window-inset-bottom) + 60%) * -1))';
        } else {
            prompt.style.transform = 'translateY(-60%)';
        }
        window.promptTimeout = setTimeout(() => {
            prompt.style.transform = 'translateY(100%)';
        }, duration);
    }, 100);
}

// Prevent input box blocked by keyboard
inputs.forEach(input => {
    input.addEventListener('focus', event => {
        document.body.classList.add(focusClass);
        const wrapper = event.target.closest('.input-box-wrapper');
        wrapper.classList.add('focus');
        const inputBox = wrapper.querySelector('.input-box');
        inputBox.style.paddingLeft = '9px';
        setTimeout(() => {
            const offsetAdjustment = window.innerHeight * 0.1;
            const targetPosition = event.target.getBoundingClientRect().top + window.scrollY;
            const adjustedPosition = targetPosition - (window.innerHeight / 2) + offsetAdjustment;
            window.scrollTo({
                top: adjustedPosition,
                behavior: 'smooth',
            });
        }, 100);
    });
    input.addEventListener('blur', () => {
        document.body.classList.remove(focusClass);
        const wrapper = input.closest('.input-box-wrapper');
        wrapper.classList.remove('focus');
        const inputBox = wrapper.querySelector('.input-box');
        inputBox.style.paddingLeft = '10px';
    });
});

// Scroll event
let lastScrollY = window.scrollY;
let isScrolling = false;
let scrollTimeout;
const scrollThreshold = 25;
window.addEventListener('scroll', () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
    }, 200);
    if (window.scrollY > lastScrollY && window.scrollY > scrollThreshold) {
        if (typeof ksu !== 'undefined' && ksu.mmrl) {
            actionContainer.style.transform = 'translateY(calc(var(--window-inset-bottom) + 110px))';
        } else {
            actionContainer.style.transform = 'translateY(110px)';
        }
    } else if (window.scrollY < lastScrollY) {
        actionContainer.style.transform = 'translateY(0)';
    }
    
    // header opacity
    const scrollRange = 30;
    const scrollPosition = Math.min(Math.max(window.scrollY, 0), scrollRange);
    const opacity = 1 - (scrollPosition / scrollRange);
    header.style.opacity = opacity.toString();
    if (opacity == 0) {
        header.style.pointerEvents = 'none';
    } else {
        header.style.pointerEvents = 'auto';
    }

    lastScrollY = window.scrollY;
});

// Attach event listener for action button
document.getElementById("actionButton").addEventListener("click", executeActionScript);

// Attach event listeners to the add buttons
function attachAddButtonListeners() {
    const elements = [
        { id: "custom-input", type: "custom", fail: "custom.prompt_fail" },
        { id: "sources-input", type: "sources", fail: "source.prompt_fail" },
        { id: "blacklist-input", type: "blacklist", fail: "blacklist.prompt_fail" },
        { id: "whitelist-input", type: "whitelist", fail: "whitelist.prompt_fail" },
        { id: "sources_whitelist-input", type: "sources_whitelist", fail: "sources_whitelist.prompt_fail" }
    ];
    elements.forEach(({ id, type, fail }) => {
        const inputElement = document.getElementById(id);
        const buttonElement = document.getElementById(`${type}-add`);
        if (inputElement) {
            inputElement.addEventListener("keypress", (e) => {
                if (e.key === "Enter") handleAdd(type, fail);
            });
        }
        if (buttonElement) {
            buttonElement.addEventListener("click", () => handleAdd(type, fail));
        }
    });
}

// Attach event listeners for mode options
document.getElementById("mode-options").addEventListener("change", (event) => {
    const selectedMode = event.target.value;
    saveModeSelection(selectedMode);
});

// Attach event listener for reset button
document.getElementById("reset-mode").addEventListener("click", () => {
    saveModeSelection("reset");
});

// Event listener for the update toggle switch
toggleContainer.addEventListener('click', async function () {
    try {
        const result = await execCommand("sh /data/adb/modules/bindhosts/bindhosts.sh --toggle-updatejson");
        const lines = result.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt("control_panel.update_true", true, undefined, "[+]");
            } else if (line.includes("[x]")) {
                showPrompt("control_panel.update_false", false, undefined, "[×]");
            }
        });
        checkUpdateStatus();
    } catch (error) {
        console.error("Failed to toggle update", error);
    }
});

// Event listener for the action redirect switch
actionRedirectContainer.addEventListener('click', async function () {
    try {
        await execCommand(`echo "magisk_webui_redirect=${actionRedirectStatus.checked ? 0 : 1}" > ${basePath}/webui_setting.sh`);
        if (actionRedirectStatus.checked) {
            showPrompt("control_panel.action_prompt_false", false, undefined, "[×]");
        } else {
            showPrompt("control_panel.action_prompt_true", true, undefined, "[+]");
        }
        checkRedirectStatus();
    } catch (error) {
        console.error("Failed to execute change status", error);
    }
});

// Event listener for the cron toggle switch
cronContainer.addEventListener('click', async function () {
    try {
        let command;
        if (cronToggle.checked) {
            command = "sh /data/adb/modules/bindhosts/bindhosts.sh --disable-cron";
        } else {
            command = "sh /data/adb/modules/bindhosts/bindhosts.sh --enable-cron";
        }
        const result = await execCommand(command);
        const lines = result.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt("control_panel.cron_true", true, undefined, "[+]");
            } else if (line.includes("[x]")) {
                showPrompt("control_panel.cron_false", false, undefined, "[×]");
            }
        });
        checkCronStatus();
    } catch (error) {
        console.error("Failed to toggle cron", error);
    }
});

// Initial load
window.onload = () => {
    checkMMRL();
    ["custom", "sources", "blacklist", "whitelist", "sources_whitelist"].forEach(loadFile);
    attachAddButtonListeners();
    attachHelpButtonListeners();
};
document.addEventListener('DOMContentLoaded', async () => {
    await initializeAvailableLanguages();
    const userLang = detectUserLanguage();
    await loadTranslations(userLang);
    cover.style.display = "none";
    setupHelpMenu();
    await getCurrentMode();
    await updateStatusFromModuleProp();
    await loadVersionFromModuleProp();
    await checkDevOption();
    checkMagisk();
    checkBindhostsApp();
    applyRippleEffect();
    checkUpdateStatus();
    checkRedirectStatus();
    checkCronStatus();
});

// Function to check if running in MMRL
function checkMMRL() {
    if (typeof ksu !== 'undefined' && ksu.mmrl) {
        // Adjust inset
        header.style.top = 'var(--window-inset-top)';
        actionContainer.style.bottom = 'calc(var(--window-inset-bottom) + 40px)';

        // Set status bars theme based on device theme
        try {
            $bindhosts.setLightStatusBars(!window.matchMedia('(prefers-color-scheme: dark)').matches)
        } catch (error) {
            console.log("Error setting status bars theme:", error)
        }

        // Request API permission
        try {
            $bindhosts.requestAdvancedKernelSUAPI();
        } catch (error) {
            console.log("Error requesting API:", error);
        }
    } else {
        console.log("Not running in MMRL environment.");
    }
}

// Execute shell commands
export async function execCommand(command) {
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

export function toast(message) {
    ksu.toast(message);
}
