import { exec, spawn } from '../../utils/kernelsu.js';
import { showPrompt, applyRippleEffect, basePath, moduleDirectory, linkRedirect, filePaths, setupSwipeToClose, createEventManager } from '../../utils/util.js';
import { translations, generateLanguageMenu } from '../../utils/language.js';
import { openFileSelector } from '../../utils/file_selector.js';
import { addCopyToClipboardListeners, setupDocsMenu } from '../../utils/docs.js';

let em = createEventManager();

/**
 * Check if user has installed bindhosts app
 * Show QS tile option when user has not installed bindhosts app
 * Click to install bindhosts app
 * @returns {void}
 */
function checkBindhostsApp() {
    const tilesContainer = document.getElementById('tiles-container');

    exec("pm path me.itejo443.bindhosts")
        .then(({ errno }) => {
            if (errno !== 0) tilesContainer.style.display = "flex";
        });
}

/**
 * Install the bindhosts app, called by controlPanelEventlistener
 * @returns {void}
 */
function installBindhostsApp() {
    showPrompt("control_panel_installing", true, 10000, "[+]");
    const tilesContainer = document.getElementById('tiles-container');
    const output = spawn("sh", [`${moduleDirectory}/bindhosts-app.sh`]);
    output.stdout.on('data', (data) => {
        if (data.includes("[+]")) {
            showPrompt("control_panel_installed", true, 5000, "[+]");
            tilesContainer.style.display = "none";
        } else if (data.includes("[x] Failed to download")) {
            showPrompt("control_panel_download_fail", false, undefined, "[×]");
        } else if (data.includes("[*]")) {
            showPrompt("control_panel_install_fail", false, 5000, "[×]");
        }
    });
}

/**
 * Check module update status
 * Event listener for module update toggle
 * @returns {void}
 */
function checkUpdateStatus() {
    const toggleVersion = document.getElementById('toggle-version');
    fetch(`link/MODDIR/module.prop`)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            toggleVersion.checked = lines.some(line => line.trim().startsWith("updateJson="));
        })
}

/**
 * Switch module update status and refresh toggle, called by controlPanelEventlistener
 * @returns {Promise<void>}
 */
async function toggleModuleUpdate() {
    const result = await exec(`sh ${moduleDirectory}/bindhosts.sh --toggle-updatejson`);
    if (result.errno === 0) {
        const lines = result.stdout.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt("control_panel_update_true", true, undefined, "[+]");
            } else if (line.includes("[x]")) {
                showPrompt("control_panel_update_false", false, undefined, "[×]");
            }
        });
        checkUpdateStatus();
    } else {
        console.error("Failed to toggle update:", result.stderr);
    }
}

/**
 * Display action redirect switch when running in Magisk
 * Action redirect WebUI toggle
 * @returns {void}
 */
function checkMagisk() {
    exec(`grep -q Magisk ${basePath}/root_manager.sh`)
        .then(({ errno }) => {
            if (errno === 0) {
                document.getElementById('action-redirect-container').style.display = "flex";
                checkRedirectStatus();
            }
        });
}

/**
 * Toggle the action redirect WebUI setting, called by controlPanelEventlistener
 * @returns {Promise<void>}
 */
async function toggleActionRedirectWebui() {
    const actionRedirectStatus = document.getElementById('action-redirect');
    const result = await exec(`
        echo "magisk_webui_redirect=${actionRedirectStatus.checked ? 0 : 1}" > ${basePath}/webui_setting.sh
        chmod 755 ${basePath}/webui_setting.sh || true
    `);
    if (result.errno === 0) {
        if (actionRedirectStatus.checked) {
            showPrompt("control_panel_action_prompt_false", false, undefined, "[×]");
        } else {
            showPrompt("control_panel_action_prompt_true", true, undefined, "[+]");
        }
        checkRedirectStatus();
    } else {
        console.error("Failed to execute change status", result.stderr);
    }
}

/**
 * Check action redirect status
 * @returns {void}
 */
function checkRedirectStatus() {
    const actionRedirectStatus = document.getElementById('action-redirect');

    fetch(`link/PERSISTENT_DIR/webui_setting.sh`)
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.text();
        })
        .then(data => {
            const redirectStatus = data.match(/magisk_webui_redirect=(\d)/)[1];
            actionRedirectStatus.checked = redirectStatus === "1";
        })
        .catch(error => {
            actionRedirectStatus.checked = true;
        });
}

