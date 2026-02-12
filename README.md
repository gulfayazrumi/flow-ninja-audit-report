# Flow Ninja Automated Audit Report Tool

A professional, white-labeled website audit tool that automates Flow Ninja's Foresight AI scanning, applies custom branding, and generates high-quality PDF reports.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## 🚀 Features

- **Automated Scanning**: Integrates with Flow Ninja Foresight AI for comprehensive website audits
- **Custom Branding**: Apply your logo, colors, and company information to reports
- **Professional PDF Reports**: High-quality, downloadable PDF reports with preserved charts and images
- **Modern UI**: Clean, responsive interface with real-time progress tracking
- **Error Handling**: Robust error handling with user-friendly messages
- **Easy Configuration**: Simple config file for branding and settings

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

## 🛠️ Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd "e:\Website Development project\Flow ninja audit report"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure branding** (optional):
   Edit `config.js` to customize:
   - Logo URL
   - Company name
   - Brand colors
   - Default user information

## ⚙️ Configuration

Edit `config.js` to customize the tool:

```javascript
module.exports = {
    branding: {
        logoUrl: 'YOUR_LOGO_URL',
        companyName: 'Your Company Name',
        primaryColor: '#6366f1',
        // ... more options
    },
    defaultUser: {
        fullName: 'Your Name',
        email: 'your.email@example.com',
        position: 'Your Position'
    }
};
```

## 🚀 Usage

### Starting the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

For development with auto-reload:
```bash
npm run dev
```

### Using the Tool

1. Open your browser and navigate to `http://localhost:3000/index.html`
2. Fill in the form:
   - **Website URL** (required): The website to audit
   - **Full Name** (required): Your name
   - **Email** (required): Your email
   - **Position** (required): Your job title
   - **Industry** (optional): Select from dropdown
   - **Website Goal** (optional): Select from dropdown
3. Click "Generate Audit Report"
4. Wait 90-120 seconds for the scan to complete
5. Download your branded PDF report

## 📁 Project Structure

```
Flow ninja audit report/
├── index.html          # Frontend form
├── styles.css          # UI styling
├── app.js             # Frontend JavaScript
├── server.js          # Express server
├── automation.js      # Puppeteer automation
├── pdfGenerator.js    # PDF generation
├── config.js          # Configuration
├── package.json       # Dependencies
└── README.md          # Documentation
```

## 🔧 API Endpoints

### POST `/api/generate-audit`

Generate an audit report for a website.

**Request Body**:
```json
{
  "websiteUrl": "https://example.com",
  "fullName": "John Doe",
  "email": "john@example.com",
  "position": "CEO",
  "industry": "Agency",
  "goal": "Conversion rate optimisation"
}
```

**Response**: PDF file (application/pdf)

### GET `/api/health`

Check server status.

**Response**:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## ⏱️ Performance Notes

- Each audit takes approximately **90-120 seconds** to complete
- The tool waits for Flow Ninja's scan to finish before generating the PDF
- Progress is shown to the user with a loading indicator
- For high-traffic scenarios, consider implementing a queue system

## 🐛 Troubleshooting

### "Unable to connect to the server"
- Ensure the backend server is running (`npm start`)
- Check that port 3000 is not in use by another application

### "Scan completed but report button not found"
- The Flow Ninja interface may have changed
- Check `automation.js` and update selectors if needed

### PDF generation fails
- Ensure all images in the report are accessible
- Check browser console for errors
- Verify Puppeteer is installed correctly

### Puppeteer installation issues on Windows
```bash
npm install puppeteer --ignore-scripts
```

## 🔒 Security Considerations

- **Production Deployment**: Update CORS settings in `config.js`
- **Environment Variables**: Store sensitive data in environment variables
- **Rate Limiting**: Implement rate limiting for the API endpoint
- **Input Validation**: All user inputs are validated on the server

## 📦 Deployment

### Local Deployment
The tool is ready to run locally. Just start the server and open the frontend.

### Cloud Deployment (Heroku, AWS, etc.)
1. Ensure all dependencies are in `package.json`
2. Set environment variables for configuration
3. Use a process manager like PM2 for production
4. Configure CORS for your domain

### Docker (Optional)
Create a `Dockerfile`:
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - feel free to use this tool for your projects.

## 👤 Author

**Gul Fayaz Rumi**
- Email: fayaz.sunskilltechs@gmail.com
- Position: CEO

## 🙏 Acknowledgments

- Powered by [Flow Ninja Foresight AI](https://foresight.flowninja.com)
- Built with [Puppeteer](https://pptr.dev/)
- UI inspired by modern web design principles

## 📞 Support

For questions or issues, please contact fayaz.sunskilltechs@gmail.com

---

**Note**: This tool automates Flow Ninja's Foresight AI. Ensure you have the right to use their service for automated scanning.
