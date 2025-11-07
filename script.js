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

    // ---- Formspree + EmailJS Auto-Reply ----
    form.addEventListener('submit', async e => {
        e.preventDefault();

        // Honeypot guard
        if (form.honeypot.value) return;

        // UI
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        loader.style.display = 'inline-block';
        alertBox.style.display = 'none';

        const formData = new FormData(form);
        const name    = formData.get('name');
        const email   = formData.get('email');
        const service = formData.get('service');
        const message = formData.get('message');

        try {
            // 1. Formspree – you get the lead
            const fsRes = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (!fsRes.ok) {
                const data = await fsRes.json();
                throw new Error(data.error || 'Formspree failed');
            }

            // 2. EmailJS Auto-Reply
            await sendEmailJSReply({ name, email, service, message });

            // SUCCESS
            alertBox.textContent = "Message sent! Check your inbox for confirmation.";
            alertBox.className = 'alert success';

        } catch (err) {
            console.error("Form error:", err);
            alertBox.textContent = err.message.includes('Formspree')
                ? 'Formspree error – try again or use WhatsApp.'
                : 'Auto-reply failed (you still got the lead).';
            alertBox.className = 'alert error';
        } finally {
            setTimeout(() => {
                loader.style.display = 'none';
                submitBtn.disabled = false;
                btnText.textContent = 'Send Secure Message';
                alertBox.style.display = 'block';
                setTimeout(() => alertBox.style.display = 'none', 5000);

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

/* ---------- EmailJS Helper ---------- */
function sendEmailJSReply({ name, email, service, message }) {
    const params = {
        to_name: name,
        to_email: email,
        service: getServiceName(service),
        message: message
    };

    // Replace these with your actual EmailJS IDs
    const SERVICE_ID = "service_xn1q9x6";
    const TEMPLATE_ID = "template_2fzlahl";

    return emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
        .then(res => {
            console.log("EmailJS auto-reply sent:", res.status, res.text);
        })
        .catch(err => {
            console.error("EmailJS FAILED:", err);
            throw new Error("EmailJS failed");
        });
}

/* ---------- Service-name helper ---------- */
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
/* ==== CONFIG ==== */
const SUPABASE_URL = 'https://rrvrtbaiuspojtunkuxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydnJ0YmFpdXNwb2p0dW5rdXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgzODksImV4cCI6MjA3NzcyNDM4OX0.qHQcbRA_F9_NtoFbIlNuwnCKev_Dc2Eu-xtKcZK3WdI';
const FORMSPREE_URL = 'https://formspree.io/f/xqagoldw';
const supabase = window.supabase.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY) || supabase;

let captchaToken = null;
const modal = document.getElementById('reviewModal');
const reviewForm = document.getElementById('reviewForm');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');

/* ==== hCaptcha ==== */
window.onCaptchaSuccess = function (token) {
  captchaToken = token;
  submitBtn.disabled = false;
};

/* ==== MODAL ==== */
function openModal() { modal.classList.add('show'); }
function closeModal() {
  modal.classList.remove('show');
  reviewForm.reset();
  submitBtn.disabled = true;
  statusDiv.innerHTML = '';
  hcaptcha.reset();
  captchaToken = null;
}
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.querySelector('.close-btn').addEventListener('click', closeModal);

/* ==== UTILS ==== */
const stars = n => '★★★★★'.substring(0, n) + '☆☆☆☆☆'.substring(n);
const escape = str => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/* ==== UPLOAD AVATAR ==== */
async function uploadAvatar(file, reviewId) {
  const ext = file.name.split('.').pop();
  const fileName = `${reviewId}.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return data.publicUrl;
}

/* ==== SUBMIT REVIEW ==== */
reviewForm.onsubmit = async e => {
  e.preventDefault();
  if (!captchaToken) {
    statusDiv.innerHTML = '<p class="error">Please complete the CAPTCHA.</p>';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading...';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const rating = +document.getElementById('rating').value;
  const message = document.getElementById('message').value.trim();
  const avatarFile = document.getElementById('avatar').files[0];

  // Validate file
  if (!avatarFile) {
    statusDiv.innerHTML = '<p class="error">Please upload a profile picture.</p>';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Review';
    return;
  }
  if (avatarFile.size > 2 * 1024 * 1024) {
    statusDiv.innerHTML = '<p class="error">Image must be under 2MB.</p>';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Review';
    return;
  }

  try {
    // 1. Insert review (get ID)
    const { data: [review], error: insertError } = await supabase
      .from('reviews')
      .insert({ name, email, rating, message, approved: false, likes: 0 })
      .select();

    if (insertError) throw insertError;

    // 2. Upload avatar
    const avatarUrl = await uploadAvatar(avatarFile, review.id);

    // 3. Update review with avatar URL
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ avatar_url: avatarUrl })
      .eq('id', review.id);

    if (updateError) throw updateError;

    // 4. Send confirmation email via Formspree
    const formData = new FormData();
    formData.append('_replyto', email);
    formData.append('_subject', 'Your Review is Pending Approval');
    formData.append('message', `
      Hi ${name},

      Thank you for your review on krlvin.net!

      Your review has been submitted and is awaiting moderation.
      We'll notify you once it's live.

      — The krlvin.net Team
    `);

    await fetch(FORMSPREE_URL, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    statusDiv.innerHTML = '<p class="success">Review submitted! Check your email.</p>';
    setTimeout(closeModal, 2000);
  } catch (err) {
    console.error(err);
    statusDiv.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Review';
    captchaToken = null;
  }
};

/* ==== LOAD REVIEWS (with avatar) ==== */
async function loadReviews() {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, review_replies(*)')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  const container = document.getElementById('reviewsContainer');
  if (error || !reviews?.length) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;">No reviews yet. Be the first!</p>';
    return;
  }

  container.innerHTML = reviews.map(r => {
    const likes = r.likes ?? 0;
    return `
      <div class="review" data-id="${r.id}">
        <div class="review-header">
          <img src="${r.avatar_url || 'https://via.placeholder.com/40'}" 
               alt="${escape(r.name)}" 
               class="review-avatar">
          <div>
            <strong>${escape(r.name)}</strong>
            <span class="rating">${stars(r.rating)}</span>
          </div>
        </div>
        <p>${escape(r.message)}</p>
        <div class="actions">
          <button onclick="likeReview('${r.id}', this)" class="like-btn">
            Like <span class="like-count">${likes}</span>
          </button>
          <button onclick="toggleReplyForm('${r.id}')">Reply</button>
        </div>
        <div class="reply-form" id="form-${r.id}"></div>
        <div class="replies">
          ${ (r.review_replies || [])
              .filter(rep => rep.approved)
              .map(rep => `
                <div class="reply">
                  <strong>${escape(rep.name)}</strong>
                  <small>${new Date(rep.created_at).toLocaleDateString()}</small><br>
                  ${escape(rep.message)}
                </div>`).join('') }
        </div>
      </div>`;
  }).join('');
}

/* ==== LIKE, REPLY, REALTIME (unchanged) ==== */
window.likeReview = async (reviewId, btn) => { /* ... same as before ... */ };
window.toggleReplyForm = id => { /* ... same ... */ };
window.submitReply = async (e, reviewId) => { /* ... same ... */ };

const channel = supabase
  .channel('reviews-channel')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reviews' }, payload => {
    const el = document.querySelector(`[data-id="${payload.new.id}"] .like-count`);
    if (el) el.textContent = payload.new.likes ?? 0;
  })
  .subscribe();

window.addEventListener('beforeunload', () => supabase.removeChannel(channel));

/* ==== INIT ==== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.write-btn').addEventListener('click', openModal);
  loadReviews();
});
