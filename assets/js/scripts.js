// Shared site enhancements: availability form handler, WhatsApp deep links, JSON-LD injection

(function() {
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try { return new Date(dateStr).toISOString().slice(0,10); } catch(e) { return ''; }
    }

    function buildWhatsAppText(locale, data) {
        const { apartmentId, checkin, checkout, guests } = data;
        if (locale === 'en') {
            return `Hello! I'm interested in booking Apartment ${apartmentId || ''} from ${checkin || 'N/A'} to ${checkout || 'N/A'} for ${guests || 'N/A'} guests.`.trim();
        }
        return `¡Hola! Estoy interesado en reservar el Apartamento ${apartmentId || ''} del ${checkin || 'N/A'} al ${checkout || 'N/A'} para ${guests || 'N/A'} personas.`.trim();
    }

    function getLocale() {
        const html = document.documentElement;
        return (html && html.lang && html.lang.startsWith('en')) ? 'en' : 'es';
    }

    function getPhoneForLocale() {
        // Site uses two numbers in hero buttons; default to +573015382699 for booking
        return '+573015382699';
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
            const text = encodeURIComponent(buildWhatsAppText(locale, { apartmentId, checkin, checkout, guests }));
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
        attachAvailabilityHandler();
        ensureFloatingWhatsApp();
        injectStructuredData();

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