import { setupScrollEvent } from './utils/util.js';
import { applyTranslations } from './utils/language.js';

// Static imports for single bundle
import homeHtml from './page/home/home.html?raw';
import hostsHtml from './page/hosts/hosts.html?raw';
import moreHtml from './page/more/more.html?raw';

import * as homeModule from './page/home/home.js';
import * as hostsModule from './page/hosts/hosts.js';
import * as moreModule from './page/more/more.js';

class Router {
    constructor() {
        this.container = document.getElementById('content-container');
        this.views = new Map(); // name -> { element, module }
        this.currentView = null;
        
        // Registry for easy access
        this.registry = {
            home: { html: homeHtml, module: homeModule },
            hosts: { html: hostsHtml, module: hostsModule },
            more: { html: moreHtml, module: moreModule }
        };
    }

    /**
     * Navigate to a page
     * @param {string} name - Page name (e.g., 'home', 'hosts')
     */
    navigate(name) {
        if (this.currentView === name) return;

        // Cleanup before transition
        document.querySelector('.back-button')?.click();

        // Get or create view
        let viewData = this.views.get(name);
        if (!viewData) {
            viewData = this.initView(name);
            this.views.set(name, viewData);
        }

        // Switch synchronously
        this.switchTo(name, viewData);
        this.currentView = name;
    }

    /**
     * Switch DOM state between views
     */
    switchTo(name, viewData) {
        // Hide all views
        this.views.forEach((v, k) => {
            if (k !== name) {
                v.element.setAttribute('data-active', 'false');
                if (v.module?.onHide) v.module.onHide();
            }
        });

        // Force clean fade-in: reset to opacity 0, commit, then animate to 1
        const el = viewData.element;
        el.style.transition = 'none';
        el.setAttribute('data-active', 'false');
        el.offsetHeight;
        el.style.transition = '';
        el.setAttribute('data-active', 'true');

        // Hide version text on not-home page
        const versionText = document.getElementById('version-text');
        if (versionText) {
            versionText.style.display = name === 'home' ? 'inline' : 'none';
        }

        // Update footer buttons
        this.updateFooter(name);

        // Lifecycle and utilities
        if (viewData.module?.onShow) {
            viewData.module.onShow();
        }

        setupScrollEvent(viewData.element);
        applyTranslations();
    }

    /**
     * Initialize a view
     */
    initView(name) {
        const entry = this.registry[name];
        if (!entry) return null;

        const section = document.createElement('section');
        section.id = `page-${name}`;
        section.className = 'page-view body-content';
        
        // Use pre-loaded HTML
        section.innerHTML = entry.html;
        this.container.appendChild(section);

        // Use pre-loaded JS module
        const module = entry.module;
        if (module && module.mount) {
            module.mount(section);
        }

        return { element: section, module };
    }

    updateFooter(name) {
        document.querySelectorAll('.bottom-bar-item').forEach(item => {
            const isTarget = item.getAttribute('page') === name;
            
            if (isTarget) {
                item.setAttribute('selected', '');
            } else {
                item.removeAttribute('selected');
            }
        });
    }
}

export const router = new Router();
