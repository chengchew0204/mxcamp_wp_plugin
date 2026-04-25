/**
 * MxCamp V3 - Accordion-style expandable h4 sections.
 *
 * Behavior:
 *   - Each non-title <h4> inside a slide becomes a collapsible header. The
 *     content that follows the header (up to the next <h4>, or an <hr> that
 *     visually belongs to the next <h4>) is wrapped in a content panel.
 *   - Sections toggle independently; opening a new section never collapses
 *     other already-open sections, so users can cross-reference content.
 *   - When toggled, the clicked <h4> is anchored in place. Any layout shift
 *     caused by the expand/collapse is compensated by adjusting the scroll
 *     container, so the title stays exactly where the user left it on screen
 *     (no auto-centering, no scroll jumps).
 *   - Specific slides can default-open the first N sections on initial load.
 *   - Light-content slides (e.g. Guests, About, Giving, Invest in EN and ES)
 *     opt out entirely; their content stays fully visible by default.
 *
 * This file is loaded once for the whole homepage by mxcamp.php, after every
 * .slide_10 is in the DOM. Each slide's `id` attribute (the post's slide_id
 * meta) drives per-slide configuration.
 */
(function () {
    'use strict';

    // Slide ids whose content is short enough that the accordion is unnecessary.
    var OPT_OUT_SLIDES = {
        guests: true,
        huespedes: true,
        about: true,
        nosotrxs: true,
        giving: true,
        contribuir: true,
        invest: true,
        invertir: true
    };

    // Slide ids that should have their first N sections expanded on load.
    var DEFAULT_OPEN_COUNT = {
        orientation: 2,
        orientacion: 2
    };

    function isSectionHeader(h4) {
        // The big slide title (rendered separately by the template) and h4s
        // that are purely vertical-spacing headers (<br> as first child) are
        // not collapsible section headers.
        if (h4.classList.contains('slide-title')) return true;
        var firstEl = h4.firstElementChild;
        if (firstEl && firstEl.tagName === 'BR') return true;
        return false;
    }

    // An <hr> that only precedes the next <h4> visually belongs to that next
    // section, so we stop gathering the current section's content there.
    function isHrBeforeNextH4(node) {
        if (!node || node.nodeType !== 1 || node.tagName !== 'HR') return false;
        var sib = node.nextSibling;
        while (sib) {
            if (sib.nodeType === 1) {
                if (sib.tagName === 'HR') { sib = sib.nextSibling; continue; }
                return sib.tagName === 'H4';
            }
            sib = sib.nextSibling;
        }
        return false;
    }

    function findScrollContainer(el) {
        // Find the nearest ancestor that is the scrolling box for `el`. We look
        // for overflow-y: auto/scroll/overlay regardless of current scrollHeight,
        // because expanding a section is precisely what makes the box scrollable.
        var cur = el && el.parentElement;
        while (cur) {
            var style = window.getComputedStyle(cur);
            var overflowY = style.overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
                return cur;
            }
            cur = cur.parentElement;
        }
        return document.scrollingElement || document.documentElement;
    }

    function openSection(s) {
        s.h4.classList.add('open');
        s.h4.setAttribute('aria-expanded', 'true');
        s.wrapper.classList.add('open');
    }

    function closeSection(s) {
        s.h4.classList.remove('open');
        s.h4.setAttribute('aria-expanded', 'false');
        s.wrapper.classList.remove('open');
    }

    function toggle(section) {
        // Anchor the clicked title to its current screen position. We measure
        // before and after the DOM mutation and compensate the scroll container
        // so the user never has to scroll back up to find the section they
        // just opened.
        var scroller = findScrollContainer(section.h4);
        var beforeTop = section.h4.getBoundingClientRect().top;

        if (section.h4.classList.contains('open')) {
            closeSection(section);
        } else {
            openSection(section);
        }

        var afterTop = section.h4.getBoundingClientRect().top;
        var delta = afterTop - beforeTop;
        if (delta !== 0 && scroller) {
            scroller.scrollTop += delta;
        }
    }

    function buildSection(h4) {
        var wrapper = document.createElement('div');
        wrapper.className = 'h4-expand-content';

        var node = h4.nextSibling;
        while (node) {
            var next = node.nextSibling;
            if (node.nodeType === 1 && node.tagName === 'H4') break;
            if (isHrBeforeNextH4(node)) break;
            wrapper.appendChild(node);
            node = next;
        }

        h4.parentNode.insertBefore(wrapper, h4.nextSibling);
        h4.classList.add('h4-expand');
        h4.setAttribute('role', 'button');
        h4.setAttribute('tabindex', '0');
        h4.setAttribute('aria-expanded', 'false');
        h4.dataset.h4ExpandInit = '1';

        return { h4: h4, wrapper: wrapper };
    }

    function attachHandlers(section) {
        section.h4.addEventListener('click', function (e) {
            // Don't hijack clicks on inline links or hover popovers inside the title.
            if (e.target.closest('a, .hover')) return;
            e.preventDefault();
            toggle(section);
        });
        section.h4.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(section);
            }
        });
    }

    function initScope(scope, slideId) {
        if (!scope) return;
        var key = (slideId || '').toLowerCase();
        if (key && OPT_OUT_SLIDES[key]) return;

        var h4s = Array.prototype.slice.call(scope.querySelectorAll('h4'));
        if (!h4s.length) return;

        var sections = [];
        h4s.forEach(function (h4) {
            if (isSectionHeader(h4)) return;
            if (h4.dataset.h4ExpandInit === '1') return;
            sections.push(buildSection(h4));
        });

        if (!sections.length) return;

        var defaultOpenCount = (key && DEFAULT_OPEN_COUNT[key]) || 0;
        if (defaultOpenCount > 0) {
            sections.slice(0, defaultOpenCount).forEach(openSection);
        }

        sections.forEach(attachHandlers);
    }

    function init() {
        var slides = document.querySelectorAll('.slide_10[id]');
        if (slides.length) {
            slides.forEach(function (slide) { initScope(slide, slide.id); });
            return;
        }
        // Fallback for previews/standalone pages where the slide wrapper is absent.
        initScope(document.body, '');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
