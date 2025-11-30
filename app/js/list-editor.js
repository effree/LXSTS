/**
 * List Editor JavaScript
 * Handles all list editing functionality including:
 * - Loading existing lists
 * - Creating new lists
 * - Adding/removing items
 * - Drag-and-drop sorting
 * - Saving to API
 */

console.log('===== LIST-EDITOR.JS FILE IS LOADING =====');

// Global variables
let currentListId = null;
let isEditMode = false;
let count = 2;

console.log('Global variables defined');
console.log('jQuery available:', typeof $ !== 'undefined');
console.log('Document ready state:', document.readyState);

// Initialize on page load - using native DOMContentLoaded instead of jQuery
function initializeListEditor() {
    console.log('List editor initializing...');

    (async function () {
        try {
            // Check authentication
            console.log('Checking authentication...');
            const isAuth = await API.checkAuth();
            console.log('Auth status:', isAuth);

            if (!isAuth) {
                console.log('Not authenticated, redirecting...');
                window.location.href = '/index.html';
                return;
            }

            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const pageType = urlParams.get('p');
            const listId = urlParams.get('l');
            console.log('Page type:', pageType, 'List ID:', listId);

            if (pageType === 'edit' && listId) {
                // Edit mode
                console.log('Loading existing list...');
                isEditMode = true;
                currentListId = listId;
                await loadList(listId);
            } else {
                // New list mode
                console.log('Initializing new list...');
                isEditMode = false;
                currentListId = null;
                initializeNewList();
            }

            // Initialize sortable AFTER items are loaded
            console.log('Initializing sortable...');
            initializeSortable();

            // Initialize form dirty tracking
            console.log('Initializing dirty tracking...');
            $("#listNew").dirty({
                preventLeaving: true, // Keep browser warning when navigating away
                onDirty: function () {
                    $('.dirtyMsg').empty();
                    $('.dirtyMsg').append('Changes have been made to this list. ');
                },
                onClean: function () {
                    $('.dirtyMsg').empty();
                }
            });

            resize();
            console.log('Initialization complete!');

            // Signout handler
            document.getElementById('signout-btn').addEventListener('click', async function () {
                await API.logout();
                window.location.href = '/index.html';
            });

        } catch (error) {
            console.error('Initialization error:', error);
            alert('Error initializing page: ' + error.message);
        } finally {
            // Always hide loading cover, even if there's an error
            console.log('Hiding loading cover...');
            $("#cover").hide(); // Use hide() instead of fadeOut() for immediate effect
        }
    })();
}

