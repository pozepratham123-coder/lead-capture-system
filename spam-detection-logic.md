# N8N Workflow - Spam Detection Logic

## Overview

The spam detection engine uses a **multi-factor scoring system** to classify leads as either `New Lead` or `Possible Spam`. This approach is explainable, tunable, and designed to minimize false positives while catching obvious spam.

---

## Scoring Algorithm

### Classification Threshold

```
Spam Score >= 50  →  "Possible Spam"
Spam Score < 50   →  "New Lead"
```

### Confidence Levels

- **High Confidence**: Score >= 70 (very likely spam)
- **Medium Confidence**: Score 50-69 (probably spam, worth manual review)
- **Low Confidence**: Score < 50 (legitimate lead)

---

## Detection Signals

The engine evaluates **6 independent signals**, each contributing points to the total spam score:

### 1. Disposable Email Domains (30 points)

**Logic**: Checks if the email domain is from a known disposable/temporary email provider.

**Disposable domains list**:
- tempmail.com
- guerrillamail.com
- 10minutemail.com
- mailinator.com
- maildrop.cc
- trashmail.com
- yopmail.com
- temp-mail.org
- fakeinbox.com
- sharklasers.com
- getnada.com
- throwaway.email

**Why this matters**: Disposable emails are commonly used by spammers to avoid detection. Legitimate users rarely use them for business inquiries.

**Example**:
```
✅ john@gmail.com → 0 points
❌ test@tempmail.com → +30 points
```

---

### 2. Honeypot Field Filled (40 points)

**Logic**: If the honeypot field (default: `website`) contains any value, it's almost certainly a bot.

**How it works**:
1. Add a hidden field to your form: `<input type="text" name="website" style="display:none">`
2. Humans cannot see or fill this field
3. Bots auto-fill ALL fields, including hidden ones

**Why this matters**: Honeypots have a near-zero false positive rate. Humans physically cannot fill hidden fields.

**Example**:
```
✅ honeypotValue: "" → 0 points
❌ honeypotValue: "http://spam.com" → +40 points
```

**Implementation tip**: Ensure the honeypot field has a realistic name like `website`, `phone2`, or `company_url` to fool smarter bots.

---

### 3. Missing Critical Fields (20 points)

**Logic**: If BOTH name AND message are missing, this is likely spam or a low-quality lead.

**Why this matters**: Legitimate users typically provide context (name + message). Spam submissions often have only an email address.

**Example**:
```
✅ name: "John Doe", message: "I need a quote" → 0 points
❌ name: "Unknown", message: "" → +20 points
```

**Tuning considerations**:
- Some forms only collect email (newsletter signups) - adjust threshold for these use cases
- For contact forms, this signal is highly reliable

---

### 4. Suspicious Email Patterns (25 points)

**Logic**: Analyzes the email address structure for spam indicators.

#### 4a. Excessive Numbers (15 points)

Checks if >60% of the email local part (before @) is numbers.

**Example**:
```
✅ john.doe@example.com → 0 points (0% numbers)
⚠️ john123@example.com → 0 points (33% numbers)
❌ user1234567890@example.com → +15 points (71% numbers)
```

#### 4b. Very Short Email (10 points)

Checks if the local part is < 3 characters.

**Example**:
```
✅ john@example.com → 0 points (4 characters)
❌ ab@example.com → +10 points (2 characters)
❌ a@b.com → +10 points (1 character)
```

**Why this matters**: Spam bots often generate random short emails. Legitimate users typically have recognizable email addresses.

---

### 5. Spam Keywords in Message (15 points)

**Logic**: Scans the message field for common spam phrases.

**Spam keyword list**:
- "buy now"
- "click here"
- "free money"
- "earn cash"
- "lose weight"
- "viagra"
- "casino"
- "lottery"
- "nigerian prince"
- "act now"
- "limited time"
- "special promotion"
- "congratulations"
- "you won"

**Why this matters**: Spam messages contain predictable marketing language. Legitimate inquiries are more specific.

**Example**:
```
✅ "I'm interested in your web design services for my bakery" → 0 points
❌ "Click here for free money! Act now!" → +15 points (3 keywords matched)
```

**Tuning considerations**:
- Add industry-specific spam keywords based on your actual spam patterns
- Review false positives and remove overly broad keywords

---

### 6. Suspicious Name Patterns (10 points)

**Logic**: Checks for obviously fake names.

#### 6a. Single Character Name (5 points)

**Example**:
```
✅ "John Doe" → 0 points
❌ "A" → +5 points
```

#### 6b. All Numbers (5 points)

**Example**:
```
✅ "John Doe" → 0 points
❌ "12345" → +5 points
```

**Why this matters**: Bots and spammers often skip the name field or fill it with junk data.

---

## Scoring Examples

### Example 1: Legitimate Lead
```json
{
  "name": "Sarah Johnson",
  "email": "sarah.johnson@techcorp.com",
  "phone": "+1-555-0123",
  "message": "I'd like to discuss your enterprise plan for our team of 50.",
  "honeypotValue": ""
}
```

**Signals**:
- ✅ Email domain: techcorp.com (not disposable) → 0 points
- ✅ Honeypot: empty → 0 points
- ✅ Has name and message → 0 points
- ✅ Email pattern: normal → 0 points
- ✅ No spam keywords → 0 points
- ✅ Valid name → 0 points

**Total Score**: 0 points
**Classification**: **New Lead** ✅
**Confidence**: Low (legitimate)

---

### Example 2: Obvious Spam
```json
{
  "name": "A",
  "email": "user123456789@tempmail.com",
  "phone": "",
  "message": "Click here for free money! You won!",
  "honeypotValue": "http://spam.com"
}
```

