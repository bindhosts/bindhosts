import { setupScrollEvent, applyRippleEffect, setFooterClick } from './utils/util.js';
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
    async navigate(name) {
        if (this.currentView === name) return;

        // Cleanup before transition
        setFooterClick(true);
        document.querySelector('.back-button')?.click();

        // Get or create view
        let viewData = this.views.get(name);
        if (!viewData) {
            viewData = this.initView(name);
            this.views.set(name, viewData);
        }

        // Perform transition
        if (document.startViewTransition) {
            document.startViewTransition(() => this.switchTo(name, viewData));
        } else {
            this.switchTo(name, viewData);
        }

        this.currentView = name;
    }

    /**
     * Switch DOM state between views
     */
    switchTo(name, viewData) {
        // Hide all views
        this.views.forEach((v, k) => {
            if (k !== name) {
                v.element.style.display = 'none';
                v.element.setAttribute('data-active', 'false');
                if (v.module?.onHide) v.module.onHide();
            }
        });

        // Show target view
        viewData.element.style.display = 'flex';
        viewData.element.setAttribute('data-active', 'true');

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

        setFooterClick(false);
        setupScrollEvent(viewData.element);
        applyRippleEffect();
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
        section.style.display = 'none';
        
        // Use pre-loaded HTML
        section.innerHTML = entry.html;
        this.container.appendChild(section);

        // Use pre-loaded JS module
        const module = entry.module;
        if (module && module.mount) {
            module.mount(section);
        }

        // Add small delay to ensure DOM is ready for classes
        requestAnimationFrame(() => section.classList.add('loaded'));

        return { element: section, module };
    }

    updateFooter(name) {
        document.querySelectorAll('.footer-btn').forEach(btn => {
            const footerBtnIcon = btn.querySelector('.footer-btn-icon');
            const activeIcon = btn.querySelector('.active');
            const inactiveIcon = btn.querySelector('.inactive');
            const isTarget = btn.getAttribute('page') === name;

            if (isTarget) {
                footerBtnIcon.classList.add('focus', 'loaded');
                if (activeIcon) activeIcon.style.display = 'block';
                if (inactiveIcon) inactiveIcon.style.display = 'none';
            } else {
                footerBtnIcon.classList.remove('loaded');
                setTimeout(() => {
                    footerBtnIcon.classList.remove('focus');
                    if (activeIcon) activeIcon.style.display = 'none';
                    if (inactiveIcon) inactiveIcon.style.display = 'block';
                }, 100);
            }
        });
    }
}

export const router = new Router();
