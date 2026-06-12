import { LeadEmail, ServiceSelection } from './types';
import { SERVICE_CATALOG } from './catalog';
import { formatIDR } from './money';

export function buildLeadEmail(lead: LeadEmail): string {
  const { guest, preferences, services, upgrade, subtotal, transcript } = lead;

  // Format timestamp in Asia/Makassar (WITA)
  const timestamp = new Date(guest.timestamp).toLocaleString('en-ID', {
    timeZone: 'Asia/Makassar',
    dateStyle: 'full',
    timeStyle: 'long',
  });

  // Build services table HTML
  const servicesRows = services
    .filter(s => s.selected)
    .map(service => {
      const catalogService = SERVICE_CATALOG.find(c => c.id === service.serviceId);
      if (!catalogService) return '';

      const valuesHtml = Object.entries(service.values)
        .map(([key, value]) => {
          const field = catalogService.captureFields.find(f => f.key === key);
          const label = field?.label || key;
          return `<div><strong>${label}:</strong> ${value}</div>`;
        })
        .join('');

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e6dccb;">
            <strong>${catalogService.name}</strong>
            <div style="font-size: 0.9em; color: #666; margin-top: 4px;">${valuesHtml}</div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e6dccb; text-align: right;">
            ${catalogService.price ? formatIDR(service.lineTotal) : 'Concierge to confirm'}
          </td>
        </tr>
      `;
    })
    .join('');

  // Build transcript HTML
  const transcriptHtml = transcript
    .map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString('en-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const role = msg.role === 'guest' ? 'Guest' : 'Concierge';
      return `
        <div style="margin-bottom: 12px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
          <div style="font-size: 0.85em; color: #888; margin-bottom: 4px;">
            <strong>${role}</strong> · ${time}
          </div>
          <div style="white-space: pre-wrap;">${msg.content}</div>
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #0F5C5B; }
    h2 { color: #C2954E; font-size: 1.2em; margin-top: 24px; border-bottom: 2px solid #E6DCCB; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px; background: #FBF7F0; border-bottom: 2px solid #0F5C5B; }
    .subtotal { font-size: 1.1em; font-weight: bold; text-align: right; padding: 16px; background: #FBF7F0; }
    .label { font-weight: bold; color: #2A2622; }
    .value { margin-left: 8px; }
  </style>
</head>
<body>
  <h1>New Pre-Arrival Request</h1>

  <h2>Guest Information</h2>
  <div><span class="label">Name:</span><span class="value">${guest.name}</span></div>
  <div><span class="label">Email:</span><span class="value">${guest.email}</span></div>
  <div><span class="label">Submitted:</span><span class="value">${timestamp}</span></div>

  <h2>Stay Preferences</h2>
  <div><span class="label">Bedding:</span><span class="value">${preferences.bedding}</span></div>
  <div><span class="label">Dietary/Allergies:</span><span class="value">${preferences.dietary || 'None'}</span></div>
  <div><span class="label">Occasion:</span><span class="value">${preferences.occasion}${preferences.occasionOther ? ` (${preferences.occasionOther})` : ''}</span></div>

  <h2>Requested Services</h2>
  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${servicesRows || '<tr><td colspan="2" style="padding: 12px; text-align: center; color: #888;">No services selected</td></tr>'}
    </tbody>
  </table>
  <div class="subtotal">
    Subtotal: ${formatIDR(subtotal)}
  </div>

  <h2>Room Upgrade</h2>
  ${upgrade.interested
    ? `<div><span class="label">Interested:</span><span class="value">Yes</span></div>
       <div><span class="label">Target category:</span><span class="value">${upgrade.targetCategory || 'Not specified'}</span> (Concierge to confirm availability and rate)</div>`
    : '<div><span class="value">Not requested</span></div>'
  }

  <h2>Full Transcript</h2>
  <div style="background: #f9f9f9; padding: 12px; border-radius: 8px;">
    ${transcriptHtml}
  </div>

  <hr style="margin: 32px 0; border: none; border-top: 1px solid #E6DCCB;">

  <p style="font-size: 0.9em; color: #888;">
    This request was submitted via The Anvaya Pre-Arrival Concierge Chat.
    A human concierge should follow up to confirm availability and finalize payment.
  </p>
</body>
</html>
  `.trim();
}
