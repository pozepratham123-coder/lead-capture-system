# Lead Capture System

A production-ready, serverless lead capture system with intelligent spam detection, multi-customer support, and automated email notifications.

## 🌟 Features

- **🎯 Smart Lead Capture**: JavaScript snippet for easy form integration
- **🛡️ Spam Detection Engine**: Multi-factor spam scoring (disposable emails, honeypot, keywords, etc.)
- **📊 Google Sheets Integration**: Centralized lead storage and management
- **✉️ Automated Email Notifications**: Beautiful HTML email templates for new leads
- **🔄 Reclassification Workflow**: Real-time notifications when spam is manually reclassified
- **👥 Multi-Customer Support**: Single system supporting multiple clients
- **🚀 Serverless Architecture**: Powered by N8N workflows and Google Apps Script

---

## 📁 Project Structure

```
lead-capture-system/
│
├── README.md                              # You are here
├── CHANGELOG.md                           # Version history
├── product-strategy-and-roadmap.md       # Product strategy documentation
│
├── example-form.html                      # Demo contact form with integration
├── lead-capture-snippet.js                # JavaScript snippet for forms
│
├── n8n-workflow.json                      # Complete N8N workflow export
├── n8n-workflow-explanation.md           # Detailed workflow documentation
│
├── build-email-html-code.js              # Email template builder
├── email-template-final.html             # HTML email template
│
├── google-apps-script-status-monitor.js  # Status change monitoring script
├── real-time-status-monitoring-guide.md  # Setup guide for status monitoring
│
└── add-status-monitoring-to-existing-workflow.md  # Integration guide
```

---

## 🚀 Quick Start

### Prerequisites

- N8N instance (cloud or self-hosted)
- Google account (for Sheets & Apps Script)
- SMTP email credentials
- A website with a contact form

### 1. Deploy N8N Workflow

1. **Import workflow**: Open N8N → Import → Upload `n8n-workflow.json`
2. **Configure Google Sheets**:
   - Connect your Google account
   - Create a new sheet with columns: Name, Phone Number, Email Address, Lead Details, Status, etc.
   - Update Sheet ID in the workflow
3. **Configure SMTP**:
   - Add SMTP credentials in N8N
   - Update "From Email" address
4. **Activate workflow**

### 2. Integrate JavaScript Snippet

Add to your contact form:

```html
<script src="lead-capture-snippet.js"></script>
<script>
  const leadCapture = new LeadCapture({
    webhookUrl: 'YOUR_N8N_WEBHOOK_URL',
    customerId: 'your-company-id',
    formId: 'contact-form'
  });
  
  leadCapture.captureFormSubmission('your-form-id');
</script>
```

### 3. Set Up Status Monitoring (Optional)

For real-time reclassification notifications:

1. Open your Google Sheet → Extensions → Apps Script
2. Paste code from `google-apps-script-status-monitor.js`
3. Update webhook URL
4. Create installable trigger for `onEdit`

---

## 📖 Documentation

- **[N8N Workflow Explanation](n8n-workflow-explanation.md)** - Detailed breakdown of each node
- **[Product Strategy & Roadmap](product-strategy-and-roadmap.md)** - Rollout strategy, edge cases, future plans
- **[Status Monitoring Guide](real-time-status-monitoring-guide.md)** - Real-time notification setup
- **[CHANGELOG](CHANGELOG.md)** - Version history and updates

---

## 🎨 Spam Detection Signals

The system uses a multi-factor scoring algorithm:

| Signal | Points | Description |
|--------|--------|-------------|
| Disposable Email | 30 | tempmail.com, guerrillamail.com, etc. |
| Honeypot Filled | 40 | Hidden field was filled (bot detected) |
| Missing Name & Message | 20 | Critical fields empty |
| Suspicious Email Pattern | 25 | Excessive numbers, very short |
| Spam Keywords | 15 | "buy now", "free money", etc. |
| Suspicious Name | 10 | Single character, all numbers |

**Classification**: Score ≥ 50 = Possible Spam | Score < 50 = New Lead

---

## 🏗️ Architecture

```
Contact Form (Website)
    ↓ (JavaScript Snippet)
N8N Webhook
    ↓
Validate & Normalize
    ↓
Spam Detection Engine
    ↓
Google Sheets
    ↓ (If New Lead)
Customer Lookup
    ↓
Build Email HTML
    ↓
Send Email (SMTP)

[Parallel Path]
Google Sheets Manual Edit
    ↓ (Google Apps Script)
Status Change Webhook
    ↓
N8N Reclassification Flow
```

---

## � Configuration

### Customer Configuration

Edit `build-email-html-code.js` to add customers:

```javascript
const customerConfig = {
  'your-company': {
    email: 'leads@yourcompany.com',
    name: 'Your Company Name'
  }
};
```

### Environment Variables (N8N)

- `GOOGLE_SHEET_ID` - Your Google Sheet ID
- `DEFAULT_NOTIFICATION_EMAIL` - Fallback email address
- `NOTIFICATION_FROM_EMAIL` - Sender email address

---

## 🐛 Troubleshooting

See [Product Strategy & Roadmap](product-strategy-and-roadmap.md) for a complete troubleshooting guide covering:

- Frontend issues (CORS, payload)
- N8N workflow debugging
- Google Sheets/Apps Script errors
- Email delivery problems

---

## � Roadmap

**Next 2 Weeks:**

- CRM Integration (HubSpot/Salesforce)
- Retry mechanism for failed API calls
- Analytics dashboard (Looker Studio)
- AI-powered lead enrichment

See [Product Strategy & Roadmap](product-strategy-and-roadmap.md) for details.

---

## 📊 Multi-Customer Deployment

This system supports multiple customers from a single workflow:

1. Each customer gets a unique `customerId`
2. Leads are stored in the same sheet with customer filtering, OR
3. Leads route to customer-specific sheets based on ID
4. Email notifications go to customer-specific addresses

---

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs!

---

## 📝 License

MIT License - Feel free to use this for commercial or personal projects.

---

## 👤 Author

**Pratham Oza**  
Portfolio: [poza.in](https://poza.in)

---

## 🙏 Acknowledgments

Built with:
- [N8N](https://n8n.io/) - Workflow automation
- [Google Sheets](https://sheets.google.com/) - Data storage
- [Google Apps Script](https://script.google.com/) - Real-time triggers
