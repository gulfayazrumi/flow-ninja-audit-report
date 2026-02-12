# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd "e:\Website Development project\Flow ninja audit report"
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════╗
║  Flow Ninja Audit Report Tool Server          ║
╚════════════════════════════════════════════════╝

✓ Server running on http://localhost:3000
✓ Frontend: http://localhost:3000/index.html
✓ API endpoint: http://localhost:3000/api/generate-audit

Ready to generate audit reports!
```

### Step 3: Open in Browser
Navigate to: **http://localhost:3000/index.html**

---

## 📝 Using the Tool

1. **Fill in the form:**
   - Website URL (required)
   - Your name, email, position (pre-filled, editable)
   - Industry and goal (optional dropdowns)

2. **Click "Generate Audit Report"**

3. **Wait 90-120 seconds** for the scan to complete
   - Progress bar will show status
   - Don't close the window

4. **Download your PDF report**
   - Click the download button when ready
   - Report includes your branding

---

## ⚙️ Customization

Edit `config.js` to customize:

```javascript
branding: {
    logoUrl: 'YOUR_LOGO_URL',
    companyName: 'Your Company',
    primaryColor: '#6366f1',
    // ... more options
}
```

---

## 🔧 Troubleshooting

**Server won't start?**
- Check if port 3000 is available
- Try: `npm install` again

**Can't access frontend?**
- Ensure server is running
- Use: `http://localhost:3000/index.html`

**Scan fails?**
- Check internet connection
- Verify website URL is accessible
- Check server logs for errors

---

## 📚 Full Documentation

See [README.md](file:///e:/Website%20Development%20project/Flow%20ninja%20audit%20report/README.md) for complete documentation.

See [walkthrough.md](file:///C:/Users/HP/.gemini/antigravity/brain/78b312d8-486d-4517-9a85-dc7e4573d1b6/walkthrough.md) for implementation details.

---

## ✅ What's Included

- ✅ Professional frontend UI
- ✅ Automated Flow Ninja scanning
- ✅ Custom branding system
- ✅ PDF report generation
- ✅ Error handling
- ✅ Complete documentation

**You're ready to generate audit reports!** 🎉