// Use both methods to ensure it runs
if (document.readyState === 'loading') {
    console.log('Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initializeListEditor);
} else {
    console.log('DOM already loaded, initializing immediately...');
    initializeListEditor();
}

/**
 * Load existing list from API
 */
async function loadList(listId) {
    try {
        const listData = await API.getList(listId);

        if (!listData) {
            showAlert('<span class="d-block w-100 text-start"><b>Error</b></span>List not found. Creating new list instead.', 'border-danger');
            initializeNewList();
            return;
        }

        // Set title
        $('#title').val(listData.name);
        $('.list-title').text(listData.name);

        // Set settings
        if (listData.settings) {
            $('#sort-view').prop('checked', listData.settings.sort !== false);
            $('#checkmark-view').prop('checked', listData.settings.checkbox !== false);
            $('#quantity-view').prop('checked', listData.settings.quantity === true);
        }

        // Apply settings visibility
        if (!listData.settings.sort) sortView();
        if (!listData.settings.checkbox) checkboxView();
        if (listData.settings.quantity) quantityView();

        // Set metadata
        if (listData.created) {
            const createdDate = new Date(listData.created);
            $('#created-date').text(createdDate.toLocaleString());
            $('#list-metadata').show();
        }
        if (listData.modified) {
            const modifiedDate = new Date(listData.modified);
            $('#modified-date').text(modifiedDate.toLocaleString());
        }

        // Load items
        const sortable = $('#sortable');
        sortable.empty();

        if (listData.items && listData.items.length > 0) {
            listData.items.forEach((item, index) => {
                addItemToList(item, index + 1);
            });
            count = listData.items.length + 1;
        } else {
            addRow();
        }

        // Show edit buttons
        $('.edit-buttons').removeClass('d-none');
        $('.save-sq').css('border-top-right-radius', '0');
        $('.save-sq').css('border-bottom-right-radius', '0');
        $('#newlist').val('2');

        totalCount();
        resize();

        // Reinitialize sortable after items are loaded
        if ($("#sortable").hasClass('ui-sortable')) {
            $("#sortable").sortable("destroy");
        }
        initializeSortable();

    } catch (error) {
        console.error('Error loading list:', error);
        showAlert('<span class="d-block w-100 text-start"><b>Error</b></span>Failed to load list.', 'border-danger');
        initializeNewList();
    }
}

/**
 * Initialize new list with one empty item
 */
function initializeNewList() {
    $('#sortable').empty();
    addRow();
    $('#newlist').val('1');
    isEditMode = false;
    currentListId = null;
}

/**
 * Add item to list (for loading existing items)
 */
function addItemToList(item, index) {
    const sortDisplay = $('#sort-view').is(':checked') ? 'd-inline-block' : 'd-none';
    const checkboxDisplay = $('#checkmark-view').is(':checked') ? 'd-inline-block' : 'd-none';
    const quantityDisplay = $('#quantity-view').is(':checked') ? 'd-inline-flex' : 'd-none';
    const indentClass = item.indent == 1 ? ' ms-5' : '';
    const checkedAttr = item.checkbox ? 'checked' : '';
    const overlayClass = item.checkbox ? 'd-block' : 'd-none';
    const indentIcon = item.indent == 1 ? 'left' : 'right';

    const itemHtml = `
        <li class="text-muted form-inline py-1">
            <div class="overlay-check ${overlayClass}"></div>
            <div class="row mx-1${indentClass}">
                <div class="col-12 col-md-12 col-lg-12 px-0 my-auto text-center">
                    <div class="input-group ms-0">
                        <i class="fas fa-up-down-left-right handle ms-1 me-2 my-auto fs-6 ${sortDisplay}"></i>
                        <div class="input-group-prepend ms-0 my-auto">
                            <input id="checked[${index}]" name="checked[${index}]" type="checkbox" class="css-checkbox items-checkbox ${checkboxDisplay} jschecked" onchange="if(this.checked){ $(this).closest('li').find('div').first().toggleClass('d-block d-none'); }else{ $(this).closest('li').find('div').first().toggleClass('d-none d-block'); }" ${checkedAttr} />
                            <label for="checked[${index}]" class="jscheckedlabel items-checkbox ${checkboxDisplay} text-muted"><span class="button"></span></label>
                            <div class="btn-group me-1 items-quantity ${quantityDisplay}" role="group">
                                <button type="button" class="btn btn-sm btn-primary rounded-0 rounded-start px-1 font-monospace" onclick="$(this).next()[0].stepDown();" title="Decrease value" aria-label="Decrease value"><i class="fas fa-circle-minus"></i></button>
                                <input class="jsquantity value-input py-0 bg-secondary border-0 text-white rounded-0 ms-0" type="number" value="${item.quantity || 0}" name="quantity[${index}]" id="quantity[${index}]" min="0" />
                                <button type="button" class="btn btn-sm btn-primary rounded-0 rounded-end px-1 font-monospace ms-0" onclick="$(this).prev()[0].stepUp();" title="Increase value" aria-label="Increase value"><i class="fas fa-circle-plus"></i></button>
                            </div>
                        </div>
                        <div class="input-group-prepend item-indent-button ms-1">
                            <input type="hidden" name="indent[${index}]" id="indent[${index}]" value="${item.indent || 0}" class="inputindent" />
                            <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 rounded-start h-100 jsindent"><i class="fas fa-arrow-${indentIcon}"></i></button>
                        </div>
                        <textarea class="jsitem form-control ps-2 pe-2 py-0 bg-secondary border-0 text-white rounded-0 ms-0 sm-shade" name="item[${index}]" id="item[${index}]" placeholder="List item">${item.item || ''}</textarea>
                        <div class="input-group-append item-delete-button">
                            <button type="button" class="btn btn-sm btn-danger rounded-0 rounded-end h-100 jsdelete sm-shade" tabindex="0"><span>CONFIRM</span><i class="fas fa-circle-xmark"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `;

    $('#sortable').append(itemHtml);
}

/**
 * Add new empty row
 */
function addRow() {
    const sort = $('#sort-view').is(':checked') ? 'd-inline-block' : 'd-none';
    const checkbox = $('#checkmark-view').is(':checked') ? 'd-inline-block' : 'd-none';
    const quantity = $('#quantity-view').is(':checked') ? 'd-inline-flex' : 'd-none';

    $("ul#sortable").append(`<li class="text-muted form-inline py-1" class="w-100">
                                <div class="overlay-check d-none"></div>
                                    <div class="row mx-1">
                                        <div class="col-12 col-md-12 col-lg-12 px-0 my-auto text-center">
                                            <div class="input-group ms-0">
                                                <i class="fas fa-up-down-left-right handle ms-1 me-2 my-auto ${sort}"></i>
                                                <div class="input-group-prepend ms-0 my-auto">
                                                    <input id="checked[${count}]" name="checked[${count}]" type="checkbox" class="jschecked css-checkbox items-checkbox ${checkbox}" onchange="if(this.checked){ $(this).closest('li').find('div').first().toggleClass('d-block d-none'); }else{ $(this).closest('li').find('div').first().toggleClass('d-none d-block'); }" />
                                                    <label for="checked[${count}]" class="jscheckedlabel items-checkbox ${checkbox}"></label>
                                                    <div class="btn-group me-1 items-quantity ${quantity}" role="group">
                                                        <button type="button" class="btn btn-sm btn-primary rounded-0 rounded-start px-1 font-monospace" onclick="$(this).next()[0].stepDown();" title="Decrease value" aria-label="Decrease value"><i class="fas fa-circle-minus"></i></button>
                                                        <input class="jsquantity value-input py-0 bg-secondary border-0 text-white rounded-0 ms-0" type="number" value="0" name="quantity${count}" id="quantity${count}" min="0" />
                                                        <button type="button" class="btn btn-sm btn-primary rounded-0 rounded-end px-1 font-monospace ms-0" onclick="$(this).prev()[0].stepUp();" title="Increase value" aria-label="Increase value"><i class="fas fa-circle-plus"></i></button>
                                                    </div>
                                                </div>
                                                <div class="input-group-prepend item-indent-button ms-1">
                                                    <input type="hidden" name="indent[${count}]" id="indent[${count}]" value="0" class="inputindent" />
                                                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 rounded-start h-100 jsindent"><i class="fas fa-arrow-right"></i></button>
                                                </div>
                                                <textarea class="jsitem form-control ps-2 pe-2 py-0 bg-secondary border-0 text-white rounded-0 ms-0" name="item[${count}]" id="item[${count}]" placeholder="List item"></textarea>
                                                <div class="input-group-append item-delete-button">
                                                    <button type="button" class="btn btn-sm btn-danger rounded-0 rounded-end h-100 jsdelete" tabindex="0"><span>CONFIRM</span><i class="fas fa-circle-xmark"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>`);
    count++;
    resort();
    totalCount();
    const textField = $('ul#sortable li:last-child').find('textarea').first();

    // Scroll to bottom and focus new field
    setTimeout(function () {
        textField.focus();
        // Scroll to bottom of page
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }, 300);

    $("#listNew").dirty("setAsDirty");
}

// Detect if on mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    $('body').addClass('mobile-view');
}

