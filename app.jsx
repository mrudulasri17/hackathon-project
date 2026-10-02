// ==========================================================================
// STOCKTRUST // NOVA CART INDIA
// React 18 Web Application (Complete Component Architecture)
// ==========================================================================

const { useState, useMemo, useEffect } = React;

// --------------------------------------------------------------------------
// MOCK DATA: STORES & PRODUCTS (INDIAN LOCAL COMMERCE)
// --------------------------------------------------------------------------
const INITIAL_STORES = [
  {
    id: 'store-1',
    name: 'Sharma Kirana Store',
    locality: 'Indiranagar 12th Main, Bengaluru',
    cancellationRate: 0.11, // 11% historical cancellation rate
    rating: 4.6,
    distance: '450m'
  },
  {
    id: 'store-2',
    name: 'Sri Balaji Supermarket',
    locality: 'Koramangala 4th Block, Bengaluru',
    cancellationRate: 0.04, // 4% historical cancellation rate (Very reliable)
    rating: 4.8,
    distance: '650m'
  },
  {
    id: 'store-3',
    name: 'Gupta Provisions & Daily Needs',
    locality: 'HSR Layout Sector 3, Bengaluru',
    cancellationRate: 0.16, // 16% historical cancellation rate (High risk)
    rating: 4.2,
    distance: '1.2km'
  }
];

// Helper to generate timestamps relative to current time
const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Amul Taaza Fresh Toned Milk (1 Litre)',
    category: 'Dairy',
    price: 54,
    emoji: '🥛',
    storeId: 'store-1',
    inStock: true,
    lastUpdated: hoursAgo(1.5), // 1.5 hours ago (Fresh)
    substitute: {
      name: 'Nandini GoodLife Toned Milk (1L)',
      storeName: 'Sri Balaji Supermarket',
      price: 52,
      confidence: 'High',
      distance: '650m'
    }
  },
  {
    id: 'prod-2',
    name: 'Aashirvaad Shudh Chakki Atta (5 kg)',
    category: 'Staples',
    price: 245,
    emoji: '🌾',
    storeId: 'store-1',
    inStock: true,
    lastUpdated: hoursAgo(31), // 31 hours ago (STALE > 24h!)
    substitute: {
      name: 'Fortune Chakki Fresh Atta (5 kg)',
      storeName: 'Sri Balaji Supermarket',
      price: 238,
      confidence: 'High',
      distance: '650m'
    }
  },
  {
    id: 'prod-3',
    name: 'Tata Salt Vacuum Evaporated (1 kg)',
    category: 'Staples',
    price: 28,
    emoji: '🧂',
    storeId: 'store-1',
    inStock: true,
    lastUpdated: hoursAgo(0.5), // 30 mins ago (Fresh)
    substitute: null
  },
  {
    id: 'prod-4',
    name: 'Fortune Sunlite Refined Sunflower Oil (1 Litre)',
    category: 'Oils & Ghee',
    price: 138,
    emoji: '🌻',
    storeId: 'store-1',
    inStock: true,
    lastUpdated: hoursAgo(44), // 44 hours ago (VERY STALE!)
    substitute: {
      name: 'Saffola Gold Pro Healthy Oil (1L)',
      storeName: 'Sri Balaji Supermarket',
      price: 149,
      confidence: 'High',
      distance: '650m'
    }
  },
  {
    id: 'prod-5',
    name: 'Maggi 2-Minute Masala Noodles (Pack of 4)',
    category: 'Snacks',
    price: 56,
    emoji: '🍜',
    storeId: 'store-1',
    inStock: true,
    lastUpdated: hoursAgo(8), // 8 hours ago (Medium freshness)
    substitute: null
  },
  {
    id: 'prod-6',
    name: 'Surf Excel Easy Wash Detergent Powder (1 kg)',
    category: 'Household',
    price: 145,
    emoji: '🧼',
    storeId: 'store-1',
    inStock: false, // Explicitly out of stock
    lastUpdated: hoursAgo(2),
    substitute: {
      name: 'Ariel Complete Detergent Powder (1 kg)',
      storeName: 'Sri Balaji Supermarket',
      price: 140,
      confidence: 'High',
      distance: '650m'
    }
  },
  {
    id: 'prod-7',
    name: 'Mother Dairy Classic Malai Paneer (200g)',
    category: 'Dairy',
    price: 92,
    emoji: '🧀',
    storeId: 'store-1',
    inStock: true,
    lastUpdated: hoursAgo(28), // 28 hours ago (STALE!)
    substitute: {
      name: 'Amul Fresh Malai Paneer (200g)',
      storeName: 'Sri Balaji Supermarket',
      price: 90,
      confidence: 'High',
      distance: '650m'
    }
  },
  {
    id: 'prod-8',
    name: 'Haldiram\'s Nagpur Bhujia Sev (400g)',
    category: 'Snacks',
    price: 110,
    emoji: '🥨',
    storeId: 'store-1',
    inStock: true,
    lastUpdated: hoursAgo(18), // 18 hours ago
    substitute: null
  }
];

