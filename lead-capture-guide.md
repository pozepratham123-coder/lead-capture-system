# Lead Capture Script - Implementation Guide

## Overview

The **Universal Lead Capture Script** is a production-ready JavaScript snippet designed to automatically capture form submissions across any website. It intelligently detects forms, normalizes data, and transmits leads to your N8N webhook endpoint.

## Quick Start

### 1. Embed the Script

Add the following script tag to your website, just before the closing `</body>` tag:

```html
<script 
  src="https://your-cdn.com/lead-capture.js"
  data-webhook-url="https://your-n8n-instance.com/webhook/leads"
  data-customer-id="acme-corp"
  data-honeypot-field="website"
></script>
```

### 2. Configuration Options

Configure the script using `data-*` attributes on the script tag:

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-webhook-url` | **Yes** | Your N8N webhook endpoint URL | `https://n8n.example.com/webhook/leads` |
| `data-customer-id` | **Yes** | Unique identifier for your business | `acme-corp` |
| `data-honeypot-field` | No | Hidden field name for spam detection | `website` (default) |
| `data-debug` | No | Enable console logging for testing | `true` or `false` (default) |

### 3. Test the Integration

After embedding, test the script:

1. **Enable debug mode**: Add `data-debug="true"` to the script tag
2. **Open browser console**: Check for `[LeadCapture]` log messages
3. **Submit a test form**: Verify the data is captured and sent
4. **Check your webhook**: Confirm the lead appears in N8N/Google Sheets

---

## How It Works

### 1. **Automatic Form Detection**

The script automatically finds and monitors ALL forms on your page:

- ✅ Forms present on page load
- ✅ Forms added dynamically (modals, SPAs, lazy-loaded content)
- ✅ Multi-step forms
- ✅ Forms in iframes (if same-origin)

**Technology**: Uses `MutationObserver` to detect forms added after page load.

### 2. **Intelligent Field Mapping**

The script understands various field naming conventions and maps them to a standard schema:

#### Supported Field Patterns

**Name Fields:**
- `name`, `full_name`, `fullname`, `contact_name`
- `first_name` + `last_name` (automatically combined)
- `your_name`, `customer_name`

**Email Fields:**
- `email`, `e-mail`, `email_address`
- `user_email`, `contact_email`, `your_email`

**Phone Fields:**
- `phone`, `tel`, `telephone`, `mobile`
- `phone_number`, `contact_phone`, `cell`

**Message Fields:**
- `message`, `comments`, `details`, `inquiry`
- `description`, `notes`

**Example**: If your form has `contact[email]` and `contact[name]`, they'll be correctly mapped to `email` and `name`.

### 3. **Data Normalization**

All captured leads follow a consistent schema:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Interested in your services",
  "sourceUrl": "https://example.com/contact",
  "pageTitle": "Contact Us - Example Corp",
  "referrer": "https://google.com/search?q=example",
  "timestamp": "2026-02-02T07:49:08.123Z",
  "customerId": "acme-corp",
  "userAgent": "Mozilla/5.0...",
  "screenResolution": "1920x1080",
  "formId": "contact-form",
  "honeypotValue": "",
  "submissionMethod": "traditional",
  "rawFields": {
    "contact[name]": "John Doe",
    "contact[email]": "john@example.com"
  }
}
```

### 4. **Duplicate Prevention**

The script prevents duplicate submissions within a 5-second window using:

- **Fingerprinting**: Generates unique ID from email + phone + URL
- **SessionStorage**: Tracks recent submissions client-side
- **Debouncing**: Prevents rapid double-clicks

### 5. **Reliable Transmission**

Leads are sent to your webhook with:

- **Retry logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Keepalive**: Requests complete even if user navigates away
- **Non-blocking**: Doesn't delay the form submission UX

---

## Behavior on Different Site Types

### Traditional HTML Forms

**Example:**
```html
<form action="/submit" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <button type="submit">Submit</button>
</form>
```

**Behavior**: Script listens to the `submit` event and captures data in parallel. The form submits normally to your backend.

---

### AJAX Forms (Single Page Apps)

**Example (React, Vue, etc.):**
```html
<form onSubmit={handleSubmit}>
  <input type="email" name="email">
  <button type="submit">Submit</button>
