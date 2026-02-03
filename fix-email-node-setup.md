# Quick Fix: Add Code Node Before Send Email

## 🔧 The Problem

The Send Email node's HTML field expects **plain HTML** or **N8N expressions** like `{{ $json.field }}`, not JavaScript code.

You need to **build the HTML in a Code node first**, then pass it to the Send Email node.

---

## ✅ Solution: Add a Code Node

### Step 1: Add Code Node Before Send Email

1. **In your workflow**, find where you want to add the email building logic
2. **Click the + button** between "Customer Lookup" and "Send Email"
3. **Search for**: "Code"
4. **Add the Code node**
5. **Name it**: "Build Email HTML"

---

### Step 2: Paste the JavaScript Code

1. **Click on the "Build Email HTML" Code node**
2. **Paste the entire code** from [`build-email-html-code.js`](file:///Users/apple/LearnVibeCoding/lead-capture-system/build-email-html-code.js)
3. **Save the node**

---

### Step 3: Update Send Email Node

Now your Send Email node should use the output from the Code node:

1. **Click on "Send Email" node**
2. **Configure**:
   - **From Email**: `prat@fibr.ai`
   - **To Email**: `{{ $json.customerEmail }}`
   - **Subject**: `{{ $json.emailSubject }}` ← This comes from the Code node
   - **Email Type**: HTML
   - **Message (HTML)**: `{{ $json.emailHtml }}` ← This comes from the Code node

---

## 🎯 Workflow Structure

```
Customer Lookup
    ↓
Build Email HTML (Code Node) ← Add this!
    ↓
Send Email (uses {{ $json.emailHtml }})
```

---

## 📋 What the Code Node Does

The Code node:
1. ✅ Checks if lead is reclassified (`lead.reclassified`)
2. ✅ Builds appropriate HTML (reclassified vs new lead)
3. ✅ Returns `emailHtml` and `emailSubject`
4. ✅ Send Email node uses these values

---

## 🔑 Key Point

**Code Node** = JavaScript that builds the HTML  
**Send Email Node** = Just uses the HTML with `{{ $json.emailHtml }}`

---

**Add the Code node between Customer Lookup and Send Email, then update the Send Email node to use the expressions!** 🚀