// Helper to format hours difference into human readable string
function formatTimeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const days = Math.floor(diffHours / 24);
  return `${diffHours}h ago (${days}d ago)`;
}

// Check if stock update is older than 24 hours
function isStaleStock(isoString) {
  const diffHours = (Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60);
  return diffHours >= 24;
}

// --------------------------------------------------------------------------
// AVAILABILITY CONFIDENCE SCORING ALGORITHM
// --------------------------------------------------------------------------
function calculateConfidence(product, store) {
  if (!product.inStock) {
    return {
      score: 0,
      level: 'Out of Stock',
      badgeText: 'Out of Stock',
      colorClass: 'confidence-low',
      isLow: true,
      reason: 'Marked Out of Stock by store'
    };
  }

  const diffHours = (Date.now() - new Date(product.lastUpdated).getTime()) / (1000 * 60 * 60);
  
  // 1. Freshness Score
  let freshnessWeight = 1.0;
  if (diffHours <= 2) {
    freshnessWeight = 1.0;
  } else if (diffHours <= 12) {
    freshnessWeight = 0.90;
  } else if (diffHours <= 24) {
    freshnessWeight = 0.75;
  } else if (diffHours <= 48) {
    freshnessWeight = 0.50; // Stale penalty
  } else {
    freshnessWeight = 0.30; // Highly stale penalty
  }

  // 2. Store Reliability Factor (Based on store's historical cancellation rate)
  const storeReliability = Math.max(0.4, 1.0 - (store.cancellationRate * 1.8));

  // 3. Combined Score (Percentage 0 to 99%)
  const rawScore = Math.round(freshnessWeight * storeReliability * 100);
  const finalScore = Math.min(99, Math.max(10, rawScore));

  if (finalScore >= 80) {
    return {
      score: finalScore,
      level: 'High Confidence',
      badgeText: `🟢 High (${finalScore}%)`,
      colorClass: 'confidence-high',
      isLow: false,
      reason: `Verified ${formatTimeAgo(product.lastUpdated)} • Store cancellation rate is only ${(store.cancellationRate * 100).toFixed(0)}%`
    };
  } else if (finalScore >= 60) {
    return {
      score: finalScore,
      level: 'Medium Confidence',
      badgeText: `🟡 Medium (${finalScore}%)`,
      colorClass: 'confidence-medium',
      isLow: false,
      reason: `Updated ${formatTimeAgo(product.lastUpdated)} • Moderate stockout risk`
    };
  } else {
    return {
      score: finalScore,
      level: 'Low Confidence',
      badgeText: `🔴 Low (${finalScore}%)`,
      colorClass: 'confidence-low',
      isLow: true,
      reason: `⚠️ Stale stock (${formatTimeAgo(product.lastUpdated)}) + ${(store.cancellationRate * 100).toFixed(0)}% past store cancellation rate increases risk of cancellation.`
    };
  }
}

