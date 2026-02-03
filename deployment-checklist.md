# Deployment Checklist - Lead Capture System

Complete this checklist before going live with the lead capture system.

---

## Phase 1: Infrastructure Setup

### 1.1 Google Sheets Setup
- [ ] Create new Google Sheet
- [ ] Add "Leads" tab with all 14 columns
- [ ] Apply conditional formatting (Status and Spam Score columns)
- [ ] Enable filters and freeze header row
- [ ] Get Sheet ID from URL
- [ ] Add N8N service account as Editor
- [ ] Test manual data entry (add sample row)

**Documentation**: [google-sheets-template.md](./google-sheets-template.md)

---

### 1.2 N8N Workflow Setup
- [ ] Import `n8n-workflow.json` to N8N instance
- [ ] Verify all 10 nodes imported correctly
- [ ] Configure Google Sheets OAuth2 credentials
- [ ] Test Google Sheets connection
- [ ] Configure SMTP credentials for email sending
- [ ] Test SMTP connection
- [ ] Set environment variables:
  - [ ] `GOOGLE_SHEET_ID`
  - [ ] `NOTIFICATION_FROM_EMAIL`
  - [ ] `GOOGLE_SHEET_URL` (optional)
  - [ ] `DEFAULT_NOTIFICATION_EMAIL` (optional)
- [ ] Activate workflow
- [ ] Copy webhook URL

**Webhook URL**: `https://____________/webhook/leads`

---

### 1.3 JavaScript Snippet Hosting
- [ ] Choose hosting method:
  - [ ] CDN (Cloudflare, AWS CloudFront)
  - [ ] Own web server
  - [ ] GitHub Pages
  - [ ] Customer-hosted
- [ ] Upload `lead-capture.js` to chosen location
- [ ] Verify file is accessible via HTTPS
- [ ] Test file loads in browser (check network tab)
- [ ] (Optional) Create minified version for production

**Script URL**: `https://____________/lead-capture.js`

---

## Phase 2: Configuration

### 2.1 Customer Configuration
- [ ] Update `Lookup Customer Config` node in N8N workflow
- [ ] Add customer entry:
  ```javascript
  'customer-id': {
    email: 'notification@customer.com',
    name: 'Customer Name'
  }
  ```
- [ ] Save and re-activate workflow
- [ ] Verify customer ID is unique and URL-safe
- [ ] Document customer ID for embedding code

**Customer ID**: `____________`

---

### 2.2 Embedding Code
- [ ] Generate embedding code for customer:
  ```html
  <script 
    src="YOUR_SCRIPT_URL"
    data-webhook-url="YOUR_WEBHOOK_URL"
    data-customer-id="YOUR_CUSTOMER_ID"
    data-honeypot-field="website"
    data-debug="false"
  ></script>
  ```
- [ ] Provide to customer with instructions
- [ ] Customer adds honeypot field to form (if not exists):
  ```html
  <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
  ```

---

## Phase 3: Testing (WITH DEBUG MODE)

### 3.1 End-to-End Test (Valid Lead)
- [ ] Set `data-debug="true"` in script tag
- [ ] Open browser console (F12)
- [ ] Submit test form with valid data:
  - Name: Test User
  - Email: test@realcompany.com
  - Phone: +1-555-0123
  - Message: "This is a test submission"
- [ ] ✅ Console shows "[LeadCapture] Successfully sent to webhook"
- [ ] ✅ Lead appears in Google Sheets within 10 seconds
- [ ] ✅ Status = "New Lead"
- [ ] ✅ Spam Score < 50
- [ ] ✅ Email notification received
- [ ] ✅ Email contains correct lead data

**Result**: Pass ☐ / Fail ☐

---

### 3.2 Spam Detection Test
- [ ] Submit form with spammy data:
  - Name: "ABC"
  - Email: test@tempmail.com (disposable)
  - Phone: (leave blank)
  - Message: "Buy now! Free money!"
  - **Fill honeypot field**: website = "spam.com"
- [ ] ✅ Lead appears in Google Sheets
- [ ] ✅ Status = "Possible Spam"
- [ ] ✅ Spam Score >= 50
- [ ] ✅ NO email notification sent
- [ ] ✅ Console shows spam signals logged

**Expected Spam Score**: 85+ (disposable email + honeypot + keywords)

**Result**: Pass ☐ / Fail ☐

---

### 3.3 Duplicate Prevention Test
- [ ] Submit same form twice within 5 seconds
- [ ] ✅ First submission: Webhook called
- [ ] ✅ Second submission: Skipped (console shows "Duplicate submission detected")
- [ ] ✅ Only ONE row in Google Sheets

**Result**: Pass ☐ / Fail ☐

---

### 3.4 Network Failure Test
- [ ] Submit form with INVALID webhook URL (change one character)
- [ ] ✅ Console shows retry attempts (3 times)
- [ ] ✅ Console shows final error after 3 failures
- [ ] Restore correct webhook URL
- [ ] Submit again
- [ ] ✅ Submission succeeds

**Result**: Pass ☐ / Fail ☐

---

### 3.5 Mobile Testing
- [ ] Test on iOS Safari
  - [ ] Form submission works
  - [ ] Data captured correctly
- [ ] Test on Android Chrome
  - [ ] Form submission works
  - [ ] Data captured correctly
- [ ] Test on mobile browser with slow connection
  - [ ] Retry logic works
  - [ ] No timeout errors

**Result**: Pass ☐ / Fail ☐

---

## Phase 4: Production Readiness

### 4.1 Disable Debug Mode
- [ ] Change `data-debug="false"` in embedding code
- [ ] Verify console no longer shows `[LeadCapture]` messages
- [ ] Submit test form
- [ ] ✅ Lead captured without console spam

