# StockTrust // NOVA CART India
### Real-Time Hyperlocal Stock Availability & Cancellation Shield
*A React Web Application for NOVA CART's Local-Store Commerce Platform*

---

## 📌 1. The Problem

In India's hyperlocal commerce landscape, platforms like **NOVA CART** connect neighbourhood kirana stores, supermarkets, and general merchants with local digital shoppers. 

Unlike centralized dark stores (Blinkit, Zepto, Instamart) with automated warehouse management systems, **local brick-and-mortar stores sell inventory concurrently to walk-in customers and digital app shoppers**. 

### The Friction Points:
1. **The Inventory Lag:** When a walk-in customer buys the last packet of milk or bag of atta, the store owner is busy at the counter and often forgets to mark the item as out of stock in their merchant app.
2. **The "Ambush Cancellation":** A digital shopper places an order, waits 20–30 minutes expecting their groceries, only for the merchant or delivery partner to cancel the order because the product is unavailable on the shelf.
3. **Severe Economic Leakage:**
   * **11%** average overall order cancellation rate across local stores.
   * **35% of those cancellations** are caused solely by **product unavailability (stockouts)**.
   * On a monthly volume of **38,500 orders** with an Average Order Value (AOV) of **₹486**, this stockout blind spot destroys over **₹7.2 Lakhs in gross revenue every month**, damages merchant ratings, and drives frustrated shoppers straight to dark-store competitors.

---

## 🛡️ 2. The Solution: StockTrust

**StockTrust** is a digital intervention built into NOVA CART that creates a shared trust contract between local merchants and online shoppers through **three core pillars**:

### 1. Store Dashboard (Merchant Experience)
* **1-Tap In-Stock Toggle:** Merchants can quickly flip an item between `IN STOCK` and `OUT OF STOCK` with zero typing.
* **Timestamp & Freshness Tracking:** Every toggle or verification updates the item's `lastUpdated` timestamp.
* **"Stale Stock" Warning (>24 Hours):** If an item hasn't been confirmed for 24+ hours, the dashboard flags it with a high-visibility warning:  
  `⚠️ Stale Stock (>24h)` — alerting the shopkeeper that customers will see lower confidence scores and alternative suggestions.
* **⚡ 1-Tap "Verify All Fresh":** Allows busy kirana owners to confirm their entire shelf inventory with a single tap during morning store opening.

### 2. Customer View (Shopper Experience)
* **Availability Confidence Score:** Every product displays a dynamic availability badge:
  * 🟢 **High Confidence (80%–99%)**: Recently verified inventory + reliable store history.
  * 🟡 **Medium Confidence (60%–79%)**: Moderate update latency; slight cancellation risk.
  * 🔴 **Low Confidence (<60%)**: Stale inventory (>24 hours) or high store cancellation history.
* **Proactive Stockout Warning:** Low-confidence items show an explicit risk explanation:  
  `⚠️ High Risk of Cancellation (42%): Stock not verified for 31 hours and store has an 11% past cancellation rate.`
* **Nearby Store Substitute Recommendation:** If an item is low-confidence or out-of-stock, StockTrust automatically detects the same or equivalent product at another nearby store with high confidence (e.g. *Sri Balaji Supermarket, 650m away, 98% High Confidence*), with a 1-click **"Switch to Substitute"** button.

### 3. Business Impact & ROI Calculator (Platform & Executive Experience)
* Configurable operational parameters with baseline industry presets:
  * **Monthly Orders:** `38,500`
  * **Cancellation Rate:** `11%`
  * **Share Caused by Unavailable Products:** `35%`
  * **Average Order Value (AOV):** `₹486`
* **Interactive StockTrust Reduction Slider (0% to 100%):** Lets platform operators stress-test how cutting stockout cancellations drives financial outcomes.
* **Dynamic Visual Chart:** Real-time SVG chart contrasting baseline order fulfillment against StockTrust rescued orders and residual cancellations.

---

## 📐 3. The Logic & Mathematical Formulas

### A. Availability Confidence Scoring Formula

The confidence score $C \in [10, 99]$ is calculated deterministically from two factors:

$$C = \text{round}\Big( W_{\text{freshness}}(\Delta t) \times R_{\text{store}} \times 100 \Big)$$

Where:
1. **Freshness Weight ($W_{\text{freshness}}$)** based on elapsed time $\Delta t$ since the last inventory confirmation:
   $$\begin{cases}
     1.00 & \text{if } \Delta t \le 2\text{ hours (Fresh)} \\
     0.90 & \text{if } 2 < \Delta t \le 12\text{ hours} \\
     0.75 & \text{if } 12 < \Delta t \le 24\text{ hours} \\
     0.50 & \text{if } 24 < \Delta t \le 48\text{ hours (Stale Warning)} \\
     0.30 & \text{if } \Delta t > 48\text{ hours (Highly Stale)}
   \end{cases}$$

