'use client'

// Initialize Leaflet with proper configurations
// This helps fix common issues with tile loading and display

const initLeaflet = () => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Add necessary styles for Leaflet to work properly
    const style = document.createElement('style');
    style.textContent = `
      /* Critical CSS fixes for Leaflet */
      .leaflet-tile-container {
        pointer-events: auto !important; 
        will-change: auto !important;
        transform: translateZ(0) !important;
      }
      
      .leaflet-tile {
        border: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        filter: none !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Fix for z-index issues */
      .leaflet-tile-pane { z-index: 2 !important; }
      .leaflet-overlay-pane { z-index: 4 !important; }
      .leaflet-shadow-pane { z-index: 5 !important; }
      .leaflet-marker-pane { z-index: 6 !important; }
      .leaflet-tooltip-pane { z-index: 7 !important; }
      .leaflet-popup-pane { z-index: 8 !important; }
    `;
    
    document.head.appendChild(style);

    // Fix for browsers without proper transform support
    if (typeof HTMLElement.prototype.getBoundingClientRect !== 'function') {
      console.warn('This browser might have issues with tile rendering');
    }
    
    // Clear any existing cached tiles in localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('leaflet-tile-') || key.includes('map-tile')) {
        localStorage.removeItem(key);
      }
    });
  }
};

export default initLeaflet;
