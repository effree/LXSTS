# Service Worker Removal Instructions

## Files Already Deleted
- ✅ `app/service-worker.js` - deleted
- ✅ `app/offline.html` - deleted

## Manual Edits Required

### 1. app/index.html
**Lines to remove: 82-89**
```javascript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('[Service Worker] Registered successfully'))
            .catch(err => console.error('[Service Worker] Registration failed:', err));
    });
}
```

### 2. app/home.html
**Lines to remove: 122-129**
```javascript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('[Service Worker] Registered successfully'))
            .catch(err => console.error('[Service Worker] Registration failed:', err));
    });
}
```

### 3. app/list.html
**Lines to remove: 214-221**
```javascript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('[Service Worker] Registered successfully'))
            .catch(err => console.error('[Service Worker] Registration failed:', err));
    });
}
```

### 4. app/all.html
**Lines to remove: 269-276**
```javascript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('[Service Worker] Registered successfully'))
            .catch(err => console.error('[Service Worker] Registration failed:', err));
    });
}
```

## Summary
Just delete those 8 lines from each of the 4 HTML files. They're all at the end of the `<script>` tag before the closing `</body>` tag.
