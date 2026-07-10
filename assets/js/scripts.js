// Shared site enhancements: hero carousel, availability form handler, WhatsApp deep links,
// analytics event tracking (structured data / JSON-LD lives statically in each
// page's <head> — see PRD-003)

(function() {
    // Captured synchronously so it's still valid inside async callbacks below (PRD-004).
    var THIS_SCRIPT_URL = document.currentScript && document.currentScript.src;

    // Canonical booking number (PRD-004): the site previously split traffic across
    // two numbers; +573015382699 was already used by 18 of 20 wa.me links.
    var BOOKING_PHONE = '+573015382699';

    // Studios (101-104) sleep up to 5; apartments (201-202) sleep up to 10 (matches hero copy).
    var UNIT_CAPACITY = { '101': 5, '102': 5, '103': 5, '104': 5, '201': 10, '202': 10 };
    var MAX_GUESTS_ANY_UNIT = 10;

    var pricingByUnit = null; // populated by loadPricing() if assets/data/pricing.json has usable numbers

    // PRD-007: inert until the owner creates a GA4 property and this is filled in
    // (format "G-XXXXXXXXXX") — with it empty, nothing loads and no events fire
    // anywhere, so this is always safe to leave as-is. See docs/prds/PRD-007.
    var GA_MEASUREMENT_ID = '';

    function initAnalytics() {
        if (!GA_MEASUREMENT_ID) return;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID);
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
        document.head.appendChild(s);
    }

    // Works whether or not GA4 is configured yet — pushes to dataLayer if gtag.js
    // is loaded, otherwise just logs, so instrumentation can land now and start
    // producing real data the moment GA_MEASUREMENT_ID is filled in.
    function trackEvent(name, params) {
        if (window.dataLayer) {
            window.dataLayer.push(Object.assign({ event: name }, params || {}));
        } else {
            try { console.log('Event:', name, params || {}); } catch (e) { /* noop */ }
        }
    }

    // PRD-002: hero slides 2+ carry their background image in data-bg instead of
    // an inline style, so only the first (already-visible, preloaded) slide's
    // image downloads on page load. This applies the real background just before
    // a slide can be seen — on init (for the starting neighbors) and on every
    // transition — instead of every slide's photo loading eagerly.
    function applyLazyHeroBackgrounds(swiper) {
        const indices = [swiper.activeIndex - 1, swiper.activeIndex, swiper.activeIndex + 1];
        indices.forEach((i) => {
            const el = swiper.slides[i];
            if (el && el.dataset && el.dataset.bg && !el.style.backgroundImage) {
                el.style.backgroundImage = `url('${el.dataset.bg}')`;
            }
        });
    }

    function initHeroCarousel() {
        if (typeof Swiper === 'undefined' || !document.querySelector('.swiper-container')) return;
        // PRD-006: an auto-advancing carousel is exactly what prefers-reduced-motion
        // asks sites to stop doing. Controls (prev/next/pagination) still work either way.
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // eslint-disable-next-line no-new
        new Swiper('.swiper-container', {
            direction: 'horizontal',
            loop: true,
            autoplay: reduceMotion ? false : { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            on: {
                init: function() { applyLazyHeroBackgrounds(this); },
                slideChangeTransitionStart: function() { applyLazyHeroBackgrounds(this); },
            },
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        try { return new Date(dateStr).toISOString().slice(0,10); } catch(e) { return ''; }
    }

    function todayISO() {
        return new Date().toISOString().slice(0, 10);
    }

    function buildWhatsAppText(locale, data) {
        const { apartmentId, checkin, checkout, guests, price } = data;
        const priceLine = price
            ? (locale === 'en' ? ` (rate shown: ${price})` : ` (tarifa mostrada: ${price})`)
            : '';
        if (locale === 'en') {
            return `Hello! I'm interested in booking Apartment ${apartmentId || ''} from ${checkin || 'N/A'} to ${checkout || 'N/A'} for ${guests || 'N/A'} guests.${priceLine}`.trim();
        }
        return `¡Hola! Estoy interesado en reservar el Apartamento ${apartmentId || ''} del ${checkin || 'N/A'} al ${checkout || 'N/A'} para ${guests || 'N/A'} personas.${priceLine}`.trim();
    }

    function getLocale() {
        const html = document.documentElement;
        return (html && html.lang && html.lang.startsWith('en')) ? 'en' : 'es';
    }

    function getPhoneForLocale() {
        return BOOKING_PHONE;
    }

    // PRD-004: reject impossible dates/guest counts before a WhatsApp message is ever built.
    function validateAvailability(locale, { checkin, checkout, guests, apartmentId }) {
        const errors = [];
        const t = locale === 'en'
            ? {
                pastCheckin: 'Check-in date must be today or later.',
                order: 'Check-out date must be after check-in date.',
                guestsRange: 'Number of guests must be between 1 and 10.',
                capacity: (id, max) => `Apartment ${id} holds up to ${max} guests. Choose a smaller party or a different unit.`,
              }
            : {
                pastCheckin: 'La fecha de llegada debe ser hoy o una fecha futura.',
                order: 'La fecha de salida debe ser posterior a la fecha de llegada.',
                guestsRange: 'El número de huéspedes debe estar entre 1 y 10.',
                capacity: (id, max) => `El Apartamento ${id} admite hasta ${max} personas. Elige un grupo más pequeño u otra unidad.`,
              };

        if (checkin && checkin < todayISO()) errors.push(t.pastCheckin);
        if (checkin && checkout && checkout <= checkin) errors.push(t.order);

        const guestsNum = parseInt(guests, 10);
        if (!guestsNum || guestsNum < 1 || guestsNum > MAX_GUESTS_ANY_UNIT) {
            errors.push(t.guestsRange);
        } else if (apartmentId && UNIT_CAPACITY[apartmentId] && guestsNum > UNIT_CAPACITY[apartmentId]) {
            errors.push(t.capacity(apartmentId, UNIT_CAPACITY[apartmentId]));
        }
        return errors;
    }

    function ensureFormErrorBox(form) {
        let box = form.querySelector('.form-error');
        if (!box) {
            box = document.createElement('div');
            box.className = 'form-error';
            box.setAttribute('role', 'alert');
            box.setAttribute('aria-live', 'polite');
            form.appendChild(box);
        }
        return box;
    }

    function showFormErrors(form, errors) {
        const box = ensureFormErrorBox(form);
        box.innerHTML = errors.map((e) => `<p>${e}</p>`).join('');
        box.hidden = errors.length === 0;
    }

    function attachAvailabilityHandler() {
        const form = document.querySelector('#availability-form');
        if (!form) return;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const checkin = formatDate(form.querySelector('[name="checkin"]').value);
            const checkout = formatDate(form.querySelector('[name="checkout"]').value);
            const guests = form.querySelector('[name="guests"]').value || '';
            const apartmentId = form.querySelector('[name="apartment"]').value || '';
            const locale = getLocale();

            const errors = validateAvailability(locale, { checkin, checkout, guests, apartmentId });
            if (errors.length) {
                showFormErrors(form, errors);
                return;
            }
            showFormErrors(form, []);

            const price = apartmentId && pricingByUnit ? pricingByUnit[apartmentId] : null;
            const text = encodeURIComponent(buildWhatsAppText(locale, { apartmentId, checkin, checkout, guests, price }));
            const phone = getPhoneForLocale();
            // PRD-007: only counts genuinely valid submissions (past the errors.length
            // check above) — a rejected submission isn't a real funnel event.
            trackEvent('availability_submit', { apartment: apartmentId || 'any', guests });
            window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
        });
    }

    function ensureFloatingWhatsApp() {
        if (document.querySelector('.whatsapp-float')) return;
        const a = document.createElement('a');
        a.className = 'whatsapp-float';
        a.href = `https://wa.me/${getPhoneForLocale()}?text=${encodeURIComponent(buildWhatsAppText(getLocale(), {}))}`;
        a.target = '_blank';
        a.setAttribute('aria-label', 'WhatsApp');
        a.dataset.ctaLocation = 'floating_button';
        a.innerHTML = '<i class="fab fa-whatsapp"></i>';
        document.body.appendChild(a);
    }

    // PRD-004: assets/data/pricing.json carries owner-supplied nightly rates. Until the
    // owner fills them in every price is null, so we deliberately render nothing rather
    // than ship a visible table full of "TBD" to guests — see docs/prds/PRD-004.
    function loadPricing() {
        if (!THIS_SCRIPT_URL) return;
        let dataUrl;
        try {
            dataUrl = new URL('../data/pricing.json', THIS_SCRIPT_URL).href;
        } catch (e) {
            return;
        }
        fetch(dataUrl).then((r) => (r.ok ? r.json() : null)).then((data) => {
            if (!data || !Array.isArray(data.units) || !Array.isArray(data.seasons)) return;
            const hasRealPrice = data.seasons.some((s) => s.studioPricePerNight != null || s.apartmentPricePerNight != null);
            if (!hasRealPrice) return; // nothing to show yet

            const byId = {};
            data.units.forEach((u) => {
                const season = data.seasons[0];
                const nightly = u.type === 'studio' ? season.studioPricePerNight : season.apartmentPricePerNight;
                if (nightly != null) byId[u.id] = `${nightly} ${data.currency || 'COP'}/${getLocale() === 'en' ? 'night' : 'noche'}`;
            });
            pricingByUnit = byId;
            renderPricingTable(data);
        }).catch(() => { /* offline or file:// — keep the existing static CTA */ });
    }

    function renderPricingTable(data) {
        const mount = document.querySelector('#pricing-table');
        if (!mount) return;
        const locale = getLocale();
        const rows = data.seasons.map((season) => {
            const label = (season.label && season.label[locale]) || season.id;
            const studio = season.studioPricePerNight != null ? `${season.studioPricePerNight} ${data.currency}` : '—';
            const apt = season.apartmentPricePerNight != null ? `${season.apartmentPricePerNight} ${data.currency}` : '—';
            return `<tr><th scope="row">${label}</th><td>${studio}</td><td>${apt}</td></tr>`;
        }).join('');
        const studioHead = locale === 'en' ? 'Studio (101–104)' : 'Apartaestudio (101–104)';
        const aptHead = locale === 'en' ? 'Apartment (201–202)' : 'Apartamento (201–202)';
        mount.innerHTML = `<table class="pricing-grid"><thead><tr><th scope="col"></th><th scope="col">${studioHead}</th><th scope="col">${aptHead}</th></tr></thead><tbody>${rows}</tbody></table>`;
        mount.hidden = false;
    }

    // PRD-007: every WhatsApp CTA on the page (hero, apartment cards, pricing,
    // footer, sticky mobile bar, plus the floating button) fires the same event
    // with a cta_location so conversions can be compared by placement. Uses
    // data-cta-location where set on the markup, falls back to the element's
    // visible text for the few links that don't carry it.
    function attachCtaTracking() {
        document.querySelectorAll('a[href*="wa.me"]').forEach((el) => {
            el.addEventListener('click', () => {
                trackEvent('whatsapp_click', {
                    cta_location: el.dataset.ctaLocation || el.textContent.trim().slice(0, 40) || 'unknown',
                });
            });
        });
    }

    function attachLanguageSwitchTracking() {
        document.querySelectorAll('.language-selector a:not(.active)').forEach((el) => {
            el.addEventListener('click', () => {
                trackEvent('language_switch', { to: getLocale() === 'es' ? 'en' : 'es' });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        initAnalytics();
        initHeroCarousel();
        attachAvailabilityHandler();
        ensureFloatingWhatsApp();
        loadPricing();
        attachCtaTracking();
        attachLanguageSwitchTracking();
    });
})();
