/**
 * Share Viewer JavaScript
 * Handles display and interaction for shared lists (no authentication required)
 */

console.log('===== SHARE-VIEWER.JS LOADING =====');

// Global variables
let currentListId = null;
let listData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeShareViewer);

async function initializeShareViewer() {
    console.log('Share viewer initializing...');

    try {
        // Get list ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentListId = urlParams.get('l');

        if (!currentListId) {
            showError('No list ID provided in URL');
            return;
        }

        console.log('Loading shared list:', currentListId);
        await loadSharedList(currentListId);

    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to load shared list');
    } finally {
        $('#cover').hide();
    }
}

/**
 * Load shared list from API (no authentication required)
 */
async function loadSharedList(listId) {
    try {
        const response = await fetch(`/api/share/${listId}`);

        if (!response.ok) {
            if (response.status === 404) {
                showError('List not found');
                return;
            }
            throw new Error('Failed to fetch list');
        }

        listData = await response.json();
        console.log('List data loaded:', listData);

        // Display the list
        displayList(listData);

    } catch (error) {
        console.error('Error loading shared list:', error);
        showError('Failed to load list');
    }
}

/**
 * Display the list data
 */
function displayList(data) {
    // Set title
    $('#list-title').text(data.name || 'Untitled List');

    // Show metadata if available
    if (data.created) {
        const createdDate = new Date(data.created);
        $('#list-subtitle').text(`Created ${createdDate.toLocaleDateString()}`);
    }

    // Load items
    const sortable = $('#sortable');
    sortable.empty();

    if (data.items && data.items.length > 0) {
        data.items.forEach((item, index) => {
            addItemToList(item, index, data.settings);
        });
    } else {
        sortable.append('<li class="text-center text-muted py-4">This list is empty</li>');
    }

    // Show content, hide loading
    $('#body-content').removeClass('fade-out');
}

/**
 * Add item to list display
 */
function addItemToList(item, index, settings) {
    const showCheckbox = settings && settings.checkbox !== false;
    const showQuantity = settings && settings.quantity === true;
    const indentClass = item.indent == 1 ? ' ms-5' : '';
    const checkedAttr = item.checkbox ? 'checked' : '';
    const overlayClass = item.checkbox ? 'd-block' : 'd-none';

    // Build quantity display (read-only text, not input)
    let quantityHtml = '';
    if (showQuantity && item.quantity > 0) {
        quantityHtml = `<span class="badge bg-primary me-2">${item.quantity}</span>`;
    }

    // Build checkbox HTML
    let checkboxHtml = '';
    if (showCheckbox) {
        checkboxHtml = `
            <input id="checked-${index}" 
                   type="checkbox" 
                   class="css-checkbox items-checkbox" 
                   data-item-index="${index}"
                   ${checkedAttr} />
            <label for="checked-${index}" class="items-checkbox text-muted">
                <span class="button"></span>
            </label>
        `;
    }

    const itemHtml = `
        <li class="text-muted form-inline py-1 share-item" data-item-index="${index}">
            <div class="overlay-check ${overlayClass}"></div>
            <div class="row mx-1${indentClass}">
                <div class="col-12 col-md-12 col-lg-12 px-0 my-auto">
                    <div class="input-group ms-0">
                        <div class="input-group-prepend ms-0 my-auto">
                            ${checkboxHtml}
                            ${quantityHtml}
                        </div>
                        <div class="form-control ps-2 pe-2 py-1 bg-secondary border-0 text-white rounded ms-0 share-item-text">
                            ${escapeHtml(item.item || '')}
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `;

    $('#sortable').append(itemHtml);
}

/**
 * Update checkbox state via API
 */
async function updateCheckbox(itemIndex, isChecked) {
    const checkboxValue = isChecked ? 1 : 0;

    try {
        const response = await fetch(`/api/share/${currentListId}/item/${itemIndex}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ checkbox: checkboxValue })
        });

        if (!response.ok) {
            throw new Error('Failed to update checkbox');
        }

        const result = await response.json();
        console.log('Checkbox updated:', result);

        // Update overlay
        const listItem = $(`.share-item[data-item-index="${itemIndex}"]`);
        const overlay = listItem.find('.overlay-check');

        if (isChecked) {
            overlay.removeClass('d-none').addClass('d-block');
        } else {
            overlay.removeClass('d-block').addClass('d-none');
        }

        return true;

    } catch (error) {
        console.error('Error updating checkbox:', error);
        showAlert('Failed to update item. Please try again.', 'border-danger');
        return false;
    }
}

/**
 * Show error message
 */
function showError(message) {
    $('#body-content').hide();
    $('#error-message').show();
    if (message) {
        $('#error-message .alert p').first().text(message);
    }
}

/**
 * Show alert message
 */
function showAlert(message, borderClass) {
    const alert = $('#popup-alert');
    alert.addClass(borderClass);
    alert.html(message);
    alert.fadeIn(200);
    alert.delay(2800);
    alert.fadeOut(200);
    setTimeout(() => {
        alert.removeClass(borderClass);
    }, 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Handlers

// Checkbox change handler
$(document).on('change', '.items-checkbox', async function () {
    const checkbox = $(this);
    const itemIndex = parseInt(checkbox.data('item-index'));
    const isChecked = checkbox.is(':checked');

    console.log(`Checkbox ${itemIndex} changed to:`, isChecked);

    // Optimistically update UI
    const originalState = !isChecked;

    // Try to update via API
    const success = await updateCheckbox(itemIndex, isChecked);

    // Rollback if failed
    if (!success) {
        checkbox.prop('checked', originalState);
    }
});

console.log('===== SHARE-VIEWER.JS LOADED =====');