/**
 * Check cron status
 * Event listener for cron toggle
 * @returns {void}
 */
function checkCronStatus() {
    const cronToggle = document.getElementById('toggle-cron');

    // Hide cron toggle when using AdAway
    fetch('link/MODDIR/module.prop')
        .then(response => response.text())
        .then(text => {
            if (text.includes('AdAway')) {
                document.getElementById('cron-toggle-container').style.display = 'none';
            } else {
                exec(`grep -q bindhosts.sh ${basePath}/crontabs/root`)
                    .then(({ errno }) => {
                        cronToggle.checked = errno === 0 ? true : false;
                    });
            }
        })
        .catch(error => {
            console.error('Error checking cron status:', error);
        });
}

/**
 * Toggle cron job status, called by controlPanelEventlistener
 * @returns {Promise<void>}
 */
async function toggleCron() {
    const cronToggle = document.getElementById('toggle-cron');
    const result = await exec(`sh ${moduleDirectory}/bindhosts.sh --${cronToggle.checked ? "disable" : "enable"}-cron`);
    if (result.errno === 0) {
        const lines = result.stdout.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt("control_panel_cron_true", true, undefined, "[+]");
            } else if (line.includes("[x]")) {
                showPrompt("control_panel_cron_false", false, undefined, "[×]");
            }
        });
        checkCronStatus();
    } else {
        console.error("Failed to toggle cron", result.stderr);
    }
}

/**
 * Update to latest canary version, called by controlPanelEventlistener
 * @returns {void}
 */
function canaryUpdate() {
    const result = spawn('sh', [`${moduleDirectory}/bindhosts.sh`, '--install-canary'], { env: { KSU_WEBUI: "true" } });
    result.stdout.on('data', (data) => {
        if (data.includes('[+]')) {
            showPrompt(data, true, 15000);
        } else if (data.includes('[x]') || data.includes('[!]')) {
            showPrompt(data, false, 3000);
        }
    });
    result.on('exit', (code) => {
        if (code === 0) {
            showPrompt("more_support_update_success", true, 3000);
        } else {
            showPrompt("more_support_update_fail", false, 3000);
        }
    });
}

let languageMenuListener = false;
/**
 * Open language menu overlay, called by controlPanelEventlistener
 * @returns {void}
 */
function openLanguageMenu() {
    const languageOverlay = document.getElementById('language-overlay');

    // Open menu
    languageOverlay.style.display = 'flex';
    setTimeout(() => {
        languageOverlay.style.opacity = '1';
    }, 10);

    const closeOverlay = () => {
        languageOverlay.style.opacity = '0';
        setTimeout(() => {
            languageOverlay.style.display = 'none';
        }, 200);
    };

    if (!languageMenuListener) {
        languageMenuListener = true;
        const closeBtn = document.querySelector('.close-btn');
        const infoBtn = document.getElementById('translate-btn');

        closeBtn.onclick = () => closeOverlay();
        infoBtn.onclick = () => closeOverlay();
        em.on(languageOverlay, 'click', (event) => {
            if (event.target === languageOverlay) closeOverlay();
        });
    }
}

/**
 * Check availability of tcpdump
 * @returns {void}
 */
function checkTcpdump() {
    exec("command -v tcpdump")
        .then(({ errno }) => {
            if (errno !== 0) document.getElementById('tcpdump-container').style.display = 'none';
        })
}

let setupTcpdumpTerminal = false, contentBox = false;

/**
 * Open tcpdump terminal
 * @returns {void}
 */