/**
 * Initialize sortable functionality
 */
function initializeSortable() {
    $("#sortable").sortable({
        handle: isMobile ? null : '.handle', // Mobile: whole item; Desktop: handle only
        delay: isMobile ? 600 : 0,           // Mobile: long press to drag
        cancel: isMobile ? '' : "input,textarea,button,select,option", // Mobile: allow dragging from inputs
        containment: "window",               // Allow dragging outside parent for scrolling
        tolerance: "pointer",
        scroll: true,
        scrollSensitivity: 150,              // Increased sensitivity for easier scrolling (covers navbar)
        scrollSpeed: 20,                     // Faster scroll speed
        stop: function (event, ui) {
            resort();
        }
    });
    $("#sortable").disableSelection();
}

/**
 * Resort items and update indices
 */
function resort() {
    let i = 0;
    $('.input-group').each(function (k, el) {
        $(el).find(".jschecked").attr("name", 'checked[' + i + ']');
        $(el).find(".jschecked").attr("id", 'checked[' + i + ']');
        $(el).find(".jscheckedlabel").attr("for", 'checked[' + i + ']');
        $(el).find(".jsquantity").attr("name", 'quantity[' + i + ']');
        $(el).find(".jsquantity").attr("id", 'quantity[' + i + ']');
        $(el).find(".jsitem").attr("name", 'item[' + i + ']');
        $(el).find(".jsitem").attr("id", 'item[' + i + ']');
        $(el).find(".inputindent").attr("name", 'indent[' + i + ']');
        $(el).find(".inputindent").attr("id", 'indent[' + i + ']');
        i++;
    });
}

