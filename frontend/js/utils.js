// Utility Functions

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date short
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function stripHtml(value) {
    if (!value) {
        return '';
    }

    const temp = document.createElement('div');
    temp.innerHTML = value;
    return temp.textContent || temp.innerText || '';
}

function sanitizeRichTextHtml(value) {
    if (typeof window.richTextSanitizeHtml === 'function') {
        return window.richTextSanitizeHtml(value);
    }

    const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'H3', 'H4', 'BLOCKQUOTE']);
    const template = document.createElement('template');
    template.innerHTML = value || '';

    const visit = (node) => {
        Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!allowedTags.has(child.tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) {
                        fragment.appendChild(child.firstChild);
                    }
                    child.replaceWith(fragment);
                    return;
                }

                Array.from(child.attributes).forEach((attribute) => {
                    child.removeAttribute(attribute.name);
                });
            }

            visit(child);
        });
    };

    visit(template.content);
    return template.innerHTML.trim();
}

function renderRichText(value) {
    return sanitizeRichTextHtml(value || '');
}

function buildPdfUrl(pdfPath) {
    if (!pdfPath) return '#';
    if (/^https?:\/\//i.test(pdfPath)) return pdfPath;
    return pdfPath;
}

// Show loading
function showLoading(container = document.body) {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.innerHTML = '<div class="spinner"></div>';
    container.appendChild(loadingEl);
}

// Hide loading
function hideLoading(container = document.body) {
    const loadingEl = container.querySelector('.loading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

// Show alert
function showAlert(message, type = 'info', container = document.body) {
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    container.insertBefore(alertEl, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertEl.remove();
    }, 5000);
}

// Get alert icon
function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Validate form
function validateForm(formEl) {
    const inputs = formEl.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Clear form
function clearForm(formEl) {
    formEl.reset();
    formEl.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Calculate progress percentage
function calculateProgress(answered, total) {
    if (total === 0) return 0;
    return Math.round((answered / total) * 100);
}

// Create progress bar
function createProgressBar(percentage) {
    return `
        <div class="progress">
            <div class="progress-bar" style="width: ${percentage}%">
                ${percentage}%
            </div>
        </div>
    `;
}

// Navigate to page
function navigateTo(page) {
    window.location.href = `/frontend/pages/${page}`;
}

// Get URL parameter
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Format phone number
function formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

// Validate phone
function isValidPhone(phone) {
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone);
}

// Validate password
function isValidPassword(password) {
    return password && password.length >= 6;
}

// Export to CSV
function exportToCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Convert to CSV
function convertToCSV(data) {
    if (!data || !data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}
