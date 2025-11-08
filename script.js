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

emailjs.init('2ahNZz2uLYhQWjryo');

/* ==== CONFIG ==== */
const SUPABASE_URL = 'https://rrvrtbaiuspojtunkuxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydnJ0YmFpdXNwb2p0dW5rdXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDgzODksImV4cCI6MjA3NzcyNDM4OX0.qHQcbRA_F9_NtoFbIlNuwnCKev_Dc2Eu-xtKcZK3WdI';
const FORMSPREE_URL = 'https://formspree.io/f/xqagoldw';
const EMAILJS_SERVICE_ID = 'service_xn1q9x6';
const EMAILJS_TEMPLATE_ID = 'template_hpkihwk';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let captchaToken = null;
const modal = document.getElementById('reviewModal');
const form = document.getElementById('reviewForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('status');

/* ==== CAPTCHA ==== */
window.onCaptchaSuccess = t => { 
  captchaToken = t; 
  btn.disabled = false; 
};

/* ==== MODAL ==== */
function openModal() { modal.classList.add('show'); }
function closeModal() {
  modal.classList.remove('show');
  form.reset();
  btn.disabled = true;
  status.innerHTML = '';
  hcaptcha.reset();
  captchaToken = null;
}
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.querySelector('.close-btn')?.addEventListener('click', closeModal);

/* ==== UTILS ==== */
const stars = n => '★★★★★'.slice(0,n) + '☆☆☆☆☆'.slice(n);
const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

/* ==== AVATAR UPLOAD ==== */
async function uploadAvatar(file, id) {
  const ext = file.name.split('.').pop().toLowerCase();
  const name = `${id}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(name, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(name);
  return data.publicUrl;
}

/* ==== FORMSPREE (Admin) ==== */
async function sendAdminEmail(fd) {
  await fetch(FORMSPREE_URL, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
}

/* ==== EMAILJS (Client) ==== */
async function sendClientEmail(name, email) {
  const res = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { name, to_email: email });
  if (res.status !== 200) throw new Error('Email failed');
}

/* ==== SUBMIT REVIEW ==== */
form.onsubmit = async e => {
  e.preventDefault();
  if (!captchaToken) { 
    status.innerHTML = '<p class="error">Complete CAPTCHA.</p>'; 
    return; 
  }

  btn.disabled = true;
  btn.textContent = 'Submitting…';

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const rating = +document.getElementById('rating').value;
  const message = document.getElementById('message').value.trim();
  const file = document.getElementById('avatar').files[0];

  if (!file) { 
    status.innerHTML = '<p class="error">Upload a picture.</p>'; 
    btn.disabled = false; 
    btn.textContent = 'Submit Review'; 
    return; 
  }

  if (file.size > 2*1024*1024) { 
    status.innerHTML = '<p class="error">Image ≤ 2 MB.</p>'; 
    btn.disabled = false; 
    btn.textContent = 'Submit Review'; 
    return; 
  }

  try {
    // 1. Insert review with approved: true
    const { data, error: insErr } = await supabase
      .from('reviews')
      .insert({ name, email, rating, message, approved: true, likes: 0 })
      .select();
    if (insErr) throw insErr;
    if (!data?.[0]) throw new Error('Failed to create review');
    const review = data[0];

    // 2. Upload avatar
    const avatarUrl = await uploadAvatar(file, review.id);

    // 3. Save avatar URL
    const { error: updErr } = await supabase
      .from('reviews')
      .update({ avatar_url: avatarUrl })
      .eq('id', review.id);
    if (updErr) throw updErr;

    // 4. Notify admin (log errors but don’t fail)
    try {
      const fd = new FormData(e.target);
      fd.append('_subject', 'New Review');
      await sendAdminEmail(fd);
    } catch(err) {
      console.warn('Admin email failed:', err);
    }

    // 5. Thank client (log errors but don’t fail)
    try {
      await sendClientEmail(name, email);
    } catch(err) {
      console.warn('Client email failed:', err);
    }

    // 6. Show success
    status.innerHTML = '<p class="success">Thank you! Review received.</p>';

    setTimeout(() => {
      closeModal();
      loadReviews(); // Refresh reviews immediately
    }, 1800);

  } catch (err) {
    console.error('Submit error:', err);
    status.innerHTML = `<p class="error">${err.message || 'Something went wrong'}</p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Review';
    captchaToken = null;
  }
};

