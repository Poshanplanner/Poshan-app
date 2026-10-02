# Poshan: launch guide

Poshan is a calorie, macro and micronutrient planner by Dr Rajesh Bandgar. This folder is the complete app: the page people use, the install-as-app files, and a small server that handles Pro subscriptions through Razorpay.

It ships in **demo mode**: sign-in and payment are simulated so you can try everything without accounts or money. Follow the steps below to go live.

## What's in the folder

| Path | What it does |
|---|---|
| `public/index.html` | The app |
| `public/config.js` | Your settings: demo switch, Firebase keys, prices, support email |
| `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` | Make it installable on phones and work offline |
| `api/` | Payment server: start, verify and cancel subscriptions, and receive Razorpay renewal events |
| `firestore.rules` | Database security: only the server can grant Pro |
| `.env.example` | List of secret keys to add in Vercel |

## One-to-one consultations

Consultations are online (video call) or by phone call. Patients fill in their details (name, age, sex, WhatsApp, email, concern, description, video or phone, preferred time, optionally their Poshan plan), check a preview, and pay the consultation fee (₹499 by default) through Razorpay. After payment:

- You get the full booking on **WhatsApp** and **email**.
- The patient sees a booking ID and is told you'll contact them on WhatsApp within 1–2 days to fix the call time.
- Every booking is also saved in Firestore → `consultations`.

Your direct contact details (phone/WhatsApp, email, Instagram) are shown in the app; change them in `config.js` → `doctor`.

## Free vs Pro

- **Free**: calorie target, four-formula comparison, BMI, macronutrients.
- **Pro** (₹99/month or ₹799/year): micronutrients with Indian food sources, meal-by-meal split, shareable summary.

Change prices in `config.js` and create matching plans in Razorpay.

---

## Step 1: Put it online (demo mode, about 15 minutes)

1. Create free accounts at github.com and vercel.com (sign in to Vercel with GitHub).
2. On GitHub, create a new repository named `poshan-app` and upload everything in this folder.
3. In Vercel: **Add New → Project → import `poshan-app` → Deploy**.
4. Open the link Vercel gives you (like `poshan-app.vercel.app`) on your phone. In Chrome, tap **Install app** or menu → **Add to Home screen**.

## Step 2: Buy a domain (optional, recommended)

Buy a domain such as `poshanplanner.in` from GoDaddy, Hostinger or Namecheap. In Vercel: **Project → Settings → Domains → Add**, then follow the DNS instructions shown.

## Step 3: Turn on real sign-in (Firebase, free)

1. Go to console.firebase.google.com → **Add project** → name it `poshan`.
2. **Build → Authentication → Get started**. Enable **Google** and **Email/Password**.
3. **Authentication → Settings → Authorized domains**: add your Vercel domain and your own domain.
4. **Build → Firestore Database → Create database** (production mode, region `asia-south1` Mumbai).
5. **Firestore → Rules**: paste the contents of `firestore.rules` → **Publish**.
6. **Project settings (gear) → General → Your apps → Web (</>)** → register the app → copy `apiKey`, `authDomain`, `projectId`, `appId` into `public/config.js`.
7. **Project settings → Service accounts → Generate new private key**. Keep this file secret; you'll need it in Step 5.

## Step 4: Set up Razorpay

1. Sign up at razorpay.com and complete KYC (PAN, bank account, business details, website with policies; see Step 7).
2. Ask Razorpay support to enable **Subscriptions** if it isn't already on.
3. **Subscriptions → Plans → Create plan**:
   - Monthly: ₹99, every 1 month
   - Yearly: ₹799, every 1 year
   Copy both plan IDs (they start with `plan_`).
4. **Account & Settings → API Keys → Generate key**. Copy the Key ID and Key Secret.
5. **Account & Settings → Webhooks → Add new webhook**:
   - URL: `https://YOUR-DOMAIN/api/razorpay-webhook`
   - Secret: type a long random text and keep a copy
   - Events: `payment.captured`, `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.completed`, `subscription.halted`, `subscription.paused`, `subscription.resumed`

Test first with **Test mode** keys (`rzp_test_...`) and Razorpay's test UPI/cards, then switch to Live keys.

