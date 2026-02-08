import { exec, spawn } from 'kernelsu-alt';
import { showPrompt, applyRippleEffect, basePath, setupSwipeToClose, moduleDirectory, filePaths } from '../../utils/util.js';
import { translations } from '../../utils/language.js';
import { FileSelector } from '../../utils/file_selector.js';
import { setupDocsMenu } from '../../utils/docs.js';

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
        listItem.className = 'scrollable-list';
        listItem.innerHTML = `
            <!-- Favicon and link text -->
            <div class="link-box">
                ${fileType !== "import_custom" ? `<div class="favicon-wrapper">
                    <div class="favicon-loader"></div>
                    <img class="favicon-img favicon" src="${faviconUrl}" />
                </div>` : ""}
                <div class="link-text">${line.replace(/^disabled\|/, '')}</div>

                <!-- Checkbox (custom hosts only) -->
                ${fileType === "custom" ? `<div class="checkbox-wrapper">
                    <input type="checkbox" class="checkbox" id="checkbox1" disabled />
                    <label for="checkbox1" class="custom-checkbox">
                        <span class="tick-symbol">
                            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 -3 26 26" width="16px" height="16px" fill="#fff"><path d="M 22.566406 4.730469 L 20.773438 3.511719 C 20.277344 3.175781 19.597656 3.304688 19.265625 3.796875 L 10.476563 16.757813 L 6.4375 12.71875 C 6.015625 12.296875 5.328125 12.296875 4.90625 12.71875 L 3.371094 14.253906 C 2.949219 14.675781 2.949219 15.363281 3.371094 15.789063 L 9.582031 22 C 9.929688 22.347656 10.476563 22.613281 10.96875 22.613281 C 11.460938 22.613281 11.957031 22.304688 12.277344 21.839844 L 22.855469 6.234375 C 23.191406 5.742188 23.0625 5.066406 22.566406 4.730469 Z"/></svg>
                        </span>
                    </label>
                </div>` : ''}
            </div>

            <!-- Edit and delete buttons -->
            ${fileType === "import_custom" ? `<button class="edit-btn ripple-element">
                <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
            </button>` : ""}
            <button class="delete-btn ripple-element" id="${fileType === "import_custom" ? "file-delete" : "line-delete"}">
                <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M277.37-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-514.5h-45.5v-91H354.5v-45.5h250.52v45.5h214.11v91h-45.5v514.5q0 37.78-26.61 64.39t-64.39 26.61H277.37Zm78.33-168.37h85.5v-360h-85.5v360Zm163.1 0h85.5v-360h-85.5v360Z"/></svg>
            </button>
        `;
        // Click to show remove button
        listElement.appendChild(listItem);
        listItem.addEventListener('click', (e) => {
            if (e.target.classList.contains("checkbox-wrapper")) return;
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            listItem.scrollTo({ 
                left: isRTL ? -listItem.scrollWidth : listItem.scrollWidth,
                behavior: 'smooth'
            });
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
        // Checkbox functionality for custom hosts
        const checkbox = listItem.querySelector(".checkbox");
        if (checkbox) {
            checkbox.checked = !line.startsWith('disabled|');
            const checkboxWrapper = listItem.querySelector('.checkbox-wrapper');
            if (checkboxWrapper) {
                checkboxWrapper.addEventListener('click', () => {
                    const command = line.startsWith('disabled|') ? `s/${line}/${line.replace(/^disabled\|/, '')}/` : `s/^${line}/disabled|${line}/`;
                    exec(`sed -i '${command}' ${basePath}/${filePaths[fileType]}`);
                    loadFile(fileType);
                });
            }
        }
        // Remove line from file
        if (deleteLine) {
            deleteLine.addEventListener('click', async () => {
                await exec(`
                    filtered=$(grep -vxF '${line}' ${basePath}/${filePaths[fileType]})
                    echo "$filtered" > ${basePath}/${filePaths[fileType]}
                `);
                listElement.removeChild(listItem);
            });
        }
        // Remove file
        if (deleteFile) {
            deleteFile.addEventListener('click', async () => {
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
            editFile.addEventListener('click', () => {
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
                showPrompt(line + ' ' + translations[prompt], false, 2000);
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
    const closeBtn = document.getElementById('close-confirmation');

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
        closeBtn.onclick = () => {
            closeConfirmationOverlay();
            resolve(false);
        }
        cancelButton.onclick = () => closeBtn.click();
        confirmationOverlay.addEventListener('click', (e) => {
            if (e.target === confirmationOverlay) closeBtn.click();
        });
        // Confirm file removal
        removeButton.onclick = () => {
            closeConfirmationOverlay();
            resolve(true);
        }
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
        button.onclick = () => {
            const type = button.dataset.type;
            const overlay = document.getElementById(`${type}-help`);
            if (overlay) openOverlay(overlay);
        };
    });
    overlays.forEach(overlay => {
        const closeButton = overlay.querySelector(".close-btn");
        
        if (closeButton) {
            closeButton.onclick = () => closeOverlay(overlay);
        }
        overlay.onclick = (e) => {
            if (e.target === overlay) closeOverlay(overlay);
        };
    });
    function openOverlay(overlay) {
        if (activeOverlay) closeOverlay(activeOverlay);
        activeOverlay = overlay;
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
        setTimeout(() => overlay.style.opacity = "1", 10);
    }
    function closeOverlay(overlay) {
        document.body.style.overflow = "";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
            activeOverlay = null;
        }, 200);
    }
}

/**
 * Handle touch screen textarea experience: force single direction scroll, snap line
 * @returns {void}
 */
function setupInputEvent() {
    const inputBoxes = document.querySelectorAll('.input-box');

    inputBoxes.forEach(inputBox => {
        let startX, startY, isScrollingX, isScrollingY;
        const lineHeight = parseFloat(window.getComputedStyle(inputBox).lineHeight);

        inputBox.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isScrollingX = false;
            isScrollingY = false;
            document.body.style.overflow = "hidden";
        });
        inputBox.addEventListener('touchmove', (event) => {
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
                    inputBox.scrollTo({ left: 0, behavior: 'smooth' });
                }
                if (isScrollingX) event.preventDefault();
            }
        });
        inputBox.addEventListener('touchend', () => {
            isScrollingX = false;
            isScrollingY = false;
            document.body.style.overflow = "";
            // Snap to the nearest line
            const scrollTop = inputBox.scrollTop;
            const nearestLine = Math.round(scrollTop / lineHeight) * lineHeight;
            inputBox.scrollTo({ top: nearestLine, behavior: 'smooth' });
        });
    });
}

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
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === "Enter") {
                handleAdd(type, fail);
                inputElement.blur();
            }
        });
        buttonElement.addEventListener('click', () => handleAdd(type, fail));
    });
}