function sortView() {
    $('.fa-up-down-left-right').each(function () {
        $(this).toggleClass('d-inline-block d-none');
    });
    resize();
}

/**
 * Toggle checkbox view
 */
function checkboxView() {
    $('.items-checkbox').each(function () {
        $(this).toggleClass('d-inline-block d-none');
    });
    resize();
}

/**
 * Toggle quantity view
 */
function quantityView() {
    $('.items-quantity').each(function () {
        $(this).toggleClass('d-inline-flex d-none');
    });
    resize();
}

/**
 * Update total count
 */
function totalCount() {
    let k = 0;
    $('.jsitem').each(function (i, e) {
        k++;
        $('.totalCount').val(k);
    });
}

/**
 * Resize overlay checkboxes
 */
function resize() {
    $('ul#sortable li').each(function () {
        const height = $(this).height();
        const pt = parseFloat($(this).css('padding-top'));
        const pb = parseFloat($(this).css('padding-bottom'));
        const heightTotal = height + pt + pb;
        $(this).find('div.overlay-check').css('height', heightTotal);
    });
}

/**
 * Show alert message
 */
function showAlert(a, b, c) {
    $(".popup-alert").addClass(b);
    $(".popup-alert").empty();
    $(".popup-alert").append(a);
    $(".popup-alert").fadeIn(200);
    if (c == null || c == "") {
        $(".popup-alert").delay(2800);
    } else {
        $(".popup-alert").delay(c);
    }
    $(".popup-alert").fadeOut(200);
    setTimeout(() => {
        $(".popup-alert").removeClass(b);
    }, 5000);
}

/**
 * Validate and save form
 */
async function validateForm() {
    const title = document.forms["listNew"]["title"].value;

    if (!title || title === "") {
        showAlert('<span class="d-block w-100 text-start"><b>Error</b></span>Please add a title before saving.', "border-danger");
        return false;
    }

    // Collect form data
    const items = [];
    $('.jsitem').each(function (index) {
        const itemText = $(this).val();
        if (itemText) {  // Only include non-empty items
            // Get the actual field name to extract the correct index
            const fieldName = $(this).attr('name'); // e.g., "item[2]"
            const fieldIndex = fieldName.match(/\[(\d+)\]/)[1]; // Extract "2"

            items.push({
                checkbox: $(`input[name="checked[${fieldIndex}]"]`).is(':checked') ? 1 : 0,
                quantity: parseInt($(`input[name="quantity[${fieldIndex}]"]`).val()) || 0,
                item: itemText,
                indent: parseInt($(`input[name="indent[${fieldIndex}]"]`).val()) || 0
            });
        }
    });

    const listData = {
        name: title,
        settings: {
            sort: $('#sort-view').is(':checked'),
            checkbox: $('#checkmark-view').is(':checked'),
            quantity: $('#quantity-view').is(':checked')
        },
        items: items
    };

    try {
        let response;
        if (isEditMode && currentListId) {
            // Update existing list
            response = await API.updateList(currentListId, listData);
        } else {
            // Create new list
            response = await API.createList(listData);
            currentListId = response.id;
        }

        showAlert('<span class="d-block w-100 text-start"><b>Success</b></span>List saved.', 'border-success');

        // Update URL if creating new list
        if (!isEditMode) {
            const url = new URL(window.location.href);
            url.searchParams.set("p", "edit");
            url.searchParams.set("l", currentListId);
            history.pushState({}, "", url);

            // Switch to edit mode
            isEditMode = true;
            $('.edit-buttons').removeClass('d-none');
            $('.save-sq').css('border-top-right-radius', '0');
            $('.save-sq').css('border-bottom-right-radius', '0');
            $('#newlist').val('2');
        }

        $("#listNew").dirty("setAsClean");

    } catch (error) {
        console.error('Error saving list:', error);
        showAlert('<span class="d-block w-100 text-start"><b>Error</b></span>Failed to save list.', "border-danger");
    }
}

