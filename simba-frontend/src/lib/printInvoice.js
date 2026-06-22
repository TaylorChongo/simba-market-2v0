export function printInvoice({ orderId, fulfillmentBranch, deliveryAddress, deliveryInstructions, phone, totalPrice, items = [] }) {
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${orderId || ''}</title>
<style>
  body{font-family:sans-serif;color:#000;padding:32px;font-size:13px}
  h1{margin:0;font-size:22px}
  hr{border:none;border-top:1px solid #ddd;margin:16px 0}
  table{width:100%;border-collapse:collapse}
  th,td{padding:8px 4px;text-align:left}
  th{font-size:10px;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #000}
  td{border-bottom:1px solid #eee}
  .right{text-align:right}.center{text-align:center}
  .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin:0 0 4px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0 24px}
  .header{display:flex;justify-content:space-between;align-items:flex-start}
  @media print{@page{margin:20mm}}
</style></head><body>
<div class="header">
  <div><h1>Simba Market</h1><p style="color:#666;margin:4px 0 0;font-size:12px">Rwanda's Choice</p></div>
  <div style="text-align:right"><strong>TAX INVOICE</strong>${orderId ? `<br><span style="color:#666;font-size:12px">Order #${orderId}</span>` : ''}<br><span style="color:#666;font-size:12px">${new Date().toLocaleDateString('en-RW', { dateStyle: 'long' })}</span></div>
</div>
<hr>
<div class="meta">
  <div><p class="label">Fulfillment Branch</p><strong>${fulfillmentBranch || 'Simba Supermarket'}</strong></div>
  <div><p class="label">Delivery Address</p><strong>${deliveryAddress || 'Kigali, Rwanda'}</strong>${deliveryInstructions ? `<br><span style="color:#555">${deliveryInstructions}</span>` : ''}</div>
  ${phone ? `<div><p class="label">Contact</p><strong>${phone}</strong></div>` : ''}
  <div><p class="label">Payment</p><strong>Pay on Delivery</strong></div>
</div>
<table>
  <thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Unit Price</th><th class="right">Total</th></tr></thead>
  <tbody>${items.map(item => `<tr><td>${item.name || item.product?.name}</td><td class="center">${item.quantity}</td><td class="right">RWF ${(item.price ?? item.product?.price)?.toLocaleString()}</td><td class="right"><strong>RWF ${((item.price ?? item.product?.price) * item.quantity)?.toLocaleString()}</strong></td></tr>`).join('')}</tbody>
  <tfoot><tr><td colspan="3" class="right" style="padding-top:12px;font-weight:700;font-size:14px">Total</td><td class="right" style="padding-top:12px;font-weight:900;font-size:16px">RWF ${totalPrice?.toLocaleString()}</td></tr></tfoot>
</table>
<hr>
<p style="text-align:center;color:#888;font-size:11px;margin-top:12px">Thank you for shopping at Simba Market</p>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
