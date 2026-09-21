// Unify CMS V6 - shared custom JS
// Loaded on every page (next to the Bootstrap script tags). Each init
// function guards itself against the elements/libraries it needs, so it's
// safe for all of them to run on every page - only the ones matching the
// current page's markup actually do anything.

document.addEventListener('DOMContentLoaded', () => {
  initHeroOrderCta();
  initCheckoutPage();
  initUpsellPage();
  initPlaceholderFooterLinks();
});

// INDEX + CHECKOUT: "Verified Customer Feedback" slider - disabled for now,
// so it renders as a static 3-up/1-up grid instead (see the
// .landing-feedback-slider:not(.slick-initialized) fallback rules in
// css/style.css and css/responsive.css). To re-enable: uncomment the Slick
// CDN <link>/<script> tags in index.html and checkout.html, and uncomment
// initFeedbackSlider() below and its call above.
// function initFeedbackSlider() {
//   var $feedbackSlider = $('.landing-feedback-slider');
//
//   function toggleFeedbackDots() {
//     var hasMultiplePages = $feedbackSlider.find('.slick-dots li').length > 1;
//     $feedbackSlider.toggleClass('has-multiple-pages', hasMultiplePages);
//   }
//
//   $feedbackSlider
//     .on('init reInit breakpoint', toggleFeedbackDots)
//     .slick({
//       dots: true,
//       arrows: false,
//       slidesToShow: 3,
//       slidesToScroll: 1,
//       infinite: true,
//       responsive: [
//         {
//           breakpoint: 768,
//           settings: {
//             slidesToShow: 1,
//           },
//         },
//       ],
//     });
// }

