/* SimplyBook.me widget — config scraped from thementalgain.com/?page_id=5148 */

const SIMPLYBOOK_WIDGET_URL = 'https://simplybook.me/v2/widget/widget.js';
const SIMPLYBOOK_CONTAINER_ID = 'sbw_z0hg2i_calendar';

/** @type {Record<string, unknown>} */
const SIMPLYBOOK_WIDGET_OPTIONS = {
  widget_type: 'iframe',
  url: 'https://thementalgain.simplybook.me',
  theme: 'default',
  theme_settings: {
    timeline_show_end_time: false,
    timeline_hide_unavailable: true,
    hide_past_days: false,
    hide_img_mode: true,
    show_sidebar: true,
    timeline_modern_display: 'as_slots',
    display_item_mode: 'block',
    sb_base_color: '#000000',
    booking_nav_bg_color: '#FF3259',
    body_bg_color: '#f7f7f7',
    dark_font_color: '#494949',
    light_font_color: '#fff',
    btn_color_1: '#FF3259',
    sb_company_label_color: '#FF3259',
    sb_busy: '#000000',
    sb_available: '#32373c',
    sb_review_image: '',
    hide_company_label: false,
    link_color: '#32373c',
  },
  timeline: 'modern',
  datepicker: 'top_calendar',
  is_rtl: '',
  app_config: {
    clear_session: '1',
    allow_switch_to_ada: '',
    predefined: [],
  },
  container_id: SIMPLYBOOK_CONTAINER_ID,
};

function showBookMeFallback() {
  const fallback = document.getElementById('book-me-widget-fallback');
  if (fallback) fallback.hidden = false;
}

function instantiateSimplyBookWidget() {
  if (typeof SimplybookWidget !== 'function') {
    showBookMeFallback();
    return;
  }
  new SimplybookWidget(SIMPLYBOOK_WIDGET_OPTIONS);
}

function loadSimplyBookScript() {
  const container = document.getElementById(SIMPLYBOOK_CONTAINER_ID);
  if (!container) return;

  if (document.querySelector(`script[src="${SIMPLYBOOK_WIDGET_URL}"]`)) {
    instantiateSimplyBookWidget();
    return;
  }

  const script = document.createElement('script');
  script.src = SIMPLYBOOK_WIDGET_URL;
  script.async = true;
  script.onload = () => {
    instantiateSimplyBookWidget();
  };
  script.onerror = () => {
    console.warn('SimplyBook widget script failed to load.');
    showBookMeFallback();
  };
  document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', loadSimplyBookScript);
document.addEventListener('loadSimplyBookPreviewWidget', instantiateSimplyBookWidget);
