// Main function - triggers automatically when you edit the sheet
function onEdit(e) {
    // Check if event object exists (only exists during actual edits)
    if (!e || !e.source) {
        Logger.log('⚠️ This function only works when you edit the sheet, not when you click Run');
        return;
    }

    var sheet = e.source.getActiveSheet();
    var range = e.range;

    // Only trigger if Status column (E, column 5) was edited
    if (range.getColumn() === 5 && sheet.getName() === 'Leads') {
        var row = range.getRow();
        var newStatus = range.getValue();
        var oldStatus = e.oldValue;

        // Check if status changed from "Possible Spam" to "New Lead"
        if (oldStatus === 'Possible Spam' && newStatus === 'New Lead') {

            // Get all data from this row
            var rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

            sendStatusChangeNotification(rowData, oldStatus);
        }
    }
}

// Helper function to send notification
function sendStatusChangeNotification(rowData, oldStatus) {
    // Build payload with all lead data
    var payload = {
        'Name': rowData[0],
        'Phone Number': rowData[1],
        'Email Address': rowData[2],
        'Lead Details': rowData[3],
        'Status': rowData[4],
        'Submission URL': rowData[5],
        'Lead Source': rowData[6],
        'Customer Name': rowData[7],
        'Created At': rowData[8],
        'Updated At': new Date().toISOString(),
        'Spam Score': rowData[10],
        'Page Title': rowData[11],
        'Form ID': rowData[12],
        'previousStatus': oldStatus,
        'reclassified': true,
        'reclassifiedAt': new Date().toISOString()
    };

    // ⚠️ IMPORTANT: Replace this with your actual N8N webhook URL
    var webhookUrl = 'https://prathamoza.app.n8n.cloud/webhook/status-change';

    try {
        var response = UrlFetchApp.fetch(webhookUrl, {
            'method': 'post',
            'contentType': 'application/json',
            'payload': JSON.stringify(payload),
            'muteHttpExceptions': true
        });

        Logger.log('✅ Status change notification sent to N8N for: ' + rowData[2]);
        Logger.log('Response: ' + response.getContentText());
    } catch (error) {
        Logger.log('❌ Error sending to N8N: ' + error);
    }
}

// TEST FUNCTION - You can run this manually to test the webhook
function testWebhook() {
    Logger.log('🧪 Testing webhook with sample data...');

    // Sample data for testing
    var testData = [
        'Test User',                    // Name
        '+1234567890',                  // Phone
        'test@example.com',             // Email
        'This is a test message',       // Lead Details
        'New Lead',                     // Status
        'http://example.com/test',      // Submission URL
        'Direct',                       // Lead Source
        'pratham-portfolio',            // Customer Name
        new Date().toISOString(),       // Created At
        new Date().toISOString(),       // Updated At
        '45',                           // Spam Score
        'Test Page',                    // Page Title
        'test-form'                     // Form ID
    ];

    sendStatusChangeNotification(testData, 'Possible Spam');

    Logger.log('✅ Test complete! Check N8N executions to see if webhook was received.');
}
