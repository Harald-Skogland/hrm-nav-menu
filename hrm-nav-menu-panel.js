/**
 * <hrm-nav-menu-panel> — Floating navigation panel web component.
 * Implements the Gaia nav-menu design (node 30986:39462 / haZ9otQDDsjb6edQoyi5Gu 3:1022).
 * Displayed as a floating overlay below the top bar, not a full-height drawer.
 *
 * Attributes:
 *   module-name   Display name in the module header (default: "Module")
 *   user-name     Full name shown in the user panel (default: "")
 *   user-avatar   URL to user photo (optional — falls back to initials)
 *   active-item   id of the currently active nav item
 *   items         JSON array of nav items (see schema below)
 *   modules       JSON array of available modules for the switcher: [{id, name, description?}]
 *   open          Present = visible, absent = hidden
 *
 * Items schema:
 *   [{ id, label, tier (1|2|3), type ("link"|"submenu"), expanded (bool) }]
 *
 * Events dispatched (bubble + composed):
 *   hrm-module-toggle       module header clicked (open/close switcher)
 *   hrm-module-select       module selected from switcher; detail: { id, name }
 *   hrm-nav-item            nav item clicked; detail: { id, label }
 *   hrm-profile             My profile clicked
 *   hrm-logout              Log out clicked
 *   hrm-user-panel-toggle   user panel chevron clicked
 *   hrm-panel-close         backdrop clicked (caller should remove [open])
 */