/**
 * Delete entire list
 */
async function deleteFullList() {
    if (!currentListId) return;

    try {
        $('form').dirty('setAsClean');
        await API.deleteList(currentListId);
        window.location.href = '/home.html';
    } catch (error) {
        console.error('Error deleting list:', error);
        showAlert('<span class="d-block w-100 text-start"><b>Error</b></span>Failed to delete list.', "border-danger");
    }
}

// Event Handlers

// Form submission
$('#listNew').submit(function (event) {
    event.preventDefault();
    validateForm();
});

// Delete item button
$(document).on('click', '.jsdelete', function (event) {
    event.preventDefault();
    if ($(this).data('confirming')) {
        $(this).closest('li').remove();
        $("#listNew").dirty("refreshEvents");
        if ($('ul#sortable li').length < 1) {
            addRow();
        }
        resort();
        totalCount();
        $(this).data('confirming', false);
    } else {
        $(this).data('confirming', true);
        $(this).focus();
    }
});

// Reset delete button on blur
$(document).on('blur', '.jsdelete', function () {
    $(this).data('confirming', false);
});

// Indent button
$(document).on('click', '.jsindent', function (event) {
    event.preventDefault();
    $(this).blur(); // Remove focus from button (fixes mobile active state)
    $(this).find('[data-fa-i2svg]').toggleClass('fa-arrow-right fa-arrow-left');
    if ($(this).prev().val() == 1) {
        $(this).prev().val('0');
    } else {
        $(this).prev().val('1');
    }
    $(this).closest('li div.row').toggleClass('ms-5');
    // Removed auto-focus on textarea - user complained about this behavior
});

// Update list title in delete modal
$("#title").blur(function () {
    $("span.list-title").empty();
    $("span.list-title").append($("#title").val());
});

// Collapse settings on outside click
$(document).click(function (event) {
    const $settings = $(".settings-body");
    const _opened = $settings.hasClass("show");
    if (_opened && $(event.target).closest('.settings-body').length === 0) {
        $settings.collapse('hide');
    }
});

// Window resize handler
$(window).on("resize", function () {
    resize();
});

// Keyboard shortcuts
$(window).keydown(function (event) {
    // Detect if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (event.keyCode == 13) {
        if (isMobile) {
            // On mobile: Enter adds new row (no shift required)
            event.preventDefault();
            addRow();
        } else {
            // On desktop: Enter disabled, Shift+Enter adds row
            if (!event.shiftKey) {
                event.preventDefault();
                showAlert('<span class="d-block w-100 text-start"><b>Notice</b></span><span class="d-block w-100 text-start">Return disabled.</span>Try "Shift+Enter" to add a new row.', 'border-warning', 800);
                return false;
            } else {
                event.preventDefault();
                addRow();
            }
        }
    }
});

// Share button
const shareButton = document.getElementById("share-btn");
if (shareButton) {
    shareButton.addEventListener("click", (e) => {
        if (navigator.share) {
            navigator.share({
                title: 'CheckList',
                text: 'Take a look at this list!',
                url: window.location.origin + '/share.html?l=' + currentListId,
            })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(window.location.origin + '/share.html?l=' + currentListId);
            showAlert('<span class="d-block w-100 text-start"><b>Success</b></span>Shareable link copied to clipboard.', 'border-success');
        }
    });
}

// Window load handler
$(window).on('load', function () {
    resize();
});
