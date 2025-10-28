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
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.15)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.1)';
            navbar.style.backdropFilter = 'none';
        }
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

            // ---- CROSS-PAGE LINK (e.g. enquiry.html) ----
            if (href.includes('.html')) {
                return; // Let browser navigate
            }

            // ---- SAME-PAGE ANCHOR (e.g. #about) ----
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ===================== 4. AUTO-SCROLL ON PAGE LOAD WITH HASH =====================
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }

    // ===================== 5. ACTIVE LINK ON SCROLL =====================
    const setActiveLinkOnScroll = () => {
        if (!navbar) return;
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        const navHeight = navbar.offsetHeight + 30;

        sections.forEach(sec => {
            const top = sec.offsetTop - navHeight;
            const height = sec.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                current = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}` || href.endsWith(`#${current}`)) {
                link.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', setActiveLinkOnScroll);
    setActiveLinkOnScroll();

    // ===================== 6. PROGRESS BARS =====================
    if (progressBars.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.getAttribute('data-width');
                    bar.style.width = `${width}%`;
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

    // ===================== 9. YEARS EXPERIENCE =====================
    const yearsEl = document.getElementById('years-experience');
    if (yearsEl) {
        const startYear = 2022;
        const years = new Date().getFullYear() - startYear;
        yearsEl.textContent = years;
    }

    // ===================== 10. ENQUIRY FORM (ONLY ON ENQUIRY.HTML) =====================
    const form = document.getElementById('contactForm');
    if (form) {
        const alertBox  = document.getElementById('alertBox');
        const submitBtn = form.querySelector('.submit-btn');
        const loader    = submitBtn.querySelector('.loader');
        const btnText   = submitBtn.querySelector('span');

        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                document.getElementById('service').value = card.dataset.service;
            });
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            if (form.honeypot.value) return;

            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            loader.style.display = 'block';

            setTimeout(() => {
                loader.style.display = 'none';
                submitBtn.disabled = false;
                btnText.textContent = 'Send Secure Message';

                alertBox.textContent = "Message sent securely! I'll reply within 24 hours.";
                alertBox.className = 'alert success';
                alertBox.style.display = 'block';
                setTimeout(() => alertBox.style.display = 'none', 5000);

                form.reset();
                document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
                document.getElementById('service').value = '';
            }, 1500);
        });
    }

       // ===================== 11. MARK ACTIVE PAGE ON LOAD =====================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Clear all active states first
    navLinks.forEach(link => link.classList.remove('active'));

    // Set active based on current page
    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    // ===================== 12. FORCE "HOME" ACTIVE ON INDEX.HTML LOAD =====================
    if (currentPage === 'index.html' || currentPage === '' || window.location.pathname === '/') {
        const homeLink = Array.from(navLinks).find(link => 
            link.getAttribute('href') === '#home' || 
            link.textContent.trim().toLowerCase() === 'home'
        );
        if (homeLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            homeLink.classList.add('active');
        }
    }
});
