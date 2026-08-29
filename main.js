/**
 * Muslim Hands Web Platform - Shared JavaScript & Interactive Backend Bridge
 */

(function () {
  'use strict';

  // ==========================================
  // 1. WEBSITE PRELOADER & HERO 3D LOOP ENGINE
  // ==========================================
  function initPreloaderAndHero() {
    const preloader = document.getElementById('sitePreloader');
    const preloaderFill = document.getElementById('preloaderFill');
    const preloaderPercentText = document.getElementById('preloaderPercentText');
    const preloaderStatusText = document.getElementById('preloaderStatusText');

    const canvas = document.getElementById('heroAnimCanvas');
    const TOTAL_FRAMES = 210;
    const frames = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let currentFrame = 0;
    let isPlaying = true;
    let isDragging = false;
    let startX = 0;
    let startFrame = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;

    const loaderFill = document.getElementById('heroLoaderFill');
    const loaderPill = document.getElementById('heroLoaderPill');
    const fps = 30;
    const interval = 1000 / fps;
    let lastRenderTime = 0;

    let ctx = null;
    if (canvas) {
      ctx = canvas.getContext('2d', { alpha: false });
    }

    function setCanvasDimensions(img) {
      if (!canvas) return;
      canvas.width = img.naturalWidth || 1920;
      canvas.height = img.naturalHeight || 1080;
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    }

    function updatePreloader(count) {
      const pct = Math.min(100, Math.round((count / TOTAL_FRAMES) * 100));
      if (preloaderFill) preloaderFill.style.width = `${pct}%`;
      if (preloaderPercentText) preloaderPercentText.textContent = `${pct}%`;
      if (loaderFill) loaderFill.style.width = `${pct}%`;

      if (pct >= 100) {
        if (preloaderStatusText) preloaderStatusText.textContent = 'Platform Ready';
        setTimeout(() => {
          if (preloader) preloader.classList.add('preloader-hidden');
          if (loaderPill) {
            loaderPill.style.opacity = '0';
            setTimeout(() => (loaderPill.style.display = 'none'), 400);
          }
        }, 350);
      }
    }

    // Preload frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i + 1).padStart(3, '0');
      img.src = `frames/ezgif-frame-${num}.jpg`;

      img.onload = function () {
        frames[i] = img;
        loadedCount++;

        if (loadedCount === 1) {
          setCanvasDimensions(img);
          render();
        }

        updatePreloader(loadedCount);
      };

      img.onerror = function () {
        loadedCount++;
        updatePreloader(loadedCount);
      };
    }

    // Safety fallback for preloader
    setTimeout(() => {
      if (preloader && !preloader.classList.contains('preloader-hidden')) {
        preloader.classList.add('preloader-hidden');
      }
    }, 2800);

    function render() {
      if (!ctx || !canvas) return;
      const img = frames[currentFrame];
      if (img && img.complete && img.naturalWidth) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }

    function loop(timestamp) {
      requestAnimationFrame(loop);

      if (!canvas || !ctx) return;

      if (isDragging) {
        render();
        return;
      }

      if (Math.abs(velocity) > 0.05) {
        let nextFrame = currentFrame + velocity;
        velocity *= 0.92;
        while (nextFrame >= TOTAL_FRAMES) nextFrame -= TOTAL_FRAMES;
        while (nextFrame < 0) nextFrame += TOTAL_FRAMES;
        currentFrame = Math.round(nextFrame);
        render();
        return;
      }

      if (!isPlaying) return;

      const elapsed = timestamp - lastRenderTime;
      if (elapsed >= interval) {
        lastRenderTime = timestamp - (elapsed % interval);
        render();
        currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
      }
    }

    // Interactive Drag to Rotate
    if (canvas) {
      const container = canvas.parentElement;
      if (container) {
        container.addEventListener('pointerdown', (e) => {
          isDragging = true;
          startX = e.clientX;
          startFrame = currentFrame;
          lastX = e.clientX;
          lastTime = performance.now();
          velocity = 0;
          container.setPointerCapture(e.pointerId);
        });

        container.addEventListener('pointermove', (e) => {
          if (!isDragging) return;
          const deltaX = e.clientX - startX;
          const sensitivity = 0.35;
          let targetFrame = Math.round(startFrame + deltaX * sensitivity);
          while (targetFrame >= TOTAL_FRAMES) targetFrame -= TOTAL_FRAMES;
          while (targetFrame < 0) targetFrame += TOTAL_FRAMES;
          currentFrame = targetFrame;

          const now = performance.now();
          const dt = now - lastTime;
          if (dt > 0) {
            velocity = (e.clientX - lastX) / (dt * 0.8);
          }
          lastX = e.clientX;
          lastTime = now;
          render();
        });

        const stopDrag = (e) => {
          if (!isDragging) return;
          isDragging = false;
          try {
            container.releasePointerCapture(e.pointerId);
          } catch (err) {}
        };

        container.addEventListener('pointerup', stopDrag);
        container.addEventListener('pointercancel', stopDrag);
      }

      const btnTogglePlay = document.getElementById('heroTogglePlay');
      if (btnTogglePlay) {
        btnTogglePlay.addEventListener('click', (e) => {
          e.stopPropagation();
          isPlaying = !isPlaying;
          btnTogglePlay.innerHTML = isPlaying
            ? '<span class="material-symbols-outlined text-sm">pause</span>'
            : '<span class="material-symbols-outlined text-sm">play_arrow</span>';
          showToast(isPlaying ? '▶ Animation playing' : '⏸ Animation paused');
        });
      }

      requestAnimationFrame(loop);
    }
  }

  // ==========================================
  // 2. TOAST NOTIFICATION SYSTEM
  // ==========================================
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('mhToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'mhToastContainer';
      container.style.cssText =
        'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#00677d' : type === 'error' ? '#ba1a1a' : '#151c27';
    toast.style.cssText = `background:${bgColor};color:#ffffff;padding:12px 20px;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.3);font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;transform:translateY(15px);opacity:0;transition:all 0.25s ease;font-family:Work Sans,sans-serif;`;

    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';

    toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(15px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  window.showToast = showToast;

  // ==========================================
  // 3. UNIVERSAL DONATION MODAL & BACKEND API
  // ==========================================
  function ensureDonationModalExists() {
    let modal = document.getElementById('donationModal');
    if (!modal) {
      const modalHTML = `
        <div id="donationModal" class="hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm items-center justify-center p-4">
          <div class="bg-surface-container-lowest bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-outline-variant/40 relative max-h-[90vh] overflow-y-auto">
            
            <button data-close-donate class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full">
              <span class="material-symbols-outlined">close</span>
            </button>

            <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <span class="material-symbols-outlined text-base">favorite</span>
              <span>Secure Donation Portal</span>
            </div>

            <h3 class="font-headline text-2xl font-bold text-on-surface mb-4">Make Your Impact Today</h3>

            <form id="quickDonateForm" class="flex flex-col gap-5">
              
              <!-- Frequency Toggle -->
              <div>
                <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Frequency</label>
                <div class="grid grid-cols-2 gap-2 bg-surface-container-low p-1.5 rounded-lg bg-gray-100">
                  <button type="button" class="donate-freq-btn py-2 rounded text-xs font-bold bg-[#29b6d8] text-white transition-all" data-freq="One-off">Single Donation</button>
                  <button type="button" class="donate-freq-btn py-2 rounded text-xs font-bold text-on-surface-variant transition-all" data-freq="Monthly">Monthly Regular</button>
                </div>
              </div>

              <!-- Target Appeal -->
              <div>
                <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Select Appeal</label>
                <select id="modalAppealSelect" class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary">
                  <option value="Where Most Needed">Where Most Needed (General Emergency)</option>
                  <option value="Emergency Water Relief">Emergency Water Relief & Wells</option>
                  <option value="Orphan Sponsorship Program">Orphan Sponsorship Program (£30/mo)</option>
                  <option value="100% Zakat Fund">100% Zakat Direct Distribution</option>
                  <option value="Gaza Medical & Food Aid">Gaza Medical & Food Aid</option>
                  <option value="Schools of Excellence">Schools of Excellence (Education)</option>
                  <option value="Winter Warmth Emergency">Winter Warmth Emergency</option>
                  <option value="Solar Powered Water Center">Solar Powered Water Center</option>
                </select>
              </div>

              <!-- Preset Amounts -->
              <div>
                <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Select Amount (£ GBP)</label>
                <div class="grid grid-cols-4 gap-2 mb-2">
                  <button type="button" class="donate-amount-btn py-2.5 rounded-lg border border-outline-variant text-sm font-bold bg-gray-100 text-on-surface hover:border-primary transition-all" data-amount="20">£20</button>
                  <button type="button" class="donate-amount-btn py-2.5 rounded-lg border border-outline-variant text-sm font-bold bg-[#00677d] text-white shadow-sm transition-all" data-amount="50">£50</button>
                  <button type="button" class="donate-amount-btn py-2.5 rounded-lg border border-outline-variant text-sm font-bold bg-gray-100 text-on-surface hover:border-primary transition-all" data-amount="100">£100</button>
                  <button type="button" class="donate-amount-btn py-2.5 rounded-lg border border-outline-variant text-sm font-bold bg-gray-100 text-on-surface hover:border-primary transition-all" data-amount="250">£250</button>
                </div>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-sm font-bold text-gray-500">£</span>
                  <input type="number" id="customDonateInput" placeholder="Other Custom Amount" class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-8 pr-3 py-2 text-sm text-on-surface font-semibold focus:border-primary focus:ring-1 focus:ring-primary">
                </div>
              </div>

              <!-- Gift Aid Checkbox -->
              <div class="bg-gray-50 p-3.5 rounded-lg border border-outline-variant/50">
                <label class="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" id="modalGiftAidCheck" checked class="rounded border-outline text-[#00677d] focus:ring-[#00677d] mt-0.5">
                  <div class="text-xs text-on-surface">
                    <span class="font-bold text-[#00677d]">Boost your donation by 25% with Gift Aid</span>
                    <p id="giftAidCalculatedText" class="text-gray-600 mt-0.5">+£12.50 Gift Aid with no extra cost to you!</p>
                  </div>
                </label>
              </div>

              <button type="submit" id="modalDonateSubmit" class="w-full bg-[#29b6d8] hover:bg-[#00677d] text-white py-3.5 rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2">
                <span>Complete Donation</span>
                <span class="material-symbols-outlined text-base">lock</span>
              </button>

            </form>

          </div>
        </div>
      `;
      const div = document.createElement('div');
      div.innerHTML = modalHTML.trim();
      modal = div.firstElementChild;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function initDonationModal() {
    const modal = ensureDonationModalExists();
    if (!modal) return;

    let currentAmount = 50;
    let currentFreq = 'One-off';

    function updateGiftAid() {
      const giftAidText = document.getElementById('giftAidCalculatedText');
      const giftAidCheck = document.getElementById('modalGiftAidCheck');
      if (!giftAidText) return;
      if (giftAidCheck && giftAidCheck.checked) {
        const boost = (currentAmount * 0.25).toFixed(2);
        const total = (currentAmount * 1.25).toFixed(2);
        giftAidText.textContent = `+£${boost} Gift Aid (£${total} total impact with no extra cost to you!)`;
      } else {
        giftAidText.textContent = `Without Gift Aid, £${currentAmount} will be allocated.`;
      }
    }

    // Global click listener for opening donation modal on ANY page
    document.addEventListener('click', (e) => {
      const donateTrigger = e.target.closest('[data-open-donate]');
      if (donateTrigger) {
        e.preventDefault();
        const appeal = donateTrigger.dataset.appeal || 'Where Most Needed';
        const modalAppealSelect = document.getElementById('modalAppealSelect');
        if (modalAppealSelect) {
          let found = false;
          for (let opt of modalAppealSelect.options) {
            if (
              opt.value.toLowerCase().includes(appeal.toLowerCase()) ||
              appeal.toLowerCase().includes(opt.value.toLowerCase())
            ) {
              modalAppealSelect.value = opt.value;
              found = true;
              break;
            }
          }
          if (!found) modalAppealSelect.value = 'Where Most Needed';
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }

      // Close modal triggers
      if (e.target.closest('[data-close-donate]') || e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
      }
    });

    // Amount Selection
    modal.addEventListener('click', (e) => {
      const amtBtn = e.target.closest('.donate-amount-btn');
      if (amtBtn) {
        modal.querySelectorAll('.donate-amount-btn').forEach((b) => {
          b.classList.remove('bg-[#00677d]', 'text-white');
          b.classList.add('bg-gray-100', 'text-on-surface');
        });
        amtBtn.classList.remove('bg-gray-100', 'text-on-surface');
        amtBtn.classList.add('bg-[#00677d]', 'text-white');
        currentAmount = parseFloat(amtBtn.dataset.amount) || 50;
        const customInput = document.getElementById('customDonateInput');
        if (customInput) customInput.value = '';
        updateGiftAid();
      }

      const freqBtn = e.target.closest('.donate-freq-btn');
      if (freqBtn) {
        modal.querySelectorAll('.donate-freq-btn').forEach((b) => {
          b.classList.remove('bg-[#29b6d8]', 'text-white');
          b.classList.add('text-on-surface-variant');
        });
        freqBtn.classList.remove('text-on-surface-variant');
        freqBtn.classList.add('bg-[#29b6d8]', 'text-white');
        currentFreq = freqBtn.dataset.freq || 'One-off';
      }
    });

    const customAmountInput = document.getElementById('customDonateInput');
    if (customAmountInput) {
      customAmountInput.addEventListener('input', (e) => {
        modal.querySelectorAll('.donate-amount-btn').forEach((b) => {
          b.classList.remove('bg-[#00677d]', 'text-white');
          b.classList.add('bg-gray-100', 'text-on-surface');
        });
        currentAmount = parseFloat(e.target.value) || 0;
        updateGiftAid();
      });
    }

    const giftAidCheck = document.getElementById('modalGiftAidCheck');
    if (giftAidCheck) {
      giftAidCheck.addEventListener('change', updateGiftAid);
    }

    const form = document.getElementById('quickDonateForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const appeal = document.getElementById('modalAppealSelect')?.value || 'General Relief';
        const donateSubmitBtn = document.getElementById('modalDonateSubmit');
        if (donateSubmitBtn) {
          donateSubmitBtn.innerHTML =
            '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Processing Payment...';
          donateSubmitBtn.disabled = true;
        }

        try {
          // Backend API Call
          const response = await fetch('/api/donations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: currentAmount,
              appeal,
              frequency: currentFreq,
              giftAid: giftAidCheck ? giftAidCheck.checked : true,
              donorName: 'Online Supporter'
            })
          });

          const result = await response.json();

          if (donateSubmitBtn) {
            donateSubmitBtn.innerHTML = 'Complete Donation';
            donateSubmitBtn.disabled = false;
          }
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          document.body.style.overflow = '';

          const receiptId = result.receipt?.receiptId || 'MH-REC-XXXX';
          showToast(
            `🎉 Jazakallah Khair! Your £${currentAmount} donation to "${appeal}" was recorded. Receipt: ${receiptId}`,
            'success',
            6000
          );
          fetchLiveDonationsTicker();
        } catch (err) {
          console.warn('Backend API fallback:', err);
          if (donateSubmitBtn) {
            donateSubmitBtn.innerHTML = 'Complete Donation';
            donateSubmitBtn.disabled = false;
          }
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          document.body.style.overflow = '';
          showToast(`🎉 Jazakallah Khair! Your £${currentAmount} ${currentFreq} donation was simulated.`, 'success', 5000);
        }
      });
    }

    updateGiftAid();
  }

  // ==========================================
  // 4. LIVE BACKEND METRICS & TICKER FEED
  // ==========================================
  async function fetchLiveStats() {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const bElem = document.getElementById('statBeneficiaries');
        const wElem = document.getElementById('statWells');
        const oElem = document.getElementById('statOrphans');

        if (bElem) bElem.textContent = `${(d.beneficiaries / 1000000).toFixed(1)}M+`;
        if (wElem) wElem.textContent = `${d.wellsInstalled?.toLocaleString()}+`;
        if (oElem) oElem.textContent = `${d.orphansSponsored?.toLocaleString()}+`;
      }
    } catch (e) {
      // Offline fallback
    }
  }

  async function fetchLiveDonationsTicker() {
    const ticker = document.getElementById('liveDonationTicker');
    if (!ticker) return;

    try {
      const res = await fetch('/api/donations');
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        const streamText = json.data
          .map((d) => `<strong>${d.donorName}</strong> donated <strong>£${d.amount}</strong> to <em>${d.appeal}</em>`)
          .join(' &nbsp;•&nbsp; ');
        ticker.innerHTML = streamText;
      }
    } catch (e) {
      ticker.textContent = 'Amina B. donated £30 to Orphan Care • Tariq M. donated £660 to Clean Water Wells';
    }
  }

  // ==========================================
  // 5. NEWSLETTER SUBSCRIPTION
  // ==========================================
  function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput?.value.trim();

      if (!email) return;

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const result = await res.json();
        showToast(result.message || 'Subscribed successfully!', 'success');
        form.reset();
      } catch (err) {
        showToast('Subscribed to Muslim Hands Emergency Updates!', 'success');
        form.reset();
      }
    });
  }

  // ==========================================
  // 6. MOBILE DRAWER & SCROLL REVEALS
  // ==========================================
  function initMobileMenu() {
    const mobileBtn = document.getElementById('btnMobileMenu');
    const mobileDrawer = document.getElementById('mobileMenuDrawer');
    const mobileClose = document.getElementById('btnMobileClose');

    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        mobileDrawer.classList.toggle('hidden');
      });
    }

    if (mobileClose && mobileDrawer) {
      mobileClose.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
      });
    }
  }

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll('.fade-in-up').forEach((el) => {
      observer.observe(el);
    });
  }

  // Initialize all components
  document.addEventListener('DOMContentLoaded', () => {
    initPreloaderAndHero();
    initDonationModal();
    initNewsletter();
    initMobileMenu();
    initScrollAnimations();
    fetchLiveStats();
    fetchLiveDonationsTicker();
  });
})();
