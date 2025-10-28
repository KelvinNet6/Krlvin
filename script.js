/* ==============================================
   script.js – SINGLE FILE FOR ALL PAGES
   Works on: index.html, enquiry.html, etc.
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ===================== SELECTORS =====================
    const navbar       = document.querySelector('.navbar');
    const navLinks     = document.querySelectorAll('.nav-link');
    const hamburger    = document.querySelector('.hamburger');
    const navMenu      = document.querySelector('.nav-menu');
    const progressBars = document.querySelectorAll('.progress-bar');
    const statItems    = document.querySelectorAll('.stat-item h3');
    const projectCards = document.querySelectorAll('.project-card');

    // ===================== 1. NAVBAR BG ON SCROLL =====================
    const updateNavbarBg = () => {
        if (!navbar) return;
        navbar.style.background = window.scrollY > 100
            ? 'rgba(0, 0, 0, 0.15)'
            : 'rgba(0, 0, 0, 0.1)';
        navbar.style.backdropFilter = window.scrollY > 100 ? 'blur(20px)' : 'none';
    };
    window.addEventListener('scroll', updateNavbarBg);
    updateNavbarBg();

    // ===================== 2. MOBILE MENU =====================
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    // ===================== 3. NAVIGATION: SAME & CROSS PAGE =====================
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');

            // Cross-page: let browser handle
            if (href.includes('.html')) return;

            // Same-page: smooth scroll
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }

            // Only update if not already active
            if (!link.classList.contains('active')) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // ===================== 4. AUTO-SCROLL ON HASH =====================
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 300);
        }
    }

    // ===================== 5. ACTIVE LINK ON SCROLL (IMPROVED) =====================
    const setActiveLinkOnScroll = () => {
        if (!navbar) return;

        const scrollPosition = window.scrollY;
        let current = '';

        // Force "home" when at top (index.html)
        if (scrollPosition < 100 && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
            current = 'home';
        } else {
            const sections = document.querySelectorAll('section[id]');
            const navHeight = navbar.offsetHeight + 30;

            sections.forEach(sec => {
                const top = sec.offsetTop - navHeight;
                const height = sec.offsetHeight;
                if (scrollPosition >= top && scrollPosition < top + height) {
                    current = sec.getAttribute('id');
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}` || href.endsWith(`#${current}`)) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', setActiveLinkOnScroll);

    // ===================== 6. PROGRESS BARS =====================
    if (progressBars.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    bar.style.width = bar.getAttribute('data-width') + '%';
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.7, rootMargin: '0px 0px -50px 0px' });
        progressBars.forEach(bar => observer.observe(bar));
    }

    // ===================== 7. STATS COUNTER =====================
    if (statItems.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const final = parseInt(el.textContent, 10);
                    let start = 0;
                    const step = final / 70;
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= final) {
                            el.textContent = final + '%';
                            clearInterval(timer);
                        } else {
                            el.textContent = Math.floor(start) + '%';
                        }
                    }, 20);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.8 });
        statItems.forEach(item => observer.observe(item));
    }

    // ===================== 8. PROJECT CARD HOVER =====================
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.transition = 'transform 0.3s ease';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // ===================== 10. ENQUIRY FORM =====================
const form = document.getElementById('contactForm');
if (form) {
    const alertBox   = document.getElementById('alertBox');
    const submitBtn  = form.querySelector('.submit-btn');
    const loader     = submitBtn.querySelector('.loader');
    const btnText    = submitBtn.querySelector('span');

    // ---- Service-card quick-select (unchanged) ----
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            document.getElementById('service').value = card.dataset.service;
        });
    });

    // ---- Real Formspree submit (AJAX) ----
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Honeypot guard
        if (form.honeypot.value) return;

        // UI: disable button + show loader
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        loader.style.display = 'inline-block';
        alertBox.style.display = 'none';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // ---- SUCCESS ----
                alertBox.textContent = "Message sent securely! I'll reply within 24 hours.";
                alertBox.className = 'alert success';
            } else {
                // ---- Formspree returned an error (e.g. validation) ----
                const data = await response.json();
                throw new Error(data.error || 'Unknown Formspree error');
            }
        } catch (err) {
            // ---- NETWORK / JS error ----
            alertBox.textContent = err.message || 'Something went wrong. Please try again.';
            alertBox.className = 'alert error';
        } finally {
            // ---- Always restore UI ----
            setTimeout(() => {
                loader.style.display = 'none';
                submitBtn.disabled = false;
                btnText.textContent = 'Send Secure Message';
                alertBox.style.display = 'block';

                // Auto-hide after 5 seconds
                setTimeout(() => alertBox.style.display = 'none', 5000);

                // Reset form & cards only on success
                if (alertBox.classList.contains('success')) {
                    form.reset();
                    document.querySelectorAll('.service-card')
                            .forEach(c => c.classList.remove('selected'));
                    document.getElementById('service').value = '';
                }
            }, 300); // tiny delay so the user sees the loader
        }
    });
}

    // ===================== 11. SET ACTIVE LINK ON PAGE LOAD (FINAL FIX) =====================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isRoot = currentPage === '' || currentPage === 'index.html' || window.location.pathname === '/';
    const isEnquiry = currentPage === 'enquiry.html';

    // Clear all active
    navLinks.forEach(link => link.classList.remove('active'));

    // 1. ENQUIRY PAGE: Activate Enquiry link
    if (isEnquiry) {
        const enquiryLink = Array.from(navLinks).find(l => 
            l.getAttribute('href') === 'enquiry.html' || 
            l.getAttribute('href').includes('enquiry.html#')
        );
        if (enquiryLink) enquiryLink.classList.add('active');
    }

    // 2. INDEX PAGE: Activate Home link
    else if (isRoot) {
        const homeLink = Array.from(navLinks).find(l => 
            l.getAttribute('href') === '#home' || 
            l.textContent.trim().toLowerCase() === 'home'
        );
        if (homeLink) homeLink.classList.add('active');
    }

    // 3. HASH NAVIGATION (e.g. #about, #contact-hero)
    if (window.location.hash) {
        const hash = window.location.hash; // e.g. "#contact-hero"
        const hashLink = Array.from(navLinks).find(l => l.getAttribute('href') === hash);
        if (hashLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            hashLink.classList.add('active');
        }
    }

    // Final scroll check
    setTimeout(setActiveLinkOnScroll, 500);
});
document.addEventListener('DOMContentLoaded', function () {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const yearsExperience = currentYear - startYear;

    const statElement = document.querySelector('#years-experience');
    if (statElement) {
      statElement.textContent = yearsExperience;
    }
  });
