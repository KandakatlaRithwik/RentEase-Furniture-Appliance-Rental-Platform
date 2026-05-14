const nodemailer = require('nodemailer');

// Safe email service — never crashes if credentials are missing
// In dev without credentials: logs to console instead of sending

let transporter = null;

const initTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!transporter) transporter = initTransporter();
    if (!transporter) {
      // Dev mode: log instead of sending
      console.log(`[EMAIL — dev] To: ${to} | Subject: ${subject}`);
      return;
    }
    await transporter.sendMail({
      from: `"RentEase" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    // Non-blocking — never crash the request due to email failure
    console.error('[EMAIL ERROR]', err.message);
  }
};

const emailTemplates = {
  orderPlaced: (user, order, product) => ({
    subject: `Order Confirmed — ${product.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#2874F0">Order Confirmed! 🎉</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your rental order has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f7f8fa;font-weight:700">Product</td><td style="padding:8px">${product.name}</td></tr>
          <tr><td style="padding:8px;background:#f7f8fa;font-weight:700">Monthly Rent</td><td style="padding:8px">₹${order.monthlyRent}</td></tr>
          <tr><td style="padding:8px;background:#f7f8fa;font-weight:700">Tenure</td><td style="padding:8px">${order.tenureMonths} months</td></tr>
          <tr><td style="padding:8px;background:#f7f8fa;font-weight:700">Total Amount</td><td style="padding:8px">₹${order.totalAmount}</td></tr>
          <tr><td style="padding:8px;background:#f7f8fa;font-weight:700">Start Date</td><td style="padding:8px">${new Date(order.startDate).toLocaleDateString('en-IN')}</td></tr>
        </table>
        <p style="color:#6B6F80;font-size:13px">Our team will contact you shortly to confirm delivery.</p>
        <p style="color:#2874F0;font-weight:700">— Team RentEase</p>
      </div>`,
  }),

  statusUpdated: (user, order, product, newStatus) => ({
    subject: `Order Update — ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#2874F0">Order Status Updated</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order for <strong>${product.name}</strong> has been updated to <strong style="color:#2874F0">${newStatus}</strong>.</p>
        ${order.adminNote ? `<p><strong>Note from team:</strong> ${order.adminNote}</p>` : ''}
        <p style="color:#6B6F80;font-size:13px">Log in to your dashboard to view full details.</p>
        <p style="color:#2874F0;font-weight:700">— Team RentEase</p>
      </div>`,
  }),

  maintenanceUpdate: (user, request, newStatus) => ({
    subject: `Maintenance Request ${newStatus === 'resolved' ? 'Resolved ✅' : 'Updated'}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#2874F0">Maintenance Update</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your maintenance request has been updated to <strong style="color:#26A541">${newStatus}</strong>.</p>
        ${request.adminNote ? `<p><strong>Team note:</strong> ${request.adminNote}</p>` : ''}
        <p style="color:#2874F0;font-weight:700">— Team RentEase</p>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
