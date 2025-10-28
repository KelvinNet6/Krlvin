// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.15)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.1)';
        }
    });

    // Smooth scrolling for nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Active nav link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        const navHeight = document.querySelector('.navbar').offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Animate progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.getAttribute('data-width');
                progressBar.style.width = width + '%';
            }
        });
    }, observerOptions);

    progressBars.forEach(bar => observer.observe(bar));

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Animate stats on scroll
    const statItems = document.querySelectorAll('.stat-item h3');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetValue = target.textContent.replace('%', '');
                let current = 0;
                const increment = targetValue / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= targetValue) {
                        target.textContent = targetValue + '%';
                        clearInterval(timer);
                    } else {
                        target.textContent = Math.floor(current) + '%';
                    }
                }, 20);
            }
        });
    });

    statItems.forEach(item => statObserver.observe(item));

    // Project card hover effects
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});
function updateYearsExperience() {
            const startYear = 2022;
            const currentYear = new Date().getFullYear();
            const yearsExperience = currentYear - startYear;
            document.getElementById('years-experience').textContent = yearsExperience;
        }

        // Run on page load
        updateYearsExperience();

// enquiry.js - Form logic for enquiry.html

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const alertBox = document.getElementById('alertBox');
    const submitBtn = form.querySelector('.submit-btn');
    const loader = submitBtn.querySelector('.loader');
    const btnText = submitBtn.querySelector('span');

    // Service Card Selector
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const service = card.getAttribute('data-service');
            document.getElementById('service').value = service;
        });
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot check
        if (form.honeypot.value) return;

        // Show loading
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        loader.style.display = 'block';

        // Simulate send (replace with real backend)
        setTimeout(() => {
            loader.style.display = 'none';
            submitBtn.disabled = false;
            btnText.textContent = 'Send Secure Message';

            showAlert('Message sent securely! I\'ll reply within 24 hours.', 'success');
            form.reset();
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            document.getElementById('service').value = '';
        }, 1500);
    });

    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = `alert ${type}`;
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000);
    }
});
