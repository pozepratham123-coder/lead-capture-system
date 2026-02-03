# Product Strategy & Roadmap: Lead Capture System

**Date:** February 4, 2026  
**Author:** Lead Product Manager  
**Status:** Production Ready  

---

## 1. Rollout Strategy: Scaling to 3 Customers

To roll this system out to 3 distinct customers (e.g., Client A, Client B, Client C), we will use a **multi-tenant configuration approach** rather than duplicating the entire infrastructure. This ensures maintainability while keeping customer data isolated.

### **Phase 1: Configuration & Tenant Isolation**
*   **Unique Identifiers:** Assign a unique `customerId` string to each client (e.g., `client-a`, `client-b`).
*   **Data Destination:**
    *   **Option A (Single Sheet, Filtered Views):** Use one master Google Sheet with a "Customer ID" column. Create filtered views for each client to see only their leads. Best for low volume/internal management.
    *   **Option B (Distinct Sheets):** Create separate Google Sheets for each client. Update the N8N "Customer Lookup" node to route data to the specific Sheet ID based on the incoming `customerId`.
*   **Email Personalization:** Update the "Customer Lookup" node to store distinct "To" addresses and "Client Names" for each ID.

### **Phase 2: Deployment**
1.  **Client A:** Deploy the standard JS snippet with `customerId: 'client-a'`.
2.  **Client B:** Deploy the same snippet but change the config to `customerId: 'client-b'`.
3.  **Client C:** Deploy with `customerId: 'client-c'`.

### **Phase 3: Verification**
*   Perform end-to-end testing for each client to ensure leads route to the correct email recipients and appear in the correct sheet/view.

---

## 2. Scenarios & Edge Cases Accounted For

We have designed the system to be robust against common failure modes in lead generation.

*   **🚫 Spam & Bot Protection:**
    *   **Honeypot Fields:** Hidden fields to catch bots that auto-fill forms.
    *   **Heuristic Scoring:** Analysis of submission speed and content patterns.
    *   **Graceful Degradation:** Spam isn't silently deleted; it's logged as "Possible Spam" so no data is ever truly lost.

*   **🔄 False Positives (The "Important Lead" Scenario):**
    *   We accounted for legitimate leads being wrongly flagged as spam.
    *   **Solution:** The "Reclassification Workflow" allows a human to simply change a dropdown in Google Sheets to trigger the missed email notification immediately.

*   **📝 Data Inconsistency:**
    *   **Field Mapping:** The system handles different casing (`Name` vs `name`) and field structures (Webhook JSON vs Google Sheet Rows) using a normalization layer, ensuring downstream tools always get clean data.

*   **❌ User Errors:**
    *   **Invalid Emails:** Basic regex validation on the frontend prevents obvious typos.
    *   **Empty Submissions:** Required field constraints prevent blank forms from being submitted.

---

## 3. Product Roadmap: Next 2 Weeks

If we had an additional sprint (2 weeks), we would focus on **Resilience** and **Intelligence**.

### **Week 1: Reliability & Integrations**
*   **CRM Integration (HubSpot/Salesforce):** Google Sheets is great for starting, but scaling requires a CRM. We would add an N8N node to push "New Leads" directly into a CRM pipeline.
*   **Retry Mechanism:** Currently, if Google Sheets API fails, the lead might be lost. We would implement a Redis-backed queue or local file logging in N8N to retry failed insertions.

### **Week 2: Analytics & AI**
*   **Lead Quality Dashboard:** Create a Looker Studio dashboard connected to the Google Sheet to visualize:
    *   Conversion Rate (Views vs. Submissions).
    *   Spam Rate over time.
    *   Time-to-Response (Submission time vs. Reclassification/Contact time).
*   **AI Enrichment:** Use an OpenAI node to analyze the "Message" content:
    *   **Sentiment Analysis:** Is the user angry or happy?
    *   **Intent Classification:** Are they valid buyers, hiring managers, or tiered support?
    *   **Auto-Drafting:** Generate a suggested email reply based on their inquiry.

---

## 4. Troubleshooting Guide: "Leads Aren't Being Captured"

If a customer reports missing leads, follow this triage flow:

### **Level 1: Frontend (The Source)**
*   **Check the Browser Console:** Open Developer Tools on the landing page. Are there Red 400/500 errors when clicking submit?
    *   *Fix:* CORS issues or wrong Webhook URL in the snippet.
*   **Network Tab:** Verify the payload includes the correct `customerId` and the honeypot field is empty.

### **Level 2: Middleware (N8N)**
*   **Check Execution Logs:** Open N8N.
    *   **No Executions?** The webhook isn't being hit. Issue is likely Frontend or DNS.
    *   **Failed Execution?** Check the specific node.
        *   *Google Sheets Node Error:* Likely expired credentials or changed column headers.
        *   *Email Node Error:* SMTP authentication failure.

### **Level 3: Backend (Google Sheets/Script)**
*   **Check "Possible Spam":** Is the lead actually there but hidden? Check the spam rows.
*   **Apps Script Logs:** If reclassification emails aren't sending, go to `Extensions > Apps Script > Executions`.
    *   *Error:* "Exception: Service invoked too many times" (Quota limit).
    *   *Error:* "Address unavailable" (Invalid email in the row).

### **Level 4: Delivery (The Destination)**
*   **Spam Folder:** Check the recipient's spam folder. Transactional emails from Gmail/SMTP often get flagged if the domain isn't "warmed up."
