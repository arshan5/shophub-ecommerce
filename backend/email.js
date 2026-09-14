const nodemailer = require("nodemailer");
console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==================================================
// SHOPHUB PROFESSIONAL EMAIL TEMPLATE
// ==================================================

function createEmailTemplate({
  title,
  greeting,
  message,
  status,
  statusColor,
  orderId,
  customer,
  items,
  subtotal,
  delivery,
  tax,
  total,
  paymentMethod,
  deliveryMethod,
  cancellationReason,
  isAdmin = false,
}) {
  const itemRows = items
    ? items
        .map(
          (item) => `
            <tr>
              <td style="padding:14px 10px;border-bottom:1px solid #eeeeee;">
                <strong style="color:#222222;">
                  ${item.name}
                </strong>
                <div style="font-size:13px;color:#777777;margin-top:4px;">
                  Quantity: ${item.quantity}
                </div>
              </td>

              <td style="padding:14px 10px;border-bottom:1px solid #eeeeee;text-align:right;">
                $${Number(item.price).toFixed(2)}
              </td>
            </tr>
          `
        )
        .join("")
    : "";

  return `
<!DOCTYPE html>

<html>
<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${title}</title>

</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f7fb;
  font-family:Arial,Helvetica,sans-serif;
  color:#333333;
">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="center" style="padding:35px 15px;">

<table
  width="600"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    max-width:600px;
    width:100%;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,0.06);
  "
>

<!-- ========================= -->
<!-- HEADER -->
<!-- ========================= -->

<tr>
<td style="
  background:#111827;
  padding:28px 30px;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>

<td>

<div style="
  font-size:26px;
  font-weight:bold;
  color:#ffffff;
">
  Shop<span style="color:#6366f1;">Hub</span>
</div>

<div style="
  color:#aeb5c2;
  font-size:13px;
  margin-top:5px;
">
  Your trusted online store
</div>

</td>

<td align="right">

<div style="
  color:#ffffff;
  font-size:13px;
">
  ${isAdmin ? "Admin Notification" : "Order Update"}
</div>

</td>

</tr>
</table>

</td>
</tr>


<!-- ========================= -->
<!-- MAIN CONTENT -->
<!-- ========================= -->

<tr>
<td style="padding:35px 30px 20px;">

<h1 style="
  margin:0 0 12px;
  font-size:24px;
  color:#111827;
">

${title}

</h1>

<p style="
  margin:0 0 10px;
  font-size:16px;
  color:#333333;
">

${greeting}

</p>

<p style="
  margin:0 0 25px;
  font-size:14px;
  line-height:1.7;
  color:#666666;
">

${message}

</p>


<!-- ========================= -->
<!-- STATUS -->
<!-- ========================= -->

${
  status
    ? `
<div style="
  background:#f8fafc;
  border:1px solid #e5e7eb;
  border-radius:10px;
  padding:18px;
  margin-bottom:25px;
">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>

<td>

<div style="
  font-size:12px;
  color:#777777;
  margin-bottom:6px;
">
ORDER STATUS
</div>

<strong style="
  font-size:16px;
  color:#111827;
">
${status}
</strong>

</td>

<td align="right">

<span style="
  display:inline-block;
  padding:7px 13px;
  border-radius:20px;
  background:${statusColor};
  color:#ffffff;
  font-size:12px;
  font-weight:bold;
">
${status}
</span>

</td>

</tr>

</table>

</div>
`
    : ""
}


<!-- ========================= -->
<!-- ORDER INFO -->
<!-- ========================= -->

<div style="
  border:1px solid #e5e7eb;
  border-radius:10px;
  padding:20px;
  margin-bottom:25px;
">

<div style="
  font-size:12px;
  color:#777777;
  margin-bottom:7px;
">
ORDER ID
</div>

<div style="
  font-size:15px;
  font-weight:bold;
  color:#111827;
  word-break:break-all;
">
${orderId}
</div>

</div>


<!-- ========================= -->
<!-- CUSTOMER -->
<!-- ========================= -->

${
  customer
    ? `
<h2 style="
  font-size:17px;
  color:#111827;
  margin:25px 0 12px;
">
Customer Information
</h2>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background:#f9fafb;
    border-radius:10px;
    padding:15px;
  "
>

<tr>

<td style="padding:6px 10px;color:#777777;">
Name
</td>

<td align="right" style="
  padding:6px 10px;
  color:#222222;
  font-weight:bold;
">
${customer.firstName || ""} ${customer.lastName || ""}
</td>

</tr>

<tr>

<td style="padding:6px 10px;color:#777777;">
Email
</td>

<td align="right" style="
  padding:6px 10px;
  color:#222222;
">
${customer.email || ""}
</td>

</tr>

<tr>

<td style="padding:6px 10px;color:#777777;">
Phone
</td>

<td align="right" style="
  padding:6px 10px;
  color:#222222;
">
${customer.phone || ""}
</td>

</tr>

</table>
`
    : ""
}


<!-- ========================= -->
<!-- PRODUCTS -->
<!-- ========================= -->

${
  items && items.length
    ? `

<h2 style="
  font-size:17px;
  color:#111827;
  margin:30px 0 12px;
">
Order Summary
</h2>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    border:1px solid #e5e7eb;
    border-radius:10px;
    overflow:hidden;
  "
>

<tr>

<td style="
  padding:12px 10px;
  background:#f9fafb;
  font-size:12px;
  color:#777777;
  font-weight:bold;
">
PRODUCT
</td>

<td align="right" style="
  padding:12px 10px;
  background:#f9fafb;
  font-size:12px;
  color:#777777;
  font-weight:bold;
">
PRICE
</td>

</tr>

${itemRows}

</table>

`
    : ""
}


<!-- ========================= -->
<!-- TOTALS -->
<!-- ========================= -->

${
  total !== undefined
    ? `

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="margin-top:20px;"
>

<tr>

<td style="
  padding:7px 0;
  color:#777777;
">
Subtotal
</td>

<td align="right" style="
  padding:7px 0;
">
$${Number(subtotal || 0).toFixed(2)}
</td>

</tr>

<tr>

<td style="
  padding:7px 0;
  color:#777777;
">
Delivery
</td>

<td align="right" style="
  padding:7px 0;
">
$${Number(delivery || 0).toFixed(2)}
</td>

</tr>

<tr>

<td style="
  padding:7px 0;
  color:#777777;
">
Tax
</td>

<td align="right" style="
  padding:7px 0;
">
$${Number(tax || 0).toFixed(2)}
</td>

</tr>

<tr>

<td colspan="2">
<div style="
  border-top:1px solid #e5e7eb;
  margin:10px 0;
"></div>
</td>

</tr>

<tr>

<td style="
  padding:8px 0;
  font-size:18px;
  font-weight:bold;
  color:#111827;
">
Total
</td>

<td align="right" style="
  padding:8px 0;
  font-size:20px;
  font-weight:bold;
  color:#4f46e5;
">
$${Number(total).toFixed(2)}
</td>

</tr>

</table>

`
    : ""
}


<!-- ========================= -->
<!-- PAYMENT / DELIVERY -->
<!-- ========================= -->

${
  paymentMethod || deliveryMethod
    ? `

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    margin-top:20px;
    background:#f9fafb;
    border-radius:10px;
  "
>

<tr>

${
  paymentMethod
    ? `
<td style="padding:15px;">

<div style="
  font-size:11px;
  color:#888888;
  margin-bottom:5px;
">
PAYMENT
</div>

<strong style="color:#222222;">
${paymentMethod}
</strong>

</td>
`
    : ""
}

${
  deliveryMethod
    ? `
<td style="padding:15px;">

<div style="
  font-size:11px;
  color:#888888;
  margin-bottom:5px;
">
DELIVERY
</div>

<strong style="color:#222222;">
${deliveryMethod}
</strong>

</td>
`
    : ""
}

</tr>

</table>

`
    : ""
}


<!-- ========================= -->
<!-- CANCELLATION -->
<!-- ========================= -->

${
  cancellationReason
    ? `

<div style="
  margin-top:25px;
  padding:18px;
  border-radius:10px;
  background:#fff7f7;
  border:1px solid #fecaca;
">

<div style="
  color:#b91c1c;
  font-size:14px;
  font-weight:bold;
  margin-bottom:7px;
">
Cancellation Reason
</div>

<div style="
  color:#555555;
  font-size:14px;
  line-height:1.6;
">
${cancellationReason}
</div>

</div>

`
    : ""
}

</td>
</tr>


<!-- ========================= -->
<!-- FOOTER -->
<!-- ========================= -->

<tr>

<td style="
  background:#f9fafb;
  padding:25px 30px;
  text-align:center;
  border-top:1px solid #eeeeee;
">

<div style="
  font-size:15px;
  font-weight:bold;
  color:#111827;
">
Shop<span style="color:#6366f1;">Hub</span>
</div>

<p style="
  margin:8px 0;
  color:#888888;
  font-size:12px;
  line-height:1.6;
">
Thank you for choosing ShopHub.
</p>

<p style="
  margin:0;
  color:#aaaaaa;
  font-size:11px;
">
This is an automated email. Please do not reply directly to this message.
</p>

</td>

</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}


// ==================================================
// SEND EMAIL
// ==================================================

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"ShopHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,

      // HTML email
      html,

      // Fallback for email clients that don't support HTML
      text: "Please view this email in an HTML-compatible email client.",
    });

    console.log(
      "Email sent to:",
      to,
      info.messageId
    );

    return true;

  } catch (error) {

    console.error(
      "Email sending failed:",
      error
    );

    throw error;
  }
}


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  sendEmail,
  createEmailTemplate,
};