// INDEX: hero order form + repeated "ORDER NOW & SAVE 50%" CTAs
function initHeroOrderCta() {
  // Repeated "ORDER NOW & SAVE 50%" CTAs scroll back up to the order form
  document.querySelectorAll('.order-now-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // The order form's own submit button proceeds to the next checkout step
  const heroOrderBtn = document.querySelector('.landing-form-card .landing-btn-full');
  if (heroOrderBtn) {
    heroOrderBtn.addEventListener('click', () => {
      window.location.href = 'checkout.html';
    });
  }
}

// CHECKOUT: package selection, live order summary, countdown timer, billing
// checkbox, cross-sell add/remove
function initCheckoutPage() {
  const packageCheckboxes = document.querySelectorAll('.package-radio input[type="checkbox"]');
  if (!packageCheckboxes.length) return;

  // Update UI based on checkbox state
  const updateCardState = () => {
    packageCheckboxes.forEach(cb => {
      const card = cb.closest('.package-card');
      if (!card) return;

      const header = card.querySelector('.package-header');
      const badge = card.querySelector('.free-shipping-badge');
      const btn = card.querySelector('.package-price-action button');

      if (cb.checked) {
        card.classList.add('selected-package');
        if (header) header.classList.remove('unselected-header');
        if (badge) badge.classList.remove('text-muted');
        if (btn) {
          btn.className = 'selct-button btn-selected';
          btn.textContent = 'SELECTED';
        }
      } else {
        card.classList.remove('selected-package');
        if (header) header.classList.add('unselected-header');
        if (badge) badge.classList.add('text-muted');
        if (btn) {
          btn.className = 'btn-select';
          btn.textContent = 'SELECT';
        }
      }
    });
    updateOrderSummary();
  };

  // Live order summary: selected package + any added cross-sell items
  const updateOrderSummary = () => {
    const rowsEl = document.getElementById('summaryLiveRows');
    const totalEl = document.getElementById('summaryLiveTotal');
    if (!rowsEl || !totalEl) return;

    const parsePrice = (text) => parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
    let total = 0;
    let rowsHtml = '';

    const selectedCard = document.querySelector('.package-card.selected-package');
    if (selectedCard) {
      const name = selectedCard.querySelector('.package-name').textContent.trim();
      const priceText = selectedCard.querySelector('.package-price').textContent.trim();
      total += parsePrice(priceText);
      rowsHtml += `<div class="summary-live-row"><span class="summary-live-name">${name}</span><span class="summary-live-price">${priceText}</span></div>`;
    }

    document.querySelectorAll('.cross-sell-item').forEach((item) => {
      const btn = item.querySelector('button');
      const added = btn && btn.textContent.trim().toUpperCase() === 'REMOVE';
      if (!added) return;
      const name = item.querySelector('.cross-sell-name').textContent.trim();
      const priceText = item.querySelector('.cross-sell-price').textContent.trim();
      total += parsePrice(priceText);
      rowsHtml += `<div class="summary-live-row"><span class="summary-live-name">${name}</span><span class="summary-live-price">${priceText}</span></div>`;
    });

    rowsEl.innerHTML = rowsHtml;
    totalEl.textContent = `$${total.toFixed(2)}`;
  };

  // Handle checkbox toggles
  packageCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // If this one was checked, uncheck all others to mimic radio behavior
      if (checkbox.checked) {
        packageCheckboxes.forEach(cb => {
          if (cb !== checkbox) cb.checked = false;
        });
      }
      updateCardState();
    });
  });

  // Handle clicking the SELECT / SELECTED buttons directly
  document.querySelectorAll('.package-price-action button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.package-card');
      const cb = card.querySelector('.package-radio input[type="checkbox"]');
      if (cb) {
        // Toggle logic: if not checked, check it. If checked, uncheck it.
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change'));
      }
    });
  });

  // Handle countdown timer
  const timerElements = document.querySelectorAll('.countdown-timer');
  if (timerElements.length) {
    let timeLeft = 9 * 60 + 59; // 9 minutes and 59 seconds

    const timerInterval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerElements.forEach(el => el.textContent = "00:00");
        return;
      }

      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const label = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      timerElements.forEach(el => el.textContent = label);
    }, 1000);
  }

  // Handle billing checkbox toggle
  const billingCheckbox = document.querySelector('.custom-checkbox');
  const billingForm = document.getElementById('billing-form-container');

  if (billingCheckbox && billingForm) {
    billingCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        billingForm.style.display = 'none';
      } else {
        billingForm.style.display = 'block';
      }
    });
  }

  // Handle cross-sell buttons text + style toggle
  document.querySelectorAll('.cross-sell-item button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.textContent.trim().toUpperCase() === 'ADD') {
        btn.textContent = 'REMOVE';
        btn.classList.remove('btn-add');
        btn.classList.add('btn-remove');
      } else {
        btn.textContent = 'ADD';
        btn.classList.remove('btn-remove');
        btn.classList.add('btn-add');
      }
      updateOrderSummary();
    });
  });

  // Set the initial summary to match the page's starting state
  // (updateCardState() only runs on checkbox change, not on load)
  updateOrderSummary();

  // Completing checkout normally proceeds to the post-purchase upsell
  // offer, but for now RUSH MY ORDER simulates a failed order submission
  // (design review for the error-state modal) instead of navigating on
  const rushOrderBtn = document.querySelector('.btn-rush-order');
  const orderErrorOverlay = document.getElementById('orderErrorOverlay');
  const orderErrorClose = document.getElementById('orderErrorClose');
  if (rushOrderBtn && orderErrorOverlay) {
    rushOrderBtn.addEventListener('click', () => {
      orderErrorOverlay.classList.add('active');
    });
  }
  if (orderErrorClose && orderErrorOverlay) {
    orderErrorClose.addEventListener('click', () => {
      orderErrorOverlay.classList.remove('active');
    });
    orderErrorOverlay.addEventListener('click', (e) => {
      if (e.target === orderErrorOverlay) orderErrorOverlay.classList.remove('active');
    });
  }

  // POPUP PREVIEW PAGE ONLY: re-open the error modal after closing it
  const testPopupBtn = document.getElementById('testPopupBtn');
  if (testPopupBtn && orderErrorOverlay) {
    testPopupBtn.addEventListener('click', () => {
      orderErrorOverlay.classList.add('active');
    });
  }

  // CVV tooltip link - no popover UI built yet, so surface the explanation
  // via the native title tooltip instead of a dead "#" jump
  const whatsThisLink = document.querySelector('.whats-this-link');
  if (whatsThisLink) {
    whatsThisLink.setAttribute('title', 'The 3-digit security code on the back of your card (4 digits on the front for Amex).');
    whatsThisLink.addEventListener('click', (e) => e.preventDefault());
  }
}

// UPSELL: accepting or declining both continue on to order confirmation
function initUpsellPage() {
  const upsellButtons = document.querySelectorAll('.btn-upsell-cta, .no-thanks-link');
  if (!upsellButtons.length) return;

  upsellButtons.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'thankyou.html';
    });
  });
}

// ALL PAGES: placeholder footer links (Terms of Service, Refund Policy -
// pages not built yet) shouldn't jump the page to the top when clicked
function initPlaceholderFooterLinks() {
  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });
}
