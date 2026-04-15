/**
 * <hrm-nav-menu> — Global navigation bar web component
 * Implements the Gaia UI Kit page-header design.
 *
 * Attributes:
 *   breadcrumbs  JSON array of {label, href} objects. Last item = current page.
 *                Example: '[{"label":"Home","href":"/"},{"label":"Settings"}]'
 *   company      Current company name shown in the selector.
 *
 * Events dispatched (on the element):
 *   hrm-menu-toggle   — hamburger clicked
 *   hrm-company-click — company selector clicked
 *   hrm-feedback      — feedback button clicked
 *   hrm-ai            — AI (sparkles) button clicked
 *   hrm-notifications — bell button clicked
 *   hrm-breadcrumb    — breadcrumb link clicked; detail: { label, href }
 */

const ICON = {
  menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  chevronsUpDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`,
  chevronDown: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  sparkles: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
  bell: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
};

const STYLES = `
  :host {
    display: block;
    font-family: 'Inter', sans-serif;

    /* Gaia design tokens — override these to retheme */
    --ga-color-text-body:              #133445;
    --ga-color-text-action:            #1f4e66;
    --ga-color-text-action-hover:      #133445;
    --ga-color-border-action:          #1f4e66;
    --ga-color-border-primary:         #6f7687;
    --ga-color-surface-primary:        #ffffff;
    --ga-color-surface-action-hover-2: #fae0ce;
    --ga-color-surface-disable-selected: #6f7687;
    --ga-color-border-action-hover:    #377ea0;
    --ga-color-border-tertiary:        #cccfd7;
    --ga-color-border-focus:           #1f4e66;
    --ga-radius-default:               4px;
    --ga-text-md-size:                 14px;
    --ga-text-md-lineheight:           24px;
    --ga-text-lg-size:                 16px;
    --ga-text-lg-lineheight:           24px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    color: var(--ga-color-text-body);
  }

  /* ── Left side ─────────────────────────────────────── */
  .left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  /* ── Icon buttons ──────────────────────────────────── */
  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--ga-color-border-action);
    border-radius: var(--ga-radius-default);
    background: var(--ga-color-surface-primary);
    color: var(--ga-color-text-action);
    cursor: pointer;
    flex-shrink: 0;
  }
  .btn-icon:hover {
    background: var(--ga-color-surface-action-hover-2);
  }
  .btn-icon svg { display: block; }

  /* ── Breadcrumbs ───────────────────────────────────── */
  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    height: 40px;
    gap: 0;
  }

  .bc-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .bc-ancestor,
  .bc-current {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--ga-text-lg-size);
    line-height: var(--ga-text-lg-lineheight);
    letter-spacing: -0.176px;
  }
  .bc-ancestor {
    color: var(--ga-color-text-action);
    font-weight: 400;
  }
  .bc-current {
    color: var(--ga-color-text-body);
    font-weight: 600;
  }

  .bc-label {
    display: inline-block;
    max-width: 320px;
    overflow: hidden;
    white-space: nowrap;
    vertical-align: bottom;
  }

  .bc-separator {
    color: var(--ga-color-text-body);
    font-size: var(--ga-text-lg-size);
    line-height: var(--ga-text-lg-lineheight);
    padding: 0 8px;
    font-weight: 400;
    user-select: none;
  }

  /* ── Breadcrumb interactive trigger (item with siblings) ─── */
  /* The whole item (label + chevron) is one clickable surface. Hover
     behaviour per Gaia spec: no background fill. Link items darken
     text + underline; current-page shows no hover visual. */
  .bc-trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    letter-spacing: inherit;
    padding: 0;
    text-decoration: none;
    border-radius: var(--ga-radius-default);
  }
  /* Any trigger (link or current-page) that's hovered: underline the label */
  .bc-trigger:hover .bc-label {
    text-decoration: underline;
  }
  /* Link-type trigger additionally darkens its text on hover */
  .bc-ancestor.bc-trigger:hover {
    color: var(--ga-color-text-action-hover);
  }
  /* Menu open (active): no underline; link darkens, current-page unchanged */
  .bc-trigger[aria-expanded="true"] .bc-label {
    text-decoration: none;
  }
  .bc-ancestor.bc-trigger[aria-expanded="true"] {
    color: var(--ga-color-text-action-hover);
  }
  .bc-trigger:focus-visible {
    outline: 2px solid var(--ga-color-border-focus);
    outline-offset: 2px;
  }

  .bc-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    flex-shrink: 0;
    pointer-events: none;
  }
  .bc-chevron svg { display: block; }

  /* ── Tooltip shown on hover of truncated items ─────── */
  .bc-tooltip {
    display: none;
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    transform: translateX(-50%);
    background: var(--ga-color-text-body);
    color: #ffffff;
    padding: 6px 10px;
    border-radius: var(--ga-radius-default);
    font-size: var(--ga-text-md-size);
    font-weight: 500;
    line-height: var(--ga-text-md-lineheight);
    letter-spacing: -0.096px;
    white-space: nowrap;
    z-index: 20;
    pointer-events: none;
  }
  .bc-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--ga-color-text-body);
  }
  .bc-item.is-truncated:hover > .bc-tooltip { display: block; }

  /* ── Sibling-explorer menu ─────────────────────────── */
  .bc-sibling-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    min-width: 160px;
    max-width: 512px;
    background: var(--ga-color-surface-primary);
    border: 1px solid var(--ga-color-border-tertiary);
    border-radius: var(--ga-radius-default);
    padding: 4px;
    box-shadow:
      0 4px 8px rgba(19,52,69,0.10),
      0 15px 15px rgba(19,52,69,0.09),
      0 34px 21px rgba(19,52,69,0.05),
      0 61px 24px rgba(19,52,69,0.01);
    z-index: 30;
    display: flex;
    flex-direction: column;
  }
  .bc-sibling-menu[hidden] { display: none; }

  .bc-sibling-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    background: var(--ga-color-surface-primary);
    color: var(--ga-color-text-action);
    font-family: inherit;
    font-size: var(--ga-text-md-size);
    font-weight: 500;
    line-height: var(--ga-text-md-lineheight);
    letter-spacing: -0.096px;
    cursor: pointer;
    text-align: left;
    border-radius: var(--ga-radius-default);
    white-space: nowrap;
  }
  .bc-sibling-item:hover {
    background: var(--ga-color-surface-action-hover-2);
    color: var(--ga-color-text-action-hover);
  }
  .bc-sibling-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 360px;
  }
  .bc-sibling-item svg { flex-shrink: 0; }

  /* ── Right side ────────────────────────────────────── */
  .right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ── Company selector ──────────────────────────────── */
  .company-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 220px;
    height: 40px;
    padding: 8px 12px;
    border: 1px solid var(--ga-color-border-primary);
    border-radius: var(--ga-radius-default);
    background: var(--ga-color-surface-primary);
    color: var(--ga-color-text-body);
    font-size: var(--ga-text-md-size);
    line-height: var(--ga-text-md-lineheight);
    letter-spacing: -0.096px;
    cursor: pointer;
  }
  .company-selector:hover {
    background: var(--ga-color-surface-action-hover-2);
    border-color: var(--ga-color-border-action-hover);
  }
  .company-selector:focus {
    outline: none;
    background: var(--ga-color-surface-primary);
    border-width: 2px;
    border-color: var(--ga-color-border-focus);
  }

  .company-selector .label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  .company-selector svg { flex-shrink: 0; color: var(--ga-color-text-body); }

  /* ── Feedback button ───────────────────────────────── */
  .btn-feedback {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 8px 16px;
    border: 1px solid var(--ga-color-border-action);
    border-radius: var(--ga-radius-default);
    background: var(--ga-color-surface-primary);
    color: var(--ga-color-text-action);
    font-size: var(--ga-text-md-size);
    font-weight: 500;
    line-height: var(--ga-text-md-lineheight);
    letter-spacing: -0.096px;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-feedback:hover {
    background: var(--ga-color-surface-action-hover-2);
    color: var(--ga-color-text-action-hover);
  }
`;

class HrmNavMenu extends HTMLElement {
  static get observedAttributes() {
    return ['breadcrumbs', 'company'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._bindEvents();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML) {
      this._render();
    }
  }

  get _breadcrumbs() {
    try {
      return JSON.parse(this.getAttribute('breadcrumbs') || '[]');
    } catch {
      return [];
    }
  }

  get _company() {
    return this.getAttribute('company') || 'Company selector';
  }

  _renderBreadcrumbs() {
    const crumbs = this._breadcrumbs;
    if (!crumbs.length) return '';

    return crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      const separator = !isLast ? `<span class="bc-separator">/</span>` : '';
      const cls = isLast ? 'bc-current' : 'bc-ancestor';
      const fullLabel = this._esc(crumb.label);
      const siblings = Array.isArray(crumb.siblings) ? crumb.siblings : [];
      const hasSiblings = siblings.length > 0;

      const chevronIcon = hasSiblings
        ? `<span class="bc-chevron">${ICON.chevronsUpDown}</span>`
        : '';

      const innerContent = `<span class="bc-label" data-full="${fullLabel}">${fullLabel}</span>${chevronIcon}`;

      const labelElement = hasSiblings
        ? `<button type="button" class="${cls} bc-trigger" data-chevron-index="${i}" aria-haspopup="menu" aria-expanded="false">${innerContent}</button>`
        : `<span class="${cls}">${innerContent}</span>`;

      const menu = hasSiblings
        ? `<div class="bc-sibling-menu" data-menu-index="${i}" hidden>${
            siblings.map(s => `
              <button class="bc-sibling-item" data-sibling-id="${this._esc(s.id)}">
                <span class="bc-sibling-label">${this._esc(s.label)}</span>
                ${ICON.chevronRight}
              </button>
            `).join('')
          }</div>`
        : '';

      return `
        <div class="bc-item" data-crumb-index="${i}">
          ${labelElement}
          ${menu}
          <div class="bc-tooltip">${fullLabel}</div>
          ${separator}
        </div>
      `;
    }).join('');
  }

  _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  _applyTruncation() {
    const MAX = 320;
    const labels = this.shadowRoot.querySelectorAll('.bc-label');
    labels.forEach(label => {
      const full = label.dataset.full || '';
      label.textContent = full;
      const item = label.closest('.bc-item');
      if (label.scrollWidth <= MAX) {
        item.classList.remove('is-truncated');
        return;
      }
      const tail = '...' + full.slice(-3);
      let lo = 0, hi = Math.max(0, full.length - 3);
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        label.textContent = full.slice(0, mid) + tail;
        if (label.scrollWidth <= MAX) lo = mid;
        else hi = mid - 1;
      }
      label.textContent = full.slice(0, lo) + tail;
      item.classList.add('is-truncated');
    });
  }

  _closeAllSiblingMenus() {
    this.shadowRoot.querySelectorAll('.bc-sibling-menu').forEach(m => {
      m.hidden = true;
    });
    this.shadowRoot.querySelectorAll('.bc-trigger').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  _toggleSiblingMenu(idx) {
    const menu = this.shadowRoot.querySelector(`.bc-sibling-menu[data-menu-index="${idx}"]`);
    const trigger = this.shadowRoot.querySelector(`.bc-trigger[data-chevron-index="${idx}"]`);
    if (!menu) return;
    const wasOpen = !menu.hidden;
    this._closeAllSiblingMenus();
    if (!wasOpen) {
      menu.hidden = false;
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <nav role="navigation" aria-label="Global navigation">
        <div class="left">
          <button class="btn-icon" aria-label="Toggle menu" data-action="menu-toggle">
            ${ICON.menu}
          </button>
          <div class="breadcrumb" aria-label="Breadcrumb">
            ${this._renderBreadcrumbs()}
          </div>
        </div>

        <div class="right">
          <button class="company-selector" aria-label="Select company" data-action="company-click">
            <span class="label">${this._company}</span>
            ${ICON.chevronDown}
          </button>

          <button class="btn-feedback" data-action="feedback">
            Feedback
          </button>

          <button class="btn-icon" aria-label="AI assistant" data-action="ai">
            ${ICON.sparkles}
          </button>

          <button class="btn-icon" aria-label="Notifications" data-action="notifications">
            ${ICON.bell}
          </button>
        </div>
      </nav>
    `;
    requestAnimationFrame(() => this._applyTruncation());
  }

  _bindEvents() {
    this.shadowRoot.addEventListener('click', (e) => {
      // Breadcrumb trigger (whole item if it has siblings) → toggle menu
      const trigger = e.target.closest('.bc-trigger');
      if (trigger) {
        e.stopPropagation();
        this._toggleSiblingMenu(trigger.dataset.chevronIndex);
        return;
      }
      // Sibling menu item → dispatch and close
      const sibling = e.target.closest('.bc-sibling-item');
      if (sibling) {
        e.stopPropagation();
        this._closeAllSiblingMenus();
        this.dispatchEvent(new CustomEvent('hrm-breadcrumb-sibling', {
          bubbles: true, composed: true,
          detail: { id: sibling.dataset.siblingId },
        }));
        return;
      }

      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;

      if (action === 'menu-toggle') {
        this.dispatchEvent(new CustomEvent('hrm-menu-toggle', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'company-click') {
        this.dispatchEvent(new CustomEvent('hrm-company-click', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'feedback') {
        this.dispatchEvent(new CustomEvent('hrm-feedback', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'ai') {
        this.dispatchEvent(new CustomEvent('hrm-ai', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'notifications') {
        this.dispatchEvent(new CustomEvent('hrm-notifications', { bubbles: true, composed: true }));
        return;
      }
    });

    // Click anywhere outside the chevron/menu closes any open sibling menu.
    this._outsideClickHandler = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const inside = path.some(n =>
        n && n.classList && (n.classList.contains('bc-trigger') || n.classList.contains('bc-sibling-menu'))
      );
      if (!inside) this._closeAllSiblingMenus();
    };
    document.addEventListener('click', this._outsideClickHandler);
  }

  disconnectedCallback() {
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler);
    }
  }
}

customElements.define('hrm-nav-menu', HrmNavMenu);
