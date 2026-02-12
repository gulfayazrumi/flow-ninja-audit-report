# Flow Ninja Audit Report Generator

**Flow Ninja Audit Report Generator** is a professional, white-labeled website audit tool designed to automate Flow Ninja’s Foresight AI scanning, generate high-quality PDF reports, and fully support custom branding. Perfect for agencies and consultants, this tool allows you to deliver automated, professional audit reports to clients with minimal setup.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## 🚀 Key Features

- **White-Labeled Reports** – Customize logos, colors, and fonts to match your brand.
- **Automated Website Audits** – Powered by Flow Ninja Foresight AI for comprehensive site analysis.
- **PDF Report Generation** – High-quality downloadable PDFs using Puppeteer.
- **User-Friendly Interface** – Single-page application built with Vanilla HTML, CSS, and JavaScript.
- **Configurable User Details** – Pre-fill or edit client information like name, email, and position.
- **Lightweight Backend** – Node.js with Express.js for easy deployment.
- **Automation Ready** – Puppeteer handles headless Chrome automation for accurate scans.

## 🛠️ Technical Details

- **Frontend**: Vanilla HTML, CSS, JavaScript (SPA)
- **Backend**: Node.js with Express.js
- **Automation**: Puppeteer (headless Chrome)
- **PDF Generation**: Puppeteer’s built-in PDF capabilities
- **Branding Customization**: Configurable via `config.js`

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

## 🚀 Usage

### Starting the Server
```bash
npm install
npm start
```
The server will start on `http://localhost:3001` (or as configured in `config.js`).

### Generating a Report
1. Open your browser to `http://localhost:3001/index.html`.
2. Enter the website URL and user details.
3. Click **Generate Audit Report**.
4. Wait 90–120 seconds for the processing to complete.
5. Download your professional, branded PDF.

## 📁 Project Structure
- `index.html`          # Frontend form
- `styles.css`          # UI styling
- `app.js`             # Frontend JavaScript
- `server.js`          # Express server
- `automation.js`      # Puppeteer automation
- `pdfGenerator.js`    # PDF generation
- `config.js`          # Configuration

## ⏱️ Important Notes

- **Scan Timing**: Each audit takes 90–120 seconds; a loading indicator is displayed during processing.
- **Concurrency**: The initial version handles one scan per session; consider a queue system for high traffic.
- **Deployment**: Fully standalone service, no complex frameworks required.

Deliver professional, branded website audit reports automatically and efficiently with **Flow Ninja Audit Report Generator**.

---
**Author**: Gul Fayaz Rumi
**License**: MIT