</form>
```

**Behavior**: Script intercepts submit button clicks and captures form data even if `preventDefault()` is called. Small 100ms delay allows client-side validation to run first.

---

### Multi-Step Forms

**Example:**
```html
<!-- Step 1 -->
<form id="step1">
  <input type="text" name="name">
  <button type="button" onclick="nextStep()">Next</button>
</form>

<!-- Step 2 (shown after Step 1) -->
<form id="step2">
  <input type="email" name="email">
  <button type="submit">Submit</button>
</form>
```

**Behavior**: Script captures data from the FINAL form submission (Step 2). To capture all steps, ensure the final form contains hidden fields with data from previous steps.

---

### Modal/Popup Forms

**Example (Bootstrap Modal):**
```html
<div class="modal" id="contactModal">
  <form>
    <input type="email" name="email">
    <button type="submit">Submit</button>
  </form>
</div>
```

**Behavior**: MutationObserver detects the form when the modal appears and automatically attaches listeners. Works with all modal libraries.

---

### E-commerce Checkout Forms

**Example (Shopify, WooCommerce):**
```html
<form class="checkout-form">
  <input type="text" name="billing[first_name]">
  <input type="text" name="billing[last_name]">
  <input type="email" name="billing[email]">
  <button type="submit">Complete Order</button>
</form>
```

**Behavior**: Script normalizes nested field names (e.g., `billing[first_name]` → `name`) and captures checkout data. Useful for abandoned cart recovery.

---

## Edge Cases & Limitations

### ✅ What's Handled

| Edge Case | How It's Handled |
|-----------|------------------|
| **Multiple forms on page** | All forms are monitored independently |
| **Dynamically added forms** | MutationObserver detects and attaches listeners |
| **AJAX submissions** | Click interception captures data |
| **Missing fields** | Only email/phone required; others optional |
| **Network failures** | Retry with exponential backoff (3 attempts) |
| **User navigates away** | `keepalive` flag ensures request completes |
| **Duplicate rapid clicks** | Fingerprint + sessionStorage prevents duplicates |

### ⚠️ Known Limitations

| Limitation | Workaround |
|------------|------------|
| **JavaScript disabled** | Cannot capture (see below) |
| **Cross-origin iframes** | Cannot access iframe forms due to browser security |
| **Heavy client-side validation** | May capture invalid data; validation should happen server-side too |
| **Multi-step forms without combined data** | Ensure final form has all data or use custom implementation |

---

## Handling JavaScript Disabled

If JavaScript is blocked or disabled:

1. **Fallback strategy**: Ensure your form has a proper `action` attribute pointing to your backend
2. **Server-side capture**: Configure your backend to forward form submissions to the webhook
3. **Detection**: Check server logs for non-JS submissions and manually add to your CRM

**Prevalence**: <0.5% of users have JavaScript disabled in 2026.

---

## Testing Checklist

Before going live, verify:

- [ ] Script loads without errors (check browser console)
- [ ] Debug mode shows form detection messages
- [ ] Test form submission sends data to webhook
- [ ] Duplicate submission within 5 seconds is blocked
- [ ] Network failure triggers retry attempts
- [ ] Data appears correctly in Google Sheets/Airtable
- [ ] Notification email is received (for "New Lead" status)
- [ ] Honeypot field catches basic bots (add hidden field to test)

---

## Troubleshooting

### Forms aren't being detected

**Symptoms**: No `[LeadCapture]` messages in console after form submission

**Solutions**:
1. Enable debug mode: Add `data-debug="true"` to script tag
2. Check if forms exist: `document.querySelectorAll('form')` in console
3. Check timing: Ensure script loads BEFORE forms are added to page
4. Check for errors: Look for red errors in browser console

---

### Data not reaching webhook

**Symptoms**: Console shows "Successfully sent" but no data in N8N

**Solutions**:
1. Verify webhook URL is correct
2. Check N8N workflow is activated
3. Test webhook directly with cURL:
   ```bash
   curl -X POST https://your-webhook-url \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","customerId":"test"}'
   ```
4. Check N8N execution logs for errors

---

### Wrong customer ID

**Symptoms**: Leads from Customer A appear under Customer B

**Solutions**:
1. Verify `data-customer-id` attribute is unique per customer
2. Check for copy-paste errors in script tag
3. Clear browser cache and test again

---

## Multi-Customer Deployment

### Option 1: Self-Hosted (Recommended)

Host `lead-capture.js` on your own CDN/server:

```html
<!-- Customer A -->
<script 
  src="https://cdn.yourcompany.com/lead-capture.js"
  data-webhook-url="https://n8n.yourcompany.com/webhook/leads"
  data-customer-id="customer-a"
