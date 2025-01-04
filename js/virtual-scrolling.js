class VirtualScroller {
    constructor() {
        this.viewport = document.getElementById('viewport');
        this.slider = document.getElementById('slider');
        this.positionIndicator = document.getElementById('position-indicator');
        
        this.isMobile = window.innerWidth <= 768;
        this.rowHeight = this.isMobile ? 45 : 37;
        this.totalItems = 899999999;
        this.bufferSize = 50;  // Threshold for loading more items
        this.windowSize = 200; // Fixed window size
        this.currentIndex = 0;
        this.highlightedIndex = -1;
        
        this.init();
        this.setupEventListeners();
        this.setupSearch();
        this.render();
    }

    init() {
        this.container = document.createElement('div');
        this.container.style.height = `${this.windowSize * this.rowHeight}px`;
        this.container.style.position = 'relative';
        this.viewport.appendChild(this.container);

        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.rowHeight = this.isMobile ? 45 : 37;
                this.render();
            }
        });
    }

    setupEventListeners() {
        let scrollRAF = null;

        this.viewport.addEventListener('scroll', () => {
            if (scrollRAF) cancelAnimationFrame(scrollRAF);
            
            scrollRAF = requestAnimationFrame(() => {
                const scrollTop = this.viewport.scrollTop;
                const currentVisibleIndex = Math.floor(scrollTop / this.rowHeight);
                
                // Load previous items when reaching top threshold
                if (currentVisibleIndex < this.bufferSize && this.currentIndex > 0) {
                    const oldScrollTop = this.viewport.scrollTop;
                    this.currentIndex = Math.max(0, this.currentIndex - this.bufferSize);
                    this.render();
                    this.viewport.scrollTop = oldScrollTop + (this.bufferSize * this.rowHeight);
                }
                
                // Load next items when reaching bottom threshold
                if (currentVisibleIndex > (this.windowSize - this.bufferSize) && 
                    this.currentIndex < (this.totalItems - this.windowSize)) {
                    const oldScrollTop = this.viewport.scrollTop;
                    this.currentIndex = Math.min(
                        this.totalItems - this.windowSize,
                        this.currentIndex + this.bufferSize
                    );
                    this.render();
                    this.viewport.scrollTop = oldScrollTop - (this.bufferSize * this.rowHeight);
                }

                const actualIndex = this.currentIndex + currentVisibleIndex;
                this.updateSlider(actualIndex);
            });
        });

        this.slider.addEventListener('input', () => {
            const percentage = this.slider.value / this.slider.max;
            const targetIndex = Math.floor(percentage * this.totalItems);
            this.scrollToIndex(targetIndex);
        });
    }

    updateSlider(index) {
        const percentage = (index / this.totalItems) * this.slider.max;
        this.slider.value = Math.floor(percentage);
    }

    scrollToIndex(index) {
        if (index < 0 || index >= this.totalItems) return;
        
        // Calculate how many items can fit in the viewport
        const viewportItems = Math.floor(this.viewport.clientHeight / this.rowHeight);
        
        // Adjust currentIndex to center the target index in the viewport
        this.currentIndex = Math.max(0, Math.min(
            this.totalItems - this.windowSize,
            index - Math.floor(viewportItems / 2)
        ));
        
        this.render();
        
        // Calculate scroll position to center the item
        const viewportCenter = Math.floor(this.viewport.clientHeight / 2);
        const targetOffset = (index - this.currentIndex) * this.rowHeight;
        const scrollPosition = targetOffset - viewportCenter + (this.rowHeight / 2);
        
        this.viewport.scrollTop = Math.max(0, scrollPosition);
        
        this.updateSlider(index);
    }

    formatIndex(index) {
        const paddedIndex = index.toString().padStart(9, '0');
        const significantStart = paddedIndex.length - index.toString().length;
        
        return `<span class="index">${paddedIndex.substring(0, significantStart)}<span class="significant">${paddedIndex.substring(significantStart)}</span></span>`;
    }

    render() {
        const fragment = document.createDocumentFragment();
        this.container.innerHTML = '';
        
        // Render exactly windowSize items
        for (let i = 0; i < this.windowSize; i++) {
            const absoluteIndex = this.currentIndex + i;
            if (absoluteIndex >= this.totalItems) break;
            
            const row = document.createElement('div');
            row.className = 'tc-row';
            if (absoluteIndex === this.highlightedIndex) {
                row.className += ' highlight';
            }
            
            row.innerHTML = `
                ${this.formatIndex(absoluteIndex)}
                <span class="tc">${indexToTC(absoluteIndex)}</span>
            `;
            
            row.style.position = 'absolute';
            row.style.top = `${i * this.rowHeight}px`;
            row.style.left = '0';
            row.style.right = '0';
            row.style.height = `${this.rowHeight}px`;
            fragment.appendChild(row);
        }
        
        this.container.appendChild(fragment);
    }

    setupSearch() {
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('tc-search');

        const handleSearch = () => {
            const tc = searchInput.value.trim();
            try {
                const index = tcToIndex(tc);
                this.highlightedIndex = index;
                this.scrollToIndex(index);
            } catch (e) {
                alert('Geçersiz TC Kimlik Numarası');
            }
        };

        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VirtualScroller();
    
    // Modal functionality
    const modal = document.getElementById('info-modal');
    const closeButton = modal.querySelector('.close-button');
    
    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