function openTcpdumpTerminal() {
    const cover = document.querySelector('.document-cover');
    const terminal = document.getElementById('tcpdump-terminal');
    const terminalContent = document.getElementById('tcpdump-terminal-content');
    const header = document.querySelector('.title-container');
    const title = document.getElementById('title');
    const backButton = document.querySelector('.back-button');
    const bodyContent = document.querySelector('.body-content');
    const floatBtn = document.querySelector('.float');
    const stopBtn = document.getElementById('stop-tcpdump');
    const scrollTopBtn = document.getElementById('scroll-top');

    terminalContent.innerHTML = `
        <div class="tcpdump-header" id="tcpdump-header"></div>
        <div class="box tcpdump-search translucent" id="tcpdump-search">
            <h2>${ translations.query_search }</h2>
            <input class="query-input translucent" type="text" id="tcpdump-search-input" placeholder="${ translations.query_search }" autocapitalize="off">
        </div>
    `;

    if (!setupTcpdumpTerminal) {
        setupSwipeToClose(terminal, cover);
        em.on(stopBtn, 'click', () => stopTcpdump());
        em.on(backButton, 'click', () => closeTcpdumpTerminal());
        const searchInput = document.getElementById('tcpdump-search-input');
        em.on(searchInput, 'input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const tcpdumpLines = document.querySelectorAll('.tcpdump-line');
            tcpdumpLines.forEach(line => {
                const domain = line.querySelector('.tcpdump-result');
                if (!domain) return;
                line.style.display = domain.textContent.toLowerCase().includes(searchTerm) ? 'flex': 'none';
            });
        });
        em.on(scrollTopBtn, 'click', () => {
            terminalContent.scrollTo({ top: 0, behavior: 'smooth' });
        });
        setupTcpdumpTerminal = true;
    }

    const tcpdumpHeader = document.getElementById('tcpdump-header');
    const output = spawn("sh", [`${moduleDirectory}/bindhosts.sh`, '--tcpdump']);
    output.stdout.on('data', (data) => {
        if (data.includes('Out IP') || data.includes('In IP')) {
            if (!contentBox) appendContentBox();
            const match = data.match(/(\bA+|HTTPS)\?\s+([^\s.]+(?:\.[^\s.]+)+)\./i);
            if (match) {
                const type = match[1].toUpperCase();
                const domain = match[2];
                const div = document.createElement('div');
                div.className = 'tcpdump-line';
                div.innerHTML = `
                    <div class="tcpdump-type">${type}</div>
                    <div class="tcpdump-domain tcpdump-result ripple-element" id="copy-link">${domain}</div>
                `;
                document.querySelector('.tcpdump-content').appendChild(div);
                terminalContent.scrollTop = terminalContent.scrollHeight;
                addCopyToClipboardListeners();
                applyRippleEffect();
            }
        } else if (!data.startsWith("[")) {
            appendVerbose(data);
        }
    });
    output.stderr.on('data', (data) => appendVerbose(data));

    // Append content box before append content
    const appendContentBox = () => {
        const div = document.createElement('div');
        div.className = 'tcpdump-content';
        div.classList.add('translucent');
        div.innerHTML = `
            <div class="tcpdump-line tcpdump-line-header">
                <div class="tcpdump-type">${translations.query_host_type}</div>
                <div class="tcpdump-domain">${translations.query_host_domain}</div>
            <div>
        `;
        terminalContent.appendChild(div);
        contentBox = true;
    };

    // Append verbose log to header part
    const appendVerbose = (data) => {
        const p = document.createElement('p');
        p.className = 'tcpdump-header-content';
        p.textContent = data;
        tcpdumpHeader.appendChild(p);
    };

    // Terminate tcpdump
    const stopTcpdump = () => {
        const output = spawn("sh", [`${moduleDirectory}/bindhosts.sh`, '--stop-tcpdump']);
        output.on('exit', () => contentBox = false);
        if (contentBox) {
            document.getElementById('tcpdump-search').style.display = 'block';
        }
        floatBtn.classList.remove('show');
        if (terminalContent.scrollHeight > 1.5 * terminal.clientHeight) {
            scrollTopBtn.style.pointerEvents = 'auto';
            scrollTopBtn.style.opacity = '1';
            floatBtn.classList.add('show');
            setTimeout(() => floatBtn.classList.add('inTerminal'), 100);
        }
    };

    const closeTcpdumpTerminal = () => {
        stopTcpdump();
        floatBtn.classList.remove('show');
        floatBtn.classList.remove('inTerminal');
        scrollTopBtn.style.pointerEvents = 'none';
        scrollTopBtn.style.opacity = '0';
        terminal.style.transform = 'translateX(100%)';
        bodyContent.style.transform = 'translateX(0)';
        cover.style.opacity = '0';
        backButton.classList.remove('show');
        header.classList.remove('back');
        title.textContent = translations.footer_more;
    }

    // Open output terminal
    setTimeout(() => {
        terminal.style.transform = 'translateX(0)';
        bodyContent.style.transform = 'translateX(-20vw)';
        cover.style.opacity = '1';
        header.classList.add('back');
        backButton.classList.add('show');
        floatBtn.classList.add('show');
        title.textContent = translations.control_panel_monitor_network_activity;
        setTimeout(() => stopTcpdump(), 60000);
    }, 50);
}

