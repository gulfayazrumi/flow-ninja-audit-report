const express = require('express');
const cors = require('cors');
const path = require('path');
const { generateAuditReport } = require('./automation');
const { generatePDF } = require('./pdfGenerator');
const config = require('./config');

const app = express();

// Middleware
app.use(cors({ origin: config.server.corsOrigin }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Main audit generation endpoint
app.post('/api/generate-audit', async (req, res) => {
    try {
        const { websiteUrl, fullName, email, position, industry, goal } = req.body;

        // Validation
        if (!websiteUrl || !fullName || !email || !position) {
            return res.status(400).json({
                error: 'Missing required fields: websiteUrl, fullName, email, position'
            });
        }

        // Validate URL format
        try {
            new URL(websiteUrl);
        } catch (e) {
            return res.status(400).json({
                error: 'Invalid URL format'
            });
        }

        console.log(`\n=== New Audit Request ===`);
        console.log(`Website: ${websiteUrl}`);
        console.log(`User: ${fullName} (${position})`);
        console.log(`Email: ${email}`);
        console.log(`Industry: ${industry || 'Agency'}`);
        console.log(`Goal: ${goal || 'Conversion rate optimisation'}`);

        // Step 1: Run automation to get report HTML
        console.log('\nStep 1: Running browser automation...');
        const automationResult = await generateAuditReport(
            websiteUrl,
            industry || 'Agency',
            goal || 'Conversion rate optimisation',
            { fullName, email, position } // Pass user info for popup form
        );

        if (!automationResult.success) {
            console.error('Automation failed:', automationResult.error);
            return res.status(500).json({
                error: `Failed to generate audit report: ${automationResult.error}`
            });
        }

        console.log('Automation completed successfully');

        // Step 2: Generate branded PDF
        console.log('\nStep 2: Generating branded PDF...');
        const pdfResult = await generatePDF(
            automationResult.reportHTML,
            automationResult.styles,
            { fullName, email, position }
        );

        if (!pdfResult.success) {
            console.error('PDF generation failed:', pdfResult.error);
            return res.status(500).json({
                error: `Failed to generate PDF: ${pdfResult.error}`
            });
        }

        console.log('PDF generated successfully');
        console.log(`=== Audit Complete ===\n`);

        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="website-audit-${Date.now()}.pdf"`);
        res.send(pdfResult.pdfBuffer);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════╗`);
    console.log(`║  Flow Ninja Audit Report Tool Server          ║`);
    console.log(`╚════════════════════════════════════════════════╝`);
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Frontend: http://localhost:${PORT}/index.html`);
    console.log(`✓ API endpoint: http://localhost:${PORT}/api/generate-audit`);
    console.log(`\nReady to generate audit reports!\n`);
});
