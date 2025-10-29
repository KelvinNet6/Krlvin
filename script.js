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

    // ---- Real Formspree + SMTP Auto-Reply ----
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Honeypot guard
        if (form.honeypot.value) return;

        // UI: disable button + show loader
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        loader.style.display = 'inline-block';
        alertBox.style.display = 'none';

        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const service = formData.get('service');
        const message = formData.get('message');

        try {
            // 1. Send to Formspree (you get the lead)
            const fsResponse = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (!fsResponse.ok) {
                const data = await fsResponse.json();
                throw new Error(data.error || 'Formspree failed');
            }

            // 2. Send Auto-Reply via Gmail SMTP
            await Email.send({
                SecureToken: "sebtsrpvowwiskvw", 
                To: email,
                From: "kelvin.net6@gmail.com",
                Subject: `Thanks ${name}! I Got Your Enquiry`,
                Body: `
                    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div style="background: #1a1a2e; color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0;">Thanks, ${name}!</h1>
                            <p style="margin: 10px 0 0;">Your enquiry is received</p>
                        </div>
                        <div style="padding: 30px; line-height: 1.7; color: #333;">
                            <p>Hey <strong>${name}</strong>,</p>
                            <p>Got your message about <strong>${getServiceName(service)}</strong>. I’m reviewing it now and will reply <strong>within 24 hours</strong>.</p>
                            <hr style="border: 1px solid #eee; margin: 20px 0;">
                            <p><em>"${message}"</em></p>
                            <hr style="border: 1px solid #eee; margin: 20px 0;">
                            <p>Need it faster? <a href="https://wa.me/27672911605" style="color: #4e9af1; text-decoration: none;">WhatsApp me</a></p>
                            <br>
                            <p><strong>Kelvin (Krlvin)</strong><br>
                            Full-Stack Dev & Pentester<br>
                            <a href="https://krlvin.net" style="color: #4e9af1;">krlvin.net</a></p>
                        </div>
                        <div style="background: #16213e; color: #aaa; text-align: center; padding: 20px; font-size: 0.9em;">
                            <p>This is an automated reply — reply to this email to respond.</p>
                        </div>
                    </div>
                `
            });

            // ---- SUCCESS ----
            alertBox.textContent = "Message sent! Check your inbox for confirmation.";
            alertBox.className = 'alert success';

        } catch (err) {
            console.error("Form error:", err);
            alertBox.textContent = err.message.includes('Formspree') 
                ? 'Formspree error. Try again or use WhatsApp.' 
                : 'Auto-reply failed. You still got the lead via email.';
            alertBox.className = 'alert error';
        } finally {
            // ---- Always restore UI ----
            setTimeout(() => {
                loader.style.display = 'none';
                submitBtn.disabled = false;
                btnText.textContent = 'Send Secure Message';
                alertBox.style.display = 'block';

                // Auto-hide alert
                setTimeout(() => alertBox.style.display = 'none', 5000);

                // Reset form & cards only on success
                if (alertBox.classList.contains('success')) {
                    form.reset();
                    document.querySelectorAll('.service-card')
                            .forEach(c => c.classList.remove('selected'));
                    document.getElementById('service').value = '';
                }
            }, 300);
        }
    });
}

// Helper: Convert service code to name
function getServiceName(code) {
    const map = {
        pentest: "Python Pentesting & Scanning",
        webapp: "Full-Stack Web App",
        mobile: "Mobile App Development",
        cloud: "Cloud & Hosting Setup",
        consult: "Security Consultation",
        other: "Other / Custom"
    };
    return map[code] || code;
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
