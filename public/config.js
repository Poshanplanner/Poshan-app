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

  // Prices shown in the app. They must match the plans you create in Razorpay.
  plans: [
    { id: "monthly", label: "Monthly", price: 99, per: "month" },
    { id: "yearly", label: "Yearly", price: 799, per: "year", note: "Save 33%" }
  ]
};