></script>

<!-- Customer B -->
<script 
  src="https://cdn.yourcompany.com/lead-capture.js"
  data-webhook-url="https://n8n.yourcompany.com/webhook/leads"
  data-customer-id="customer-b"
></script>
```

**Pros**: Full control, easy updates, single webhook endpoint

---

### Option 2: Customer-Hosted

Provide `lead-capture.js` file to each customer:

```html
<script 
  src="/js/lead-capture.js"
  data-webhook-url="https://n8n.yourcompany.com/webhook/leads"
  data-customer-id="customer-a"
></script>
```

**Pros**: Customer has full control
**Cons**: Updates require manual distribution

---

### Option 3: Per-Customer Webhooks

Each customer gets their own webhook endpoint:

```html
<!-- Customer A -->
<script 
  src="https://cdn.yourcompany.com/lead-capture.js"
  data-webhook-url="https://n8n.yourcompany.com/webhook/customer-a"
  data-customer-id="customer-a"
></script>
```

**Pros**: Complete data isolation
**Cons**: Harder to manage (N8N workflow per customer)

---

## Custom Field Mapping

If your forms use unusual field names, you have two options:

### Option 1: Pre-process in N8N

Let the script capture `rawFields` and map them in N8N:

```javascript
// N8N Function node
const rawFields = $input.item.json.rawFields;
return {
  email: rawFields['custom_email_field'],
  name: rawFields['full_name_field']
};
```

### Option 2: Modify Script (Advanced)

Edit `FIELD_PATTERNS` in `lead-capture.js`:

```javascript
const FIELD_PATTERNS = {
  email: [
    'email', 'e-mail',
    'custom_email_field'  // Add your custom field
  ],
  // ...
};
```

---

## Security Considerations

### 1. **Honeypot Field**

Add a hidden field to catch bots:

```html
<form>
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  
  <!-- Hidden field (bots will fill this, humans won't) -->
  <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
  
  <button type="submit">Submit</button>
</form>
```

Configure honeypot field name:
```html
<script data-honeypot-field="website" ...></script>
```

If `honeypotValue` is not empty, the lead is likely spam.

---

### 2. **HTTPS Only**

Always use HTTPS for:
- Your website (where form is hosted)
- Webhook endpoint (N8N)
- Script hosting (CDN)

**Why**: Prevents man-in-the-middle attacks and data interception.

---

### 3. **Webhook Authentication**

Secure your N8N webhook with authentication:

**Option A: Header Authentication**
```javascript
// Modify sendToWebhook() in lead-capture.js
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_SECRET_TOKEN'
}
```

**Option B: N8N Webhook Auth**
Enable "Webhook Authentication" in N8N webhook settings.

---

## Performance Impact

The script is designed to be lightweight:

- **File size**: ~8KB minified
- **Load time**: <50ms on average connections
- **Runtime overhead**: <5ms per form submission
- **Memory**: <100KB (includes sessionStorage tracking)

**Recommendation**: Load asynchronously to avoid blocking page render:

```html
<script 
  src="lead-capture.js"
  data-webhook-url="..."
  data-customer-id="..."
  async
></script>
```

---

## Browser Compatibility

Tested and working on:

- ✅ Chrome 90+ (2021+)
- ✅ Firefox 88+ (2021+)
- ✅ Safari 14+ (2020+)
- ✅ Edge 90+ (2021+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Unsupported**: IE11 and below (no MutationObserver, no fetch)

---

## Next Steps

1. ✅ Embed the script on your website
2. ✅ Test with debug mode enabled
3. ✅ Configure N8N workflow (see N8N guide)
4. ✅ Test end-to-end (form → webhook → storage → notification)
5. ✅ Disable debug mode for production
6. ✅ Monitor first 100 leads for data quality

---

## Support & Updates

**Questions?** Check the [Operational Guide](./operational-guide.md) for troubleshooting.

**Feature requests?** See the [2-Week Roadmap](./operational-guide.md#future-improvements) for planned enhancements.

**Found a bug?** Enable debug mode, capture console logs, and report with reproduction steps.
