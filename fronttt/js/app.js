(function () {
  'use strict';

  // ─── API Base URL Detection ──────────────────────────────────────────────────
  const API_BASE_URL = (function () {
    if (window.location.protocol === 'file:') return 'http://localhost:3000/api';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if (window.location.port === '3000') return '/api';
      return 'http://localhost:3000/api';
    }
    return '/api';
  })();

  // ─── Global State ────────────────────────────────────────────────────────────
  let cart = JSON.parse(localStorage.getItem('honest_cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('honest_wishlist')) || [];
  let authToken = localStorage.getItem('honest_token') || null;
  let currentUser = JSON.parse(localStorage.getItem('honest_user')) || null;

  let currentPage = 1;
  const productsPerPage = 45;
  let totalProducts = 0;
  let currentSearch = '';
  let currentSort = '';
  let currentProducts = [];

  const storeSettings = {
    delivery: {
      enabled: true,
      fee: 1500,
      freeDeliveryThreshold: 25000,
    },
  };

  // ─── DOM References ──────────────────────────────────────────────────────────
  const productsContainer = document.getElementById('products-container');
  const loadingProducts = document.getElementById('loading-products');
  const emptyProducts = document.getElementById('empty-products');
  const paginationContainer = document.getElementById('pagination-container');
  const cartCountBadge = document.getElementById('cart-count');
  const wishlistCountBadge = document.getElementById('wishlist-count');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSummary = document.getElementById('cart-summary');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    readUrlParams();
    setupEventListeners();
    setupAuthListeners();
    setupProductUploadListeners();
    updateCartDisplay();
    updateWishlistUI();
    updateAuthUI();

    // Verify token validity in background if present
    if (authToken) {
      verifyAuthProfile();
    }

    // Hide preloader
    const preloader = document.querySelector('.preloader-wrapper');
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => (preloader.style.display = 'none'), 400);
      }, 300);
    }

    await loadProducts();
  }

  // ─── URL Parameters ──────────────────────────────────────────────────────────
  function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('page')) currentPage = parseInt(params.get('page')) || 1;
    if (params.has('search')) {
      currentSearch = params.get('search') || '';
      const input = document.getElementById('search-input');
      if (input) input.value = currentSearch;
      const pInput = document.getElementById('products-search-input');
      if (pInput) pInput.value = currentSearch;
    }
    if (params.has('sort')) currentSort = params.get('sort') || '';
  }

  function syncUrlParams() {
    const url = new URL(window.location);
    if (currentPage > 1) url.searchParams.set('page', currentPage);
    else url.searchParams.delete('page');

    if (currentSearch) url.searchParams.set('search', currentSearch);
    else url.searchParams.delete('search');

    if (currentSort) url.searchParams.set('sort', currentSort);
    else url.searchParams.delete('sort');

    window.history.pushState({}, '', url);
    updateActiveFilterBadges();
  }

  // ─── Image Fallback Helper ───────────────────────────────────────────────────
  function getProductImage(p) {
    if (p.imageUrl && typeof p.imageUrl === 'string' && p.imageUrl.startsWith('http')) {
      return p.imageUrl;
    }
    if (p.featuredImage && typeof p.featuredImage === 'string' && p.featuredImage.startsWith('http')) {
      return p.featuredImage;
    }
    if (p.image && typeof p.image === 'string' && p.image.startsWith('http')) {
      return p.image;
    }
    if (Array.isArray(p.images) && p.images[0] && typeof p.images[0] === 'string' && p.images[0].startsWith('http')) {
      return p.images[0];
    }

    // Contextual high-quality images based on product title & category
    const n = (p.name || '').toLowerCase();
    const c = (typeof p.category === 'string' ? p.category : (p.category?.name || '')).toLowerCase();

    if (n.includes('coffee') || c.includes('coffee')) return 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60';
    if (n.includes('tea') || c.includes('tea')) return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60';
    if (n.includes('laptop') || n.includes('computer')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60';
    if (n.includes('phone') || n.includes('smart') || c.includes('electronic')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60';
    if (n.includes('camera')) return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60';
    if (n.includes('tv')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60';
    if (n.includes('bike') || n.includes('moto')) return 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=60';
    if (n.includes('car') || c.includes('driving') || c.includes('transport')) return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60';
    if (n.includes('milk') || c.includes('dairy') || c.includes('egg')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60';
    if (n.includes('fruit') || n.includes('strawberr') || n.includes('vegetable') || c.includes('fruit')) return 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60';
    if (n.includes('cloth') || c.includes('clothing')) return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60';
    if (n.includes('table') || c.includes('furniture')) return 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&auto=format&fit=crop&q=60';
    if (n.includes('oil') || n.includes('amavuta')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60';
    if (n.includes('iron') || n.includes('sheet') || c.includes('construction')) return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60';
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
  }

  // ─── Load Products ───────────────────────────────────────────────────────────
  async function loadProducts() {
    toggleLoading(true);

    const queryParts = [];
    if (currentSearch) queryParts.push(`search=${encodeURIComponent(currentSearch)}`);
    if (currentSort) queryParts.push(`sort=${encodeURIComponent(currentSort)}`);

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    const apiUrl = `${API_BASE_URL}/products${queryString}`;

    try {
      const res = await fetch(apiUrl).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          currentProducts = data;
          totalProducts = data.length;
        } else if (data && data.products) {
          currentProducts = data.products;
          totalProducts = data.totalCount || data.total || currentProducts.length;
        } else {
          currentProducts = window.MOCK_PAGE_1_PRODUCTS || [];
          totalProducts = currentProducts.length;
        }
      } else {
        currentProducts = window.MOCK_PAGE_1_PRODUCTS || [];
        totalProducts = currentProducts.length;
      }
    } catch {
      currentProducts = window.MOCK_PAGE_1_PRODUCTS || [];
      totalProducts = currentProducts.length;
    }

    toggleLoading(false);
    renderProducts();
    renderPagination();
    syncUrlParams();
  }

  function toggleLoading(isLoading) {
    if (loadingProducts) loadingProducts.style.display = isLoading ? 'block' : 'none';
    if (productsContainer) productsContainer.style.display = isLoading ? 'none' : 'block';
    if (emptyProducts) emptyProducts.style.display = 'none';
  }

  function renderProducts() {
    if (!productsContainer) return;
    productsContainer.innerHTML = '';

    if (!currentProducts || currentProducts.length === 0) {
      if (emptyProducts) emptyProducts.style.display = 'block';
      if (paginationContainer) paginationContainer.style.display = 'none';
      return;
    }

    let currentRow = null;
    currentProducts.forEach((p, idx) => {
      if (idx % 3 === 0) {
        currentRow = document.createElement('div');
        currentRow.className = 'row g-3 mb-2';
        productsContainer.appendChild(currentRow);
      }

      const pId = p._id || p.id;
      const img = getProductImage(p);
      const catName = typeof p.category === 'string' ? p.category : (p.category?.name || 'General');
      const price = p.price || (p.sizes && p.sizes[0] && p.sizes[0].price) || 0;
      const originalPrice = p.originalPrice;
      const isSaved = wishlist.includes(pId);

      let discountBadge = '';
      if (originalPrice && originalPrice > price) {
        const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
        discountBadge = `<span class="badge bg-danger">-${pct}%</span>`;
      }

      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 col-sm-6 mb-4';
      col.innerHTML = `
        <div class="product-card-v2">
          <div class="product-img-wrap">
            <div class="product-badge-wrap">${discountBadge}</div>
            <button class="wishlist-btn-v2 ${isSaved ? 'active' : ''}" data-id="${pId}" title="Wishlist">
              <i class="${isSaved ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <a href="#" class="product-link d-flex align-items-center justify-content-center w-100 h-100" data-id="${pId}">
              <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60'">
            </a>
            <div class="qv-overlay">
              <button class="qv-btn" data-id="${pId}">
                <i class="fas fa-eye me-1"></i> Quick View
              </button>
            </div>
          </div>
          <div class="product-body">
            ${catName ? `<div class="product-cat-label">${catName}</div>` : ''}
            <div class="product-name">
              <a href="#" class="product-link" data-id="${pId}">${p.name}</a>
            </div>
            <div class="product-rating-row">
              <span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span class="rating-count">(${Math.floor(Math.random() * 50) + 12})</span>
            </div>
            <div class="price-row">
              <span class="price-main">RWF ${Number(price).toLocaleString()}</span>
              ${originalPrice ? `<span class="price-original">RWF ${Number(originalPrice).toLocaleString()}</span>` : ''}
            </div>
            <div class="product-footer">
              <div class="qty-wrap">
                <button class="qty-btn qty-decrease">−</button>
                <input type="number" class="qty-input" value="1" min="1" max="99">
                <button class="qty-btn qty-increase">+</button>
              </div>
              <button class="add-cart-btn" data-id="${pId}">
                <i class="fas fa-cart-plus"></i>
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      `;

      currentRow.appendChild(col);
    });
  }

  function renderPagination() {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'block';
    let html = `<ul class="pagination justify-content-center">`;
    html += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo; Prev</a>
      </li>
    `;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    if (start > 1) {
      html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
      if (start > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    for (let i = start; i <= end; i++) {
      html += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    if (end < totalPages) {
      if (end < totalPages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }

    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Next &raquo;</a>
      </li>
    `;
    html += `</ul>`;

    paginationContainer.innerHTML = html;
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────────
  function setupEventListeners() {
    // Pagination clicks
    if (paginationContainer) {
      paginationContainer.addEventListener('click', (e) => {
        const link = e.target.closest('[data-page]');
        if (!link) return;
        e.preventDefault();
        const p = parseInt(link.dataset.page);
        if (p && p !== currentPage) {
          currentPage = p;
          loadProducts();
          document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }



    // Top Search bar
    const searchBtn = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    if (searchBtn && searchInput) {
      const execSearch = () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
      };
      searchBtn.addEventListener('click', execSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') execSearch();
      });
    }

    // Products Section search
    const pSearchBtn = document.getElementById('products-search-button');
    const pSearchInput = document.getElementById('products-search-input');
    if (pSearchBtn && pSearchInput) {
      pSearchBtn.addEventListener('click', () => {
        currentSearch = pSearchInput.value.trim();
        currentPage = 1;
        loadProducts();
      });
      pSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          currentSearch = pSearchInput.value.trim();
          currentPage = 1;
          loadProducts();
        }
      });
    }

    // Sort options
    document.querySelectorAll('.sort-option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        currentSort = opt.dataset.sort || '';
        currentPage = 1;
        loadProducts();
      });
    });

    // Product Card Buttons (Add to Cart, Quantity, Wishlist, Quick View)
    if (productsContainer) {
      productsContainer.addEventListener('click', (e) => {
        const target = e.target;

        // Qty controls
        if (target.classList.contains('qty-increase')) {
          const input = target.previousElementSibling;
          if (input) input.value = parseInt(input.value || 1) + 1;
          return;
        }
        if (target.classList.contains('qty-decrease')) {
          const input = target.nextElementSibling;
          if (input && parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
          return;
        }

        // Wishlist
        const wishBtn = target.closest('.wishlist-btn-v2');
        if (wishBtn) {
          e.preventDefault();
          toggleWishlist(wishBtn.dataset.id);
          return;
        }

        // Quick View
        const qvBtn = target.closest('.qv-btn') || target.closest('.product-link');
        if (qvBtn) {
          e.preventDefault();
          const pId = qvBtn.dataset.id;
          const p = currentProducts.find((item) => (item._id || item.id) === pId);
          if (p) openQuickView(p);
          return;
        }

        // Add to Cart
        const addBtn = target.closest('.add-cart-btn');
        if (addBtn) {
          e.preventDefault();
          const pId = addBtn.dataset.id;
          const p = currentProducts.find((item) => (item._id || item.id) === pId);
          const qtyInput = addBtn.closest('.product-footer')?.querySelector('.qty-input');
          const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
          if (p) {
            addToCart(p, qty);
            showToast(`${p.name} added to cart!`, 'success');
          }
        }
      });
    }

    // Clear Cart
    document.getElementById('clear-cart')?.addEventListener('click', () => {
      cart = [];
      saveCart();
      updateCartDisplay();
      showToast('Cart cleared', 'info');
    });

    // Checkout Modal Step Switching
    setupCheckoutFlow();
  }

  // ─── Shopping Cart Operations ────────────────────────────────────────────────
  function addToCart(product, quantity = 1, selectedSize = null) {
    const pId = product._id || product.id;
    const price = selectedSize ? selectedSize.price : product.price || 0;
    const key = selectedSize ? `${pId}_size_${selectedSize.name}` : pId;

    const existing = cart.find((item) => item.key === key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        key,
        id: pId,
        name: product.name,
        price,
        size: selectedSize ? selectedSize.name : null,
        image: getProductImage(product),
        quantity,
      });
    }

    saveCart();
    updateCartDisplay();
  }

  function updateCartDisplay() {
    if (cartCountBadge) {
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountBadge.textContent = count;
    }

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-shopping-basket fa-3x text-muted mb-3"></i>
          <p class="text-muted">Your cart is empty.</p>
        </div>
      `;
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }

    if (cartSummary) cartSummary.style.display = 'block';

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart
      .map((item) => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;
        return `
          <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
            <img src="${item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}" width="60" height="60" style="object-fit:cover;border-radius:8px;">
            <div class="flex-grow-1">
              <h6 class="mb-0 fs-6">${item.name}</h6>
              ${item.size ? `<small class="text-muted d-block">Size: ${item.size}</small>` : ''}
              <small class="text-danger fw-bold">RWF ${item.price.toLocaleString()} x ${item.quantity}</small>
            </div>
            <button class="btn btn-sm btn-outline-danger remove-cart-item" data-key="${item.key}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
      })
      .join('');

    const formattedSub = `RWF ${subtotal.toLocaleString()}`;
    if (cartSubtotalEl) cartSubtotalEl.textContent = formattedSub;
    if (cartTotalEl) cartTotalEl.textContent = formattedSub;

    cartItemsContainer.querySelectorAll('.remove-cart-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        cart = cart.filter((i) => i.key !== key);
        saveCart();
        updateCartDisplay();
      });
    });
  }

  function saveCart() {
    localStorage.setItem('honest_cart', JSON.stringify(cart));
  }

  // ─── Wishlist Operations ─────────────────────────────────────────────────────
  function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter((id) => id !== productId);
      showToast('Removed from wishlist', 'info');
    } else {
      wishlist.push(productId);
      showToast('Saved to wishlist', 'success');
    }
    localStorage.setItem('honest_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
  }

  function updateWishlistUI() {
    if (wishlistCountBadge) wishlistCountBadge.textContent = wishlist.length;
    document.querySelectorAll('.wishlist-btn-v2').forEach((btn) => {
      const isSaved = wishlist.includes(btn.dataset.id);
      btn.classList.toggle('active', isSaved);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isSaved ? 'fas fa-heart' : 'far fa-heart';
      }
    });
  }

  // ─── Quick View Modal ────────────────────────────────────────────────────────
  function openQuickView(product) {
    const modalEl = document.getElementById('quickViewModal');
    if (!modalEl || !window.bootstrap) return;

    document.getElementById('quickview-title').textContent = product.name;
    document.getElementById('quickview-category').textContent =
      typeof product.category === 'string' ? product.category : product.category?.name || 'General';
    document.getElementById('quickview-price').textContent = `RWF ${Number(product.price).toLocaleString()}`;
    document.getElementById('quickview-description').textContent =
      product.description || 'Authentic fresh quality supermarket item.';
    document.getElementById('quickview-main-image').src = getProductImage(product);

    const variantsWrapper = document.getElementById('quickview-variants');
    const sizeGroup = document.getElementById('size-variants');
    if (product.sizes && product.sizes.length > 0) {
      if (variantsWrapper) variantsWrapper.style.display = 'block';
      if (sizeGroup) {
        sizeGroup.innerHTML = `
          <label class="d-block mb-2 fw-bold">Select Size:</label>
          <div class="btn-group" role="group">
            ${product.sizes
              .map(
                (s, idx) => `
              <input type="radio" class="btn-check" name="qv-size" id="size_${idx}" autocomplete="off" ${idx === 0 ? 'checked' : ''} data-price="${s.price}" data-name="${s.name}">
              <label class="btn btn-outline-danger btn-sm" for="size_${idx}">${s.name} (RWF ${Number(s.price).toLocaleString()})</label>
            `
              )
              .join('')}
          </div>
        `;
      }
    } else {
      if (variantsWrapper) variantsWrapper.style.display = 'none';
    }

    const addBtn = document.getElementById('quickview-add-to-cart');
    if (addBtn) {
      addBtn.onclick = () => {
        const qty = parseInt(document.getElementById('quickview-quantity')?.value) || 1;
        const checkedSizeInput = document.querySelector('input[name="qv-size"]:checked');
        const selectedSize = checkedSizeInput
          ? {
              name: checkedSizeInput.dataset.name,
              price: Number(checkedSizeInput.dataset.price),
            }
          : null;

        addToCart(product, qty, selectedSize);
        showToast(`${product.name} added to cart!`, 'success');
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      };
    }

    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  }

  // ─── Checkout Flow & Brevo Email Integration ─────────────────────────────────
  function setupCheckoutFlow() {
    const steps = ['customer-info', 'delivery', 'review', 'confirm', 'complete'];

    const showStep = (idx) => {
      steps.forEach((s, i) => {
        const el = document.getElementById(`step-${s}`);
        if (el) el.style.display = i === idx ? 'block' : 'none';
      });
    };

    document.querySelectorAll('.next-step').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextId = btn.dataset.step;
        const idx = steps.indexOf(nextId);
        if (idx !== -1) {
          if (nextId === 'review') populateOrderReview();
          showStep(idx);
        }
      });
    });

    document.querySelectorAll('.prev-step').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prevId = btn.dataset.step;
        const idx = steps.indexOf(prevId);
        if (idx !== -1) showStep(idx);
      });
    });

    document.getElementById('place-order-btn')?.addEventListener('click', async () => {
      const orderRef = 'NH-' + Math.floor(100000 + Math.random() * 900000);
      const name = document.getElementById('fullName')?.value || 'Valued Customer';
      const email = document.getElementById('customerEmail')?.value || 'client@example.com';
      const address = document.getElementById('address')?.value || 'Kigali, Rwanda';
      const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const fee = subtotal >= storeSettings.delivery.freeDeliveryThreshold ? 0 : storeSettings.delivery.fee;
      const totalAmount = subtotal + fee;

      document.getElementById('order-reference').textContent = orderRef;

      showStep(4); // step-complete
      cart = [];
      saveCart();
      updateCartDisplay();
      showToast('Order Placed Successfully!', 'success');
    });
  }

  function populateOrderReview() {
    const name = document.getElementById('fullName')?.value || '';
    const email = document.getElementById('customerEmail')?.value || '';
    const phone = document.getElementById('phoneNumber')?.value || '';
    const address = document.getElementById('address')?.value || '';

    const summaryName = document.getElementById('summary-name');
    if (summaryName) summaryName.textContent = name;
    const summaryPhone = document.getElementById('summary-phone');
    if (summaryPhone) summaryPhone.textContent = '+250 ' + phone;
    const summaryAddress = document.getElementById('summary-address');
    if (summaryAddress) summaryAddress.textContent = address;

    const tbody = document.getElementById('summary-items');
    if (tbody) {
      let sub = 0;
      tbody.innerHTML = cart
        .map((i) => {
          const total = i.price * i.quantity;
          sub += total;
          return `
            <tr>
              <td>${i.name} ${i.size ? `(${i.size})` : ''}</td>
              <td class="text-center">${i.quantity}</td>
              <td class="text-end">RWF ${i.price.toLocaleString()}</td>
              <td class="text-end">RWF ${total.toLocaleString()}</td>
            </tr>
          `;
        })
        .join('');

      const fee = sub >= storeSettings.delivery.freeDeliveryThreshold ? 0 : storeSettings.delivery.fee;
      const subEl = document.getElementById('summary-subtotal');
      if (subEl) subEl.textContent = `RWF ${sub.toLocaleString()}`;
      const delEl = document.getElementById('summary-delivery');
      if (delEl) delEl.textContent = fee === 0 ? 'FREE' : `RWF ${fee.toLocaleString()}`;
      const totEl = document.getElementById('summary-total');
      if (totEl) totEl.textContent = `RWF ${(sub + fee).toLocaleString()}`;
    }
  }

  // ─── Authentication Integration ──────────────────────────────────────────────
  function updateAuthUI() {
    const userLabel = document.getElementById('header-username');
    const avatarImg = document.getElementById('header-avatar-img');
    const toggleBtn = document.getElementById('account-dropdown-toggle');
    const menu = document.getElementById('account-dropdown-menu');

    if (currentUser && authToken) {
      // User is logged in
      if (userLabel) userLabel.textContent = currentUser.name || 'My Account';
      if (avatarImg) {
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=1E6C41&color=fff`;
      }
      if (toggleBtn) {
        toggleBtn.removeAttribute('data-bs-target');
        toggleBtn.setAttribute('data-bs-toggle', 'dropdown');
      }
      if (menu) {
        menu.style.display = '';
        const nameEl = document.getElementById('menu-user-name');
        if (nameEl) nameEl.textContent = currentUser.name;
        const emailEl = document.getElementById('menu-user-email');
        if (emailEl) emailEl.textContent = currentUser.email;
        const roleEl = document.getElementById('menu-user-role');
        if (roleEl) {
          roleEl.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Customer';
          roleEl.className = currentUser.role === 'admin' ? 'badge bg-danger mt-1' : 'badge bg-success mt-1';
        }
      }
    } else {
      // User is signed out
      if (userLabel) userLabel.textContent = 'Sign In';
      if (avatarImg) {
        avatarImg.src = 'https://ui-avatars.com/api/?name=Customer&background=1E6C41&color=fff';
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('data-bs-toggle', 'modal');
        toggleBtn.setAttribute('data-bs-target', '#accountModal');
      }
      if (menu) menu.style.display = 'none';
    }
  }

  async function verifyAuthProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user || currentUser;
        localStorage.setItem('honest_user', JSON.stringify(currentUser));
        updateAuthUI();
      } else if (res.status === 401) {
        // Token expired
        handleLogout(false);
      }
    } catch {
      // Network failure, keep offline cache
    }
  }

  function setupAuthListeners() {
    // Sign In Form
    const loginForm = document.getElementById('auth-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('login-alert-box');
        const spinner = document.getElementById('login-spinner');
        const submitBtn = document.getElementById('login-submit-btn');

        if (alertBox) alertBox.classList.add('d-none');
        if (spinner) spinner.classList.remove('d-none');
        if (submitBtn) submitBtn.disabled = true;

        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;

        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (res.ok && data.token) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('honest_token', authToken);
            localStorage.setItem('honest_user', JSON.stringify(currentUser));

            updateAuthUI();
            showToast(`Welcome back, ${currentUser.name}!`, 'success');

            const modal = window.bootstrap?.Modal.getInstance(document.getElementById('accountModal'));
            if (modal) modal.hide();
            loginForm.reset();
          } else {
            if (alertBox) {
              alertBox.textContent = data.message || 'Invalid email or password.';
              alertBox.classList.remove('d-none');
            }
          }
        } catch {
          if (alertBox) {
            alertBox.textContent = 'Unable to connect to authentication server.';
            alertBox.classList.remove('d-none');
          }
        } finally {
          if (spinner) spinner.classList.add('d-none');
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Sign Up Form
    const signupForm = document.getElementById('auth-signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('signup-alert-box');
        const spinner = document.getElementById('signup-spinner');
        const submitBtn = document.getElementById('signup-submit-btn');

        if (alertBox) alertBox.classList.add('d-none');
        if (spinner) spinner.classList.remove('d-none');
        if (submitBtn) submitBtn.disabled = true;

        const name = document.getElementById('signup-name')?.value.trim();
        const email = document.getElementById('signup-email')?.value.trim();
        const password = document.getElementById('signup-password')?.value;

        try {
          const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await res.json();

          if (res.ok && data.token) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('honest_token', authToken);
            localStorage.setItem('honest_user', JSON.stringify(currentUser));

            updateAuthUI();
            showToast(`Account created! Welcome, ${currentUser.name}!`, 'success');

            const modal = window.bootstrap?.Modal.getInstance(document.getElementById('accountModal'));
            if (modal) modal.hide();
            signupForm.reset();
          } else {
            if (alertBox) {
              alertBox.textContent = data.message || 'Registration failed.';
              alertBox.classList.remove('d-none');
            }
          }
        } catch {
          if (alertBox) {
            alertBox.textContent = 'Unable to connect to authentication server.';
            alertBox.classList.remove('d-none');
          }
        } finally {
          if (spinner) spinner.classList.add('d-none');
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Switch to Reset tab from Login link
    document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      const resetTabBtn = document.getElementById('tab-reset-btn');
      if (resetTabBtn && window.bootstrap) {
        new window.bootstrap.Tab(resetTabBtn).show();
      }
    });

    // Forgot Password OTP Request
    const forgotForm = document.getElementById('auth-forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('reset-alert-box');
        const spinner = document.getElementById('forgot-spinner');
        const submitBtn = document.getElementById('forgot-submit-btn');

        if (alertBox) alertBox.classList.add('d-none');
        if (spinner) spinner.classList.remove('d-none');
        if (submitBtn) submitBtn.disabled = true;

        const email = document.getElementById('forgot-email')?.value.trim();

        try {
          const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await res.json();

          if (res.ok) {
            document.getElementById('reset-step-1')?.classList.add('d-none');
            document.getElementById('reset-step-2')?.classList.remove('d-none');
            if (alertBox) {
              alertBox.className = 'alert alert-success py-2 px-3 small';
              alertBox.textContent = '6-Digit reset code sent to your email!';
              alertBox.classList.remove('d-none');
            }
          } else {
            if (alertBox) {
              alertBox.className = 'alert alert-danger py-2 px-3 small';
              alertBox.textContent = data.message || 'Could not process request.';
              alertBox.classList.remove('d-none');
            }
          }
        } catch {
          if (alertBox) {
            alertBox.className = 'alert alert-danger py-2 px-3 small';
            alertBox.textContent = 'Failed to reach reset service.';
            alertBox.classList.remove('d-none');
          }
        } finally {
          if (spinner) spinner.classList.add('d-none');
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Reset Password with Code
    const resetForm = document.getElementById('auth-reset-form');
    if (resetForm) {
      resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('reset-alert-box');
        const spinner = document.getElementById('reset-spinner');
        const submitBtn = document.getElementById('reset-submit-btn');

        if (spinner) spinner.classList.remove('d-none');
        if (submitBtn) submitBtn.disabled = true;

        const email = document.getElementById('forgot-email')?.value.trim();
        const code = document.getElementById('reset-code')?.value.trim();
        const newPassword = document.getElementById('reset-newpassword')?.value;

        try {
          const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword }),
          });

          const data = await res.json();

          if (res.ok) {
            showToast('Password updated! Please sign in.', 'success');
            const loginTabBtn = document.getElementById('tab-login-btn');
            if (loginTabBtn && window.bootstrap) {
              new window.bootstrap.Tab(loginTabBtn).show();
            }
            document.getElementById('reset-step-1')?.classList.remove('d-none');
            document.getElementById('reset-step-2')?.classList.add('d-none');
            resetForm.reset();
            forgotForm?.reset();
          } else {
            if (alertBox) {
              alertBox.className = 'alert alert-danger py-2 px-3 small';
              alertBox.textContent = data.message || 'Invalid code or password.';
              alertBox.classList.remove('d-none');
            }
          }
        } catch {
          if (alertBox) {
            alertBox.className = 'alert alert-danger py-2 px-3 small';
            alertBox.textContent = 'Failed to connect to reset service.';
            alertBox.classList.remove('d-none');
          }
        } finally {
          if (spinner) spinner.classList.add('d-none');
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Logout Button
    document.getElementById('menu-logout-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout(true);
    });
  }

  function handleLogout(showNotification = true) {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('honest_token');
    localStorage.removeItem('honest_user');
    updateAuthUI();
    if (showNotification) showToast('Signed out successfully.', 'info');
  }

  // ─── Add Product Modal Operations ────────────────────────────────────────────
  function setupProductUploadListeners() {
    const addProductForm = document.getElementById('add-product-form');
    if (!addProductForm) return;

    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('add-product-alert');
      const spinner = document.getElementById('add-prod-spinner');
      const submitBtn = document.getElementById('add-prod-submit-btn');

      if (!authToken) {
        if (alertBox) {
          alertBox.textContent = 'You must be logged in to add a product.';
          alertBox.classList.remove('d-none');
        }
        return;
      }

      if (alertBox) alertBox.classList.add('d-none');
      if (spinner) spinner.classList.remove('d-none');
      if (submitBtn) submitBtn.disabled = true;

      const name = document.getElementById('new-prod-name')?.value.trim();
      const price = document.getElementById('new-prod-price')?.value;
      const description = document.getElementById('new-prod-description')?.value.trim();
      const fileInput = document.getElementById('new-prod-file');
      const imageUrl = document.getElementById('new-prod-imageurl')?.value.trim();

      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', 'General');
      formData.append('price', price);
      formData.append('description', description);

      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      } else {
        formData.append('imageUrl', getProductImage({ name, category: 'General' }));
      }

      try {
        const res = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          showToast(`Product "${name}" published successfully!`, 'success');
          addProductForm.reset();
          const modal = window.bootstrap?.Modal.getInstance(document.getElementById('addProductModal'));
          if (modal) modal.hide();

          // Refresh catalog
          await loadProducts();
        } else {
          if (alertBox) {
            alertBox.textContent = data.message || 'Failed to create product.';
            alertBox.classList.remove('d-none');
          }
        }
      } catch {
        if (alertBox) {
          alertBox.textContent = 'Network error while uploading product.';
          alertBox.classList.remove('d-none');
        }
      } finally {
        if (spinner) spinner.classList.add('d-none');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ─── Filter Badges & Reset ───────────────────────────────────────────────────
  function updateActiveFilterBadges() {
    const container = document.getElementById('active-filters-container');
    const list = document.getElementById('active-filters');
    if (!container || !list) return;

    list.innerHTML = '';
    let hasFilters = false;

    if (currentSearch) {
      hasFilters = true;
      list.innerHTML += `
        <span class="badge bg-primary p-2 d-inline-flex align-items-center gap-2">
          Search: "${currentSearch}"
          <i class="fas fa-times cursor-pointer" onclick="window.clearFilter('search')"></i>
        </span>
      `;
    }

    if (currentSort) {
      hasFilters = true;
      list.innerHTML += `
        <span class="badge bg-secondary p-2 d-inline-flex align-items-center gap-2">
          Sort: ${currentSort}
          <i class="fas fa-times cursor-pointer" onclick="window.clearFilter('sort')"></i>
        </span>
      `;
    }

    container.style.display = hasFilters ? 'block' : 'none';
  }

  window.clearFilter = function (type) {
    if (type === 'search') {
      currentSearch = '';
      const input = document.getElementById('search-input');
      if (input) input.value = '';
      const pInput = document.getElementById('products-search-input');
      if (pInput) pInput.value = '';
    }
    if (type === 'sort') currentSort = '';
    currentPage = 1;
    loadProducts();
  };

  // ─── Toast Feedback ──────────────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle text-success' : 'fa-info-circle text-primary'} me-2"></i>
      <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
})();
