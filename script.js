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

// Handle Contact Form Submission
function handleContactSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    // Construct mailto link
    const subject = encodeURIComponent(`DTMP Contact Form - ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const targetEmail = atob("a3Njb3JlbGFic0BnbWFpbC5jb20="); // Encrypted email
    const mailtoUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
    
    // Open default email client robustly
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = 'rgba(52, 199, 89, 0.9)'; // Green success color
    
    toast.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-circle-check"></i>
                <span>Opening your email client...</span>
            </div>
            <div style="font-size: 0.85rem; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); margin-top: 5px;">
                Didn't open? <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${subject}&body=${body}" target="_blank" style="color: #fff; text-decoration: underline; font-weight: bold;">Click here to use Web Gmail</a>
            </div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Reset form
    event.target.reset();
    
    // Increased timeout to give users time to click the fallback link
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 10000);
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