**Signals**:
- ❌ Email domain: tempmail.com (disposable) → +30 points
- ❌ Honeypot: filled → +40 points
- ❌ Single character name → +5 points
- ❌ Email has excessive numbers → +15 points
- ❌ Spam keywords: "click here", "free money", "you won" → +15 points

**Total Score**: 105 points
**Classification**: **Possible Spam** ❌
**Confidence**: High (very likely spam)

---

### Example 3: Borderline Case
```json
{
  "name": "Unknown",
  "email": "john.doe@gmail.com",
  "phone": "+1-555-9999",
  "message": "",
  "honeypotValue": ""
}
```

**Signals**:
- ✅ Email domain: gmail.com (not disposable) → 0 points
- ✅ Honeypot: empty → 0 points
- ❌ Missing name and message → +20 points
- ✅ Email pattern: normal → 0 points
- ✅ No message to scan → 0 points

**Total Score**: 20 points
**Classification**: **New Lead** ✅
**Confidence**: Low (borderline - worth manual review)

**Note**: This might be a legitimate lead from a minimal form (e.g., phone number capture only). Consider the form context when reviewing.

---

## Threshold Calibration

The default threshold of **50 points** is designed to be conservative (minimize false positives). Adjust based on your needs:

### Aggressive (Catch More Spam, Risk False Positives)
```
Threshold: 40 points
```
**Use when**: You get a LOT of spam and can tolerate occasional false positives.

### Balanced (Recommended)
```
Threshold: 50 points
```
**Use when**: Standard B2B/B2C lead capture with moderate spam.

### Conservative (Minimize False Positives)
```
Threshold: 60 points
```
**Use when**: Every lead is valuable and you want to manually review borderline cases.

---

## False Positive Handling

### What is a False Positive?

A **false positive** is when a legitimate lead is incorrectly classified as spam.

### How to Minimize False Positives

1. **Start conservative**: Use threshold = 50 or 60 initially
2. **Review "Possible Spam" leads**: Manually check spam folder weekly
3. **Tune signals**: If you see patterns, adjust point values
4. **Add whitelisting**: Exclude known customer domains from spam checks
5. **Monitor spam score distribution**: If most legitimate leads score 0-10, your system is well-tuned

### Manual Review Workflow

The N8N workflow supports manual reclassification:

1. Lead marked as "Possible Spam" → No notification sent
2. Operator reviews Google Sheet
3. If lead is legitimate → Change status to "New Lead"
4. Status Monitor (see N8N workflow) detects change and sends notification

**Important**: This is implemented via a Google Sheets trigger (not included in base workflow - see "Future Improvements").

---

## Continuous Improvement

### 1. Monitor Spam Score Distribution

After 100+ leads, analyze the distribution:

```
Score Range    | Count | Classification
---------------|-------|---------------
0-20           | 85    | New Lead ✅
21-40          | 10    | New Lead ✅ (borderline)
41-60          | 3     | Possible Spam (review these!)
61+            | 2     | Possible Spam ❌
```

**Action**: If many legitimate leads score 21-40, your signals might be too aggressive. Review the `spamSignals` field to see which signals are triggering.

### 2. Add Custom Signals

Based on your industry/use case, add custom signals:

**Example - B2B SaaS**:
- Free email domains (gmail, yahoo) → +10 points for enterprise plans
- Missing company name → +15 points
- Non-business hours submission → +5 points

**Example - E-commerce**:
- Gift card inquiry in message → +20 points
- Multiple country codes in phone → +15 points

### 3. Machine Learning (Future)

With 1000+ labeled leads (spam vs. legitimate), you could:
- Train a simple logistic regression model
- Use features: all current signals + new features (time of day, device type, etc.)
- Replace rule-based scoring with ML predictions

**Estimated improvement**: 10-20% better accuracy vs. rule-based system.

---

## Signal Weight Justification

| Signal | Points | Rationale |
|--------|--------|-----------|
| **Honeypot filled** | 40 | Near-perfect accuracy - humans can't fill hidden fields |
| **Disposable email** | 30 | Strong signal - rarely used by real customers |
| **Email patterns** | 25 | Medium confidence - some false positives possible |
| **Missing fields** | 20 | Contextual - depends on form type |
| **Spam keywords** | 15 | Good signal but requires careful keyword selection |
| **Name patterns** | 10 | Weaker signal - some legitimate users have short names |

**Design philosophy**: Weight signals by confidence level. High-confidence signals (honeypot) get more points than lower-confidence signals (name length).

---

## Testing the Spam Engine

### Test Case 1: Perfect Spam
```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "name": "12345",
    "email": "abc@tempmail.com",
    "phone": "",
    "message": "Buy now! Free money!",
    "honeypotValue": "filled",
    "customerId": "test"
  }'
```
**Expected**: Score 100+, Status "Possible Spam"

### Test Case 2: Perfect Lead
```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "phone": "+1-555-0100",
    "message": "I need help with my account",
    "honeypotValue": "",
    "customerId": "test"
  }'
```
**Expected**: Score 0, Status "New Lead"

### Test Case 3: Borderline
```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unknown",
    "email": "user@gmail.com",
    "phone": "",
    "message": "",
    "honeypotValue": "",
    "customerId": "test"
  }'
```
**Expected**: Score 20, Status "New Lead" (borderline)

---

## Summary

The spam detection engine balances **accuracy** and **explainability**:

- ✅ **Explainable**: Every score is backed by specific signals
- ✅ **Tunable**: Adjust threshold and signal weights based on data
- ✅ **Conservative**: Minimizes false positives (missing real leads is worse than getting spam)
- ✅ **Observable**: All signals and scores are logged for analysis

**Key Metric**: Aim for <5% false positive rate and >80% spam catch rate.

**Next Steps**: After 100 leads, review the `spamScore` and `spamSignals` fields in your Google Sheet to tune the system.