// --------------------------------------------------------------------------
// MAIN APPLICATION COMPONENT
// --------------------------------------------------------------------------
function App() {
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'customer' | 'impact'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [stores, setStores] = useState(INITIAL_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState('store-1');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Toggle in-stock status in Store Dashboard
  const handleToggleStock = (productId) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextState = !p.inStock;
        showToast(`"${p.name}" marked ${nextState ? 'IN STOCK' : 'OUT OF STOCK'}`);
        return {
          ...p,
          inStock: nextState,
          lastUpdated: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  // Confirm product is fresh/in-stock right now
  const handleConfirmFresh = (productId) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        showToast(`Stock confirmed fresh for "${p.name}"`);
        return {
          ...p,
          inStock: true,
          lastUpdated: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  // Verify all products in store
  const handleVerifyAllStock = () => {
    setProducts(prev => prev.map(p => ({
      ...p,
      lastUpdated: new Date().toISOString()
    })));
    showToast('All items verified fresh! Stale stock warnings cleared.');
  };

  // Swap to substitute in Customer View
  const handleSwitchToSubstitute = (product) => {
    if (!product.substitute) return;
    showToast(`Switched "${product.name}" to "${product.substitute.name}" at ${product.substitute.storeName}!`);
  };

  const currentStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  return (
    <div>
      {/* Top Header */}
      <header className="app-header">
        <div className="app-container">
          <div className="header-top">
            <div className="brand-wrapper">
              <div className="brand-logo-icon">🛡️</div>
              <div className="brand-title-wrap">
                <h1>StockTrust <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>// NOVA CART</span></h1>
                <div className="brand-sub">Hyperlocal Stock Availability & Cancellation Shield</div>
              </div>
            </div>

            <div className="location-pill">
              <span>📍 Bengaluru Urban</span>
              <span>•</span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>Live Network</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="view-tabs-nav" aria-label="Views">
            <button
              className={`tab-btn ${activeTab === 'store' ? 'active' : ''}`}
              onClick={() => setActiveTab('store')}
            >
              <span>🏪 Store Dashboard</span>
              <span className="tab-badge">Merchant</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              <span>🛍️ Customer View</span>
              <span className="tab-badge">Shopper</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'impact' ? 'active' : ''}`}
              onClick={() => setActiveTab('impact')}
            >
              <span>📊 Business Impact</span>
              <span className="tab-badge">ROI Model</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Views */}
      <main className="app-container">
        {activeTab === 'store' && (
          <StoreDashboardView
            store={currentStore}
            products={products}
            onToggleStock={handleToggleStock}
            onConfirmFresh={handleConfirmFresh}
            onVerifyAll={handleVerifyAllStock}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerView
            stores={stores}
            selectedStore={currentStore}
            onSelectStore={setSelectedStoreId}
            products={products}
            onSwitchSubstitute={handleSwitchToSubstitute}
            showToast={showToast}
          />
        )}

        {activeTab === 'impact' && (
          <BusinessImpactView />
        )}
      </main>

      {/* Toast Feedback Alert */}
      {toastMessage && (
        <div className="stock-toast">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// VIEW 1: STORE DASHBOARD COMPONENT
// --------------------------------------------------------------------------
function StoreDashboardView({ store, products, onToggleStock, onConfirmFresh, onVerifyAll }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'stale' | 'in_stock' | 'out_of_stock'
  const [searchQuery, setSearchQuery] = useState('');

  const staleCount = products.filter(p => isStaleStock(p.lastUpdated)).length;
  const inStockCount = products.filter(p => p.inStock).length;

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    if (filter === 'stale') return isStaleStock(p.lastUpdated);
    if (filter === 'in_stock') return p.inStock;
    if (filter === 'out_of_stock') return !p.inStock;
    return true;
  });

  return (
    <div className="view-content">
      {/* Store Header Banner */}
      <div className="dashboard-hero-banner">
        <div className="store-meta-info">
          <div className="store-avatar">🏬</div>
          <div className="store-details">
            <h2>{store.name}</h2>
            <p>
              <span>{store.locality}</span>
              <span>•</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>Active Merchant</span>
            </p>
          </div>
        </div>

        <div className="store-actions-bar">
          <button className="btn btn-primary" onClick={onVerifyAll}>
            <span>⚡ Verify All Fresh (1-Tap)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="filter-pills">
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Items ({products.length})
          </button>
          <button
            className={`filter-pill ${filter === 'stale' ? 'active' : ''}`}
            onClick={() => setFilter('stale')}
            style={staleCount > 0 ? { borderColor: 'rgba(245, 158, 11, 0.5)' } : {}}
          >
            ⚠️ Stale &gt;24h ({staleCount})
          </button>
          <button
            className={`filter-pill ${filter === 'in_stock' ? 'active' : ''}`}
            onClick={() => setFilter('in_stock')}
          >
            In Stock ({inStockCount})
          </button>
          <button
            className={`filter-pill ${filter === 'out_of_stock' ? 'active' : ''}`}
            onClick={() => setFilter('out_of_stock')}
          >
            Out of Stock ({products.length - inStockCount})
          </button>
        </div>

        <div className="search-input-box">
          <span className="search-icon-svg">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search product or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Notice if stale items exist */}
      {staleCount > 0 && filter !== 'stale' && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fbbf24' }}>
            <span>⚠️</span>
            <span><strong>{staleCount} products have not been updated for 24+ hours.</strong> Shoppers will see lower confidence scores and substitute alerts.</span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={() => setFilter('stale')}
          >
            View Stale Items
          </button>
        </div>
      )}

      {/* Product List */}
      <div className="inventory-list">
        {filteredProducts.map(product => {
          const isStale = isStaleStock(product.lastUpdated);
          return (
            <div
              key={product.id}
              className={`product-row-card ${isStale ? 'stale-card' : ''} ${!product.inStock ? 'out-of-stock-card' : ''}`}
            >
              {/* Product Info */}
              <div className="prod-main-col">
                <div className="prod-emoji-wrap">{product.emoji}</div>
                <div>
                  <h4 className="prod-title">{product.name}</h4>
                  <div className="prod-meta-tags">
                    <span className="category-tag">{product.category}</span>
                    <span>•</span>
                    <span className="price-text">₹{product.price}</span>
                  </div>
                </div>
              </div>

              {/* Timestamp & Stale Warning */}
              <div className="prod-time-col">
                <div className="time-badge">
                  <span>🕒</span>
                  <span>{formatTimeAgo(product.lastUpdated)}</span>
                </div>
                {isStale ? (
                  <span className="stale-alert-badge">
                    <span>⚠️</span>
                    <span>Stale Stock (&gt;24h)</span>
                  </span>
                ) : (
                  <span className="fresh-badge">✓ Verified Fresh</span>
                )}
              </div>

              {/* In-Stock Toggle & Quick Touch */}
              <div className="prod-actions-col">
                <div className="toggle-switch-wrap">
                  <span className={`toggle-label ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={() => onToggleStock(product.id)}
                    />
                    <span className="slider-switch"></span>
                  </label>
                </div>

                <button
                  className="btn-confirm-now"
                  title="Update timestamp to Just now"
                  onClick={() => onConfirmFresh(product.id)}
                >
                  <span>🔄</span>
                  <span>Verify</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// VIEW 2: CUSTOMER VIEW COMPONENT
// --------------------------------------------------------------------------
function CustomerView({ stores, selectedStore, onSelectStore, products, onSwitchSubstitute, showToast }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Dairy', 'Staples', 'Snacks', 'Oils & Ghee', 'Household'];

  const displayedProducts = products.filter(p => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="view-content">
      {/* Store Selector & Context */}
      <div className="store-selector-card">
        <div>
          <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Shopping From Nearby Store
          </label>
          <select
            className="store-select-dropdown"
            value={selectedStore.id}
            onChange={(e) => onSelectStore(e.target.value)}
          >
            {stores.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.locality})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="store-stat-pill">
            <span>Rating: </span>
            <strong>⭐ {selectedStore.rating}</strong>
          </div>
          <div className="store-stat-pill">
            <span>Distance: </span>
            <strong>{selectedStore.distance}</strong>
          </div>
          <div className="store-stat-pill">
            <span>Past Cancellation Rate: </span>
            <strong style={{ color: selectedStore.cancellationRate > 0.12 ? '#f87171' : '#34d399' }}>
              {(selectedStore.cancellationRate * 100).toFixed(0)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '16px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Customer Product Cards Grid */}
      <div className="customer-products-grid">
        {displayedProducts.map(product => {
          const confidence = calculateConfidence(product, selectedStore);

          return (
            <div key={product.id} className="customer-prod-card">
              <div>
                <div className="card-top-row">
                  <span style={{ fontSize: '2rem' }}>{product.emoji}</span>
                  <span className={`confidence-score-badge ${confidence.colorClass}`}>
                    {confidence.badgeText}
                  </span>
                </div>

                <div className="prod-info-block">
                  <h3 className="cust-prod-title">{product.name}</h3>
                  <div className="cust-prod-brand">{product.category} • {selectedStore.name}</div>
                  
                  <div className="cust-price-row">
                    <span className="cust-price">₹{product.price}</span>
                    <span className="stock-freshness-text">Updated {formatTimeAgo(product.lastUpdated)}</span>
                  </div>
                </div>

                {/* If Low Confidence: Show Explicit Warning */}
                {confidence.isLow && (
                  <div className="low-conf-warning-box">
                    <div className="warning-header">
                      <span>⚠️</span>
                      <span>High Risk of Cancellation ({confidence.score}%)</span>
                    </div>
                    <p className="warning-desc">
                      {confidence.reason}
                    </p>
                  </div>
                )}

                {/* If Low Confidence & Substitute Available: Suggest Substitute */}
                {confidence.isLow && product.substitute && (
                  <div className="substitute-suggestion-card">
                    <div className="substitute-title">
                      <span>✦</span>
                      <span>Smart Substitute Recommendation</span>
                    </div>
                    <div className="substitute-details">
                      <div>
                        <strong>{product.substitute.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          At {product.substitute.storeName} ({product.substitute.distance}) • ₹{product.substitute.price}
                        </div>
                      </div>
                      <span className="confidence-score-badge confidence-high" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                        98% High
                      </span>
                    </div>
                    <button
                      className="btn-switch-substitute"
                      onClick={() => onSwitchSubstitute(product)}
                    >
                      Switch to Substitute (Guaranteed In Stock)
                    </button>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                className="btn-add-cart"
                onClick={() => showToast(`Added "${product.name}" to cart`)}
                disabled={!product.inStock}
              >
                {!product.inStock ? 'Out of Stock' : '+ Add to Cart'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// VIEW 3: BUSINESS IMPACT CALCULATOR COMPONENT
// --------------------------------------------------------------------------
function BusinessImpactView() {
  const [monthlyOrders, setMonthlyOrders] = useState(38500);
  const [cancellationRate, setCancellationRate] = useState(11); // 11%
  const [unavailableShare, setUnavailableShare] = useState(35); // 35%
  const [aov, setAov] = useState(486); // ₹486
  const [reductionSlider, setReductionSlider] = useState(65); // 65% reduction by StockTrust

  // Deterministic Business Impact Math
  const totalCancelledOrders = (monthlyOrders * (cancellationRate / 100));
  const unavailableCancellations = totalCancelledOrders * (unavailableShare / 100);
  const ordersSavedMonthly = Math.round(unavailableCancellations * (reductionSlider / 100));
  const revenueRecoveredMonthly = Math.round(ordersSavedMonthly * aov);
  const revenueRecoveredAnnual = revenueRecoveredMonthly * 12;

  // New Lower Blended Cancellation Rate
  const remainingCancellations = totalCancelledOrders - ordersSavedMonthly;
  const newCancellationRate = (remainingCancellations / monthlyOrders) * 100;
  const cancellationDrop = cancellationRate - newCancellationRate;

  // Lakhs conversion helper for Indian formatting
  const formatInLakhs = (amount) => {
    const inLakhs = (amount / 100000).toFixed(2);
    return `₹${inLakhs} Lakhs`;
  };

  return (
    <div className="view-content">
      {/* Top Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
          StockTrust Business Impact & Financial ROI
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
          Quantifying how real-time availability confidence & smart store substitution recovers lost GMV on NOVA CART.
        </p>
      </div>

      <div className="impact-layout-grid">
        {/* Left Column: Parameter Inputs */}
        <div className="calc-panel">
          <h3 className="calc-panel-title">
            <span>⚙️</span>
            <span>Platform Operating Parameters</span>
          </h3>

          <div className="input-form-grid">
            <div className="input-group">
              <label className="input-label">Total Monthly Orders</label>
              <input
                type="number"
                className="custom-number-input"
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Baseline Cancellation Rate (%)</label>
              <input
                type="number"
                step="0.5"
                className="custom-number-input"
                value={cancellationRate}
                onChange={(e) => setCancellationRate(Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Share Caused by Stockouts (%)</label>
              <input
                type="number"
                step="1"
                className="custom-number-input"
                value={unavailableShare}
                onChange={(e) => setUnavailableShare(Number(e.target.value) || 0)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Average Order Value (₹ AOV)</label>
              <input
                type="number"
                className="custom-number-input"
                value={aov}
                onChange={(e) => setAov(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Interactive Reduction Slider */}
          <div className="reduction-slider-box">
            <div className="slider-label-row">
              <span className="slider-name">StockTrust Stockout Reduction Cut</span>
              <span className="slider-val-badge">{reductionSlider}% Cut</span>
            </div>
            <input
              type="range"
              className="impact-range"
              min="0"
              max="100"
              step="5"
              value={reductionSlider}
              onChange={(e) => setReductionSlider(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
              <span>0% (No Impact)</span>
              <span>50%</span>
              <span>100% (Zero Stockout Drops)</span>
            </div>
          </div>

          {/* Formula Breakdown */}
          <div className="formula-callout-card">
            <div className="formula-title">📐 Algorithmic Calculation Logic:</div>
            <div className="formula-step">
              1. <strong>Baseline Cancelled Orders:</strong> <code>{monthlyOrders.toLocaleString()} × {cancellationRate}% = {Math.round(totalCancelledOrders).toLocaleString()} orders</code>
            </div>
            <div className="formula-step">
              2. <strong>Stockout-Driven Cancellations:</strong> <code>{Math.round(totalCancelledOrders).toLocaleString()} × {unavailableShare}% = {Math.round(unavailableCancellations).toLocaleString()} orders</code>
            </div>
            <div className="formula-step">
              3. <strong>Orders Saved by StockTrust:</strong> <code>{Math.round(unavailableCancellations).toLocaleString()} × {reductionSlider}% = {ordersSavedMonthly.toLocaleString()} orders/mo</code>
            </div>
            <div className="formula-step">
              4. <strong>Monthly Recovered Revenue:</strong> <code>{ordersSavedMonthly.toLocaleString()} saved × ₹{aov} AOV = ₹{revenueRecoveredMonthly.toLocaleString()}</code>
            </div>
          </div>
        </div>

        {/* Right Column: Outcomes & Chart */}
        <div className="calc-panel">
          <h3 className="calc-panel-title">
            <span>📈</span>
            <span>Recovered Value & Customer Retention</span>
          </h3>

          <div className="results-kpi-grid">
            <div className="kpi-stat-card">
              <div className="kpi-title">Monthly Orders Saved</div>
              <div className="kpi-number text-emerald">+{ordersSavedMonthly.toLocaleString()}</div>
              <div className="kpi-subtext">Rescued from cancellation</div>
            </div>

            <div className="kpi-stat-card">
              <div className="kpi-title">Monthly Revenue Recovered</div>
              <div className="kpi-number text-emerald">₹{revenueRecoveredMonthly.toLocaleString()}</div>
              <div className="kpi-subtext">Direct top-line addition</div>
            </div>

            <div className="kpi-stat-card">
              <div className="kpi-title">Annualized Revenue Recovered</div>
              <div className="kpi-number text-amber">{formatInLakhs(revenueRecoveredAnnual)}</div>
              <div className="kpi-subtext">₹{(revenueRecoveredAnnual).toLocaleString()} / year</div>
            </div>

            <div className="kpi-stat-card">
              <div className="kpi-title">New Cancellation Rate</div>
              <div className="kpi-number" style={{ color: '#38bdf8' }}>
                {newCancellationRate.toFixed(1)}%
              </div>
              <div className="kpi-subtext">Down from {cancellationRate}% (-{cancellationDrop.toFixed(1)}% pts)</div>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="chart-card-container">
            <div className="chart-header-row">
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                Monthly Order Fulfillment Breakdown
              </span>
              <div className="chart-legend">
                <span><span className="legend-dot" style={{ background: '#3b82f6' }}></span>Delivered</span>
                <span><span className="legend-dot" style={{ background: '#10b981' }}></span>StockTrust Saved</span>
                <span><span className="legend-dot" style={{ background: '#ef4444' }}></span>Cancelled</span>
              </div>
            </div>

            {/* Visual SVG Comparison Chart */}
            <ImpactChart
              monthlyOrders={monthlyOrders}
              totalCancelled={totalCancelledOrders}
              ordersSaved={ordersSavedMonthly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// INTERACTIVE CHART COMPONENT (PURE SVG RENDERING)
// --------------------------------------------------------------------------
function ImpactChart({ monthlyOrders, totalCancelled, ordersSaved }) {
  const deliveredBaseline = monthlyOrders - totalCancelled;
  const residualCancelled = totalCancelled - ordersSaved;
  const deliveredWithStockTrust = deliveredBaseline + ordersSaved;

  const total = monthlyOrders;
  const chartHeight = 160;
  const chartWidth = 420;

  // Percentage heights for stacked bars
  const pDeliveredBase = (deliveredBaseline / total) * chartHeight;
  const pCancelledBase = (totalCancelled / total) * chartHeight;

  const pDeliveredNova = (deliveredBaseline / total) * chartHeight;
  const pSavedNova = (ordersSaved / total) * chartHeight;
  const pResidualNova = (residualCancelled / total) * chartHeight;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Background gridlines */}
        <line x1="30" y1="20" x2="390" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
        <line x1="30" y1="80" x2="390" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
        <line x1="30" y1="140" x2="390" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

        {/* Bar 1: Baseline (Without StockTrust) */}
        <g>
          {/* Delivered portion */}
          <rect
            x="90"
            y={160 - pDeliveredBase}
            width="65"
            height={pDeliveredBase}
            fill="#3b82f6"
            rx="4"
          />
          {/* Cancelled portion */}
          <rect
            x="90"
            y={160 - pDeliveredBase - pCancelledBase}
            width="65"
            height={pCancelledBase}
            fill="#ef4444"
            rx="4"
          />
          <text x="122" y="180" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600">
            Baseline
          </text>
          <text x="122" y={150 - pDeliveredBase} fill="#fff" fontSize="10" textAnchor="middle" fontWeight="700">
            {Math.round(totalCancelled).toLocaleString()} dropped
          </text>
        </g>

        {/* Bar 2: With StockTrust */}
        <g>
          {/* Delivered base portion */}
          <rect
            x="240"
            y={160 - pDeliveredNova}
            width="65"
            height={pDeliveredNova}
            fill="#3b82f6"
            rx="4"
          />
          {/* StockTrust Saved portion */}
          <rect
            x="240"
            y={160 - pDeliveredNova - pSavedNova}
            width="65"
            height={pSavedNova}
            fill="#10b981"
            rx="4"
          />
          {/* Residual Cancelled portion */}
          <rect
            x="240"
            y={160 - pDeliveredNova - pSavedNova - pResidualNova}
            width="65"
            height={pResidualNova}
            fill="#ef4444"
            rx="4"
          />
          <text x="272" y="180" fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="700">
            With StockTrust
          </text>
          <text x="272" y={155 - pDeliveredNova - (pSavedNova / 2)} fill="#022c22" fontSize="10" textAnchor="middle" fontWeight="800">
            +{ordersSaved.toLocaleString()} Saved
          </text>
        </g>
      </svg>
    </div>
  );
}

// --------------------------------------------------------------------------
// BOOTSTRAP REACT APPLICATION
// --------------------------------------------------------------------------
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