/**
 * Backup bindhosts config to /sdcard/Download/bindhosts_config.json
 * @returns {Promise<void>}
 */
async function exportConfig() {
    const config = {
        metadata: {
            version: "v1",
            description: "bindhosts config backup"
        }
    };

    // Fetch and process each file
    for (const [fileType, filePath] of Object.entries(filePaths)) {
        const response = await fetch(`link/PERSISTENT_DIR/${filePath}`);
        if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
        const text = await response.text();
        const lines = text.trim();
        config[fileType] = {
            path: filePath,
            content: lines
        };
    }

    // Output in json format
    const result = await exec(`
            FILENAME="/storage/emulated/0/Download/bindhosts_config_$(date +%Y%m%d_%H%M%S).json"
            cat <<'JSON_EOF' > "$FILENAME"
${JSON.stringify(config)}
JSON_EOF
            echo "$FILENAME"
        `);
    if (result.errno === 0) {
        showPrompt("backup_restore_exported", true, undefined, undefined, result.stdout.trim());
    } else {
        console.error("Backup failed:", result.stderr);
        showPrompt("backup_restore_export_fail", false);
    }
}

/**
 * Restore config
 * Open file selector and restore config from selected file
 * @return {Promise<void>}
 */
async function restoreConfig() {
    const jsonConfig = await openFileSelector("json");
    const config = JSON.parse(jsonConfig);

    // Validate using metadata
    const isValid = config.metadata && config.metadata.description === "bindhosts config backup";
    if (!isValid) {
        showPrompt("backup_restore_invalid_config", false);
        return;
    }

    // Restore each file according to backup version
    if (config.metadata.version === "v1") {
        for (const [fileType, fileData] of Object.entries(config)) {
            if (!filePaths[fileType] || !fileData.content) continue;
            const content = fileData.content;
            const result = await exec(`
                cat <<'RESTORE_EOF' > ${basePath}/${fileData.path}
${content}
RESTORE_EOF
                chmod 644 ${basePath}/${fileData.path} || true
            `);
            if (result.errno === 0) {
                showPrompt("backup_restore_restored", true);
            } else {
                console.error("Restore failed:", result.stderr);
                showPrompt("backup_restore_restore_fail", false);
            }
        }
    }
}

/**
 * Attach event listeners to control panel items
 * @returns {void}
 */
function controlPanelEventlistener(event) {
    const controlPanel = {
        "language-container": openLanguageMenu,
        "tcpdump-container": openTcpdumpTerminal,
        "tiles-container": installBindhostsApp,
        "update-toggle-container": toggleModuleUpdate,
        "action-redirect-container": toggleActionRedirectWebui,
        "cron-toggle-container": toggleCron,
        "github-issues": () => linkRedirect('https://github.com/bindhosts/bindhosts/issues/new'),
        "canary-update": canaryUpdate,
        "export": exportConfig,
        "restore": restoreConfig
    };

    Object.entries(controlPanel).forEach(([element, functionName]) => {
        const el = document.getElementById(element);
        if (el) {
            let touchMoved = false, isHandling = false;

            // Handler for end events
            const handleEndEvent = () => {
                if (isHandling) return;
                isHandling = true;
                if (!touchMoved) {
                    setTimeout(() => {
                        functionName(event);
                        isHandling = false;
                    }, 50);
                } else {
                    isHandling = false;
                }
                touchMoved = false;
            };

            // Touch event
            em.on(el, 'touchstart', () => touchMoved = false);
            em.on(el, 'touchmove', () => touchMoved = true);
            em.on(el, 'touchend', handleEndEvent);

            // Mouse event
            em.on(el, 'mousedown', () => touchMoved = false);
            em.on(el, 'mousemove', () => touchMoved = true);
            em.on(el, 'mouseup', handleEndEvent);
        }
    });
}

/**
 * Initial load event listener
 * @returns {void}
 */
export function init() {
    document.getElementById('title').textContent = translations.footer_more;
    checkUpdateStatus();
    checkBindhostsApp();
    checkMagisk();
    checkCronStatus();
    checkTcpdump();
    controlPanelEventlistener();
    setupDocsMenu();
    generateLanguageMenu();
    applyRippleEffect();
}

export function destroy() {
    languageMenuListener = false;
    setupTcpdumpTerminal = false, contentBox = false;

    const floatBtn = document.querySelector('.float');
    floatBtn.classList.remove('show');
    floatBtn.classList.remove('inTerminal');

    em?.removeAll();
}
