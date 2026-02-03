/**
 * Universal Lead Capture Script
 * Version: 1.0.0
 * 
 * Production-ready JavaScript snippet for capturing form submissions across any website.
 * Designed for multi-customer deployment with configurable options.
 * 
 * EMBEDDING INSTRUCTIONS:
 * 
 * Add this script tag to your website (before closing </body>):
 * 
 * <script 
 *   src="path/to/lead-capture.js"
 *   data-webhook-url="https://your-n8n-instance.com/webhook/leads"
 *   data-customer-id="customer-name"
 *   data-honeypot-field="website"
 * ></script>
 * 
 * CONFIGURATION:
 * - data-webhook-url: N8N webhook endpoint (required)
 * - data-customer-id: Unique identifier for your business (required)
 * - data-honeypot-field: Hidden field name for spam detection (optional, default: "website")
 * - data-debug: Enable console logging (optional, set to "true")
 */

(function () {
    'use strict';

    // ============================================================================
    // CONFIGURATION & INITIALIZATION
    // ============================================================================

    /**
     * Get configuration from script tag data attributes
     * This approach avoids global namespace pollution while allowing easy customization
     */
    const scriptTag = document.currentScript || document.querySelector('script[data-webhook-url]');

    if (!scriptTag) {
        console.error('[LeadCapture] Script tag not found. Ensure data-webhook-url is set.');
        return;
    }

    const CONFIG = {
        webhookUrl: scriptTag.getAttribute('data-webhook-url'),
        customerId: scriptTag.getAttribute('data-customer-id') || 'unknown',
        honeypotField: scriptTag.getAttribute('data-honeypot-field') || 'website',
        debug: scriptTag.getAttribute('data-debug') === 'true',
        retryAttempts: 3,
        retryDelay: 1000, // milliseconds
        duplicateWindowMs: 5000 // 5 seconds to detect rapid duplicate submissions
    };

    // Validate required configuration
    if (!CONFIG.webhookUrl) {
        console.error('[LeadCapture] data-webhook-url is required');
        return;
    }

    /**
     * Debug logger - only logs when debug mode is enabled
     */
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[LeadCapture]', ...args);
        }
    }

    log('Initialized with config:', CONFIG);

    // ============================================================================
    // FIELD MAPPING & NORMALIZATION
    // ============================================================================

    /**
     * Common field name patterns for different data types
     * These patterns cover most common form field naming conventions
     */
    const FIELD_PATTERNS = {
        name: [
            'name', 'full_name', 'fullname', 'full-name',
            'contact_name', 'contact-name', 'contactname',
            'your_name', 'your-name', 'yourname',
            'customer_name', 'customer-name',
            'first_name', 'firstname', 'first-name', // Will combine with last if both exist
            'fname'
        ],
        lastName: [
            'last_name', 'lastname', 'last-name', 'surname', 'lname'
        ],
        email: [
            'email', 'e-mail', 'email_address', 'email-address',
            'user_email', 'user-email', 'useremail',
            'contact_email', 'contact-email', 'contactemail',
            'your_email', 'your-email', 'youremail',
            'customer_email', 'customer-email'
        ],
        phone: [
            'phone', 'tel', 'telephone', 'mobile',
            'phone_number', 'phone-number', 'phonenumber',
            'contact_phone', 'contact-phone', 'contactphone',
            'your_phone', 'your-phone', 'yourphone',
            'cell', 'cellphone', 'cell_phone', 'cell-phone'
        ],
        message: [
            'message', 'comments', 'comment', 'details',
            'description', 'notes', 'note', 'inquiry',
            'your_message', 'your-message', 'yourmessage',
            'customer_message', 'customer-message'
        ]
    };

    /**
     * Normalize field name for comparison
     * Converts to lowercase and handles nested field names like contact[email]
     */
    function normalizeFieldName(name) {
        return name
            .toLowerCase()
            .replace(/\[|\]/g, '_') // Convert contact[email] to contact_email
            .replace(/-/g, '_')      // Normalize hyphens to underscores
            .replace(/__+/g, '_')    // Remove duplicate underscores
            .replace(/^_|_$/g, '');  // Trim leading/trailing underscores
    }

    /**
     * Extract and normalize form data into consistent schema
     * Intelligently maps various field names to standard fields
     */
    function extractFormData(form) {
        const formData = new FormData(form);
        const data = {
            name: '',
            email: '',
            phone: '',
            message: '',
            rawFields: {} // Store all fields for potential custom processing
        };

        let firstName = '';
        let lastName = '';

        // Build raw fields map
        for (let [key, value] of formData.entries()) {
            data.rawFields[key] = value;
        }

        // Map fields to normalized schema
        for (let [key, value] of formData.entries()) {
            const normalizedKey = normalizeFieldName(key);
            const stringValue = String(value).trim();

            // Skip empty values
            if (!stringValue) continue;

            // Check against each pattern category
            if (!data.name && FIELD_PATTERNS.name.some(pattern => normalizedKey.includes(pattern))) {
                data.name = stringValue;
            }

            if (!firstName && FIELD_PATTERNS.name.some(pattern => normalizedKey.includes('first'))) {
                firstName = stringValue;
            }

            if (!lastName && FIELD_PATTERNS.lastName.some(pattern => normalizedKey.includes(pattern))) {
                lastName = stringValue;
            }

            if (!data.email && FIELD_PATTERNS.email.some(pattern => normalizedKey.includes(pattern))) {
                data.email = stringValue;
            }

            if (!data.phone && FIELD_PATTERNS.phone.some(pattern => normalizedKey.includes(pattern))) {
                data.phone = stringValue;
            }

            if (!data.message && FIELD_PATTERNS.message.some(pattern => normalizedKey.includes(pattern))) {
                data.message = stringValue;
            }
        }

        // Combine first and last name if we didn't find a full name field
        if (!data.name && (firstName || lastName)) {
            data.name = `${firstName} ${lastName}`.trim();
        }

        return data;
    }

    // ============================================================================
    // DATA ENRICHMENT
    // ============================================================================

    /**
     * Enrich lead data with contextual information
     * This metadata is critical for lead attribution and analysis
     */
    function enrichLeadData(formData, form) {
        return {
            // Normalized lead data
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message,

            // Contextual enrichment
            sourceUrl: window.location.href,
            pageTitle: document.title,
            referrer: document.referrer || 'Direct',
            timestamp: new Date().toISOString(),
            customerId: CONFIG.customerId,

            // Technical metadata
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,

            // Form-specific data
            formId: form.id || 'unnamed-form',
            formAction: form.action || 'no-action',

            // Spam detection helpers
            honeypotValue: formData.rawFields[CONFIG.honeypotField] || '',
            submissionMethod: 'traditional', // Will be updated for AJAX

            // Raw fields for custom processing
            rawFields: formData.rawFields
        };
    }

    // ============================================================================
    // DUPLICATE DETECTION
    // ============================================================================

    /**
     * Generate unique fingerprint for a submission
     * Used to detect duplicate submissions within a time window
     */
    function generateFingerprint(data) {
        const parts = [
            data.email,
            data.phone,
            data.customerId,
            data.sourceUrl
        ].filter(Boolean);
        return btoa(parts.join('|')); // Base64 encode for storage
    }

    /**
     * Check if this submission is a duplicate
     * Uses sessionStorage to track recent submissions
     */
    function isDuplicate(fingerprint) {
        const storageKey = 'leadcapture_submissions';
        const now = Date.now();

        try {
            // Get existing submissions
            let submissions = JSON.parse(sessionStorage.getItem(storageKey) || '[]');

            // Clean old submissions (outside duplicate window)
            submissions = submissions.filter(sub =>
                now - sub.timestamp < CONFIG.duplicateWindowMs
            );

            // Check if current fingerprint exists
            const exists = submissions.some(sub => sub.fingerprint === fingerprint);

            if (!exists) {
                // Add current submission
                submissions.push({ fingerprint, timestamp: now });
                sessionStorage.setItem(storageKey, JSON.stringify(submissions));
            }

            return exists;
        } catch (e) {
            // sessionStorage might be disabled - fail safely
            log('sessionStorage not available:', e);
            return false;
        }
    }

    // ============================================================================
    // WEBHOOK TRANSMISSION
    // ============================================================================

    /**
     * Send lead data to webhook with retry logic
     * Uses exponential backoff for retries
     */
    async function sendToWebhook(data, attempt = 1) {
        try {
            log('Sending to webhook (attempt ' + attempt + '):', data);

            const response = await fetch(CONFIG.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                // Use keepalive to ensure request completes even if user navigates away
                keepalive: true
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            log('Successfully sent to webhook');
            return true;

        } catch (error) {
            log('Webhook error:', error);

            // Retry with exponential backoff
            if (attempt < CONFIG.retryAttempts) {
                const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
                log(`Retrying in ${delay}ms...`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return sendToWebhook(data, attempt + 1);
            }

            // All retries failed
            console.error('[LeadCapture] Failed to send lead after ' + CONFIG.retryAttempts + ' attempts:', error);
            return false;
        }
    }

    // ============================================================================
    // FORM SUBMISSION HANDLING
    // ============================================================================

    /**
     * Main form submission handler
     * Processes the form and sends data to webhook
     */
    async function handleFormSubmission(form, event) {
        log('Form submission detected:', form);

        // Extract and normalize form data
        const formData = extractFormData(form);

        // Validate minimum required data (at least email or phone)
        if (!formData.email && !formData.phone) {
            log('Skipping submission - no email or phone found');
            return;
        }

        // Enrich with contextual data
        const enrichedData = enrichLeadData(formData, form);

        // Check for duplicates
        const fingerprint = generateFingerprint(enrichedData);
        if (isDuplicate(fingerprint)) {
            log('Duplicate submission detected, skipping');
            return;
        }

        // Send to webhook (non-blocking)
        // We don't wait for the response to avoid delaying the form submission
        sendToWebhook(enrichedData).catch(err => {
            console.error('[LeadCapture] Unhandled error:', err);
        });
    }

    /**
     * Attach listener to traditional form submission
     */
    function attachFormListener(form) {
        // Avoid double-binding
        if (form.dataset.leadcaptureAttached) {
            return;
        }

        form.dataset.leadcaptureAttached = 'true';

        form.addEventListener('submit', function (event) {
            // Don't prevent default - let the form submit normally
            // We capture data in parallel
            handleFormSubmission(form, event);
        });

        log('Attached listener to form:', form);
    }

    // ============================================================================
    // AJAX FORM DETECTION
    // ============================================================================

    /**
     * Intercept AJAX form submissions by monitoring click events on submit buttons
     * This is a fallback for forms that prevent default and use AJAX
     */
    function setupAjaxInterception() {
        document.addEventListener('click', function (event) {
            const target = event.target;

            // Check if clicked element is a submit button or input
            const isSubmitButton =
                (target.tagName === 'BUTTON' && target.type === 'submit') ||
                (target.tagName === 'INPUT' && target.type === 'submit');

            if (isSubmitButton) {
                const form = target.closest('form');
                if (form) {
                    // Small delay to allow form validation to run first
                    setTimeout(() => {
                        // Check if form is still valid (wasn't prevented)
                        if (form.checkValidity && form.checkValidity()) {
                            handleFormSubmission(form, event);
                        }
                    }, 100);
                }
            }
        }, true); // Use capture phase

        log('AJAX interception enabled');
    }

    // ============================================================================
    // DYNAMIC FORM DETECTION
    // ============================================================================

    /**
     * Watch for dynamically added forms (e.g., modals, SPAs)
     * Uses MutationObserver for efficient DOM monitoring
     */
    function watchForDynamicForms() {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    // Check if the added node is a form
                    if (node.tagName === 'FORM') {
                        attachFormListener(node);
                    }

                    // Check if the added node contains forms
                    if (node.querySelectorAll) {
                        const forms = node.querySelectorAll('form');
                        forms.forEach(attachFormListener);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log('MutationObserver initialized for dynamic forms');
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize the lead capture system
     * Runs when DOM is ready
     */
    function init() {
        log('Initializing lead capture system');

        // Attach listeners to all existing forms
        const forms = document.querySelectorAll('form');
        forms.forEach(attachFormListener);
        log('Found ' + forms.length + ' existing forms');

        // Watch for dynamically added forms
        watchForDynamicForms();

        // Setup AJAX interception
        setupAjaxInterception();

        log('Initialization complete');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