---

### 4.2 Monitoring Setup
- [ ] Set up webhook health check (UptimeRobot, Pingdom, etc.)
  - Monitor URL: `YOUR_WEBHOOK_URL`
  - Check interval: 5 minutes
  - Alert on: >5 minutes downtime
- [ ] Configure N8N error workflow (optional)
  - Trigger: Any execution error
  - Action: Send Slack/email alert
- [ ] Set up Google Sheets daily summary (optional)
  - Apps Script: Send daily lead count email
  - Recipients: Operations team

**Health check URL**: `____________`

---

### 4.3 Documentation Handoff
- [ ] Share relevant docs with team:
  - [ ] [README.md](./README.md) - System overview
  - [ ] [lead-capture-guide.md](./lead-capture-guide.md) - Customer guide
  - [ ] [operational-guide.md](./operational-guide.md) - Operations runbook
  - [ ] [troubleshooting section](./operational-guide.md#troubleshooting-guide)
- [ ] Train support team on troubleshooting common issues
- [ ] Add webhook URL and sheet ID to team password manager
- [ ] Document escalation process for critical failures

---

### 4.4 Backup & Recovery
- [ ] Export N8N workflow as backup
  - File: `n8n-workflow-backup-YYYY-MM-DD.json`
  - Location: Secure storage (Google Drive, Git repo)
- [ ] Backup Google Sheet (File → Make a copy)
- [ ] Document recovery process:
  - [ ] How to restore workflow
  - [ ] How to reconfigure credentials
  - [ ] How to re-import sheet data
- [ ] Test restoration process (dry run)

---

## Phase 5: Go Live

### 5.1 Pre-Launch Verification
- [ ] All Phase 1-4 tasks completed
- [ ] Debug mode disabled
- [ ] Monitoring active
- [ ] Team trained
- [ ] Recovery process documented
- [ ] Customer notified of go-live date

---

### 5.2 Launch
- [ ] Customer deploys embedding code to production
- [ ] Monitor first hour closely:
  - [ ] Check for execution errors in N8N
  - [ ] Verify leads appearing in sheet
  - [ ] Verify emails being sent
- [ ] Submit test form from production site
- [ ] ✅ End-to-end flow works on production

**Go-Live Date**: ____/____/______

---

### 5.3 First 24 Hours
- [ ] Monitor lead volume (expected: ____ leads/day)
- [ ] Review spam detection accuracy:
  - [ ] Check false positive rate (legitimate leads marked as spam)
  - [ ] Check false negative rate (spam marked as legitimate)
- [ ] Manually review first 10 "Possible Spam" leads
  - [ ] If legitimate, manually change status to "New Lead"
  - [ ] Note patterns for threshold tuning
- [ ] Verify email deliverability (not going to spam)

**Actual Lead Volume**: ____
**False Positive Count**: ____
**False Negative Count**: ____

---

### 5.4 First Week
- [ ] Review 100+ leads (if available)
- [ ] Calculate spam detection metrics:
  - Spam rate: ____%
  - False positive rate: ____%
  - Average spam score for legitimate leads: ____
  - Average spam score for spam: ____
- [ ] Tune spam threshold if needed (see [spam-detection-logic.md](./spam-detection-logic.md#threshold-calibration))
- [ ] Update disposable email domain list if new patterns found
- [ ] Customer satisfaction check-in

---

## Phase 6: Optimization (Week 2+)

### 6.1 Performance Optimization
- [ ] Review N8N execution times
  - Average: ____ ms
  - Target: <500ms
- [ ] Check Google Sheets API quota usage
- [ ] Optimize workflow if bottlenecks found

---

### 6.2 Feature Enhancements (from roadmap)
- [ ] Week 1:
  - [ ] Email validation (NeverBounce)
  - [ ] Lead enrichment (Clearbit)
  - [ ] GDPR consent tracking
- [ ] Week 2:
  - [ ] CRM integration (HubSpot/Salesforce)
  - [ ] Advanced spam detection (ML)
  - [ ] Real-time dashboard

**Roadmap**: [operational-guide.md#future-improvements](./operational-guide.md#future-improvements-2-week-roadmap)

---

## Rollback Plan (If Issues Arise)

### Critical Failure Scenarios

**Scenario 1: Workflow completely broken**
1. Deactivate N8N workflow immediately
2. Notify customer to remove script tag temporarily
3. Restore from backup workflow
4. Re-test thoroughly before reactivating

**Scenario 2: All leads marked as spam**
1. Don't deactivate (leads are still being stored)
2. Adjust spam threshold in workflow
3. Manually review and reclassify leads in sheet
4. Send missed notification emails manually

**Scenario 3: Google Sheets quota exceeded**
1. Pause workflow temporarily
2. Switch to PostgreSQL/Airtable (requires migration)
3. Or implement batched writes (every 5 minutes)

---

## Success Criteria

The deployment is considered successful when:

- ✅ **Capture rate**: >99% of form submissions captured
- ✅ **False positive rate**: <5% of legitimate leads marked as spam
- ✅ **Uptime**: >99% webhook availability
- ✅ **Latency**: <1 second end-to-end processing
- ✅ **Customer satisfaction**: Positive feedback from first customer
- ✅ **Zero data loss**: All leads accounted for in Google Sheets

---

## Sign-Off

**Deployment Lead**: __________________ Date: ____/____/______

**Technical Reviewer**: __________________ Date: ____/____/______

**Customer Representative**: __________________ Date: ____/____/______

---

## Notes & Issues

(Use this space to document any issues encountered during deployment)

---

**Last Updated**: 2026-02-02  
**Version**: 1.0.0
