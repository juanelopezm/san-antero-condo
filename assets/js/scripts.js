// Shared site enhancements: hero carousel, availability form handler, WhatsApp deep links, JSON-LD injection

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
        // eslint-disable-next-line no-new
        new Swiper('.swiper-container', {
            direction: 'horizontal',
            loop: true,
            autoplay: { delay: 5000, disableOnInteraction: false },
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

    function injectStructuredData() {
        if (document.querySelector('script[type="application/ld+json"][data-auto="lodging"]')) return;
        const locale = getLocale();
        // Derive simple aggregates from DOM
        const reviewCount = document.querySelectorAll('#reviews .review-card').length || 0;
        const apartmentCount = document.querySelectorAll('#apartments .apartment').length || 6;

        const data = {
            '@context': 'https://schema.org',
            '@type': 'LodgingBusiness',
            'name': locale === 'en' ? 'Cabañas Mi Pequeño Paraíso' : 'Cabañas Mi Pequeño Paraíso',
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': 'San Antero',
                'addressRegion': 'Córdoba',
                'addressCountry': 'CO'
            },
            'amenityFeature': [
                { '@type': 'LocationFeatureSpecification', 'name': 'Jacuzzi', 'value': true },
                { '@type': 'LocationFeatureSpecification', 'name': 'Swimming Pool', 'value': true },
                { '@type': 'LocationFeatureSpecification', 'name': 'Wi‑Fi', 'value': true }
            ],
            'telephone': '+57 301 538 2699',
            'url': window.location.href,
            'aggregateRating': reviewCount ? {
                '@type': 'AggregateRating',
                'ratingValue': 5,
                'reviewCount': reviewCount
            } : undefined,
            'offers': {
                '@type': 'AggregateOffer',
                'offerCount': apartmentCount,
                'priceCurrency': 'COP',
                'availability': 'https://schema.org/InStock',
                'url': window.location.href
            }
        };
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.dataset.auto = 'lodging';
        // Remove undefined
        s.textContent = JSON.stringify(JSON.parse(JSON.stringify(data)));
        document.head.appendChild(s);

        // FAQ schema from on-page content if available
        const faqSection = document.querySelector('#faq');
        if (faqSection && !document.querySelector('script[type="application/ld+json"][data-auto="faq"]')) {
            const items = Array.from(faqSection.querySelectorAll('.faq-item')).map(item => {
                const q = item.querySelector('h3')?.textContent?.trim();
                const a = item.querySelector('p')?.innerHTML?.trim();
                return q && a ? {
                    '@type': 'Question',
                    'name': q,
                    'acceptedAnswer': { '@type': 'Answer', 'text': a }
                } : null;
            }).filter(Boolean);
            if (items.length) {
                const faq = document.createElement('script');
                faq.type = 'application/ld+json';
                faq.dataset.auto = 'faq';
                faq.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': items });
                document.head.appendChild(faq);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        initHeroCarousel();
        attachAvailabilityHandler();
        ensureFloatingWhatsApp();
        injectStructuredData();
        loadPricing();

        // Lightweight event tracking hooks (works with GTM/GA4 if dataLayer exists)
        const floatBtn = document.querySelector('.whatsapp-float');
        if (floatBtn) {
            floatBtn.addEventListener('click', function() {
                if (window.dataLayer) {
                    window.dataLayer.push({ event: 'whatsapp_floating_click' });
                } else {
                    try { console.log('Event: whatsapp_floating_click'); } catch(e) {}
                }
            });
        }
        const form = document.querySelector('#availability-form');
        if (form) {
            form.addEventListener('submit', function() {
                if (window.dataLayer) {
                    window.dataLayer.push({ event: 'availability_submit' });
                } else {
                    try { console.log('Event: availability_submit'); } catch(e) {}
                }
            });
        }
    });
})();
