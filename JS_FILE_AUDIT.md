# JavaScript File Audit

## Files You Can DELETE

### 1. ❌ `app/js/offline-indicator.js` - **DELETE THIS**
- **Purpose**: Shows a banner when user goes offline
- **Why remove**: Without the service worker, this is just annoying. Your app requires a server connection to work anyway.
- **Used in**: index.html, home.html, list.html, all.html (line with `<script src="js/offline-indicator.js"></script>`)
- **Action**: Delete the file AND remove the `<script>` tag from all 4 HTML files

### 2. ❌ `app/js/unregister-sw.js` - **DELETE THIS**
- **Purpose**: I created this to unregister service workers
- **Why remove**: Once users visit once, it's done its job. No longer needed.
- **Used in**: Nowhere (I never added it to HTML files)
- **Action**: Just delete the file

## Files You MUST KEEP

### ✅ `app/js/init.js` - **KEEP**
- **Purpose**: Theme toggle (dark/light mode) functionality
- **Why keep**: Your theme switcher won't work without this
- **Used in**: All HTML files

### ✅ `app/js/api.js` - **KEEP**
- **Purpose**: All API calls to your backend (login, logout, getLists, etc.)
- **Why keep**: Your entire app depends on this

### ✅ `app/js/list-editor.js` - **KEEP**
- **Purpose**: List editing functionality (add/remove/reorder items)
- **Used in**: list.html

### ✅ `app/js/share-viewer.js` - **KEEP**
- **Purpose**: Viewing shared lists
- **Used in**: share.html

### ✅ `app/js/jquery.dirty.js` - **KEEP**
- **Purpose**: Detects unsaved changes in forms
- **Used in**: list.html

### ✅ `app/js/jquery.ui.touchpunch.js` - **KEEP**
- **Purpose**: Makes jQuery UI drag/drop work on mobile
- **Used in**: list.html

### ✅ `app/js/fa.js` - **KEEP**
- **Purpose**: Font Awesome icons
- **Used in**: All HTML files

## Summary

**DELETE:**
1. `app/js/offline-indicator.js` + remove `<script>` tags from 4 HTML files
2. `app/js/unregister-sw.js`

**KEEP everything else** - they're all actively used.
