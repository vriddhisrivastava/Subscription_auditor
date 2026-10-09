# Subscription Auditor 🛡️💳

A production-grade web application to track, audit, and optimize recurring subscriptions. It algorithmically detects duplicate/overlapping services, flags inactive subscriptions ("zombie subs"), alerts to price hikes, warns about converting free trials, provides "Cancel or Keep" scored recommendations, and offers bank statement CSV scanning.

---

## 🚀 Features

1. **Subscription Portfolio Management**:
   - Add, edit, delete, and view recurring subscriptions.
   - Attributes: Name, Category (11 categories), Cost, Billing Cycle (Weekly, Monthly, Quarterly, Biannual, Yearly), Next Renewal Date, Payment Method, Status (Active, Trial, Paused, Cancelled), Last Used Date, and Price History.
   - Comprehensive client & server validation on all inputs.

2. **Executive Financial Dashboard**:
   - Total monthly spend & annualized run-rate projection.
   - Potential annual savings uncovered by the audit engine.
   - Spend distribution by category (interactive visual bar stack & list).
   - Upcoming renewal charges over the next 7 and 30 days.

3. **Intelligent Audit Engine**:
   - **Overlapping Services**: Flags duplicate services in identical categories (e.g. Spotify + Apple Music, Netflix + Disney+).
   - **Inactive & Zombie Subscriptions**: Detects services unaccessed for 30+, 60+, or 90+ days based on user-logged activity.
   - **Price Increase Detection**: Compares current cost against previously logged historical prices with percentage hike calculation.
   - **Free Trial Expiration**: Alerts when trials are about to convert into recurring charges within 7 days.

4. **"Cancel or Keep" Recommendation Matrix**:
   - Generates an optimization score (0–100) for every subscription.
   - Evaluates usage frequency, category overlap, and price jumps.
   - Categorizes into **Cancel**, **Review**, or **Keep** with bullet-point reasoning and step-by-step cancellation instructions.

5. **Renewal Reminders**:
   - In-app notification bell with real-time badges.
   - Simulated email dispatch with full email subject and body generation.
   - Configurable alert trigger threshold (1, 2, 3, 5, or 7 days before charge).

6. **Bank Statement CSV Auto-Detector**:
   - Upload any credit card or bank CSV (Chase, Amex, Apple Card, etc.) or load the built-in sample statement.
   - Automatically detects known subscription merchants (Netflix, OpenAI, Spotify, Equinox, NYTimes, etc.), amounts, and suggests categories.
   - Bulk import into your active portfolio.

---

## 📁 Project Architecture & File Tree

```
subscription-auditor/
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL / Prisma)
│   └── seed.ts                # Realistic sample subscriptions seed script
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx           # Authentication sign-in
│   │   │   └── signup/page.tsx          # Account creation
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Overview dashboard & metrics
│   │   │   ├── subscriptions/page.tsx   # Subscription management
│   │   │   └── audit/page.tsx           # Audit findings & flags
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts # NextAuth credential handler
│   │       ├── subscriptions/route.ts      # GET (list), POST (create)
│   │       ├── subscriptions/[id]/route.ts # GET, PUT (update), DELETE
│   │       └── audit/route.ts              # Runs audit engine on user portfolio
│   ├── components/
│   │   ├── Navbar.tsx             # Main navigation, alerts bell, profile switcher
│   │   ├── SubscriptionCard.tsx   # Responsive card with renewal & usage badges
│   │   ├── SpendChart.tsx         # Category spend breakdown & monthly/yearly views
│   │   ├── RenewalReminder.tsx    # 7-day and 30-day scheduled charges timeline
│   │   ├── AuditFlag.tsx          # Highlighted issue card with one-click actions
│   │   ├── CancelKeepList.tsx     # "Cancel or Keep" scored decision matrix
│   │   ├── SubscriptionModal.tsx  # Add/Edit form with real-time validation
│   │   ├── CSVImportModal.tsx     # Bank statement CSV auto-detector
│   │   └── AuthModal.tsx          # User sign-in & demo persona switcher
│   ├── lib/
│   │   ├── api.ts                 # Type-safe API client layer
│   │   ├── auditEngine.ts         # Redundancy, dormancy, price hike, & scoring logic
│   │   ├── csvParser.ts           # CSV parser & merchant matching heuristics
│   │   ├── db.ts                  # In-memory & persistent storage with validation
│   │   └── notifications.ts       # Renewal scheduling & email alert simulation
│   └── types/
│       └── subscription.ts        # TypeScript data contracts, enums, & multipliers
├── .env                           # DATABASE_URL, NEXTAUTH_SECRET, EMAIL keys
├── package.json
└── README.md
```

---

## 🗄️ Database Schema (`prisma/schema.prisma`)

### Models:
- **`User`**: User accounts, credentials, preferred currency, and notification threshold.
- **`Subscription`**: Core subscription record containing cost, billing cycle, renewal date, last used date, trial deadline, and payment method.
- **`PriceHistory`**: Historical record of price adjustments (`oldCost`, `newCost`, `effectiveDate`).
- **`AuditFlag`**: Generated flags for duplicate categories, unused services, price increases, and expiring trials.
- **`Notification`**: In-app renewal alerts and audit notices.

### Enums:
- `BillingCycle`: `WEEKLY`, `MONTHLY`, `QUARTERLY`, `BIANNUAL`, `YEARLY`
- `SubscriptionStatus`: `ACTIVE`, `TRIAL`, `PAUSED`, `CANCELLED`
- `SubscriptionCategory`: `STREAMING_VIDEO`, `STREAMING_MUSIC`, `PRODUCTIVITY_SOFTWARE`, `GAMING`, `FITNESS_HEALTH`, `CLOUD_STORAGE`, `NEWS_MEDIA`, `FOOD_DELIVERY`, `UTILITIES_SERVICES`, `EDUCATION`, `OTHER`
- `AuditSeverity`: `LOW`, `MEDIUM`, `HIGH`
- `RecommendationDecision`: `KEEP`, `REVIEW`, `CANCEL`

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subscriptions` | Retrieve all active subscriptions for the current user |
| `POST` | `/api/subscriptions` | Create a new subscription (with payload validation) |
| `GET` | `/api/subscriptions/:id` | Fetch a single subscription by ID |
| `PUT` | `/api/subscriptions/:id` | Update an existing subscription (tracks price history) |
| `DELETE` | `/api/subscriptions/:id` | Remove a subscription |
| `GET` | `/api/audit` | Run audit engine and return flags & recommendations |
| `POST` | `/api/auth/[...nextauth]`| Authenticate / register user credentials |

---

## 🏃 Running Locally

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env` and configure your database connection string if using PostgreSQL:
   ```bash
   cp .env.example .env
   ```

3. **Initialize Database & Seed Data**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Seed Data

Click the **Reset Demo Seed** button in the top navigation bar to populate sample subscriptions, including:
- **Duplicate Streaming**: Spotify and Apple Music running simultaneously.
- **Dormant "Zombie" Subscription**: Disney+ (inactive 52 days) & The New York Times (inactive 106 days).
- **Price Increases**: Notion Plus ($8.00 ➔ $10.00) & Equinox ($195.00 ➔ $210.00).
- **Expiring Free Trial**: Headspace (converting to $69.99/yr in 3 days).
- **Upcoming Renewals**: Next 7-day deadlines with instant email reminder testing.
