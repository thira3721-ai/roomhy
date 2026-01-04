const fetch = require('node-fetch').default;

async function testMessage() {
    try {
        // Test sending a message
        const response = await fetch('http://localhost:5000/api/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'SUPERADMIN001',
                to: 'MGR001',
                message: 'Test message from superadmin',
                type: 'text'
            })
        });

        const result = await response.json();
        console.log('Send result:', result);

        // Test retrieving messages
        const messagesResponse = await fetch('http://localhost:5000/api/chat/messages?from=SUPERADMIN001&to=MGR001&limit=10');
        const messages = await messagesResponse.json();
        console.log('Messages:', messages);

    } catch (error) {
        console.error('Error:', error);
    }
}

testMessage();
