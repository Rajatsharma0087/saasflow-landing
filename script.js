// ============================================
// SaaSFlow - script.js
// All interactive behavior
// ============================================

(function () {
    'use strict';

    // ── Scroll Progress Bar ───────────────────
    const progressBar = document.createElement('div');
    progressBar.id    = 'scroll-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', function () {
        const scrolled    = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent     = totalHeight > 0 ? (scrolled / totalHeight) * 100 : 0;
        progressBar.style.width = percent + '%';
    }, { passive: true });

    // ── Mobile Menu ───────────────────────────
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu    = document.getElementById('mobile-menu');
    let menuOpen = false;

    function openMenu() {
        menuOpen = true;
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenuBtn.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.classList.remove('menu-open');
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            menuOpen ? closeMenu() : openMenu();
        });

        // Close on link click
        mobileMenu.querySelectorAll('a, button').forEach(function (el) {
            el.addEventListener('click', closeMenu);
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (menuOpen &&
                !mobileMenu.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {
                closeMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menuOpen) {
                closeMenu();
                mobileMenuBtn.focus();
            }
        });
    }

    // ── Smooth Scroll ─────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const navbar = document.getElementById('navbar');
            const offset = navbar ? navbar.offsetHeight : 72;
            const top    = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // ── Pricing Toggle ────────────────────────
    const pricingToggle   = document.getElementById('pricing-toggle');
    const toggleIndicator = document.getElementById('toggle-indicator');
    const labelMonthly    = document.getElementById('label-monthly');
    const labelYearly     = document.getElementById('label-yearly');
    let isYearly = false;

    function updatePricing() {
        document.querySelectorAll('.price-value').forEach(function (el) {
            const price = isYearly ? el.dataset.yearly : el.dataset.monthly;
            el.textContent = '$' + price;
        });
    }

    function updateToggleUI() {
        if (!pricingToggle) return;

        pricingToggle.setAttribute('aria-checked', String(isYearly));
        toggleIndicator.style.transform = isYearly ? 'translateX(28px)' : 'translateX(0)';

        // Update label colours
        if (labelMonthly) {
            labelMonthly.classList.toggle('text-white',    !isYearly);
            labelMonthly.classList.toggle('text-gray-400',  isYearly);
        }
        if (labelYearly) {
            labelYearly.classList.toggle('text-white',    isYearly);
            labelYearly.classList.toggle('text-gray-400', !isYearly);
        }
    }

    if (pricingToggle) {
        pricingToggle.addEventListener('click', function () {
            isYearly = !isYearly;
            updateToggleUI();
            updatePricing();
        });

        // Keyboard support for switch role
        pricingToggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                isYearly = !isYearly;
                updateToggleUI();
                updatePricing();
            }
        });
    }

    // ── FAQ Accordion ─────────────────────────
    document.querySelectorAll('.faq-button').forEach(function (button) {
        button.addEventListener('click', function () {
            const content    = button.nextElementSibling;
            const parentItem = button.closest('.faq-item');
            const isOpen     = parentItem.classList.contains('is-open');

            // Close all
            document.querySelectorAll('.faq-item').forEach(function (item) {
                item.classList.remove('is-open');
                item.querySelector('.faq-content').classList.remove('open');
                item.querySelector('.faq-button').setAttribute('aria-expanded', 'false');
            });

            // Open clicked item if it was closed
            if (!isOpen) {
                parentItem.classList.add('is-open');
                content.classList.add('open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ── Counter Animation ─────────────────────
    const animatedCounters = new WeakSet();

    function animateCounter(counterEl) {
        if (animatedCounters.has(counterEl)) return;
        animatedCounters.add(counterEl);

        const target   = parseInt(counterEl.dataset.target, 10);
        const duration = 1800;
        const steps    = 60;
        const interval = duration / steps;
        let   step     = 0;

        const timer = setInterval(function () {
            step++;
            const value = Math.min(Math.round((target / steps) * step), target);
            counterEl.textContent = value.toLocaleString();
            if (step >= steps) clearInterval(timer);
        }, interval);
    }

    // ── Intersection Observer (fade + counters) ─
    const fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.counter').forEach(animateCounter);
            fadeObserver.unobserve(entry.target);
        });
    }, {
        threshold:  0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(function (el) {
        fadeObserver.observe(el);
    });

    // ── Active Nav Link on Scroll ─────────────
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            navLinks.forEach(function (link) {
                link.classList.toggle(
                    'active',
                    link.getAttribute('href') === '#' + entry.target.id
                );
            });
        });
    }, { threshold: 0.4 });

    sections.forEach(function (s) { sectionObserver.observe(s); });

    // ── Back to Top ───────────────────────────
    const backToTop = document.getElementById('back-to-top');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── Ripple Effect ─────────────────────────
    // Inject keyframe once
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = '@keyframes ripple { to { transform:scale(4); opacity:0; } }';
    document.head.appendChild(rippleStyle);

    document.querySelectorAll('.glow-button').forEach(function (button) {
        button.addEventListener('click', function (e) {
            const rect   = this.getBoundingClientRect();
            const size   = 100;
            const ripple = document.createElement('span');

            ripple.style.cssText = [
                'position:absolute',
                'border-radius:50%',
                'pointer-events:none',
                'width:'  + size + 'px',
                'height:' + size + 'px',
                'left:'   + (e.clientX - rect.left - size / 2) + 'px',
                'top:'    + (e.clientY - rect.top  - size / 2) + 'px',
                'background:rgba(255,255,255,0.25)',
                'transform:scale(0)',
                'animation:ripple 0.6s linear forwards',
            ].join(';');

            this.appendChild(ripple);
            setTimeout(function () { ripple.remove(); }, 650);
        });
    });

    // ── CTA Email Form ────────────────────────
    const ctaForm   = document.getElementById('cta-form');
    const ctaEmail  = document.getElementById('cta-email');
    const ctaSubmit = document.getElementById('cta-submit');
    const ctaError  = document.getElementById('cta-email-error');

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showCtaError(message) {
        if (!ctaError) return;
        ctaError.textContent = message;
        ctaError.classList.remove('hidden');
        ctaEmail.classList.add('error');
    }

    function clearCtaError() {
        if (!ctaError) return;
        ctaError.textContent = '';
        ctaError.classList.add('hidden');
        ctaEmail.classList.remove('error');
    }

    if (ctaForm && ctaEmail && ctaSubmit) {

        // Clear error on input
        ctaEmail.addEventListener('input', clearCtaError);

        ctaForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = ctaEmail.value.trim();

            if (!email) {
                showCtaError('Please enter your email address.');
                ctaEmail.focus();
                return;
            }

            if (!isValidEmail(email)) {
                showCtaError('Please enter a valid email address.');
                ctaEmail.focus();
                return;
            }

            clearCtaError();

            // Loading state
            const originalText = ctaSubmit.textContent;
            ctaSubmit.disabled     = true;
            ctaSubmit.textContent  = 'Starting...';

            // Simulate API call (replace with real endpoint)
            setTimeout(function () {

                // Show success state
                ctaForm.innerHTML = [
                    '<div class="cta-success">',
                    '  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">',
                    '    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
                    '  </svg>',
                    '  <span>You\'re in! Check your email to get started. 🎉</span>',
                    '</div>',
                ].join('');

                showToast('🎉 Welcome to SaaSFlow! Check your inbox.', 'success');

            }, 1200);
        });
    }

    // ── Toast Notification ────────────────────
    let activeToast = null;

    function showToast(message, type) {
        if (activeToast) {
            activeToast.remove();
            activeToast = null;
        }

        const toast = document.createElement('div');
        toast.className   = 'toast ' + (type || 'success');
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        document.body.appendChild(toast);
        activeToast = toast;

        // Animate in
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.add('show');
            });
        });

        // Animate out after 4s
        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                if (toast.parentNode) toast.remove();
                if (activeToast === toast) activeToast = null;
            }, 300);
        }, 4000);
    }

    // ── Tab Visibility ────────────────────────
    document.addEventListener('visibilitychange', function () {
        document.title = document.hidden
            ? '👋 Come back! | SaaSFlow'
            : 'SaaSFlow - Streamline Your Workflow';
    });

    // ── Console Branding ──────────────────────
    console.log(
        '%c ⚡ SaaSFlow',
        'color:#6366f1; font-size:22px; font-weight:bold;'
    );
    console.log(
        '%c Built with HTML, Tailwind CSS & JavaScript',
        'color:#8b5cf6; font-size:13px;'
    );

})(); // End IIFE
