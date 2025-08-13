// Image-Centric Enhancements for Hospitality Website
(function() {
    'use strict';

    // Enhanced media galleries with more images per apartment
    const enhancedMediaGalleries = {
        '101': [
            { type: 'video', src: 'assets/images/101.mp4', thumb: 'assets/images/casa.jpeg' },
            { type: 'image', src: 'assets/images/casa.jpeg', thumb: 'assets/images/casa.jpeg' },
            { type: 'image', src: 'assets/images/casa2.jpeg', thumb: 'assets/images/casa2.jpeg' },
            { type: 'image', src: 'assets/images/terraza.jpeg', thumb: 'assets/images/terraza.jpeg' }
        ],
        '102': [
            { type: 'video', src: 'assets/images/102.mp4', thumb: 'assets/images/102-2.jpeg' },
            { type: 'video', src: 'assets/images/102-2.mp4', thumb: 'assets/images/102-2.jpeg' },
            { type: 'image', src: 'assets/images/102-2.jpeg', thumb: 'assets/images/102-2.jpeg' },
            { type: 'image', src: 'assets/images/102-3.jpeg', thumb: 'assets/images/102-3.jpeg' }
        ],
        '103': [
            { type: 'video', src: 'assets/images/103.mp4', thumb: 'assets/images/pool1.jpg' },
            { type: 'video', src: 'assets/images/103-2.mp4', thumb: 'assets/images/pool2.jpg' },
            { type: 'image', src: 'assets/images/pool1.jpg', thumb: 'assets/images/pool1.jpg' },
            { type: 'image', src: 'assets/images/pool2.jpg', thumb: 'assets/images/pool2.jpg' }
        ],
        '104': [
            { type: 'video', src: 'assets/images/104.mp4', thumb: 'assets/images/pool3.jpg' },
            { type: 'video', src: 'assets/images/104-4.mp4', thumb: 'assets/images/pool4.jpg' },
            { type: 'image', src: 'assets/images/pool3.jpg', thumb: 'assets/images/pool3.jpg' },
            { type: 'image', src: 'assets/images/pool4.jpg', thumb: 'assets/images/pool4.jpg' }
        ],
        '201': [
            { type: 'video', src: 'assets/images/201.mp4', thumb: 'assets/images/201-2.jpeg' },
            { type: 'video', src: 'assets/images/201-2.mp4', thumb: 'assets/images/201-2.jpeg' },
            { type: 'image', src: 'assets/images/201-2.jpeg', thumb: 'assets/images/201-2.jpeg' },
            { type: 'image', src: 'assets/images/201-3.jpeg', thumb: 'assets/images/201-3.jpeg' },
            { type: 'image', src: 'assets/images/201-4.jpeg', thumb: 'assets/images/201-4.jpeg' },
            { type: 'image', src: 'assets/images/201-5.jpeg', thumb: 'assets/images/201-5.jpeg' },
            { type: 'image', src: 'assets/images/201-6.jpeg', thumb: 'assets/images/201-6.jpeg' },
            { type: 'image', src: 'assets/images/201-7.jpeg', thumb: 'assets/images/201-7.jpeg' }
        ],
        '202': [
            { type: 'video', src: 'assets/images/202.mp4', thumb: 'assets/images/202.jpeg' },
            { type: 'image', src: 'assets/images/202.jpeg', thumb: 'assets/images/202.jpeg' },
            { type: 'image', src: 'assets/images/pool5.jpg', thumb: 'assets/images/pool5.jpg' },
            { type: 'image', src: 'assets/images/jacuzzi.jpg', thumb: 'assets/images/jacuzzi.jpg' }
        ]
    };

    let currentLightboxIndex = 0;
    let currentLightboxGallery = [];
    let lightboxOverlay = null;

    // Create lightbox overlay
    function createLightboxOverlay() {
        if (lightboxOverlay) return;
        
        lightboxOverlay = document.createElement('div');
        lightboxOverlay.className = 'lightbox-overlay';
        lightboxOverlay.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close lightbox">×</button>
                <div class="lightbox-main">
                    <button class="lightbox-nav prev" aria-label="Previous image">‹</button>
                    <button class="lightbox-nav next" aria-label="Next image">›</button>
                </div>
                <div class="lightbox-thumbnails"></div>
            </div>
        `;
        
        document.body.appendChild(lightboxOverlay);
        
        // Event listeners
        lightboxOverlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightboxOverlay.querySelector('.lightbox-nav.prev').addEventListener('click', () => navigateLightbox(-1));
        lightboxOverlay.querySelector('.lightbox-nav.next').addEventListener('click', () => navigateLightbox(1));
        
        // Close on overlay click
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) closeLightbox();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', handleLightboxKeydown);
    }

    function openLightbox(apartmentId, startIndex = 0) {
        createLightboxOverlay();
        currentLightboxGallery = enhancedMediaGalleries[apartmentId] || [];
        currentLightboxIndex = startIndex;
        
        if (currentLightboxGallery.length === 0) {
            return;
        }
        
        if (!lightboxOverlay) {
            return;
        }
        
        lightboxOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        updateLightboxContent();
        createLightboxThumbnails();
        
        // Track analytics
        if (window.dataLayer) {
            window.dataLayer.push({ 
                event: 'lightbox_open', 
                apartment_id: apartmentId,
                media_count: currentLightboxGallery.length 
            });
        }
    }

    // Open lightbox with an arbitrary media array (used for standalone galleries)
    function openMediaLightbox(mediaArray, startIndex = 0) {
        createLightboxOverlay();
        currentLightboxGallery = Array.isArray(mediaArray) ? mediaArray : [];
        currentLightboxIndex = startIndex;

        if (currentLightboxGallery.length === 0 || !lightboxOverlay) {
            return;
        }

        lightboxOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        updateLightboxContent();
        createLightboxThumbnails();
    }

    function closeLightbox() {
        if (!lightboxOverlay) return;
        
        lightboxOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        if (window.dataLayer) {
            window.dataLayer.push({ event: 'lightbox_close' });
        }
    }

    function navigateLightbox(direction) {
        currentLightboxIndex += direction;
        
        if (currentLightboxIndex < 0) {
            currentLightboxIndex = currentLightboxGallery.length - 1;
        } else if (currentLightboxIndex >= currentLightboxGallery.length) {
            currentLightboxIndex = 0;
        }
        
        updateLightboxContent();
        updateLightboxThumbnails();
    }

    function updateLightboxContent() {
        const media = currentLightboxGallery[currentLightboxIndex];
        const mainContainer = lightboxOverlay.querySelector('.lightbox-main');
        const navButtons = mainContainer.querySelectorAll('.lightbox-nav');
        
        // Remove existing media
        const existingMedia = mainContainer.querySelector('img, video');
        if (existingMedia) existingMedia.remove();
        
        // Create new media element
        let mediaElement;
        if (media.type === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.innerHTML = `<source src="${media.src}" type="video/mp4">`;
        } else {
            mediaElement = document.createElement('img');
            mediaElement.src = media.src;
            mediaElement.alt = `Gallery image ${currentLightboxIndex + 1}`;
        }
        
        // Insert before nav buttons
        mainContainer.insertBefore(mediaElement, navButtons[0]);
    }

    function createLightboxThumbnails() {
        const thumbnailsContainer = lightboxOverlay.querySelector('.lightbox-thumbnails');
        thumbnailsContainer.innerHTML = '';
        
        currentLightboxGallery.forEach((media, index) => {
            const thumb = document.createElement('img');
            thumb.src = media.thumb || media.src;
            thumb.alt = `Thumbnail ${index + 1}`;
            thumb.addEventListener('click', () => {
                currentLightboxIndex = index;
                updateLightboxContent();
                updateLightboxThumbnails();
            });
            
            if (index === currentLightboxIndex) {
                thumb.classList.add('active');
            }
            
            thumbnailsContainer.appendChild(thumb);
        });
    }

    function updateLightboxThumbnails() {
        const thumbnails = lightboxOverlay.querySelectorAll('.lightbox-thumbnails img');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentLightboxIndex);
        });
    }

    function handleLightboxKeydown(e) {
        if (!lightboxOverlay || !lightboxOverlay.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    }

    // Progressive image loading
    function setupProgressiveLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const wrapper = img.closest('.progressive-img');
                        
                        img.src = img.dataset.src;
                        img.onload = () => {
                            img.classList.add('loaded');
                            if (wrapper) wrapper.classList.add('loaded');
                        };
                        
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.onload = () => img.classList.add('loaded');
            });
        }
    }

    // Enhanced apartment galleries
    function enhanceApartmentGalleries() {
        Object.keys(enhancedMediaGalleries).forEach(apartmentId => {
            const apartmentElement = document.querySelector(`[data-apartment="${apartmentId}"]`);
            
            if (!apartmentElement) {
                return;
            }
            
            const mediaGallery = apartmentElement.querySelector('.media-gallery');
            if (!mediaGallery) return;
            
            // Add click handlers to images/videos to open lightbox
            mediaGallery.addEventListener('click', (e) => {
                const target = e.target;
                if (target && (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.closest('video'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    openLightbox(apartmentId, 0);
                }
            }, { passive: false });
            
            // Add thumbnails below main media
            const thumbnailsContainer = document.createElement('div');
            thumbnailsContainer.className = 'media-thumbnails';
            
            enhancedMediaGalleries[apartmentId].slice(1, 5).forEach((media, index) => {
                const thumb = document.createElement('img');
                thumb.src = media.thumb || media.src;
                thumb.alt = `${apartmentId} view ${index + 2}`;
                thumb.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openLightbox(apartmentId, index + 1);
                });
                thumbnailsContainer.appendChild(thumb);
            });
            
            if (thumbnailsContainer.children.length > 0) {
                mediaGallery.appendChild(thumbnailsContainer);
            }
        });
    }

    // Enhance general gallery sections (videos and photos sections)
    function enhanceStandaloneGalleries() {
        const gallerySections = document.querySelectorAll('section.gallery');

        gallerySections.forEach(section => {
            const mediaElements = Array.from(section.querySelectorAll('.gallery-item img, .gallery-item video'));
            if (mediaElements.length === 0) return;

            // Build media array for this section
            const mediaArray = mediaElements.map(el => {
                if (el.tagName === 'VIDEO') {
                    const source = el.querySelector('source');
                    return { type: 'video', src: source ? source.src : (el.currentSrc || el.src) };
                }
                return { type: 'image', src: el.currentSrc || el.src };
            });

            // Attach click handlers with proper index
            mediaElements.forEach((el, index) => {
                el.style.cursor = 'pointer';
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openMediaLightbox(mediaArray, index);
                }, { passive: false });
            });
        });
    }

    // Add parallax effect to hero slides
    function addParallaxEffect() {
        const heroSlides = document.querySelectorAll('.swiper-slide');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3; // Reduced parallax intensity
            
            heroSlides.forEach(slide => {
                // Only apply parallax if the slide is in the viewport
                const rect = slide.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    // Apply transform to background only, not the entire slide
                    slide.style.backgroundPosition = `center ${50 + rate * 0.1}%`;
                }
            });
        });
    }

    // Initialize all enhancements
    function init() {
        setupProgressiveLoading();
        enhanceApartmentGalleries();
        enhanceStandaloneGalleries();
        // addParallaxEffect(); // Temporarily disabled to check background images
        
        // Add progressive loading class to existing images
        document.querySelectorAll('.gallery-item img, .apartment img').forEach(img => {
            if (!img.classList.contains('loaded') && img.src) {
                // Mark existing loaded images as loaded
                img.classList.add('loaded');
                
                // Wrap in progressive container for styling
                if (!img.closest('.progressive-img')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'progressive-img loaded';
                    img.parentNode.insertBefore(wrapper, img);
                    wrapper.appendChild(img);
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export functions for external use
    window.ImageEnhancements = {
        openLightbox,
        closeLightbox,
        openMediaLightbox
    };
})();