## Step 5: Add the secret keys to Vercel

Vercel → Project → **Settings → Environment Variables**. Add each name from `.env.example` with your real values. For `FIREBASE_SERVICE_ACCOUNT`, paste the whole service-account JSON file content.

Never put these secrets in `config.js`; that file is public.

## Step 5b: Booking alerts on WhatsApp and email

**Email (Resend, free up to 3,000 emails a month):**
1. Sign up at resend.com using `rajkban31@gmail.com`.
2. **API Keys → Create** → copy it into `RESEND_API_KEY` in Vercel. Set `DOCTOR_EMAIL=rajkban31@gmail.com`.
3. Optional: verify your domain in Resend and set `MAIL_FROM` so patients also get a confirmation email.

**WhatsApp (CallMeBot, free personal alerts):**
1. Go to callmebot.com → WhatsApp API and follow the steps: save their number in your contacts and send them the activation message from `+91 81696 63781`.
2. You receive an API key on WhatsApp. Put it in `CALLMEBOT_APIKEY` and set `DOCTOR_WHATSAPP=918169663781`.

**Fee:** set `CONSULT_FEE_INR` in Vercel and the same number as `consultFee` in `config.js`.

Also add the event `payment.captured` to your Razorpay webhook, so a booking is confirmed even if the patient closes the app right after paying.

Test with Razorpay test mode: book a consultation, pay with a test UPI ID, and check that the WhatsApp message and email arrive.

## Step 6: Switch off demo mode

In `public/config.js` set `demo: false`, set your `supportEmail`, commit to GitHub. Vercel redeploys automatically. Then test the full flow on your phone: sign in → Unlock with Pro → pay with a test UPI ID → Pro unlocks.

## Step 7: Legal pages before you take money

Already included: `/terms`, `/privacy`, `/refund` and `/contact` (files in `public/`), linked from the app footer and the booking form. **Before applying to Razorpay, open `public/contact.html`, `terms.html`, `privacy.html` and `refund.html` and replace `[ADD YOUR FULL POSTAL ADDRESS]` with the real address.** Review the refund rules and change them if you want different ones.

The pages cover:

Razorpay KYC and Google Play both require these on your website:

- Privacy policy (you store email and health inputs; India's DPDP Act 2023 applies)
- Terms of use with a medical disclaimer
- Refund and cancellation policy
- Contact page with a business address and email

Register for GST once turnover crosses the threshold, and take advice from a CA on invoicing.

## Step 8: Publish on Google Play

1. Create a Google Play developer account (one-time US$25).
2. Install Node.js on a computer, then run:
   ```
   npm i -g @bubblewrap/cli
   bubblewrap init --manifest https://YOUR-DOMAIN/manifest.webmanifest
   bubblewrap build
   ```
   This makes an Android app (`.aab`) that opens your site full-screen.
3. Bubblewrap prints a SHA-256 fingerprint. Put it in `public/.well-known/assetlinks.json` (Bubblewrap shows the exact file) and redeploy, so the app opens without a browser bar.
4. In Play Console, create the app, upload the `.aab`, fill in the store listing, data safety form and health-app declaration, then submit for review.

**Important about payments on Play.** Google requires Google Play Billing for digital subscriptions sold inside Play Store apps. Razorpay checkout is fine on your website, but for the Play Store version you need Play Billing (through the Digital Goods API for this kind of app), or to apply for Google's user choice billing programme in India. Launch on the web first, then add Play Billing before releasing the Play version with payments.

## Costs to start

| Item | Cost |
|---|---|
| Vercel hosting, Firebase | Free at small scale |
| Domain (.in) | about ₹600–1,200 per year |
| Google Play account | US$25 once |
| Razorpay | About 2% per transaction, no setup fee (check current pricing) |

## Changing things later

- **Prices**: edit `plans` in `config.js` and create matching Razorpay plans.
- **Doctor contact and consultation fee**: `config.js` → `doctor` and `consultFee` (and `CONSULT_FEE_INR` in Vercel).
- **Doctor qualifications card**: search for "Rajesh" in `index.html`.
- **What is Pro**: in `index.html`, sections wrapped in `isPro() ? ... : locked(...)`.
