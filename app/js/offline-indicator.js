/**
 * Offline Indicator
 * Shows/hides a banner when the user goes offline/online
 */

(function () {
    let offlineBanner = null;

    function createOfflineBanner() {
        if (offlineBanner) return offlineBanner;

        offlineBanner = document.createElement('div');
        offlineBanner.className = 'offline-banner';
        offlineBanner.innerHTML = `
      <div class="container">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <i class="fas fa-wifi" style="text-decoration: line-through; margin-right: 8px;"></i>
            <strong>You are offline.</strong> Some features may be limited.
          </div>
          <button type="button" class="btn btn-sm btn-dark" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;

        return offlineBanner;
    }

    function showOfflineBanner() {
        if (document.querySelector('.offline-banner')) return;

        const banner = createOfflineBanner();
        document.body.insertBefore(banner, document.body.firstChild);

        // Add padding to body to prevent content from being hidden
        document.body.style.paddingTop = '50px';
    }

    function hideOfflineBanner() {
        const banner = document.querySelector('.offline-banner');
        if (banner) {
            banner.remove();
            document.body.style.paddingTop = '0';
        }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
        console.log('[Offline Indicator] Back online');
        hideOfflineBanner();
    });

    window.addEventListener('offline', () => {
        console.log('[Offline Indicator] Gone offline');
        showOfflineBanner();
    });

    // Check initial state
    if (!navigator.onLine) {
        showOfflineBanner();
    }
})();
