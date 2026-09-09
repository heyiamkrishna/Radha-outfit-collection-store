export function generateOrderEmailHtml({ order, customerName }) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://radha-outfit-collection.vercel.app";
  const invoiceUrl = `${siteUrl}/account/orders/${order._id}/invoice`;

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #F0F2F6; font-size: 13px; color: #0C0D11;">
          <strong>${item.name}</strong><br/>
          <span style="font-size: 11px; color: #8E92A2;">Size: ${item.size || "M"} · Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #F0F2F6; text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; color: #0C0D11;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Order Confirmation - Radha Outfit Collection</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F8FA; margin: 0; padding: 30px 15px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 28px; border: 1px solid #E8EBF2; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <!-- Header -->
        <tr>
          <td style="background-color: #0C0D11; padding: 36px 30px; text-align: center;">
            <span style="color: #8E92A2; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; font-family: monospace; display: block; margin-bottom: 4px;">Atelier Haute Couture</span>
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase;">Radha Outfit Collection</h1>
          </td>
        </tr>

        <!-- Content Body -->
        <tr>
          <td style="padding: 36px 30px;">
            <span style="color: #3B7BF6; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Order Confirmed</span>
            <h2 style="color: #0C0D11; font-size: 22px; margin: 6px 0 16px; font-weight: 800;">Thank you for your order, ${customerName}.</h2>
            <p style="color: #4A4D59; font-size: 13px; line-height: 1.6; margin: 0 0 24px;">
              Your bespoke garment reservation has been accepted by our atelier. Our artisans are now processing your pieces.
            </p>

            <!-- Order Reference Box -->
            <table width="100%" style="background-color: #FAFAFC; border: 1px solid #F0F2F6; border-radius: 16px; padding: 14px 18px; margin-bottom: 24px;">
              <tr>
                <td style="font-size: 11px; color: #8E92A2; text-transform: uppercase; font-weight: bold;">Order Reference</td>
                <td style="font-size: 11px; color: #8E92A2; text-transform: uppercase; font-weight: bold; text-align: right;">Payment Mode</td>
              </tr>
              <tr>
                <td style="font-size: 14px; color: #0C0D11; font-family: monospace; font-weight: 800; padding-top: 4px;">${order.orderNumber}</td>
                <td style="font-size: 13px; color: #0C0D11; font-weight: bold; text-transform: uppercase; text-align: right; padding-top: 4px;">${order.paymentMethod}</td>
              </tr>
            </table>

            <!-- Garment List -->
            <table width="100%" style="margin-bottom: 24px; border-collapse: collapse;">
              ${itemRows}
              <tr>
                <td style="padding: 14px 0 0; font-size: 14px; font-weight: 800; color: #0C0D11;">Total Amount</td>
                <td style="padding: 14px 0 0; text-align: right; font-family: monospace; font-size: 16px; font-weight: 900; color: #0C0D11;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
              </tr>
            </table>

            <!-- Shipping Destination -->
            <div style="background-color: #FAFAFC; border: 1px solid #F0F2F6; border-radius: 16px; padding: 16px; margin-bottom: 28px;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: #3B7BF6; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">Delivery Destination</span>
              <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0C0D11;">${order.shippingAddress.fullName}</p>
              <p style="margin: 2px 0 0; font-size: 12px; color: #4A4D59; line-height: 1.5;">
                ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
                Phone: ${order.shippingAddress.phone}
              </p>
            </div>

            <!-- Tax Invoice Button -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="${invoiceUrl}" target="_blank" style="display: inline-block; background-color: #0C0D11; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 32px; border-radius: 9999px;">
                    View & Print Tax Invoice
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 30px; background-color: #FAFAFC; border-top: 1px solid #F0F2F6; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #8E92A2;">
              © ${new Date().getFullYear()} Radha Outfit Collection. All Rights Reserved.
            </p>
            <p style="margin: 4px 0 0; font-size: 10px; color: #CBD5E1;">
              For adjustments, reply directly to this dispatch or contact your atelier assistant.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}