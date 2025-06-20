'use client'

// This script adds additional event handlers to fix tile loading issues
// This runs on the client-side only

export function fixMapTileLoading() {
  if (typeof window !== 'undefined') {
    const interval = setInterval(() => {
      // Find all leaflet tile images
      const tileImages = document.querySelectorAll('.leaflet-tile-container img');
      
      if (tileImages.length > 0) {
        clearInterval(interval);
        
        // Add an error handler to all tile images
        tileImages.forEach((img: Element) => {
          if (img instanceof HTMLImageElement) {
            img.onerror = function() {
              // Replace with a placeholder if image fails to load
              this.src = 'https://via.placeholder.com/256x256?text=Map+Tile';
              this.style.opacity = '0.7';
            };
            
            // Force reload of any incomplete images
            if (!img.complete || img.naturalHeight === 0) {
              const currentSrc = img.src;
              img.src = '';
              setTimeout(() => {
                img.src = currentSrc;
              }, 100);
            }
          }
        });
      }
    }, 1000);
    
    // Clean up on component unmount
    return () => clearInterval(interval);
  }
  
  return undefined;
}

// Add a global function to purge the tile cache if needed
(window as any).purgeTileCache = function() {
  const tileContainers = document.querySelectorAll('.leaflet-tile-container');
  tileContainers.forEach(container => {
    container.innerHTML = '';
  });
  console.log('🧹 Map tile cache cleared');
};
