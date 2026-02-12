const http = require('http');

const data = JSON.stringify({
    websiteUrl: 'https://www.apple.com',
    fullName: 'Test User',
    email: 'test@example.com',
    position: 'Tester',
    industry: 'Agency',
    goal: 'Conversion rate optimisation'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/generate-audit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    },
    timeout: 600000 // 10 minutes timeout
};

console.log('Sending audit request...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    // Create a write stream to save the PDF
    const fs = require('fs');
    // filename from content-disposition or default
    const filename = 'test-report.pdf';
    const file = fs.createWriteStream(filename);

    res.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log(`Download completed: ${filename}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