let actionRunning = false, setupActionTerminal = false, isTerminalOpen = false;

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
    const backButton = document.querySelector('.back-button');
    const bodyContent = document.getElementById('page-hosts');
    const FabContainer = document.querySelector('.action-container');
    const actionBtn = document.getElementById('action-btn');
    const closeBtn = document.getElementById('close-terminal');
    const forceUpdateButton = document.getElementById('force-update-btn');

    if (!setupActionTerminal) {
        setupSwipeToClose(terminal, cover);
        closeBtn.addEventListener('click', () => closeTerminal());
        backButton.addEventListener('click', () => closeTerminal());
        setupActionTerminal = true;
    }

    if (!actionRunning) {
        actionRunning = true;
        terminalContent.innerHTML = '';
        const output = spawn("sh", [`${moduleDirectory}/bindhosts.sh`, `${args}`]);
        output.stdout.on('data', (data) => appendOutput(data));
        output.stderr.on('data', (data) => appendOutput(data));
        output.on('exit', () => {
            if (isTerminalOpen) {
                closeBtn.classList.add('show');
                FabContainer.classList.add('show');
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

    const closeTerminal = () => {
        if (!isTerminalOpen) return;
        terminal.style.transform = 'translateX(100%)';
        bodyContent.style.transform = 'translateX(0)';
        cover.style.opacity = '0';
        backButton.classList.remove('show');
        FabContainer.classList.add('show');
        actionBtn.classList.add('show');
        FabContainer.classList.remove('inTerminal');
        forceUpdateButton.classList.add('show');
        closeBtn.classList.remove('show');
        header.classList.remove('back');
        title.textContent = translations.footer_hosts;
        setTimeout(() => {
            isTerminalOpen = false;
        }, 100);
    }

    // Open output terminal
    setTimeout(() => {
        isTerminalOpen = true;
        terminal.style.transform = 'translateX(0)';
        bodyContent.style.transform = 'translateX(-20vw)';
        cover.style.opacity = '1';
        header.classList.add('back');
        backButton.classList.add('show');
        FabContainer.classList.remove('show');
        actionBtn.classList.remove('show');
        FabContainer.classList.add('inTerminal');
        forceUpdateButton.classList.remove('show');
        title.textContent = translations.global_action;
    }, 50);
}

/**
 * Find out custom hosts list and display it
 * @returns {void}
 */
function getCustomHostsList() {
    exec(`ls ${basePath} | grep "^custom.*\.txt$" | grep -vx "custom.txt"`)
        .then(({ stdout, errno }) => {
            if (errno !== 0) return;
            const lines = stdout.split("\n");
            displayHostsList(lines, "import_custom");
        });
}

/**
 * Import custom hosts with file selector
 * @returns {void}
 */
async function importCustomHost() {
    const filePath = await FileSelector.getFilePath("txt");
    if (filePath) {
        const fileName = filePath.split('/').pop().replace(/ /g, '_');
        const destPath = `${basePath}/custom_${fileName}`;
        const result = await exec(`
            cp -f "${filePath}" "${destPath}"
            chmod 644 "${destPath}"
        `);
        if (result.errno === 0) {
            showPrompt(translations.global_saved + ` ${destPath}`);
            await new Promise(resolve => setTimeout(resolve, 100));
            getCustomHostsList();
        } else {
            showPrompt(translations.global_save_fail, false);
            console.error('Error copying file:', result.stderr);
        }
    }
}

/**
 * Open file name editor
 * @param {string} fileName - Current file name
 * @returns {Promise<void>}
 */
async function fileNameEditor(fileName) {
    const editorInput = document.getElementById("edit-input");
    const fileNameInput = document.getElementById('file-name-input');
    const rawFileName = fileName.replace("custom", "").replace(".txt", "");
    fileNameInput.value = rawFileName;
    // Editor support for file smaller than 128KB
    const result = await exec(`[ $(wc -c < ${basePath}/${fileName}) -lt 131072 ] || exit 1`);
    if (result.errno === 0) {
        const content = await fetch(`link/PERSISTENT_DIR/${fileName}`).then(response => response.text());
        editorInput.value = content;
        openFileEditor(fileName);
    } else {
        // Only rename is supported for large files
        openFileEditor(fileName, false);
        showPrompt(translations.global_file_too_large);
    }
}

let setupEditor = false, isSwipeToCloseSetup = false;
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
    const backButton = document.querySelector('.back-button');
    const saveButton = document.getElementById('edit-save-btn');
    const FabContainer = document.querySelector('.action-container');
    const actionBtn = document.getElementById('action-btn');
    const editorCover = document.querySelector('.document-cover');
    const editor = document.getElementById('edit-content');
    const lineNumbers = document.querySelector('.line-numbers');
    const bodyContent = document.getElementById('page-hosts');
    const forceUpdateButton = document.getElementById('force-update-btn');
    const editorInput = document.getElementById("edit-input");
    const fileNameInput = document.getElementById('file-name-input');

    if (!setupEditor) {
        setupEditor = true;
        fileNameInput.addEventListener('input', adjustFileNameWidth);
        saveButton.addEventListener('click', saveFile);
        editorInput.addEventListener('input', scrollSafeInset);
        editorInput.addEventListener('blur', () => {
            editorInput.style.paddingBottom = '30px';
            lineNumbers.style.paddingBottom = '30px';
        });
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
        backButton.addEventListener('click', () => closeEditor());
    }

    // Adjust width of fileName according to the length of text in input
    function adjustFileNameWidth() {
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.whiteSpace = 'nowrap';
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

    // Show editor
    editorCover.style.opacity = '1';
    editorCover.style.pointerEvents = 'auto';
    header.classList.add('back', 'save');
    backButton.classList.add('show');
    saveButton.classList.add('show');
    FabContainer.classList.remove('show');
    actionBtn.classList.remove('show');
    forceUpdateButton.classList.remove('show');
    title.style.display = 'none';
    fileName.style.display = 'flex';
    bodyContent.style.overflowY = 'hidden';
    lineNumbers.style.display = 'block'; // Added line

    // Open file editor
    if (openEditor) {
        editor.style.transform = 'translateX(0)';
        bodyContent.style.transform = 'translateX(-20vw)';
    } else {
        setTimeout(() => fileNameInput.focus(), 1000);
    }

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

    // Setup swipe to close if not set it yet
    if (!isSwipeToCloseSetup) {
        setupSwipeToClose(editor, editorCover);
        isSwipeToCloseSetup = true;
    }

    // Alternative way to close about docs with back button
    const closeEditor = () => {
        // Check if editor is actually active
        if (editor.style.transform !== 'translateX(0)' && fileName.style.display === 'none') return;
        
        const lineNumbers = document.querySelector('.line-numbers');
        if (lineNumbers) lineNumbers.style.display = 'none';
        if (openEditor) { editor.style.transform = 'translateX(100%)'; }
        editorCover.style.opacity = '0';
        editorCover.style.pointerEvents = 'none';
        backButton.classList.remove('show');
        fileName.style.display = 'none';
        saveButton.classList.remove('show');
        header.classList.remove('back', 'save');
        title.style.display = 'inline';
        FabContainer.classList.add('show');
        actionBtn.classList.add('show');
        setTimeout(() => {
            forceUpdateButton.classList.add('show');
        }, 200);
        bodyContent.style.overflowY = 'auto';
        bodyContent.style.transform = 'translateX(0)';
        document.querySelectorAll('.box li').forEach(li => {
            li.scrollTo({ left: 0, behavior: 'smooth' });
        });
        editorInput.scrollTo(0, 0);
    }

    // Save file
    async function saveFile() {
        const newFileName = fileNameInput.value;
        const content = editorInput.value.trim();
        if (newFileName === "") {
            showPrompt(translations.global_file_name_empty, false);
            return;
        }
        let command;
        if (openEditor) {
            // Save file
            command = `
                [ ! -f ${basePath}/${lastFileName} ] || rm -f ${basePath}/${lastFileName}
                cat << 'HostEditorEOF' > ${basePath}/custom${newFileName}.txt
${content}
HostEditorEOF
                chmod 644 ${basePath}/custom${newFileName}.txt`;
        } else {
            // Rename file
            command = `mv -f ${basePath}/${lastFileName} ${basePath}/custom${newFileName}.txt`;
        }
        const result = await exec(command);
        if (result.errno === 0) {
            showPrompt(translations.global_saved + ` ${basePath}/custom${newFileName}.txt`);
        } else {
            showPrompt(translations.global_save_fail, false);
            console.error("Failed to save file:", result.stderr);
        }
        getCustomHostsList();
        closeEditor();
    }
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

// Lifecycle: Initial mount to DOM
export function mount() {
    attachAddButtonListeners();
    setupHelpMenu();
    setupDocsMenu();
    setupInputEvent();
    
    // One-time load of data
    ["custom", "sources", "blacklist", "whitelist", "sources_whitelist"].forEach(loadFile);
    getCustomHostsList();

    // Event listeners for action buttons
    const actionBtn = document.getElementById("action-btn");
    const forceUpdateButton = document.getElementById('force-update-btn');
    const importBtn = document.getElementById("import-custom-button");

    actionBtn.addEventListener('click', () => runBindhosts("--action"));
    forceUpdateButton.addEventListener('click', () => runBindhosts("--force-update"));
    importBtn.addEventListener('click', () => importCustomHost());
}

// Lifecycle: Each time page becomes visible
export function onShow() {
    document.getElementById('title').textContent = translations.footer_hosts;
    const actionContainer = document.querySelector('.action-container');
    const actionBtn = document.getElementById('action-btn');
    const forceUpdateButton = document.getElementById('force-update-btn');
    
    actionContainer?.classList.add('show');
    actionBtn?.classList.add('show');
    setTimeout(() => forceUpdateButton?.classList.add('show'), 200);
}

// Lifecycle: Each time page is hidden
export function onHide() {
    const actionContainer = document.querySelector('.action-container');
    const actionBtn = document.getElementById('action-btn');
    const forceUpdateButton = document.getElementById('force-update-btn');
    const saveBtn = document.getElementById('edit-save-btn');

    actionContainer?.classList.remove('show');
    actionBtn?.classList.remove('show');
    forceUpdateButton?.classList.remove('show');
    saveBtn?.classList.remove('show');
}
