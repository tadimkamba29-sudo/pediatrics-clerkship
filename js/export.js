/**
 * Export and Print logic
 */

function printForm() {
    window.print();
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast') || createToastElement();
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

function createToastElement() {
    const t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
    return t;
}
