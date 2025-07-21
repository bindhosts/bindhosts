import { exec, spawn, showPrompt, applyRippleEffect, checkMMRL, basePath, initialTransition, setupSwipeToClose, moduleDirectory, filePaths } from './util.js';
import { loadTranslations, translations } from './language.js';
import { openFileSelector } from './file_selector.js';

const forceUpdateButton = document.getElementById('force-update-btn');

/**
 * Read a file and display its content in the UI
 * Exclude # pattern
 * Create empty file if file not found
 * @param {string} fileType - Type of hosts file ('custom', 'sources', 'blacklist', etc.)
 * @returns {Promise<void>}
 */
async function loadFile(fileType) {
    const content = await fetch('link/PERSISTENT_DIR/' + filePaths[fileType]).then(response => response.text());
    const lines = content
        .split("\n")
        .map(line => line)
        .filter(line => line && !line.startsWith("#"));
    displayHostsList(lines, fileType);
}

/**
 * Display hosts list in the UI
 * Create list item with remove button, edit button on custom file
 * @param {string[]} lines - Array of host entries to display
 * @param {string} fileType - Type of hosts file ('custom', 'sources', 'blacklist', etc.)
 * @throws {Error} When DOM elements are not found
 * @returns {void}
 */
function displayHostsList(lines, fileType) {
    const listElement = document.getElementById(`${fileType}-list`);
    listElement.innerHTML = "";
    
    // "show more" option
    const showInitialLimit = 4;
    const minItemsForShowMore = 6; // Only show "Show More" when there are at least 6 items
    const hasMoreItems = lines.length >= minItemsForShowMore;
    const initialLines = hasMoreItems ? lines.slice(0, showInitialLimit) : lines;
    
    // Function to create list items
    const createListItem = (line) => {
        // Free favicon provided by GitHub@twentyhq/favicon
        let domain = line.trim().split(/\s+/).pop();
        try {
            if (!domain.startsWith("http")) domain = "http://" + domain;
            domain = new URL(domain).hostname;
        } catch (e) {
            domain = domain.split(/[/:?#]/)[0];
        }
        const faviconUrl = `https://twenty-icons.com/${domain}`;

        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div class="link-box">
                ${fileType !== "import_custom" ? `<div class="favicon-wrapper">
                    <div class="favicon-loader"></div>
                    <img class="favicon-img favicon" src="${faviconUrl}" />
                </div>` : ""}
                <div class="link-text">${line}</div>
            </div>
            ${fileType === "import_custom" ? `<button class="edit-btn ripple-element">
                <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
            </button>` : ""}
            <button class="delete-btn ripple-element" id="${fileType === "import_custom" ? "file-delete" : "line-delete"}">
                <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M277.37-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-514.5h-45.5v-91H354.5v-45.5h250.52v45.5h214.11v91h-45.5v514.5q0 37.78-26.61 64.39t-64.39 26.61H277.37Zm78.33-168.37h85.5v-360h-85.5v360Zm163.1 0h85.5v-360h-85.5v360Z"/></svg>
            </button>
        `;
        // Click to show remove button
        listElement.appendChild(listItem);
        listItem.addEventListener('click', () => {
            listItem.scrollTo({ left: listItem.scrollWidth, behavior: 'smooth' });
        });
        const deleteLine = listItem.querySelector("#line-delete");
        const deleteFile = listItem.querySelector("#file-delete");
        const editFile = listItem.querySelector(".edit-btn");
        const img = listItem.querySelector(".favicon-img");
        // Wait for favicon to load
        if (img) {
            const loader = listItem.querySelector(".favicon-loader");
            img.onload = () => {
                loader.style.display = "none";
                img.style.display = "block";
            };
            img.onerror = () => {
                loader.style.display = "none";
                listItem.querySelector(".favicon-wrapper").innerHTML = `<svg class="favicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z"/></svg>`;
            };
        }
        // Remove line from file
        if (deleteLine) {
            deleteLine.addEventListener("click", async () => {
                await exec(`
                    filtered=$(grep -vxF '${line}' ${basePath}/${filePaths[fileType]})
                    echo "$filtered" > ${basePath}/${filePaths[fileType]}
                `);
                listElement.removeChild(listItem);
            });
        }
        // Remove file
        if (deleteFile) {
            deleteFile.addEventListener("click", async () => {
                const fileName = listItem.querySelector(".link-text").textContent;
                const remove = await removeCustomHostsFile(fileName);
                if (remove) {
                    await exec(`rm -f "${basePath}/${fileName}"`);
                    listElement.removeChild(listItem);
                }
            });
        }
        // Edit file
        if (editFile) {
            editFile.addEventListener("click", () => {
                const line = listItem.querySelector(".link-text").textContent;
                fileNameEditor(line);
            });
        }
        return listItem;
    };

    // Display initial items
    initialLines.forEach(line => createListItem(line));
    // Add "Show More" button
    if (hasMoreItems) {
        const showMoreItem = document.createElement("li");
        showMoreItem.className = "show-more-item";
        // Special styling to make it visually distinct
        showMoreItem.innerHTML = `<span>${translations.global_show_all} ${lines.length - showInitialLimit} ${translations.global_more}</span>`;
        listElement.appendChild(showMoreItem);
        // Remove the "Show More" button and show remaining items
        showMoreItem.addEventListener('click', () => {
            listElement.removeChild(showMoreItem);
            lines.slice(showInitialLimit).forEach(line => createListItem(line));
            applyRippleEffect();
        });
    }
    applyRippleEffect();
}

/**
 * Handle adding input to the file
 * @param {string} fileType - Type of hosts file ('custom', 'sources', 'blacklist', etc.)
 * @param {string} prompt - Prompt message to display
 * @returns {Promise<void>}
 */
async function handleAdd(fileType, prompt) {
    const inputElement = document.getElementById(`${fileType}-input`);
    const inputValue = inputElement.value.trim();
    console.log(`Input value for ${fileType}: "${inputValue}"`);
    if (inputValue === "") return;
    const inputLines = inputValue.split('\n').map(line => line.trim()).filter(line => line !== "");
    try {
        const fileContent = await fetch('link/PERSISTENT_DIR/' + filePaths[fileType]).then(response => response.text());
        const existingLines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== "");

        for (const line of inputLines) {
            if (existingLines.includes(line)) {
                showPrompt(prompt, false, 2000, `${line}`);
                continue;
            }
            await exec(`echo "${line}" >> ${basePath}/${filePaths[fileType]}`);
        }
        inputElement.value = ""; // Clear input if add successful
        loadFile(fileType);
    } catch (error) {
        console.error(`Failed to process input for ${fileType}: ${error}`);
    }
}

/**
 * Remove custom hosts file with confirmation
 * @param {string} fileName - Name of the file to remove
 * @returns {Promise<boolean>}
 */
function removeCustomHostsFile(fileName) {
    const confirmationOverlay = document.getElementById("confirmation-overlay");
    const cancelButton = document.getElementById("cancel-btn");
    const removeButton = document.getElementById("remove-btn");

    document.getElementById("confirmation-file-name").textContent = fileName;

    // Open confirmation dialog
    confirmationOverlay.style.display = "flex";
    setTimeout(() => {
        confirmationOverlay.style.opacity = "1";
    }, 10);

    const closeConfirmationOverlay = () => {
        confirmationOverlay.style.opacity = "0";
        setTimeout(() => {
            confirmationOverlay.style.display = "none";
        }, 200);
    }

    return new Promise((resolve) => {
        cancelButton.addEventListener("click", () => {
            closeConfirmationOverlay();
            resolve(false);
        });
        confirmationOverlay.addEventListener("click", (e) => {
            if (e.target === confirmationOverlay) cancelButton.click();
        });
        // Confirm file removal
        removeButton.addEventListener("click", () => {
            closeConfirmationOverlay();
            resolve(true);
        });
    });
}

// Help event listener
export let activeOverlay = null;
/**
 * Setup help menu event listeners to open and close help overlays
 * @returns {void}
 */
function setupHelpMenu() {
    const helpButtons = document.querySelectorAll(".help-btn");
    const overlays = document.querySelectorAll(".overlay");
    helpButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;
            const overlay = document.getElementById(`${type}-help`);
            if (overlay) openOverlay(overlay);
        });
    });
    overlays.forEach(overlay => {
        const closeButton = overlay.querySelector(".close-btn");
        const docsButtons = overlay.querySelector(".docs-btn");
        if (closeButton) closeButton.addEventListener("click", () => closeOverlay(overlay));
        if (docsButtons) docsButtons.addEventListener("click", () => closeOverlay(overlay));
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeOverlay(overlay);
        });
    });
    function openOverlay(overlay) {
        if (activeOverlay) closeOverlay(activeOverlay);
        activeOverlay = overlay;
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
        setTimeout(() => overlay.style.opacity = "1", 10);
    }
    function closeOverlay(overlay) {
        activeOverlay = null;
        document.body.style.overflow = "";
        overlay.style.opacity = "0";
        setTimeout(() => overlay.style.display = "none", 200);
    }
}

/**
 * Handle touch screen textarea experience: force single direction scroll, snap line
 * Prevent input box from being blocked by soft keyboard
 * Scoll up when focused input is at the bottom of the screen (60%)
 * @returns {void}
 */
document.querySelectorAll('.input-box').forEach(inputBoxes => {
    let startX, startY, isScrollingX, isScrollingY;
    const lineHeight = parseFloat(window.getComputedStyle(inputBoxes).lineHeight);

    inputBoxes.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isScrollingX = false;
        isScrollingY = false;
        document.body.style.overflow = "hidden";
    });
    inputBoxes.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        // Only allow X or Y scroll in a single touchmove event
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (!isScrollingX) {
                isScrollingX = true;
                isScrollingY = false;
            }
            if (isScrollingY) event.preventDefault();
        } else {
            if (!isScrollingY) {
                isScrollingY = true;
                isScrollingX = false;
                inputBoxes.scrollTo({ left: 0, behavior: 'smooth' });
            }
            if (isScrollingX) event.preventDefault();
        }
    });
    inputBoxes.addEventListener('touchend', () => {
        isScrollingX = false;
        isScrollingY = false;
        document.body.style.overflow = "";
        // Snap to the nearest line
        const scrollTop = inputBoxes.scrollTop;
        const nearestLine = Math.round(scrollTop / lineHeight) * lineHeight;
        inputBoxes.scrollTo({ top: nearestLine, behavior: 'smooth' });
    });
    inputBoxes.addEventListener('focus', (event) => {
        document.querySelector('.placeholder').classList.add('focused');
        const wrapper = event.target.closest('.input-box-wrapper');
        wrapper.classList.add('focus');
        const inputBox = wrapper.querySelector('.input-box');
        inputBox.style.paddingLeft = '9px';
        setTimeout(() => {
            const inputRect = event.target.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const keyboardHeight = viewportHeight * 0.6;
            const safeArea = 20;
            if (inputRect.bottom > (viewportHeight - keyboardHeight)) {
                const scrollAmount = inputRect.bottom - (viewportHeight - keyboardHeight) + safeArea;
                document.querySelector('.content').scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }
        }, 100);
    });
    inputBoxes.addEventListener('blur', () => {
        document.querySelector('.placeholder').classList.remove('focused');
        const wrapper = inputBoxes.closest('.input-box-wrapper');
        wrapper.classList.remove('focus');
        const inputBox = wrapper.querySelector('.input-box');
        inputBox.style.paddingLeft = '10px';
    });
});

/**
 * Attach event listeners to the add buttons
 * @returns {void}
 */
function attachAddButtonListeners() {
    // id - input id, type - file type, fail - prompt message
    const elements = [
        { id: "custom-input", type: "custom", fail: "custom_prompt_fail" },
        { id: "sources-input", type: "sources", fail: "source_prompt_fail" },
        { id: "blacklist-input", type: "blacklist", fail: "blacklist_prompt_fail" },
        { id: "whitelist-input", type: "whitelist", fail: "whitelist_prompt_fail" },
        { id: "sources_whitelist-input", type: "sources_whitelist", fail: "sources_whitelist_prompt_fail" }
    ];
    elements.forEach(({ id, type, fail }) => {
        const inputElement = document.getElementById(id);
        const buttonElement = document.getElementById(`${type}-add`);
        if (inputElement) {
            inputElement.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    handleAdd(type, fail);
                    inputElement.blur();
                }
            });
        }
        if (buttonElement) {
            buttonElement.addEventListener("click", () => handleAdd(type, fail));
        }
    });
}

let actionRunning = false, setupActionTerminal = false, terminalClosed = true;

/**
 * Run bindhosts.sh with and display output in fake terminal
 * @param {String} args - argument for bindhosts.sh
 * @returns {Promise<void>}
 */
function runBindhosts(args) {
    const cover = document.querySelector('.document-cover');
    const terminal = document.getElementById('action-terminal');
    const terminalContent = document.getElementById('action-terminal-content');
    const header = document.querySelector('.title-container');
    const title = document.getElementById('title');
    const backButton = document.getElementById('edit-back-btn');
    const bodyContent = document.querySelector('.content');
    const actionButton = document.querySelector('.float');
    const closeBtn = document.getElementById('close-terminal');

    if (!setupActionTerminal) {
        setupSwipeToClose(terminal, cover, backButton);
        closeBtn.addEventListener('click', () => backButton.click());
        backButton.addEventListener('click', () => {
            terminal.style.transform = 'translateX(100%)';
            bodyContent.style.transform = 'translateX(0)';
            cover.style.opacity = '0';
            backButton.style.transform = 'translateX(-100%)';
            actionButton.style.transform = 'translateY(0)';
            actionButton.classList.remove('inTerminal');
            forceUpdateButton.classList.add('show');
            closeBtn.style.opacity = '0';
            closeBtn.style.pointerEvents = 'none';
            header.classList.remove('back');
            title.textContent = translations.footer_hosts;
            terminalClosed = true;
        });
        setupActionTerminal = true;
    }

    if (!actionRunning) {
        actionRunning = true;
        terminalClosed = false;
        terminalContent.innerHTML = '';
        const output = spawn("sh", [`${moduleDirectory}/bindhosts.sh`, `${args}`]);
        output.stdout.on('data', (data) => appendOutput(data));
        output.stderr.on('data', (data) => appendOutput(data));
        output.on('error', () => appendOutput(translations.global_execute_error));
        output.on('exit', () => {
            if (!terminalClosed) {
                closeBtn.style.opacity = '1';
                closeBtn.style.pointerEvents = 'auto';
                actionButton.style.transform = 'translateY(0)';
            }
            actionRunning = false;
        });
    }

    // Append output to terminal
    const appendOutput = (output) => {
        const p = document.createElement('p');
        p.className = 'action-terminal-output';
        p.textContent = output;
        terminalContent.appendChild(p);
    };

    // Open output terminal
    setTimeout(() => {
        terminal.style.transform = 'translateX(0)';
        bodyContent.style.transform = 'translateX(-20vw)';
        cover.style.opacity = '1';
        header.classList.add('back');
        backButton.style.transform = 'translateX(0)';
        actionButton.style.transform = 'translateY(110px)';
        actionButton.classList.add('inTerminal');
        forceUpdateButton.classList.remove('show');
        title.textContent = translations.global_action;
    }, 50);
}

// Action button and force update button click event
document.getElementById("action-btn").addEventListener("click", () => runBindhosts("--action"));
forceUpdateButton.addEventListener('click', () => runBindhosts("--force-update"));

/**
 * Find out custom hosts list and display it
 * @returns {Promise<void>}
 */
async function getCustomHostsList() {
    try {
        const output = await exec(`ls ${basePath} | grep "^custom.*\.txt$" | grep -vx "custom.txt" || true`);
        if (output.trim() !== '') {
            const lines = output.split("\n");
            displayHostsList(lines, "import_custom");
        }
    } catch (error) {
        console.error("Failed to get custom hosts list:", error);
    }
}

// Open file selector to import custom hosts file
document.getElementById("import-custom-button").addEventListener("click", async () => {
    const file = await openFileSelector("txt");
    if (file) getCustomHostsList();
});

const editorInput = document.getElementById("edit-input");
const fileNameInput = document.getElementById('file-name-input');

/**
 * Open file name editor
 * @param {string} fileName - Current file name
 * @returns {Promise<void>}
 */
async function fileNameEditor(fileName) {
    const rawFileName = fileName.replace("custom", "").replace(".txt", "");
    fileNameInput.value = rawFileName;
    try {
        // go to error if file is larger than 128KB
        await exec(`[ $(wc -c < ${basePath}/${fileName}) -lt 131072 ] || exit 1`);
        const content = await fetch(`link/PERSISTENT_DIR/${fileName}`).then(response => response.text());
        editorInput.value = content;
        openFileEditor(fileName);
    } catch (error) {
        // Only rename is supported for large files
        openFileEditor(fileName, false);
        showPrompt("global_file_too_large", true);
        console.error("Failed to get custom hosts list:", error);
    }
}

/**
 * Open file editor
 * @param {string} lastFileName - Name of the last file edited
 * @param {boolean} openEditor - Whether to open the file editor, false goes to file name editor only
 * @returns {void}
 */
function openFileEditor(lastFileName, openEditor = true) {
    const header = document.querySelector('.title-container');
    const title = document.getElementById('title');
    const fileName = document.querySelector('.file-name-editor');
    const backButton = document.getElementById('edit-back-btn');
    const saveButton = document.getElementById('edit-save-btn');
    const actionButton = document.querySelector('.float');
    const editorCover = document.querySelector('.document-cover');
    const editor = document.getElementById('edit-content');
    const lineNumbers = document.querySelector('.line-numbers');
    const bodyContent = document.querySelector('.content');

    // Adjust width of fileName according to the length of text in input
    function adjustFileNameWidth() {
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.fontFamily = window.getComputedStyle(fileNameInput).fontFamily;
        tempSpan.style.fontSize = '21px';
        tempSpan.textContent = fileNameInput.value;
        document.body.appendChild(tempSpan);
        if (tempSpan.offsetWidth <= window.innerWidth * 0.8 - 150) {
            fileNameInput.style.width = `${tempSpan.offsetWidth}px`;
        } else {
            fileNameInput.style.width = window.innerWidth * 0.8 - 150 + 'px';
        }
        document.body.removeChild(tempSpan);
    }
    adjustFileNameWidth();
    fileNameInput.addEventListener('input', adjustFileNameWidth);

    // Show editor
    editorCover.style.opacity = '1';
    editorCover.style.pointerEvents = 'auto';
    header.classList.add('back');
    backButton.style.transform = 'translateX(0)';
    saveButton.style.transform = 'translateX(0)';
    setTimeout(() => actionButton.style.transform = 'translateY(110px)', 50);
    forceUpdateButton.classList.remove('show');
    title.style.display = 'none';
    fileName.style.display = 'flex';
    bodyContent.style.overflowY = 'hidden';

    // Open file editor
    if (openEditor) {
        editor.style.transform = 'translateX(0)';
        bodyContent.style.transform = 'translateX(-20vw)';
    } else setTimeout(() => fileNameInput.focus(), 1000);

    // Set line numbers
    editorInput.addEventListener('input', () => {
        const lines = editorInput.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, index) => 
            `<div>${(index + 1).toString().padStart(2, ' ')}</div>`
        ).join('');
        // Sync scroll position
        lineNumbers.scrollTop = editorInput.scrollTop;
    });
    editorInput.addEventListener('scroll', () => {
        lineNumbers.style.top = `-${editorInput.scrollTop}px`;
        // Sync scroll position
        lineNumbers.scrollTop = editorInput.scrollTop;
    });
    editorInput.dispatchEvent(new Event('input'));

    // Scroll to avoid keyboard blocking input box
    function scrollSafeInset() {
        editorInput.style.paddingBottom = '55vh';
        lineNumbers.style.paddingBottom = '55vh';
        setTimeout(() => {
            // Get cursor position
            const cursorPosition = editorInput.selectionStart;
            const textBeforeCursor = editorInput.value.substring(0, cursorPosition);
            const linesBeforeCursor = textBeforeCursor.split('\n').length;

            // Calculate cursor position using line height
            const lineHeight = parseFloat(window.getComputedStyle(editorInput).lineHeight);
            const cursorBottom = linesBeforeCursor * lineHeight;
            const viewportHeight = window.innerHeight;
            const keyboardHeight = viewportHeight * 0.6;
            const safeArea = 20;
            if (cursorBottom > (viewportHeight - keyboardHeight)) {
                const scrollAmount = cursorBottom - (viewportHeight - keyboardHeight) + safeArea;
                editorInput.scrollTo({
                    top: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
    editorInput.addEventListener('input', scrollSafeInset);
    editorInput.addEventListener('blur', () => {
        editorInput.style.paddingBottom = '30px';
        lineNumbers.style.paddingBottom = '30px';
    });

    // Setup swipe to close if not set it yet
    let isSwipeToCloseSetup = false;
    if (!isSwipeToCloseSetup) {
        setupSwipeToClose(editor, editorCover, backButton);
        isSwipeToCloseSetup = true;
    }

    // Alternative way to close about docs with back button
    backButton.addEventListener('click', () => {
        if (openEditor) { editor.style.transform = 'translateX(100%)'; }
        editorInput.removeEventListener('input', scrollSafeInset);
        saveButton.removeEventListener('click', saveFile);
        editorCover.style.opacity = '0';
        editorCover.style.pointerEvents = 'none';
        backButton.style.transform = 'translateX(-100%)';
        header.classList.remove('back');
        title.style.display = 'block';
        actionButton.style.transform = 'translateY(0)';
        setTimeout(() => forceUpdateButton.classList.add('show'), 200);
        fileName.style.display = 'none';
        saveButton.style.transform = 'translateX(calc(105% + 15px))';
        bodyContent.style.overflowY = 'auto';
        bodyContent.style.transform = 'translateX(0)';
        document.querySelectorAll('.box li').forEach(li => {
            li.scrollTo({ left: 0, behavior: 'smooth' });
        });
        editorInput.scrollTo(0, 0);
    });

    // Save file
    async function saveFile() {
        const newFileName = fileNameInput.value;
        const content = editorInput.value.trim();
        if (newFileName === "") {
            showPrompt("global_file_name_empty", false);
            return;
        }
        try {
            if (openEditor) {
                // Save file
                await exec(`
                    [ ! -f ${basePath}/${lastFileName} ] || rm -f ${basePath}/${lastFileName}
                    cat << 'AUniqueEOF' > ${basePath}/custom${newFileName}.txt
${content}
AUniqueEOF
                    chmod 644 ${basePath}/custom${newFileName}.txt
                `);
                showPrompt("global_saved", true, undefined, undefined, `${basePath}/custom${newFileName}.txt`);
            } else {
                // Rename file
                await exec(`mv -f ${basePath}/${lastFileName} ${basePath}/custom${newFileName}.txt`);
            }
            showPrompt("global_saved", true, undefined, undefined, `${basePath}/custom${newFileName}.txt`);
        } catch (error) {
            showPrompt("global_save_fail", false);
            console.error("Failed to save file:", error);
        }
        getCustomHostsList();
        backButton.click();
    }
    saveButton.addEventListener('click', saveFile);
}

/**
 * Prevents invalid characters in file names
 * @param {HTMLInputElement} input - Input element to process
 * @returns {void}
 */
window.replaceSpaces = function(input) {
    const cursorPosition = input.selectionStart;
    input.value = input.value.replace(/ /g, '_').replace(/[\/\0*?[\]{}|&$`"'\\<>]/g, '');
    input.setSelectionRange(cursorPosition, cursorPosition);
}

/**
 * Initial load event listener
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', async () => {
    initialTransition();
    checkMMRL();
    await loadTranslations();
    ["custom", "sources", "blacklist", "whitelist", "sources_whitelist"].forEach(loadFile);
    getCustomHostsList();
    attachAddButtonListeners();
    setupHelpMenu();
    applyRippleEffect();
});
