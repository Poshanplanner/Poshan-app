# Poshan: setup guide

Poshan is a calorie, macro and micronutrient planner by Dr Rajesh Bandgar, with:
- **Free calculator**: calories from 4 formulas, BMI, macros
- **Poshan Pro**: ₹199 for 3 months, one-time UPI payment. Adds micronutrients, the meal split and a shareable summary.
- **One-to-one consultation**: ₹499 by UPI, online video call or phone call. Includes 1 month of Pro free.

All payments go by UPI to **Sindhu Bandgar · sinban1968@oksbi**. The site ships in **demo mode**, where nothing is saved or sent. Follow the steps below to go live.

## How payments work

1. The patient pays by scanning the QR, tapping "Open UPI app", or paying the UPI ID directly.
2. They enter the 12-digit **UPI transaction ID (UTR)**.
3. You get a WhatsApp message and an email with the details and a **verify link**.
4. You check GPay to confirm the money arrived, open the link, and tap **Approve** or **Reject**.
   - **Pro**: unlocks on the user's screen immediately.
   - **Consultation**: marked verified. 1 month of Pro is added to the Poshan account with the patient's email, if one exists. Then WhatsApp the patient to fix the call time.

Each UTR can be used only once. Opening the link alone changes nothing; only the buttons do.

## Files

| Path | What it is |
|---|---|
| `public/index.html` | The app |
| `public/config.js` | Settings: demo switch, Firebase keys, doctor contacts, UPI ID, prices |
| `public/qr/` | Ready-made UPI QR codes for ₹199 (Pro) and ₹499 (consultation) |
| `public/terms.html`, `privacy.html`, `refund.html`, `contact.html` | Policy pages |
| `api/upi-pro.js`, `api/upi-consult.js` | Receive payment details and alert you |
| `api/approve.js` | The verify page your alert links to |
| `firestore.rules` | Database security |
| `later-razorpay/` | Razorpay version, kept for later. Not used now. |

## Step 1: Firebase (login and database, free)

1. Go to console.firebase.google.com → **Create a project** → name it `poshan`, Analytics off.
2. **Build → Authentication → Get started** → enable **Google** and **Email/Password**.
3. **Authentication → Settings → Authorized domains** → add `poshanplanner.vercel.app`.
4. **Build → Firestore Database → Create database** → location `asia-south1 (Mumbai)`, production mode.
5. **Firestore → Rules** → paste the contents of `firestore.rules` → **Publish**.
6. **Project settings (gear) → Your apps → Web (</>)** → register → copy `apiKey`, `authDomain`, `projectId`, `appId` into `public/config.js`.
7. **Project settings → Service accounts → Generate new private key**. Keep this file secret; it's used in Step 3.

## Step 2: Alerts on WhatsApp and email (free)

**WhatsApp (CallMeBot):** go to callmebot.com → WhatsApp API and follow the steps there: save their number, then send the activation message from +91 81696 63781. You receive an API key on WhatsApp.

**Email (Resend):** sign up at resend.com with rajkban31@gmail.com → **API Keys → Create** → copy the key.

## Step 3: Secret keys in Vercel

Vercel → Project → **Settings → Environment Variables**. Add each of these, then **redeploy** (Deployments → ⋯ → Redeploy):

| Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Whole content of the private-key file from Step 1.7 |
| `ADMIN_SECRET` | Any long random text (at least 30 characters). Signs your verify links. |
| `DOCTOR_WHATSAPP` | `918169663781` |
| `DOCTOR_EMAIL` | `rajkban31@gmail.com` |
| `CALLMEBOT_APIKEY` | From Step 2 |
| `RESEND_API_KEY` | From Step 2 |
| `PRO_PRICE_INR` | `199` |
| `PRO_DAYS` | `90` |
| `CONSULT_FEE_INR` | `499` |
| `CONSULT_PRO_DAYS` | `30` |

Never put these in `config.js`; that file is public.

## Step 4: Switch off demo mode

In `public/config.js` set `demo: false` and commit. Then test once with a real payment from another phone:
1. Sign in → Unlock Pro → pay ₹199 → enter the UTR → check you get WhatsApp and email → Approve → Pro badge appears.
2. Book a consultation → pay ₹499 → enter the UTR → Approve.

## Changing prices

1. Change the price in `public/config.js` (`pro.price` or `consultFee`) **and** in Vercel (`PRO_PRICE_INR` or `CONSULT_FEE_INR`).
2. Ask Claude to regenerate the matching QR image in `public/qr/`, or delete that image. The app then builds the QR itself from a free online library.

## Before going public

- **Address**: replace `[ADD YOUR FULL POSTAL ADDRESS]` in `public/terms.html`, `privacy.html`, `refund.html` and `contact.html`.
- **Vercel plan**: the free Hobby plan is for non-commercial use. Upgrade to Pro (about US$20/month) once you are taking payments, or move to a host that allows commercial use on its free plan.
- **UPI account**: many business payments to a personal UPI ID can get flagged by the bank. A free Google Pay for Business or PhonePe Business account for the same bank account avoids this. Only the UPI ID in `config.js` and the QR images change.
- **Tax**: payments are income of the account holder. Ask a CA about GST and income tax.

## Later: Razorpay

The folder `later-razorpay/` has a working Razorpay version (automatic payment confirmation, auto-renewing subscriptions). Move it back into `api/` when volume makes manual checking tiresome.
