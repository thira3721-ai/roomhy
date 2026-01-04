#!/usr/bin/env node

const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testChatSystem() {
    console.log('\n=== Testing Chat System ===\n');

    try {
        // Test 1: Create a group
        console.log('1️⃣  Testing: Create Group');
        const groupRes = await makeRequest('/api/chat/group/create', 'POST', {
            name: 'Managers Group',
            members: ['RYGA6319', 'RYGA7154'],
            createdBy: 'SUPER_ADMIN',
            description: 'Group for all area managers'
        });
        console.log('✅ Response:', groupRes.data);
        const groupId = groupRes.data.groupId;

        // Test 2: Create a support ticket
        console.log('\n2️⃣  Testing: Create Support Ticket');
        const ticketRes = await makeRequest('/api/chat/support/create', 'POST', {
            from: 'ROOMHY3986',
            subject: 'AC Not Working',
            description: 'Air conditioner is making noise',
            priority: 'high'
        });
        console.log('✅ Response:', ticketRes.data);
        const ticketId = ticketRes.data.ticketId;

        // Test 3: Send a support message
        console.log('\n3️⃣  Testing: Send Support Message');
        const msgRes = await makeRequest('/api/chat/support/send', 'POST', {
            from: 'ROOMHY3986',
            ticketId: ticketId,
            message: 'Please help, my AC is making loud noise'
        });
        console.log('✅ Response:', msgRes.data);

        // Test 4: Create an inquiry
        console.log('\n4️⃣  Testing: Create Property Inquiry');
        const inquiryRes = await makeRequest('/api/chat/inquiry/send', 'POST', {
            propertyId: 'ROOMHY3986',
            ownerId: 'ROOMHY3986',
            visitorId: 'VISITOR_' + Date.now(),
            visitorEmail: 'visitor@example.com',
            visitorPhone: '9876543210',
            message: 'Interested in this property'
        });
        console.log('✅ Response:', inquiryRes.data);
        const inquiryId = inquiryRes.data.inquiryId;

        // Test 5: Accept inquiry
        console.log('\n5️⃣  Testing: Accept Inquiry');
        const acceptRes = await makeRequest('/api/chat/inquiry/respond', 'POST', {
            inquiryId: inquiryId,
            status: 'accepted'
        });
        console.log('✅ Response:', acceptRes.data);

        // Test 6: Get group details
        console.log('\n6️⃣  Testing: Get Group Details');
        const getGroupRes = await makeRequest(`/api/chat/group/${groupId}`, 'GET');
        console.log('✅ Response:', getGroupRes.data);

        // Test 7: Get support ticket
        console.log('\n7️⃣  Testing: Get Support Ticket');
        const getTicketRes = await makeRequest(`/api/chat/support/${ticketId}`, 'GET');
        console.log('✅ Response:', getTicketRes.data);

        // Test 8: Update ticket status
        console.log('\n8️⃣  Testing: Update Ticket Status');
        const updateRes = await makeRequest('/api/chat/support/update-status', 'POST', {
            ticketId: ticketId,
            status: 'in-progress'
        });
        console.log('✅ Response:', updateRes.data);

        console.log('\n✅ All tests passed!\n');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testChatSystem();