/* ==== LOAD REVIEWS ==== */
async function loadReviews() {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, review_replies(*)')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  const container = document.getElementById('reviewsContainer');
  if (!reviews?.length) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;">No reviews yet. Be the first!</p>';
    return;
  }

  container.innerHTML = reviews.map(r => {
    const likes = r.likes ?? 0;
    const avatar = r.avatar_url || 'https://via.placeholder.com/40?text=?';
    return `
      <div class="review" data-id="${r.id}">
        <div class="review-header">
          <img src="${avatar}" alt="${esc(r.name)}" class="review-avatar" onerror="this.src='https://via.placeholder.com/40?text=?'">
          <div>
            <strong>${esc(r.name)}</strong>
            <span class="rating">${stars(r.rating)}</span>
          </div>
        </div>
        <p>${esc(r.message)}</p>
        <div class="actions">
          <button onclick="likeReview('${r.id}', this)" class="like-btn">Like <span class="like-count">${likes}</span></button>
          <button onclick="toggleReplyForm('${r.id}')">Reply</button>
        </div>
        <div class="reply-form" id="form-${r.id}"></div>
        <div class="replies">
          ${(r.review_replies || []).filter(x => x.approved).map(x => `
            <div class="reply">
              <strong>${esc(x.name)}</strong>
              <small>${new Date(x.created_at).toLocaleDateString()}</small><br>
              ${esc(x.message)}
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

/* ==== LIKE ==== */
window.likeReview = async (id, btn) => {
  if (btn.disabled) return;
  const el = btn.querySelector('.like-count');
  const old = +el.textContent || 0;
  el.textContent = old + 1;
  btn.disabled = true;
  try {
    const { data } = await supabase.from('reviews').select('likes').eq('id', id).single();
    await supabase.from('reviews').update({ likes: (data?.likes || 0) + 1 }).eq('id', id);
  } catch { el.textContent = old; }
  btn.disabled = false;
};

/* ==== REPLY ==== */
window.toggleReplyForm = id => {
  const c = document.getElementById(`form-${id}`);
  if (c.classList.contains('show')) { c.classList.remove('show'); return; }
  if (!c.dataset.init) {
    c.innerHTML = `<form onsubmit="submitReply(event,'${id}')">
      <input type="text" placeholder="Name" required class="reply-name">
      <textarea placeholder="Reply..." required class="reply-msg"></textarea>
      <button type="submit">Send</button>
    </form>`;
    c.dataset.init = '1';
  }
  c.classList.add('show');
};

window.submitReply = async (e, id) => {
  e.preventDefault();
  const f = e.target;
  const name = f.querySelector('.reply-name').value.trim();
  const msg = f.querySelector('.reply-msg').value.trim();
  if (!name || !msg) return;
  const { error } = await supabase.from('review_replies').insert({ review_id: id, name, message: msg, approved: true });
  if (error) alert('Error: ' + error.message);
  else { alert('Reply sent!'); f.reset(); f.parentElement.classList.remove('show'); }
};

/* ==== REALTIME ==== */
supabase.channel('public')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reviews' }, p => {
    const el = document.querySelector(`[data-id="${p.new.id}"] .like-count`);
    if (el) el.textContent = p.new.likes ?? 0;
  })
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'review_replies' }, p => {
    if (!p.new.approved) return;
    const c = document.querySelector(`[data-id="${p.new.review_id}"] .replies`);
    if (c) c.insertAdjacentHTML('beforeend', `<div class="reply"><strong>${esc(p.new.name)}</strong>
      <small>${new Date(p.new.created_at).toLocaleDateString()}</small><br>${esc(p.new.message)}</div>`);
  })
  .subscribe();

/* ==== INIT ==== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.write-btn')?.addEventListener('click', openModal);
  loadReviews();
});

(function(){
    const openBtn = document.getElementById('openImageBtn');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const closeBtn = document.getElementById('closeModalBtn');
    const backdrop = document.getElementById('modalBackdrop');
    const openInNewTab = document.getElementById('openInNewTab');

    function openModal(imgUrl){
      modalImg.src = imgUrl;
      openInNewTab.href = imgUrl;
      modal.setAttribute('aria-hidden', 'false');
      // trap focus: move focus to close button
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    }
    function closeModal(){
      modal.setAttribute('aria-hidden', 'true');
      modalImg.src = '';
      document.body.style.overflow = '';
      openBtn.focus();
    }

    openBtn.addEventListener('click', function(){
      const url = this.dataset.image;
      openModal(url);
    });
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // keyboard support
    document.addEventListener('keydown', function(e){
      if (modal.getAttribute('aria-hidden') === 'false' && e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    });

    // optional: allow clicking image to zoom (toggle class)
    modalImg.addEventListener('click', function(){
      this.classList.toggle('zoomed');
      if (this.classList.contains('zoomed')) {
        this.style.maxHeight = 'none';
        this.style.maxWidth = 'none';
      } else {
        this.style.maxHeight = '';
        this.style.maxWidth = '';
      }
    });
  })();
