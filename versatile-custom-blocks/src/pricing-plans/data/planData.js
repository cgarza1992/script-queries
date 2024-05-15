// Wrap your code in a document-ready event handler
document.addEventListener('DOMContentLoaded', function () {
    // Check for localized data. If it's there, exit.
    if (typeof planDataFree !== 'undefined' || typeof planDataAdvanced !== 'undefined') {
        return;
    } else {
        console.error('Localized data is not defined.');
    }
});
