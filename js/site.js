function handleNewsletter(event) {
    event.preventDefault();
    const message = document.getElementById('newsletterMessage');
    if (message) {
        message.textContent = 'Thanks for joining the B5IVE list!';
    }
}

(function () {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');

    function setActiveNav(target) {
        navLinks.forEach((link) => {
            link.classList.toggle('active-nav', link.dataset.target === target);
        });
    }

    function handleHashChange() {
        const hashTarget = window.location.hash.replace('#', '');
        const pageTarget = document.body.dataset.activeNav;
        const target = hashTarget || pageTarget || 'home';
        setActiveNav(target);
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => setActiveNav(link.dataset.target));
    });

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
})();

(function () {
    const copyButtons = document.querySelectorAll('.copy-btn');

    function fallbackCopy(text) {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(tempInput);
        }
    }

    copyButtons.forEach((button) => {
        const originalIcon = button.innerHTML;

        button.addEventListener('click', () => {
            const value = button.dataset.copy;
            const setSuccess = () => {
                button.innerHTML = '<i class="bi bi-check2"></i>';
                setTimeout(() => {
                    button.innerHTML = originalIcon;
                }, 1400);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard
                    .writeText(value)
                    .then(setSuccess)
                    .catch(() => {
                        fallbackCopy(value);
                        setSuccess();
                    });
            } else {
                fallbackCopy(value);
                setSuccess();
            }
        });
    });
})();

(function () {
    const carousel = document.querySelector('.product-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('[data-carousel-track]');
    const prevButton = carousel.querySelector('[data-carousel="prev"]');
    const nextButton = carousel.querySelector('[data-carousel="next"]');

    if (!track || !prevButton || !nextButton) return;

    // Get original tiles
    const originalTiles = Array.from(track.querySelectorAll('.product-tile'));
    if (originalTiles.length === 0) return;

    console.log('Original tiles count:', originalTiles.length);

    // Store original HTML and clear track
    const originalHTML = track.innerHTML;
    track.innerHTML = '';

    // Create 3 sets: [clones] [originals] [clones]
    track.innerHTML = originalHTML + originalHTML + originalHTML;

    const allTiles = Array.from(track.querySelectorAll('.product-tile'));
    const numOriginal = originalTiles.length;

    console.log('Total tiles after cloning:', allTiles.length);

    let currentIndex = numOriginal; // Start at first original set
    let isTransitioning = false;

    const updateGalleryPadding = () => {
        const trackWidth = track.getBoundingClientRect().width;
        if (allTiles.length === 0) return;
        const tileWidth = allTiles[0].offsetWidth;
        const padding = Math.max(0, (trackWidth - tileWidth) / 2);
        track.style.paddingLeft = `${padding}px`;
        track.style.paddingRight = `${padding}px`;
    };

    const getGap = () => {
        const styles = window.getComputedStyle(track);
        return parseFloat(styles.columnGap || styles.gap || '0') || 0;
    };

    const getTileWidth = () => {
        return allTiles[0] ? allTiles[0].offsetWidth + getGap() : 0;
    };

    const scrollToTile = (index, smooth = true) => {
        if (index < 0 || index >= allTiles.length) return;
        
        const tile = allTiles[index];
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.width / 2;
        const targetScroll = tile.offsetLeft - trackCenter + tile.offsetWidth / 2;

        track.scrollTo({
            left: targetScroll,
            behavior: smooth ? 'smooth' : 'auto'
        });
    };

    const updateActiveTile = () => {
        const realIndex = currentIndex % numOriginal;
        
        // Update all corresponding tiles across all sets
        allTiles.forEach((tile, index) => {
            const tileRealIndex = index % numOriginal;
            tile.classList.toggle('lens-active', tileRealIndex === realIndex);
        });
    };

    const handleInfiniteLoop = () => {
        if (isTransitioning) return;

        // If we're in the last set, jump to middle set
        if (currentIndex >= numOriginal * 2) {
            isTransitioning = true;
            const offset = currentIndex - (numOriginal * 2);
            currentIndex = numOriginal + offset;
            scrollToTile(currentIndex, false);
            setTimeout(() => {
                isTransitioning = false;
                updateActiveTile();
            }, 50);
        }
        // If we're in the first set, jump to middle set
        else if (currentIndex < numOriginal) {
            isTransitioning = true;
            const offset = currentIndex;
            currentIndex = numOriginal + offset;
            scrollToTile(currentIndex, false);
            setTimeout(() => {
                isTransitioning = false;
                updateActiveTile();
            }, 50);
        }
    };

    const goToNext = () => {
        if (isTransitioning) return;
        currentIndex++;
        scrollToTile(currentIndex, true);
        updateActiveTile();
        setTimeout(handleInfiniteLoop, 600);
    };

    const goToPrev = () => {
        if (isTransitioning) return;
        currentIndex--;
        scrollToTile(currentIndex, true);
        updateActiveTile();
        setTimeout(handleInfiniteLoop, 600);
    };

    prevButton.addEventListener('click', goToPrev);
    nextButton.addEventListener('click', goToNext);

    window.addEventListener('resize', () => {
        updateGalleryPadding();
        scrollToTile(currentIndex, false);
    });

    // Initialize
    updateGalleryPadding();
    setTimeout(() => {
        scrollToTile(currentIndex, false);
        updateActiveTile();
    }, 100);
})();