const NAV_ICON = {
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  chevronDown:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  chevronUp:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`,
  chevronsUpDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`,
  search:       `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  userRound:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`,
  logOut:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  circleX:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  chevronRightSm: `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
};

const PANEL_STYLES = `
  :host {
    --ga-color-text-body:              #133445;
    --ga-color-text-action:            #1f4e66;
    --ga-color-text-action-hover:      #133445;
    --ga-color-text-disabled:          #b9b9b9;
    --ga-color-text-disable-selected:  #6f7687;
    --ga-color-border-action:          #1f4e66;
    --ga-color-border-action-hover:    #377ea0;
    --ga-color-border-focus:           #1f4e66;
    --ga-color-border-primary:         #6f7687;
    --ga-color-border-tertiary:        #cccfd7;
    --ga-color-border-disabled:        #cccfd7;
    --ga-color-surface-primary:        #ffffff;
    --ga-color-surface-page:           #f2f3f5;
    --ga-color-surface-selected:       #eef5ee;
    --ga-color-surface-highlight:      #fcf0e7;
    --ga-color-surface-disabled:       #e2e4e9;
    --ga-color-icon-action:            #1f4e66;
    --ga-color-text-body-secondary:    #2a6480;
    --ga-radius-default:               4px;
    --ga-radius-round:                 9999px;
    --ga-text-md-size:                 14px;
    --ga-text-md-lineheight:           24px;
    --ga-text-sm-size:                 12px;
    --ga-text-sm-lineheight:           16px;
    --ga-text-xs-size:                 11px;
    --ga-text-xs-lineheight:           16px;
    display: block;
    font-family: 'Inter', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Backdrop (invisible — click-outside-to-close only) */
  .backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 100;
  }
  :host([open]) .backdrop { display: block; }

  /* ── Panel ─────────────────────────────────────────── */
  .panel {
    position: fixed;
    top: var(--hrm-panel-top, 68px);
    left: 16px;
    width: 328px;
    height: 872px;
    max-height: calc(100vh - var(--hrm-panel-top, 68px) - 16px);
    z-index: 101;
    display: none;
    flex-direction: column;
    background: var(--ga-color-surface-primary);
    border-radius: var(--ga-radius-default);
    padding: 4px;
    box-shadow:
      0px 4px 8px 0px rgba(19,52,69,0.10),
      0px 15px 15px 0px rgba(19,52,69,0.09),
      0px 34px 21px 0px rgba(19,52,69,0.05),
      0px 61px 24px 0px rgba(19,52,69,0.01);
    overflow: hidden;
  }
  :host([open]) .panel { display: flex; }

  /* ── Module header ─────────────────────────────────── */
  .module-header-wrapper {
    position: relative;
    flex-shrink: 0;
    z-index: 4;
  }

  .module-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--ga-radius-default);
    background: var(--ga-color-surface-primary);
    cursor: pointer;
    border: none;
    width: 100%;
    text-align: left;
  }
  .module-header:hover { background: var(--ga-color-surface-highlight); }
  .module-header:active { background: var(--ga-color-surface-highlight); }
  .module-header:active .module-name { font-weight: 600; }
  .module-header.open,
  .module-header.open:hover,
  .module-header.open:active {
    background: var(--ga-color-surface-selected);
  }
  .module-header.open .module-name { font-weight: 700; }

  .module-name {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: -0.176px;
    color: var(--ga-color-text-action);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .module-toggle {
    color: var(--ga-color-text-action);
    flex-shrink: 0;
  }

  /* ── Module switcher dropdown ──────────────────────── */
  .module-switcher-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--ga-color-surface-primary);
    box-shadow:
      0px 4px 8px 0px rgba(19,52,69,0.10),
      0px 15px 15px 0px rgba(19,52,69,0.09),
      0px 34px 21px 0px rgba(19,52,69,0.05),
      0px 61px 24px 0px rgba(19,52,69,0.01);
    z-index: 10;
    padding-top: 16px;
    padding-bottom: 8px;
  }

  .switcher-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 64px;
    padding: 12px 16px;
    background: var(--ga-color-surface-primary);
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    gap: 0;
  }
  .switcher-item:hover { background: var(--ga-color-surface-highlight); }

  .switcher-item-name {
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: -0.176px;
    color: var(--ga-color-text-action);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .switcher-item-desc {
    font-size: var(--ga-text-sm-size);
    line-height: var(--ga-text-sm-lineheight);
    color: var(--ga-color-text-body-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Search ────────────────────────────────────────── */
  .search-area {
    padding: 8px 12px;
    flex-shrink: 0;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 8px 12px;
    background: var(--ga-color-surface-page);
    border: 1px solid transparent;
    border-radius: var(--ga-radius-default);
    cursor: text;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    transition: background-color 0.15s, border-color 0.15s;
  }
  .search-field:hover {
    background: var(--ga-color-surface-primary);
    border-color: var(--ga-color-border-action-hover);
  }
  .search-field:focus-within {
    background: var(--ga-color-surface-primary);
    border: 2px solid var(--ga-color-border-focus);
    padding: 7px 11px; /* compensate for +1px border */
  }
  .search-field.is-disabled {
    background: var(--ga-color-surface-disabled);
    border-color: var(--ga-color-border-disabled);
    cursor: not-allowed;
  }
  .search-field > svg:first-child { color: var(--ga-color-text-disable-selected); flex-shrink: 0; }

  .search-input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    font-family: inherit;
    font-size: var(--ga-text-md-size);
    line-height: var(--ga-text-md-lineheight);
    color: var(--ga-color-text-body);
    letter-spacing: -0.096px;
  }
  .search-input::placeholder {
    color: var(--ga-color-text-disable-selected);
    opacity: 1;
  }

  .search-shortcut {
    display: flex;
    align-items: center;
    gap: 2px;
    height: 20px;
    padding: 0 4px;
    border: 1px solid var(--ga-color-border-tertiary);
    border-radius: var(--ga-radius-default);
    background: var(--ga-color-surface-primary);
    flex-shrink: 0;
  }
  .search-field.is-filled .search-shortcut { display: none; }
  .search-shortcut svg { color: var(--ga-color-text-disable-selected); }
  .search-shortcut span {
    font-size: var(--ga-text-xs-size);
    line-height: var(--ga-text-xs-lineheight);
    color: var(--ga-color-text-disable-selected);
    letter-spacing: 0.08px;
  }

  .search-clear {
    display: none;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--ga-color-text-disable-selected);
    cursor: pointer;
    flex-shrink: 0;
  }
  .search-field.is-filled .search-clear { display: inline-flex; }
  .search-clear:hover { color: var(--ga-color-text-action); }
  .search-clear svg { display: block; }

  /* ── Search results (nav-container content when searching) ──── */
  .nav-search-counter {
    display: flex;
    align-items: center;
    height: 24px;
    padding: 0 24px;
    font-size: var(--ga-text-sm-size);
    line-height: var(--ga-text-sm-lineheight);
    font-weight: 500;
    color: var(--ga-color-text-disable-selected);
  }
  .nav-search-results {
    display: flex;
    flex-direction: column;
    padding: 0 12px;
  }
  .nav-search-result {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 24px;
    border: none;
    background: transparent;
    font: inherit;
    cursor: pointer;
    text-align: left;
    border-radius: var(--ga-radius-default);
    width: 100%;
  }
  .nav-search-result:hover { background: var(--ga-color-surface-page); }
  .nav-search-result-content {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .nav-search-result-label {
    font-size: var(--ga-text-md-size);
    line-height: var(--ga-text-md-lineheight);
    font-weight: 400;
    color: var(--ga-color-text-action);
    letter-spacing: -0.096px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nav-search-result-label .result-match {
    font-weight: 600;
  }
  .nav-search-hierarchy {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    margin-top: 2px;
  }
  .hierarchy-item {
    font-size: var(--ga-text-xs-size);
    line-height: var(--ga-text-xs-lineheight);
    color: var(--ga-color-text-disable-selected);
    letter-spacing: 0.08px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
    min-width: 0;
  }
  .hierarchy-chevron {
    display: inline-flex;
    color: var(--ga-color-text-disable-selected);
    flex-shrink: 0;
  }
  .hierarchy-chevron svg { display: block; }

  .nav-search-callout {
    padding: 16px 24px;
    font-size: var(--ga-text-sm-size);
    line-height: var(--ga-text-sm-lineheight);
    color: var(--ga-color-text-disable-selected);
  }

  /* ── Nav items ─────────────────────────────────────── */
  .nav-container {
    flex: 1;
    overflow-y: auto;
    background: var(--ga-color-surface-primary);
    padding: 8px 0;
    min-height: 0;
  }

  .nav-items {
    display: flex;
    flex-direction: column;
    padding: 0 12px;
  }

  .nav-item-row {
    position: relative;
    display: flex;
    align-items: center;
    height: 44px;
    border-radius: var(--ga-radius-default);
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }

  .nav-item-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 100%;
    width: 100%;
    padding: 12px 16px;
    border-radius: var(--ga-radius-default);
    background: var(--ga-color-surface-primary);
    overflow: hidden;
  }
  .nav-item-row.tier-2 .nav-item-inner { padding-left: 40px; }
  .nav-item-row.tier-3 .nav-item-inner { padding-left: 64px; }
  .nav-item-row.tier-4 .nav-item-inner { padding-left: 88px; }

  .nav-item-row.selected .nav-item-inner {
    background: var(--ga-color-surface-selected);
  }
  .nav-item-row:not(.selected):hover .nav-item-inner {
    background: var(--ga-color-surface-highlight);
  }
  .nav-item-row:not(.selected):active .nav-item-inner {
    background: var(--ga-color-surface-highlight);
  }
  .nav-item-row:not(.selected):active .nav-item-label {
    font-weight: 500;
  }
  .nav-item-row.disabled { cursor: not-allowed; }
  .nav-item-row.disabled .nav-item-label,
  .nav-item-row.disabled .nav-item-icon {
    color: var(--ga-color-text-disabled);
  }
  .nav-item-row.disabled:hover .nav-item-inner {
    background: var(--ga-color-surface-primary);
  }

  .nav-item-icon {
    width: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ga-color-text-action);
  }

  .nav-item-label {
    flex: 1;
    font-size: var(--ga-text-md-size);
    line-height: var(--ga-text-md-lineheight);
    color: var(--ga-color-text-action);
    letter-spacing: -0.096px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
  }
  .nav-item-row.selected .nav-item-label { font-weight: 600; }

  /* Selected indicator badge */
  .nav-item-row.selected::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 4px;
    background: var(--ga-color-icon-action);
    border-radius: 0 var(--ga-radius-default) var(--ga-radius-default) 0;
    z-index: 1;
  }

  /* ── Footer ────────────────────────────────────────── */
  .footer {
    flex-shrink: 0;
    position: relative;
    padding-top: 12px;
  }

  /* Collapsed: thin separator above the user row */
  .footer-keyline {
    height: 1px;
    background: var(--ga-color-border-tertiary);
  }

  /* Expanded: dropdown card positioned upward, overlapping nav content */
  .footer-dropdown-container {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    background: var(--ga-color-surface-primary);
    border-radius: var(--ga-radius-default);
    padding: 12px;
    box-shadow:
      0px -10px 4px 0px rgba(19,52,69,0.01),
      0px -6px 3px 0px rgba(19,52,69,0.04),
      0px -2px 2px 0px rgba(19,52,69,0.07),
      0px -1px 1px 0px rgba(19,52,69,0.08);
  }

  .footer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 44px;
    padding: 12px 8px 12px 16px;
    border-radius: var(--ga-radius-default);
    cursor: pointer;
    background: var(--ga-color-surface-primary);
    border: none;
    width: 100%;
    text-align: left;
  }
  .footer-item svg { color: var(--ga-color-text-action); flex-shrink: 0; }
  .footer-item span {
    font-size: var(--ga-text-md-size);
    line-height: var(--ga-text-md-lineheight);
    color: var(--ga-color-text-action);
    letter-spacing: -0.096px;
    font-weight: 400;
  }
  /* hover: cream surface (no underline) */
  .footer-item:hover { background: var(--ga-color-surface-highlight); }
  /* pressed: same bg, weight 500, no underline */
  .footer-item:active { background: var(--ga-color-surface-highlight); }
  .footer-item:active span {
    font-weight: 500;
    text-decoration: none;
  }
  /* selected: green surface + semibold */
  .footer-item.selected,
  .footer-item.selected:hover,
  .footer-item.selected:active {
    background: var(--ga-color-surface-selected);
  }
  .footer-item.selected span {
    font-weight: 600;
    text-decoration: none;
  }
  /* disabled */
  .footer-item:disabled,
  .footer-item.is-disabled {
    cursor: not-allowed;
    background: var(--ga-color-surface-primary);
  }
  .footer-item:disabled span,
  .footer-item.is-disabled span {
    color: var(--ga-color-text-disabled);
    text-decoration: none;
    font-weight: 400;
  }
  .footer-item:disabled svg,
  .footer-item.is-disabled svg {
    color: var(--ga-color-text-disabled);
  }

  /* ── Footer user row ───────────────────────────────── */
  .footer-user-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--ga-radius-default);
    background: var(--ga-color-surface-primary);
    cursor: pointer;
    border: none;
    width: 100%;
    text-align: left;
  }
  .footer-user-row:hover { background: var(--ga-color-surface-highlight); }
  .footer-user-row:active { background: var(--ga-color-surface-highlight); }
  .footer-user-row:active .user-name { font-weight: 600; }
  .footer-user-row.open,
  .footer-user-row.open:hover,
  .footer-user-row.open:active {
    background: var(--ga-color-surface-selected);
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--ga-radius-round);
    border: 1px solid var(--ga-color-border-tertiary);
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ga-color-surface-page);
    color: var(--ga-color-text-action);
    font-size: 14px;
    font-weight: 600;
  }
  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-name {
    flex: 1;
    font-size: var(--ga-text-md-size);
    line-height: var(--ga-text-md-lineheight);
    font-weight: 500;
    color: var(--ga-color-text-action);
    letter-spacing: -0.096px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .footer-user-row.open .user-name { font-weight: 700; }

  .user-toggle {
    color: var(--ga-color-text-action);
    flex-shrink: 0;
  }

  /* ── Keyboard shortcut icon (⌘) ────────────────────── */
  .cmd-icon {
    width: 12px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cmd-icon svg { width: 12px; height: 12px; }
`;

const CMD_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9H5a2 2 0 0 0 0 4h4v4a2 2 0 0 0 4 0v-4h4a2 2 0 0 0 0-4h-4V5a2 2 0 0 0-4 0v4z"/></svg>`;

// Mac/iOS get the ⌘ glyph; everything else gets a "Ctrl" label.
const IS_MAC = (() => {
  const data = navigator.userAgentData;
  if (data && typeof data.platform === 'string') return /mac/i.test(data.platform);
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent || '');
})();

// Example items — will be replaced by caller via [items] attribute
const EXAMPLE_ITEMS = [
  { id: 'my-tasks',          label: 'My tasks',          tier: 1, type: 'submenu'  },
  { id: 'my-history',        label: 'My history',        tier: 1, type: 'link'     },
  { id: 'task-overview',     label: 'Task overview',     tier: 1, type: 'submenu'  },
  { id: 'process-overview',  label: 'Process overview',  tier: 1, type: 'submenu'  },
  { id: 'document-overview', label: 'Document overview', tier: 1, type: 'submenu'  },
  { id: 'configuration',     label: 'Configuration',     tier: 1, type: 'submenu', expanded: true },
  { id: 'substitutes',       label: 'Substitutes',       tier: 2, type: 'link'     },
  { id: 'due-settings',      label: 'Due settings',      tier: 2, type: 'link'     },
  { id: 'departments',       label: 'Departments',       tier: 2, type: 'link'     },
  { id: 'roles',             label: 'Roles',             tier: 2, type: 'link'     },
  { id: 'projects',          label: 'Projects',          tier: 2, type: 'link'     },
  { id: 'cost-units',        label: 'Cost units',        tier: 2, type: 'link'     },
  { id: 'workflows',         label: 'Workflows',         tier: 2, type: 'link'     },
];

class HrmNavMenuPanel extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'module-name', 'user-name', 'user-avatar', 'active-item', 'items', 'modules'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._switcherOpen = false;
    this._footerOpen = false;
    this._expandedIds = new Set();
    this._searchQuery = '';
    this._showCallout = false;
    this._calloutTimer = null;
  }

  connectedCallback() {
    this._render();
    this._bindEvents();
    this._cmdKHandler = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!this.hasAttribute('open')) this.setAttribute('open', '');
        requestAnimationFrame(() => {
          const input = this.shadowRoot.querySelector('.search-input');
          if (input) { input.focus(); input.select(); }
        });
      }
    };
    document.addEventListener('keydown', this._cmdKHandler);
  }

  disconnectedCallback() {
    if (this._cmdKHandler) document.removeEventListener('keydown', this._cmdKHandler);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      const becoming = newValue !== null;
      const was = oldValue !== null;
      if (becoming && !was) {
        // Opening: close switcher/footer and expand path to active
        this._switcherOpen = false;
        this._footerOpen = false;
        this._expandPathToActive();
      } else if (!becoming && was) {
        // Closing: full reset
        this._switcherOpen = false;
        this._footerOpen = false;
        this._expandedIds.clear();
        this._searchQuery = '';
        this._showCallout = false;
        clearTimeout(this._calloutTimer);
      }
    }
    if (name === 'active-item' && this.hasAttribute('open')) {
      this._expandPathToActive();
    }
    if (this.shadowRoot.innerHTML) {
      this._render();
    }
  }

  _expandPathToActive() {
    this._expandedIds.clear();
    const id = this._activeItem;
    if (!id) return;
    const items = this._items;
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;
    const targetTier = items[idx].tier || 1;
    let needed = targetTier - 1;
    for (let i = idx - 1; i >= 0 && needed >= 1; i--) {
      const t = items[i].tier || 1;
      if (t === needed && items[i].type === 'submenu') {
        this._expandedIds.add(items[i].id);
        needed--;
      }
    }
  }

  get _items() {
    try {
      return JSON.parse(this.getAttribute('items') || 'null') || EXAMPLE_ITEMS;
    } catch {
      return EXAMPLE_ITEMS;
    }
  }

  get _moduleName()  { return this.getAttribute('module-name') || 'Module'; }
  get _userName()    { return this.getAttribute('user-name') || ''; }
  get _userAvatar()  { return this.getAttribute('user-avatar') || ''; }
  get _activeItem()  { return this.getAttribute('active-item') || ''; }

  get _modules() {
    try {
      return JSON.parse(this.getAttribute('modules') || '[]');
    } catch {
      return [];
    }
  }

  _userInitials() {
    return this._userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  /** Return only items whose ancestors are all expanded. */
  _getVisibleItems() {
    const all = this._items;
    const visible = [];
    // Stack tracks whether each tier level's parent is expanded.
    // Index 0 (tier 1 parent) is always true — tier 1 items are always visible.
    const openStack = [true];

    for (const item of all) {
      const tier = item.tier || 1;

      // Trim stack down to this tier's parent level
      while (openStack.length > tier) openStack.pop();

      // Visible if parent tier is expanded
      if (openStack[tier - 1]) {
        const isExpanded = item.type === 'submenu' && this._expandedIds.has(item.id);
        visible.push({ ...item, expanded: isExpanded });
      }

      // Push this item's expanded state for its children
      if (item.type === 'submenu') {
        while (openStack.length <= tier) openStack.push(false);
        openStack[tier] = this._expandedIds.has(item.id);
      }
    }
    return visible;
  }

  /** Accordion toggle: expand clicked submenu, collapse its siblings (and their descendants). */
  _handleSubmenuClick(clickedId) {
    const all = this._items;
    const idx = all.findIndex(i => i.id === clickedId);
    if (idx === -1) return;

    const clickedTier = all[idx].tier || 1;
    const isExpanding = !this._expandedIds.has(clickedId);

    if (isExpanding) {
      // Find parent boundary: walk backward to find first item with tier < clickedTier
      let parentEnd = 0;
      for (let i = idx - 1; i >= 0; i--) {
        if ((all[i].tier || 1) < clickedTier) { parentEnd = i + 1; break; }
      }

      // Collapse all sibling submenus (same tier, same parent) and their descendants
      for (let i = parentEnd; i < all.length; i++) {
        const t = all[i].tier || 1;
        if (t < clickedTier) break; // past parent's children
        if (t === clickedTier && all[i].type === 'submenu' && all[i].id !== clickedId) {
          this._expandedIds.delete(all[i].id);
          // Collapse descendants
          for (let j = i + 1; j < all.length; j++) {
            if ((all[j].tier || 1) <= clickedTier) break;
            if (all[j].type === 'submenu') this._expandedIds.delete(all[j].id);
          }
        }
      }
      this._expandedIds.add(clickedId);
    } else {
      // Collapse this folder and all its descendants
      this._expandedIds.delete(clickedId);
      for (let i = idx + 1; i < all.length; i++) {
        if ((all[i].tier || 1) <= clickedTier) break;
        if (all[i].type === 'submenu') this._expandedIds.delete(all[i].id);
      }
    }

    this._render();
  }

  _renderModuleSwitcher() {
    const modules = this._modules;
    if (!modules.length) return '';
    return `
      <div class="module-switcher-dropdown">
        ${modules.map(m => `
          <button class="switcher-item" data-action="module-select" data-id="${m.id}" data-name="${m.name}">
            <span class="switcher-item-name">${m.name}</span>
            ${m.description ? `<span class="switcher-item-desc">${m.description}</span>` : ''}
          </button>
        `).join('')}
      </div>
    `;
  }

  _renderNavItems() {
    return this._getVisibleItems().map(item => {
      const isSelected = item.id === this._activeItem;
      const tierClass = `tier-${item.tier || 1}`;
      const selectedClass = isSelected ? 'selected' : '';

      let icon = '';
      if (item.type === 'submenu') {
        icon = item.expanded ? NAV_ICON.chevronDown : NAV_ICON.chevronRight;
      }

      return `
        <button class="nav-item-row ${tierClass} ${selectedClass}" data-action="nav-item" data-id="${item.id}" data-label="${item.label}" data-type="${item.type || 'link'}">
          <div class="nav-item-inner">
            <span class="nav-item-icon">${icon}</span>
            <span class="nav-item-label">${item.label}</span>
          </div>
        </button>
      `;
    }).join('');
  }

  _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  _renderNavArea() {
    const q = this._searchQuery.trim();
    if (q.length >= 3) return this._renderSearchResults(q);
    if (q.length > 0 && q.length < 3 && this._showCallout) {
      return `<div class="nav-search-callout">Type at least 3 characters to search</div>`;
    }
    return `<div class="nav-items">${this._renderNavItems()}</div>`;
  }

  _renderSearchResults(query) {
    const qLower = query.toLowerCase();
    const results = this._items.filter(i =>
      i.type === 'link' && i.label.toLowerCase().includes(qLower)
    );
    const counter = `<div class="nav-search-counter">${results.length} result${results.length === 1 ? '' : 's'}</div>`;
    if (results.length === 0) return counter;
    const rows = results.map(r => this._renderSearchResult(r, query)).join('');
    return `${counter}<div class="nav-search-results">${rows}</div>`;
  }

  _renderSearchResult(item, query) {
    const ancestors = this._getAncestors(item);
    const labelHtml = this._highlightMatch(item.label, query);
    const hierarchy = ancestors.length > 0
      ? `<div class="nav-search-hierarchy">${
          ancestors.map((a, i) => `
            ${i > 0 ? `<span class="hierarchy-chevron">${NAV_ICON.chevronRightSm}</span>` : ''}
            <span class="hierarchy-item">${this._esc(a.label)}</span>
          `).join('')
        }</div>`
      : '';
    return `
      <button class="nav-search-result" data-action="nav-item" data-id="${this._esc(item.id)}" data-label="${this._esc(item.label)}" data-type="link">
        <div class="nav-search-result-content">
          <div class="nav-search-result-label">${labelHtml}</div>
          ${hierarchy}
        </div>
      </button>
    `;
  }

  _getAncestors(target) {
    const items = this._items;
    const idx = items.findIndex(i => i.id === target.id);
    if (idx < 0) return [];
    const tier = target.tier || 1;
    const ancestors = [];
    let needed = tier - 1;
    for (let i = idx - 1; i >= 0 && needed >= 1; i--) {
      const t = items[i].tier || 1;
      if (t === needed) {
        ancestors.unshift(items[i]);
        needed--;
      }
    }
    return ancestors;
  }

  _highlightMatch(label, query) {
    if (!query) return this._esc(label);
    const lower = label.toLowerCase();
    const q = query.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx < 0) return this._esc(label);
    return `${this._esc(label.slice(0, idx))}<span class="result-match">${this._esc(label.slice(idx, idx + query.length))}</span>${this._esc(label.slice(idx + query.length))}`;
  }

  _renderUserAvatar() {
    if (this._userAvatar) {
      return `<img src="${this._userAvatar}" alt="${this._userName}" />`;
    }
    return this._userInitials() || NAV_ICON.userRound;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>${PANEL_STYLES}</style>

      <div class="backdrop" data-action="close"></div>

      <div class="panel">

        <!-- Module header + switcher dropdown -->
        <div class="module-header-wrapper">
          <button class="module-header${this._switcherOpen ? ' open' : ''}" data-action="module-toggle" aria-label="Module switcher" aria-expanded="${this._switcherOpen}">
            <span class="module-name">${this._moduleName}</span>
            <span class="module-toggle">${this._switcherOpen ? NAV_ICON.chevronDown : NAV_ICON.chevronsUpDown}</span>
          </button>
          ${this._switcherOpen ? this._renderModuleSwitcher() : ''}
        </div>

        <!-- Search -->
        <div class="search-area">
          <div class="search-field${this._searchQuery ? ' is-filled' : ''}">
            ${NAV_ICON.search}
            <input class="search-input" type="text" placeholder="Search" value="${this._esc(this._searchQuery)}" aria-label="Search">
            <div class="search-shortcut">
              ${IS_MAC ? `<div class="cmd-icon">${CMD_ICON}</div>` : `<span>Ctrl</span>`}
              <span>K</span>
            </div>
            <button class="search-clear" type="button" data-action="search-clear" aria-label="Clear search">${NAV_ICON.circleX}</button>
          </div>
        </div>

        <!-- Nav items or search results -->
        <div class="nav-container">${this._renderNavArea()}</div>

        <!-- Footer -->
        <div class="footer">
          ${this._footerOpen ? `
            <div class="footer-dropdown-container">
              <button class="footer-item" data-action="profile">
                ${NAV_ICON.userRound}
                <span>My profile</span>
              </button>
              <button class="footer-item" data-action="logout">
                ${NAV_ICON.logOut}
                <span>Log out</span>
              </button>
            </div>
          ` : '<div class="footer-keyline"></div>'}
          <button class="footer-user-row${this._footerOpen ? ' open' : ''}" data-action="footer-toggle" aria-label="User options" aria-expanded="${this._footerOpen}">
            <div class="user-avatar">${this._renderUserAvatar()}</div>
            <span class="user-name">${this._userName || 'User'}</span>
            <span class="user-toggle">${this._footerOpen ? NAV_ICON.chevronUp : NAV_ICON.chevronsUpDown}</span>
          </button>
        </div>

      </div>
    `;
  }

  _bindEvents() {
    this.shadowRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;

      if (action === 'close') {
        this.dispatchEvent(new CustomEvent('hrm-panel-close', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'module-toggle') {
        const opening = !this._switcherOpen;
        this._switcherOpen = opening;
        if (opening) this._footerOpen = false;
        this._render();
        this.dispatchEvent(new CustomEvent('hrm-module-toggle', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'module-select') {
        this._switcherOpen = false;
        this._render();
        this.dispatchEvent(new CustomEvent('hrm-module-select', {
          bubbles: true, composed: true,
          detail: { id: btn.dataset.id, name: btn.dataset.name },
        }));
        return;
      }
      if (action === 'nav-item') {
        // Any nav-menu interaction collapses switcher/footer.
        this._switcherOpen = false;
        this._footerOpen = false;
        if (btn.dataset.type === 'submenu') {
          this._handleSubmenuClick(btn.dataset.id);
          return;
        }
        this.dispatchEvent(new CustomEvent('hrm-nav-item', {
          bubbles: true, composed: true,
          detail: { id: btn.dataset.id, label: btn.dataset.label },
        }));
        return;
      }
      if (action === 'profile') {
        this.dispatchEvent(new CustomEvent('hrm-profile', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'logout') {
        this.dispatchEvent(new CustomEvent('hrm-logout', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'footer-toggle') {
        const opening = !this._footerOpen;
        this._footerOpen = opening;
        if (opening) this._switcherOpen = false;
        this._render();
        this.dispatchEvent(new CustomEvent('hrm-user-panel-toggle', { bubbles: true, composed: true }));
        return;
      }
      if (action === 'search-clear') {
        this._clearSearch();
        const input = this.shadowRoot.querySelector('.search-input');
        if (input) input.focus();
        return;
      }
    });

    // Search input: typing, clearing, Esc.
    this.shadowRoot.addEventListener('input', (e) => {
      if (!e.target.classList || !e.target.classList.contains('search-input')) return;
      this._handleSearchInput(e.target.value);
    });
    this.shadowRoot.addEventListener('keydown', (e) => {
      if (!e.target.classList || !e.target.classList.contains('search-input')) return;
      if (e.key === 'Escape') {
        if (this._searchQuery) {
          e.preventDefault();
          e.stopPropagation();
          this._clearSearch();
          const input = this.shadowRoot.querySelector('.search-input');
          if (input) input.focus();
        } else {
          e.preventDefault();
          this.dispatchEvent(new CustomEvent('hrm-panel-close', { bubbles: true, composed: true }));
        }
      }
    });
    // Focus on input counts as a nav interaction → collapse switcher/footer.
    this.shadowRoot.addEventListener('focusin', (e) => {
      if (!e.target.classList || !e.target.classList.contains('search-input')) return;
      if (this._switcherOpen || this._footerOpen) {
        this._switcherOpen = false;
        this._footerOpen = false;
        this._render();
        const input = this.shadowRoot.querySelector('.search-input');
        if (input) input.focus();
      }
    });
  }

  _handleSearchInput(value) {
    this._searchQuery = value;
    clearTimeout(this._calloutTimer);
    this._showCallout = false;
    if (value.length > 0 && value.length < 3) {
      this._calloutTimer = setTimeout(() => {
        this._showCallout = true;
        this._updateNavArea();
      }, 1500);
    }
    this._updateSearchFieldState();
    this._updateNavArea();
  }

  _clearSearch() {
    this._searchQuery = '';
    this._showCallout = false;
    clearTimeout(this._calloutTimer);
    const input = this.shadowRoot.querySelector('.search-input');
    if (input) input.value = '';
    this._updateSearchFieldState();
    this._updateNavArea();
  }

  _updateSearchFieldState() {
    const field = this.shadowRoot.querySelector('.search-field');
    if (field) field.classList.toggle('is-filled', this._searchQuery.length > 0);
  }

  _updateNavArea() {
    const container = this.shadowRoot.querySelector('.nav-container');
    if (container) container.innerHTML = this._renderNavArea();
  }
}

customElements.define('hrm-nav-menu-panel', HrmNavMenuPanel);
