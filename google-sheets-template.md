# Google Sheets Template for Lead Capture System

## Quick Setup

1. Create a new Google Sheet
2. Name it: "Lead Capture System - [Your Company]"
3. Create a tab named: **"Leads"**
4. Add the following columns in **Row 1** (headers):

---

## Column Headers (Copy & Paste)

```
Name	Phone Number	Email Address	Lead Details	Status	Submission URL	Lead Source	Customer Name	Created At	Updated At	Spam Score	Page Title	Form ID	User Agent
```

**OR** manually create these 14 columns:

---

## Column Reference

| # | Column Name | Data Type | Description | Example |
|---|-------------|-----------|-------------|---------|
| A | **Name** | Text | Contact's full name | John Doe |
| B | **Phone Number** | Text | Contact phone (with country code) | +1-555-0123 |
| C | **Email Address** | Email | Contact email | john@example.com |
| D | **Lead Details** | Text | Message/inquiry from form | "Interested in enterprise plan..." |
| E | **Status** | Text | Lead classification | New Lead / Possible Spam |
| F | **Submission URL** | URL | Page where form was submitted | https://example.com/contact |
| G | **Lead Source** | Text | Traffic source (referrer) | Google / Direct / LinkedIn |
| H | **Customer Name** | Text | Customer identifier | acme-corp |
| I | **Created At** | Timestamp | Submission time (ISO format) | 2026-02-02T07:49:08.123Z |
| J | **Updated At** | Timestamp | Last processed time | 2026-02-02T07:49:09.001Z |
| K | **Spam Score** | Number | Numeric spam score (0-100+) | 15 |
| L | **Page Title** | Text | Title of submission page | Contact Us - ACME Corp |
| M | **Form ID** | Text | Form identifier | contact-form |
| N | **User Agent** | Text | Browser user agent | Mozilla/5.0... |

---

## Formatting Recommendations

### 1. Header Row Styling
- **Background color**: Light gray (#f3f4f6)
- **Text**: Bold, centered
- **Font size**: 11pt

### 2. Status Column (E) - Conditional Formatting

**Rule 1: New Lead (Green)**
- Format cells where: `Text is exactly "New Lead"`
- Background: Light green (#d1fae5)
- Text color: Dark green (#065f46)

**Rule 2: Possible Spam (Orange)**
- Format cells where: `Text is exactly "Possible Spam"`
- Background: Light orange (#fed7aa)
- Text color: Dark orange (#9a3412)

### 3. Spam Score Column (K) - Conditional Formatting

**Rule 1: Low (0-20) - Green**
- Format cells where: `Value is between 0 and 20`
- Background: Light green (#d1fae5)

**Rule 2: Medium (21-49) - Yellow**
- Format cells where: `Value is between 21 and 49`
- Background: Light yellow (#fef3c7)

**Rule 3: High (50+) - Red**
- Format cells where: `Value is >= 50`
- Background: Light red (#fee2e2)

### 4. Freeze Header Row
- Select Row 1
- View → Freeze → 1 row

### 5. Add Filters
- Select all headers (A1:N1)
- Data → Create a filter

---

## Advanced: Data Validation

### Status Column (E)
1. Select column E (from E2 downward)
2. Data → Data validation
3. Criteria: List of items
4. Items: `New Lead, Possible Spam`
5. This allows manual status changes from dropdown

---

## Sample Data (For Testing)

Add this test row to verify your setup:

| Name | Phone | Email | Lead Details | Status | Submission URL | Lead Source | Customer | Created At | Updated At | Spam Score | Page Title | Form ID | User Agent |
|------|-------|-------|--------------|--------|----------------|-------------|----------|------------|------------|------------|------------|---------|------------|
| Test User | +1-555-0123 | test@example.com | This is a test submission | New Lead | https://example.com/contact | Direct | test-customer | 2026-02-02T08:00:00.000Z | 2026-02-02T08:00:01.000Z | 5 | Contact Us | contact-form | Mozilla/5.0... |

---

## Useful Views & Filters

### View 1: New Leads Only
- Filter: Status = "New Lead"
- Sort: Created At (newest first)

### View 2: Possible Spam Review
- Filter: Status = "Possible Spam"
- Sort: Spam Score (highest first)

### View 3: By Customer
- Filter: Customer Name = "your-customer-id"
- Sort: Created At (newest first)

### View 4: High-Value Leads
- Filter: Status = "New Lead" AND Spam Score < 10
- Sort: Created At (newest first)

---

## Sharing & Permissions

### For N8N Service Account
1. Click "Share" button
2. Add your N8N Google OAuth2 email
3. Permissions: **Editor** (required for append/update)

### For Team Members (View Only)
1. Click "Share" button
2. Add team member emails
3. Permissions: **Viewer** or **Commenter**

### For Customers (Optional)
Create a filtered view showing only their leads:
1. Data → Filter views → Create new filter view
2. Name: "[Customer Name] Leads"
3. Filter: Customer Name = "customer-id"
4. Share this view link (read-only)

---

## Troubleshooting

### Leads not appearing?
1. Check N8N Google Sheets node has correct Sheet ID
2. Verify OAuth2 credentials are connected
3. Check if sheet name is exactly "Leads" (case-sensitive)
4. Verify all 14 column headers exist in Row 1

### Permission errors?
1. Verify N8N service account has Editor access
2. Try disconnecting and reconnecting OAuth2 in N8N
3. Check sharing settings (not "Private")

### Wrong data in columns?
1. Verify column order matches exactly (A-N as listed above)
2. Check N8N node's column mapping
3. Test with sample cURL request (see spam-detection-logic.md)

---

## Getting the Sheet ID

1. Open your Google Sheet
2. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
3. Copy the SHEET_ID_HERE part
4. Add to N8N environment variable:
   ```
   GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j
   ```

---

## Optional: Add Calculated Columns

### Column O: Time to Process
```
=J2-I2
```
Shows how long N8N took to process the lead.

### Column P: Days Since Submission
```
=NOW()-I2
```
Shows how many days ago the lead was submitted.

### Column Q: Lead Quality Score
```
=IF(K2<10,"High",IF(K2<30,"Medium","Low"))
```
Categorizes leads by spam score.

---

## Backup & Export

**Recommended backup schedule:**
- **Weekly**: File → Download → CSV
- **Monthly**: File → Make a copy → Rename with date

**Automation (Advanced):**
Use Google Apps Script to auto-export to Google Drive weekly.

---

## Summary Checklist

Before connecting to N8N:

- [ ] Sheet created and named
- [ ] Tab named "Leads" exists
- [ ] All 14 columns added in exact order
- [ ] Header row formatted
- [ ] Conditional formatting applied to Status column
- [ ] Filters enabled
- [ ] Header row frozen
- [ ] N8N service account added as Editor
- [ ] Sheet ID copied and saved
- [ ] Test data added and verified

You're ready to receive leads! 🚀
