const nodemailer = require("nodemailer");

function canSend() {
  return Boolean(
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    (process.env.SMTP_HOST || process.env.EMAIL_SERVICE)
  );
}

function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });
  }
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });
}

async function safeSend(mailOptions) {
  if (!canSend()) {
    console.log(
      "📧 [stub] Email disabled (no SMTP configured). Would send:",
      mailOptions.subject,
      mailOptions.to
    );
    return { messageId: "stubbed" };
  }
  const transporter = createTransporter();
  const info = await transporter.sendMail(mailOptions);
  console.log("📧 Email sent:", info.messageId);
  return info;
}

async function sendRegistrationEmail(schoolData) {
  return safeSend({
    from: process.env.SMTP_USER,
    to: schoolData.Email,
    subject: "School Registration Request Received - SchoolFund",
    html: `...` // keep your full HTML here from original
  });
}

async function sendApprovalEmail(schoolData, credentials) {
  return safeSend({
    from: process.env.SMTP_USER,
    to: schoolData.Email,
    subject: "Congratulations! Your School Account Has Been Approved - SchoolFund",
    html: `...` // keep your full HTML here from original
  });
}

async function sendRejectionEmail(schoolData, reason = "") {
  return safeSend({
    from: process.env.SMTP_USER,
    to: schoolData.Email,
    subject: "School Registration Request Update - SchoolFund",
    html: `...` // keep your full HTML here from original
  });
}

async function sendPrincipalCredentialsEmail(school, credentials, campaign) {
  return safeSend({
    from: process.env.SMTP_USER,
    to: school.Email,
    subject: "Principal Credentials for Campaign Approval - SchoolFund",
    html: `...` // keep your full HTML here from original
  });
}

async function sendReceiptToDonor(donation, payment, donorEmail) {
  return safeSend({
    from: process.env.SMTP_USER,
    to: donorEmail,
    subject: "Your donation receipt - SchoolFund+",
    html: `<p>Thank you for your donation.</p>
           <p>Amount: ${payment?.amountPaid ?? donation?.amount}</p>
           <p>Transaction ID: ${payment?.transactionID ?? "-"}</p>`,
  });
}

async function sendNonMonetaryNotificationToSchool({
  schoolEmail,
  campaignName,
  donorName,
  deliveryMethod,
  deadlineDate,
  notes,
}) {
  return safeSend({
    from: process.env.SMTP_USER,
    to: schoolEmail,
    subject: `Non-monetary donation intent — ${campaignName}`,
    html: `<p>Donor: ${donorName || "Anonymous"}</p>
           <p>Campaign: ${campaignName}</p>
           <p>Delivery: ${deliveryMethod}</p>
           <p>Deadline: ${deadlineDate ? new Date(deadlineDate).toLocaleString() : "N/A"}</p>
           <p>Notes: ${notes || "-"}</p>`,
  });
}

module.exports = {
  sendRegistrationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPrincipalCredentialsEmail,
  sendReceiptToDonor,
  sendNonMonetaryNotificationToSchool,
};
