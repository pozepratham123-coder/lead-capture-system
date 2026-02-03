const lead = $input.item.json;

// Check if data is nested in 'body' (from webhook) or directly in json
const data = lead.body || lead;

// Debug: Log the incoming data
console.log('=== INCOMING LEAD DATA ===');
console.log('data.reclassified:', data.reclassified);
console.log('typeof data.reclassified:', typeof data.reclassified);

// Be very explicit about checking reclassified
const isReclassified = data.reclassified === true || data.reclassified === 'true';

console.log('isReclassified:', isReclassified);

// Normalize field names - Google Sheets format FIRST
const normalizedLead = {
  name: data.Name || data.name || 'N/A',
  email: data['Email Address'] || data.email || 'N/A',
  phone: data['Phone Number'] || data.phone || 'N/A',
  message: data['Lead Details'] || data.message || 'N/A',
  pageTitle: data['Page Title'] || data.pageTitle || 'N/A',
  sourceUrl: data['Submission URL'] || data.sourceUrl || 'N/A',
  referrer: data.referrer || 'Direct',
  submittedAt: data['Created At'] || data.submittedAt || 'N/A',
  spamScore: data['Spam Score'] || data.spamScore || 0,
  leadSource: data['Lead Source'] || data.leadSource || 'N/A',
  customerId: data['Customer Name'] || data.customerId || 'N/A',
  customerName: lead.customerName || 'Unknown Customer',
  formId: data['Form ID'] || data.formId || 'N/A',
  reclassifiedAt: data.reclassifiedAt || 'N/A',
  previousStatus: data.previousStatus || 'N/A'
};

console.log('=== NORMALIZED LEAD ===');
console.log('name:', normalizedLead.name);
console.log('email:', normalizedLead.email);
console.log('customerName:', normalizedLead.customerName);

// Choose email template based on type
let emailHtml;
let emailSubject;

if (isReclassified) {
  console.log('✅ Using RECLASSIFIED template');
  // RECLASSIFIED LEAD EMAIL
  emailSubject = `🔄 Reclassified Lead: ${normalizedLead.name} from ${normalizedLead.customerName}`;

  emailHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0070ff 0%, #00a3ff 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .badge { display: inline-block; padding: 6px 12px; background: #fbbf24; color: #78350f; border-radius: 12px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .warning { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24; margin-bottom: 20px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .field-value { font-size: 16px; color: #111827; word-wrap: break-word; }
    .metadata { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔄 Lead Reclassified!</h1>
    <div class="badge">Previously Marked as Spam</div>
  </div>
  <div class="content">
    <div class="warning">
      <strong>⚠️ Note:</strong> This lead was originally flagged as "Possible Spam" but has been manually reclassified.
    </div>
    <div class="field">
      <div class="field-label">Name</div>
      <div class="field-value">${normalizedLead.name}</div>
    </div>
    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-value"><a href="mailto:${normalizedLead.email}" style="color: #0070ff; text-decoration: none;">${normalizedLead.email}</a></div>
    </div>
    <div class="field">
      <div class="field-label">Phone</div>
      <div class="field-value">${normalizedLead.phone}</div>
    </div>
    <div class="field">
      <div class="field-label">Message</div>
      <div class="field-value">${normalizedLead.message}</div>
    </div>
    <div class="metadata">
      <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Lead Context</h3>
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Previous Status:</strong> ${normalizedLead.previousStatus}</p>
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Source:</strong> ${normalizedLead.pageTitle}</p>
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>URL:</strong> ${normalizedLead.sourceUrl}</p>
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Lead Source:</strong> ${normalizedLead.leadSource}</p>
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Original Spam Score:</strong> ${normalizedLead.spamScore} / 100</p>
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Submitted:</strong> ${normalizedLead.submittedAt}</p>
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Reclassified:</strong> ${normalizedLead.reclassifiedAt}</p>
    </div>
  </div>
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
    <p>This lead was manually reclassified from spam to legitimate.</p>
    <p>Customer: ${normalizedLead.customerName} (${normalizedLead.customerId})</p>
  </div>
</body>
</html>`;

} else {
  console.log('❌ Using NEW LEAD template (reclassified was false)');
  // NEW LEAD EMAIL
  emailSubject = `🎯 New Lead: ${normalizedLead.name} from ${normalizedLead.customerName}`;

  emailHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0070ff 0%, #00a3ff 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .field-value { font-size: 16px; color: #111827; word-wrap: break-word; }
    .metadata { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e5e7eb; }
    .metadata-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .metadata-item:last-child { border-bottom: none; }
    .spam-score { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #d1fae5; color: #065f46; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0070ff 0%, #00a3ff 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 New Lead Received!</h1>
  </div>
  <div class="content">
    <div class="field">
      <div class="field-label">Name</div>
      <div class="field-value">${normalizedLead.name}</div>
    </div>
    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-value"><a href="mailto:${normalizedLead.email}" style="color: #0070ff; text-decoration: none;">${normalizedLead.email}</a></div>
    </div>
    <div class="field">
      <div class="field-label">Phone</div>
      <div class="field-value">${normalizedLead.phone}</div>
    </div>
    <div class="field">
      <div class="field-label">Message</div>
      <div class="field-value">${normalizedLead.message}</div>
    </div>
    <div class="metadata">
      <h3 style="margin-top: 0; font-size: 14px; color: #6b7280;">Lead Context</h3>
      <div class="metadata-item">
        <span style="color: #6b7280;">Source Page:</span>
        <span style="font-weight: 600;">${normalizedLead.pageTitle}</span>
      </div>
      <div class="metadata-item">
        <span style="color: #6b7280;">URL:</span>
        <span style="font-size: 12px;">${normalizedLead.sourceUrl}</span>
      </div>
      <div class="metadata-item">
        <span style="color: #6b7280;">Referrer:</span>
        <span>${normalizedLead.referrer}</span>
      </div>
      <div class="metadata-item">
        <span style="color: #6b7280;">Submitted:</span>
        <span>${normalizedLead.submittedAt}</span>
      </div>
      <div class="metadata-item">
        <span style="color: #6b7280;">Spam Score:</span>
        <span class="spam-score">${normalizedLead.spamScore} / 100</span>
      </div>
    </div>
    <a href="https://docs.google.com/spreadsheets/d/1ztbfKuue6ad5QvuTPn0gdKUxFzfNwvVS-s7r2KdT588" class="btn" style="color: white;">
      📊 View in Google Sheets
    </a>
  </div>
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
    <p>This is an automated notification from your Lead Capture System.</p>
    <p>Customer: ${normalizedLead.customerName} (${normalizedLead.customerId})</p>
  </div>
</body>
</html>`;
}

console.log('Email subject:', emailSubject);

return {
  json: {
    ...lead,
    emailHtml: emailHtml,
    emailSubject: emailSubject
  }
};
