// Poshan app settings. Edit this file, then redeploy.
// While demo is true, sign-in and payments are simulated and nothing is charged.
window.POSHAN_CONFIG = {
  demo: true, // set to false after filling in the Firebase values below

  // Firebase console → Project settings → General → Your apps → Web app → SDK config
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  },

  // Shown in the account screen for billing help
  supportEmail: "rajkban31@gmail.com",

  // Doctor contact details and consultation fee (₹).
  // The fee charged is set on the server (CONSULT_FEE_INR); keep both the same.
  doctor: {
    name: "Dr Rajesh Bandgar",
    phone: "+91 81696 63781",
    whatsapp: "918169663781",
    email: "rajkban31@gmail.com",
    instagram: "idrrajeshbandgar",
    registration: "" // e.g. "MMC 2015/12345" — shown under the consultation when filled in
  },
  consultFee: 499,

  // UPI account that receives all payments (shown with a QR code at checkout)
  upi: { id: "sinban1968@oksbi", name: "Sindhu Bandgar" },

  // Poshan Pro: one-time UPI payment, unlocked after you approve it
  pro: { price: 199, days: 90, label: "3 months" },

  // Free Pro given with each consultation once its payment is approved
  consultProDays: 30
};
