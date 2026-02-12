// Branding Configuration
module.exports = {
    // Company Branding
    branding: {
        logoUrl: 'https://via.placeholder.com/300x100/6366f1/ffffff?text=Sun+Skill+Techs',
        companyName: 'Sun Skill Techs',
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        accentColor: '#818cf8',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },

    // Default User Information (can be overridden by form input)
    defaultUser: {
        fullName: 'Gul Fayaz Rumi',
        email: 'fayaz.sunskilltechs@gmail.com',
        position: 'CEO'
    },

    // Flow Ninja Configuration
    flowNinja: {
        scanUrl: 'https://foresight.flowninja.com/app/scanning',
        scanTimeout: 300000, // 300 seconds (5 minutes)
        reportLoadTimeout: 60000, // 60 seconds
        maxRetries: 2
    },

    // PDF Configuration
    pdf: {
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    },

    // Server Configuration
    server: {
        port: 3001,
        corsOrigin: '*' // Change to specific domain in production
    }
};
