// Initialize Swiper
document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper('.swiper-container', {
        // Optional parameters
        direction: 'horizontal',
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        
        // If we need pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        
        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        // And if we need scrollbar
        scrollbar: {
            el: '.swiper-scrollbar',
        },
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to nav links based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
});

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        // No need to do anything as src is already set
        console.log('Native lazy loading is supported');
    } else {
        // Fallback for browsers that don't support lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // Only set src from data-src if it exists
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Media Gallery Functions
let currentMediaIndex = 0;
const mediaGalleries = {
    '101': [
        { type: 'video', src: 'assets/images/101.mp4' },
        { type: 'image', src: 'assets/images/101.jpg' },
        { type: 'image', src: 'assets/images/101-2.jpg' },
        { type: 'image', src: 'assets/images/101-3.jpg' }
    ],
    '102': [
        { type: 'video', src: 'assets/images/102.mp4' },
        { type: 'image', src: 'assets/images/102.jpeg' },
        { type: 'video', src: 'assets/images/102-2.mp4' },
        { type: 'image', src: 'assets/images/102-2.jpeg' },
        { type: 'image', src: 'assets/images/102-3.jpeg' }
    ],
    '103': [
        { type: 'video', src: 'assets/images/103.mp4' },
        { type: 'image', src: 'assets/images/103.jpg' },
        { type: 'video', src: 'assets/images/103-2.mp4' },
        { type: 'image', src: 'assets/images/103-2.jpg' }
    ],
    '104': [
        { type: 'video', src: 'assets/images/104.mp4' },
        { type: 'image', src: 'assets/images/104.jpg' },
        { type: 'video', src: 'assets/images/104-4.mp4' },
        { type: 'image', src: 'assets/images/104-2.jpg' }
    ],
    '201': [
        { type: 'video', src: 'assets/images/201.mp4' },
        { type: 'image', src: 'assets/images/201.jpg' },
        { type: 'video', src: 'assets/images/201-2.mp4' },
        { type: 'image', src: 'assets/images/201-2.jpeg' },
        { type: 'image', src: 'assets/images/201-3.jpeg' },
        { type: 'image', src: 'assets/images/201-4.jpeg' },
        { type: 'image', src: 'assets/images/201-5.jpeg' },
        { type: 'image', src: 'assets/images/201-6.jpeg' },
        { type: 'image', src: 'assets/images/201-7.jpeg' }
    ],
    '202': [
        { type: 'video', src: 'assets/images/202.mp4' },
        { type: 'image', src: 'assets/images/202.jpeg' }
    ]
}; 

function openGallery(galleryId) {
    console.log(`Opening gallery for: ${galleryId}`);
    const gallery = document.getElementById(galleryId);
    if (gallery) {
        gallery.style.display = 'block';
        document.body.style.overflow = 'hidden';
        currentMediaIndex = 0;
        updateMediaDisplay(galleryId.split('-')[1]);
    } else {
        console.error(`Gallery not found: ${galleryId}`);
    }
}

function closeGallery(galleryId) {
    console.log(`Closing gallery for: ${galleryId}`);
    const gallery = document.getElementById(galleryId);
    if (gallery) {
        gallery.style.display = 'none';
        document.body.style.overflow = '';
    } else {
        console.error(`Gallery not found: ${galleryId}`);
    }
}

function updateMediaDisplay(apartmentId) {
    console.log(`Updating media display for apartment: ${apartmentId}, index: ${currentMediaIndex}`);
    const mediaContainer = document.querySelector(`#apartment-${apartmentId} .media-gallery`) || 
                          document.querySelector(`#apartment-${apartmentId} .media-container`);
    const currentMedia = mediaGalleries[apartmentId]?.[currentMediaIndex];
    
    if (!mediaContainer) {
        console.error(`Media container not found for apartment: ${apartmentId}`);
        return;
    }
    
    if (!currentMedia) {
        console.error(`Media not found for apartment: ${apartmentId} at index: ${currentMediaIndex}`);
        return;
    }
    
    if (!currentMedia.src) {
        console.error(`Media source is undefined for apartment: ${apartmentId} at index: ${currentMediaIndex}`, currentMedia);
        return;
    }
    
    if (currentMedia.type === 'video') {
        mediaContainer.innerHTML = `
            <video controls>
                <source src="${currentMedia.src}" type="video/mp4">
                Tu navegador no soporta el elemento de video.
            </video>`;
    } else {
        mediaContainer.innerHTML = `<img src="${currentMedia.src}" alt="Apartamento ${apartmentId}">`;
    }
}

function nextMedia(apartmentId) {
    if (currentMediaIndex < mediaGalleries[apartmentId].length - 1) {
        currentMediaIndex++;
        updateMediaDisplay(apartmentId);
    }
}

function prevMedia(apartmentId) {
    if (currentMediaIndex > 0) {
        currentMediaIndex--;
        updateMediaDisplay(apartmentId);
    }
}

// Close gallery with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const galleries = document.querySelectorAll('.popup-gallery');
        galleries.forEach(gallery => {
            gallery.style.display = 'none';
        });
        document.body.style.overflow = '';
    }
});

// Initialize galleries when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Validate media galleries data
    Object.entries(mediaGalleries).forEach(([apartmentId, media]) => {
        if (!Array.isArray(media)) {
            console.error(`Invalid media array for apartment ${apartmentId}`);
            return;
        }
        
        media.forEach((item, index) => {
            if (!item || !item.type || !item.src) {
                console.error(`Invalid media item for apartment ${apartmentId} at index ${index}:`, item);
            }
        });
    });

    Object.keys(mediaGalleries).forEach(apartmentId => {
        const apartmentElement = document.querySelector(`#apartment-${apartmentId}`);
        if (apartmentElement) {
            const mediaContainer = apartmentElement.querySelector('.media-gallery') || 
                                 apartmentElement.querySelector('.media-container');
            if (mediaContainer) {
                updateMediaDisplay(apartmentId);
                
                // Add click event to media container
                mediaContainer.addEventListener('click', function(e) {
                    if (!e.target.closest('.gallery-nav') && !e.target.closest('.gallery-close')) {
                        openGallery(`apartment-${apartmentId}`);
                    }
                });
            } else {
                console.error(`Media container not found for apartment ${apartmentId}`);
            }
        } else {
            console.error(`Apartment element not found: #apartment-${apartmentId}`);
        }
    });
});