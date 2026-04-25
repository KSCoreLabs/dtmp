// Fetch latest APK from GitHub Releases API and trigger direct download
async function downloadApk() {
    const btn = document.getElementById('apk-download-btn');
    const icon = btn.querySelector('i');
    const smallText = btn.querySelector('.small-text');
    const largeText = btn.querySelector('.large-text');

    // Show loading state
    icon.className = 'fa-solid fa-spinner fa-spin';
    smallText.textContent = 'Fetching';
    largeText.textContent = 'Latest...';
    btn.disabled = true;

    try {
        const response = await fetch(
            'https://api.github.com/repos/KSCoreLabs/DTMP-Updates/releases/latest',
            { headers: { 'Accept': 'application/vnd.github+json' } }
        );

        if (!response.ok) throw new Error('GitHub API error: ' + response.status);

        const data = await response.json();

        // Find the .apk asset
        const apkAsset = data.assets && data.assets.find(a => a.name.endsWith('.apk'));

        if (!apkAsset) {
            throw new Error('No APK found in the latest release.');
        }

        // Trigger download silently
        const link = document.createElement('a');
        link.href = apkAsset.browser_download_url;
        link.download = apkAsset.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success state briefly
        icon.className = 'fa-solid fa-circle-check';
        smallText.textContent = 'Download';
        largeText.textContent = 'Started!';

        setTimeout(() => {
            icon.className = 'fa-brands fa-android';
            smallText.textContent = 'Download The';
            largeText.textContent = 'APK';
            btn.disabled = false;
        }, 3000);

    } catch (err) {
        console.error('APK download failed:', err);

        // Reset button
        icon.className = 'fa-brands fa-android';
        smallText.textContent = 'Download The';
        largeText.textContent = 'APK';
        btn.disabled = false;

        // Show error toast
        showUnavailableToast('APK Download (check connection)');
    }
}

function showUnavailableToast(platformName) {
    const toastContainer = document.getElementById('toast-container');
    
    // Create new toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Add icon and text
    toast.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>Currently unavailable on <strong>${platformName}</strong> (Under Review)</span>
    `;
    
    // Append to container
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        
        // Wait for animation to finish before removing from DOM
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Close mobile menu if open
        const navLinks = document.querySelector('.nav-links');
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ── Contact Form → Google Sheets (secured) ───────────────────
(function () {
    try {
        // Each segment is base64-encoded. Joined at runtime — not plain text in source.
        // TODO: Replace these placeholders with your new DTMP Google Sheet Apps Script URL chunks
        const _a = atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy8='); // base path (keep this)
        const _b = atob('QUtmeWNidzFPQkxhYllRQjZyX0tuWG05a3dtUUZFRkFqd3oxNA==');  // ID chunk 1 (Replace 'CHUNK1_PLACEHOLDER' with your actual base64)
        const _c = atob('Xzc1VVZTb2RrV0dobWVwZi1SOENXbHNpblY5UzliMW5rVG5Pdw=='); // ID chunk 2 (Replace 'CHUNK2_PLACEHOLDER' with your actual base64)
        const _d = atob('L2V4ZWM=');                                              // /exec (keep this)
        const ENDPOINT = _a + _b + _c + _d;

        // Must exactly match SECRET_TOKEN in your new DTMP Apps Script
        const _tk = atob('RFRNUC0yMDI2LVNFQ1JFVA=='); // Default: DTMP-2026-SECRET

        const form    = document.getElementById('contact-form');
        const btnText = form ? form.querySelector('.cf-btn-text') : null;
        const btnLoad = form ? form.querySelector('.cf-btn-loading') : null;
        const submit  = document.getElementById('cf-submit');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!form.checkValidity()) { form.reportValidity(); return; }

            if (btnText) btnText.hidden = true;
            if (btnLoad) btnLoad.hidden = false;
            if (submit) submit.disabled = true;

            const payload = {
                token:   _tk,
                name:    document.getElementById('cf-name').value.trim(),
                email:   document.getElementById('cf-email').value.trim(),
                subject: 'DTMP Webpage Feedback', // Hardcoded subject for DTMP
                message: document.getElementById('cf-message').value.trim(),
                date:    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            };

            try {
                await fetch(ENDPOINT, {
                    method:  'POST',
                    mode:    'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload),
                });
                showContactToast('success');
                form.reset();
            } catch (fetchErr) {
                showContactToast('error');
            } finally {
                if (btnText) btnText.hidden = false;
                if (btnLoad) btnLoad.hidden = true;
                if (submit) submit.disabled = false;
            }
        });

    } catch (setupErr) {
        // If base64 decode fails, at least stop form from page-refreshing
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                showContactToast('error');
            });
        }
        console.error('[DTMP Contact] Setup error:', setupErr);
    }
}());

function showContactToast(type) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    if (type === 'success') {
        toast.style.background = 'rgba(52, 199, 89, 0.9)'; // Green success
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Message sent successfully! We'll be in touch.</span>`;
    } else {
        toast.style.background = 'rgba(255, 59, 48, 0.9)'; // Red error
        toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>Failed to send message. Please try again.</span>`;
    }
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Populate encrypted email address on page load to prevent scraping
document.addEventListener("DOMContentLoaded", () => {
    const emailDisplay = document.getElementById("contact-email-display");
    if (emailDisplay) {
        emailDisplay.textContent = atob("a3Njb3JlbGFic0BnbWFpbC5jb20=");
    }
});