2. **Store Reliability Factor ($R_{\text{store}}$)** based on historical cancellation rate $CR$:
   $$R_{\text{store}} = \max\Big(0.40, \; 1.0 - (CR \times 1.8)\Big)$$
   *(e.g., a store with a 4% cancellation rate scores $1.0 - 0.072 = 0.928$; a store with a 16% rate drops to $0.712$)*.

3. **Classification Tiers:**
   * **High Confidence:** $C \ge 80\%$
   * **Medium Confidence:** $60\% \le C < 80\%$
   * **Low Confidence:** $C < 60\%$ (Triggers warnings and substitute recommendations)

---

### B. Business Impact Financial Model

Given the operational inputs:
* $O_{\text{monthly}} = 38,500$ (Total monthly orders)
* $CR = 11\%$ (Baseline cancellation rate)
* $S_{\text{unavail}} = 35\%$ (Share caused by unavailable products)
* $AOV = ₹486$ (Average Order Value)
* $K_{\text{cut}} = 65\%$ (StockTrust cancellation cut percentage)

#### Calculations:
1. **Total Monthly Cancelled Orders:**
   $$C_{\text{total}} = O_{\text{monthly}} \times CR = 38,500 \times 0.11 = 4,235 \text{ orders}$$

2. **Cancellations Due to Unavailable Stock:**
   $$C_{\text{stockout}} = C_{\text{total}} \times S_{\text{unavail}} = 4,235 \times 0.35 = 1,482.25 \text{ orders}$$

3. **Monthly Orders Saved by StockTrust:**
   $$O_{\text{saved}} = C_{\text{stockout}} \times K_{\text{cut}} = 1,482.25 \times 0.65 = \mathbf{963 \text{ orders / month}}$$

4. **Monthly Revenue Recovered:**
   $$\text{Rev}_{\text{monthly}} = O_{\text{saved}} \times AOV = 963 \times 486 = \mathbf{₹4,68,018 \text{ / month}}$$

5. **Annualized Revenue Recovered:**
   $$\text{Rev}_{\text{annual}} = \text{Rev}_{\text{monthly}} \times 12 = \mathbf{₹56,16,216 \text{ / year (₹56.16 Lakhs / year)}}$$

6. **New Platform Cancellation Rate:**
   $$CR_{\text{new}} = \frac{C_{\text{total}} - O_{\text{saved}}}{O_{\text{monthly}}} = \frac{4,235 - 963}{38,500} = \mathbf{8.5\%} \quad (\text{down from } 11.0\%)$$

---

## 💻 4. Project Structure

```
hackathon-project/
├── index.html       # HTML entry point loading React 18, Babel, and styles
├── app.jsx          # React 18 application containing all 3 views & state logic
├── style.css        # Clean, modern, mobile-friendly responsive CSS design
├── vendor/          # Offline-ready React 18 & Babel standalone libraries
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   └── babel.min.js
└── README.md        # Comprehensive documentation of the problem and logic
```

---

## 🚀 5. How to Run the App

Because **StockTrust** is self-contained with vendor libraries in the `vendor/` folder, it runs directly in any modern browser without needing `npm install` or node build steps:

### Option 1: Direct File Launch (Zero Setup)
Double-click [`index.html`](file:///c:/Users/HP/Downloads/hackathon-project/index.html) or run in PowerShell:
```powershell
Start-Process "index.html"
```

### Option 2: PowerShell Local Server (Already Included - Zero Dependencies)
Run the included server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Python Server (If Python is installed)
```powershell
python -m http.server 3000
```

### Option 4: VS Code Live Server
Right-click `index.html` and choose **"Open with Live Server"**.

---

## 🧪 6. Interactive Testing Walkthrough

1. **Verify the Shared State Loop:**
   * Go to **Store Dashboard**: Locate an item marked with `⚠️ Stale Stock (>24h)` (e.g. *Fortune Sunflower Oil*).
   * Click **"🔄 Verify"**: The timestamp updates to *"Just now"* and the stale warning disappears.
   * Switch to **Customer View**: Notice that the availability score for Fortune Sunflower Oil has updated to **🟢 High Confidence (94%)**!
2. **Test Out-of-Stock Toggle:**
   * In **Store Dashboard**, flip *Amul Taaza Milk* to **OUT OF STOCK**.
   * Switch to **Customer View**: The item now displays an Out of Stock badge and the Add to Cart button is disabled.
3. **Experience Substitute Recommendations:**
   * In **Customer View**, find a low-confidence item (e.g. *Aashirvaad Atta* or *Surf Excel*).
   * Review the low availability warning and click **"Switch to Substitute"** to seamlessly substitute the item from *Sri Balaji Supermarket*.
4. **Stress-Test the Business Impact Model:**
   * In **Business Impact**, drag the **StockTrust Reduction Slider** from `0%` to `80%`.
   * Watch the saved orders, monthly revenue recovered, and the stacked SVG comparison chart dynamically update in real time!