import { exec, basePath, applyRippleEffect, showPrompt } from './util.js';

let fileType;

// File selector
const fileSelector = document.querySelector('.file-selector-overlay');
let currentPath = '/storage/emulated/0/Download';

/**
 * Display the current path in the headeer of file selector
 * @returns {void}
 */
function updateCurrentPath() {
    const currentPathElement = document.querySelector('.current-path');
    const segments = currentPath.split('/').filter(Boolean);
    
    // Create spans with data-path attribute for each segment
    const pathHTML = segments.map((segment, index) => {
        const fullPath = '/' + segments.slice(0, index + 1).join('/');
        return `<span class="path-segment" data-path="${fullPath}">${segment}</span>`;
    }).join('<span class="separator">›</span>');
    
    currentPathElement.innerHTML = pathHTML;
    currentPathElement.scrollTo({ 
        left: currentPathElement.scrollWidth,
        behavior: 'smooth'
    });
}

/**
 * List files in the specified directory
 * @param {string} path - Directory path to list files from
 * @param {boolean} skipAnimation - Whether to skip the animation
 * @returns {Promise<void>}
 */
async function listFiles(path, skipAnimation = false) {
    const fileList = document.querySelector('.file-list');
    if (!skipAnimation) {
        fileList.classList.add('switching');
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    try {
        // Limit to .txt files and directories only, theoretically symlinks supported
        const result = await exec(`
            cd "${path}"
            find . -maxdepth 1 -type f -name "*.${fileType}" -o -type d ! -name ".*" -o -type l | sort
        `);
        const items = result.split('\n').filter(Boolean).map(item => ({
            path: path + '/' + item.replace(/^\.\//, ''),
            name: item.split('/').pop(),
            isDirectory: !item.endsWith('.' + fileType),
            isTextFile: item.endsWith('.txt')
        }));
        fileList.innerHTML = '';

        // Add back button item if not in root directory
        if (currentPath !== '/storage/emulated/0') {
            const backItem = document.createElement('div');
            backItem.className = 'file-item ripple-element';
            backItem.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                    <path d="M141-160q-24 0-42-18.5T81-220v-520q0-23 18-41.5t42-18.5h280l60 60h340q23 0 41.5 18.5T881-680v460q0 23-18.5 41.5T821-160H141Z"/>
                </svg>
                <span>..</span>
            `;
            backItem.addEventListener('click', async () => {
                document.querySelector('.file-selector-back-button').click();
            });
            fileList.appendChild(backItem);
        }
        // Add folder and file file selector
        items.forEach(item => {
            if (item.path === path) return;
            const itemElement = document.createElement('div');
            itemElement.className = 'file-item ripple-element';
            itemElement.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                    ${item.isDirectory ? 
                        '<path d="M141-160q-24 0-42-18.5T81-220v-520q0-23 18-41.5t42-18.5h280l60 60h340q23 0 41.5 18.5T881-680v460q0 23-18.5 41.5T821-160H141Z"/>' :
                        '<path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>'}
                </svg>
                <span>${item.name}</span>
            `;
            // Attach click event
            itemElement.addEventListener('click', async () => {
                if (item.isDirectory) {
                    // Go into directory
                    currentPath = item.path;
                    const currentPathElement = document.querySelector('.current-path');
                    currentPathElement.innerHTML = currentPath.split('/').filter(Boolean).join('<span class="separator">›</span>');
                    currentPathElement.scrollTo({ 
                        left: currentPathElement.scrollWidth,
                        behavior: 'smooth'
                    });
                    await listFiles(item.path);
                } else if (item.isTextFile) {
                    // Select file
                    try {
                        const fileName = item.name.replace(/ /g, '_');
                        await exec(`
                            cp -f "${item.path}" ${basePath}/custom_${fileName}
                            chmod 644 ${basePath}/custom_${fileName}
                        `);
                        closeFileSelector();
                        showPrompt('global_saved', true, undefined, undefined, `${basePath}/custom_${fileName}`);
                    } catch (error) {
                        showPrompt('global_save_fail', false);
                    }
                }
            });
            fileList.appendChild(itemElement);
        });
        
        if (!skipAnimation) {
            fileList.classList.remove('switching');
        }
    } catch (error) {
        console.error('Error listing files:', error);
        if (!skipAnimation) {
            fileList.classList.remove('switching');
        }
    }
    applyRippleEffect();
    updateCurrentPath();
}

/**
 * Update click handler to use data-path attribute
 * By clicking on a path segment, the user can navigate to that directory
 * @returns {void}
 */
document.querySelector('.current-path').addEventListener('click', async (event) => {
    const segment = event.target.closest('.path-segment');
    if (!segment) return;
    
    const targetPath = segment.dataset.path;
    if (!targetPath || targetPath === currentPath) return;
    
    // Return if already at /storage/emulated/0
    const clickedSegment = segment.textContent;
    if ((clickedSegment === 'storage' || clickedSegment === 'emulated') && 
        currentPath === '/storage/emulated/0') {
        return;
    }

    // Always stay within /storage/emulated/0
    if (targetPath.split('/').length <= 3) {
        currentPath = '/storage/emulated/0';
    } else {
        currentPath = targetPath;
    }
    updateCurrentPath();
    await listFiles(currentPath);
});

/**
 * Back button handler to navigate up one directory
 * @returns {void}
 */
document.querySelector('.file-selector-back-button').addEventListener('click', async () => {
    if (currentPath === '/storage/emulated/0') return;
    currentPath = currentPath.split('/').slice(0, -1).join('/');
    if (currentPath === '') currentPath = '/storage/emulated/0';
    const currentPathElement = document.querySelector('.current-path');
    currentPathElement.innerHTML = currentPath.split('/').filter(Boolean).join('<span class="separator">›</span>');
    currentPathElement.scrollTo({ 
        left: currentPathElement.scrollWidth,
        behavior: 'smooth'
    });
    await listFiles(currentPath);
});

// Close file selector overlay
document.querySelector('.close-selector').addEventListener('click', () => closeFileSelector());
fileSelector.addEventListener('click', (event) => {
    if (event.target === fileSelector) closeFileSelector();
});

/**
 * Function to close file selector
 * @returns {void}
 */
function closeFileSelector() {
    fileSelector.style.opacity = '0';
    document.body.classList.remove("no-scroll");
    setTimeout(() => fileSelector.style.display = 'none', 300);
}

/**
 * Open file selector overlay
 * @param {string} type - Type of file to display (e.g., "json")
 * @returns {Promise<string>} Resolves with the content of the selected JSON file or true in txt file
 */
export async function openFileSelector(type) {
    fileType = type;
    fileSelector.style.display = 'flex';
    document.body.classList.add("no-scroll");
    fileSelector.offsetHeight;
    fileSelector.style.opacity = '1';
    currentPath = '/storage/emulated/0/Download';
    const currentPathElement = document.querySelector('.current-path');
    currentPathElement.innerHTML = currentPath.split('/').filter(Boolean).join('<span class="separator">›</span>');
    currentPathElement.scrollTo({ 
        left: currentPathElement.scrollWidth,
        behavior: 'smooth'
    });
    await listFiles(currentPath, true);

    // Return a promise that resolves with the selected JSON content
    return new Promise((resolve, reject) => {
        const fileList = document.querySelector('.file-list');
        fileList.addEventListener('click', async (event) => {
            const item = event.target.closest('.file-item');
            if (item && item.querySelector('span').textContent.endsWith('.json')) {
                try {
                    const jsonConfig = await exec(`cat ${currentPath}/${item.querySelector('span').textContent}`);
                    closeFileSelector();
                    resolve(jsonConfig.trim());
                } catch (error) {
                    reject(error);
                }
            } else if (item && item.querySelector('span').textContent.endsWith('.txt')) {
                closeFileSelector();
                resolve(true);
            }
        });
    });
}
