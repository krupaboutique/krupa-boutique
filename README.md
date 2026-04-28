# 🧵 Krupa Boutique — Complete Management System v2.0

**Professional boutique management system with Admin Dashboard + Tailor Portal**

✨ **Zero dependencies • Single-file Node.js backend • File-based JSON database • Deploy free in 30 seconds**

---

## 🚀 Quick Start (Windows)

### **Option 1: Fastest Way — Double-Click to Run**

1. **Install Node.js** (if not installed)
   - Go to https://nodejs.org → Download LTS
   - Install it
   - Restart your computer

2. **Download & Extract** this repo

3. **Double-click `START_SERVER.bat`**
   - Server starts automatically
   - Browser opens at http://localhost:3000

4. **Login as Admin:**
   - Email: `krupaboutique@gmail.com`
   - Password: `admin123`

### **Option 2: Command Line**

```bash
node server.js
```

Then open http://localhost:3000 in your browser.

---

## 📱 Access on Other Devices

### **Within Same WiFi Network**

1. Find your computer's IP:
   - Run `ipconfig` in terminal → look for "IPv4 Address" (e.g., `192.168.1.100`)

2. On mobile/tablet, open:
   ```
   http://192.168.1.100:3000
   ```

3. Login with same credentials

---

## ☁️ Deploy FREE Online (30 seconds)

### **Glitch.com (Easiest)**

1. Go to https://glitch.com
2. Click **"New Project"** → **"Import from GitHub"**
3. Paste your GitHub URL
4. Click **"Remix"**
5. **Share URL** with tailors → they can access anytime!

✅ **Pros:** Instant, no setup, always online  
❌ **Cons:** Sleeps after 5 mins inactive (free plan)

---

### **Railway.app (Recommended)**

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repo
4. Auto-deploy! 🎉
5. Get public URL

✅ **Pros:** Always on, free $5/month credit  
❌ **Cons:** Needs GitHub account

---

### **Render.com (Good Alternative)**

1. Go to https://render.com
2. **"New +"** → **"Web Service"**
3. Connect GitHub repo
4. Deploy

✅ **Pros:** 750 hours/month free, good performance  
❌ **Cons:** Needs credit card on file

---

## 👤 User Roles

### **Admin Panel**
- 📊 Dashboard with real-time metrics
- ✂️ Create & manage orders
- 👗 Customer database
- 🧵 Tailor management & payments
- 📅 Appointments & scheduling
- 💸 Expense tracking
- 📈 Reports & analytics
- 🖨️ PDF receipt generation
- 💬 WhatsApp integration
- ☁️ Backup/restore data

### **Tailor Portal**
- 📊 Personal dashboard
- ✂️ View assigned work
- 👗 Customer list (assigned only)
- 💬 Chat with admin
- 💰 Track earnings & payments
- 📏 View customer measurements

---

## 📋 Features

### **Order Management**
- 6-stage workflow: Received → Cutting → Stitching → Finishing → Ready → Delivered
- Track upper & lower body measurements (inches)
- Design notes & customization
- Payment tracking (advance + balance)
- Real-time status updates
- Admin ↔️ Tailor communication

### **Customer Management**
- Phone-based search
- Track all orders per customer
- Total spent metrics
- Notes field for special requests
- Join date tracking

### **Tailor Management**
- Per-order work rates
- Monthly salary tracking
- Payment history (salary, bonus, deductions)
- Earned vs. paid analysis
- Active/On Leave/Resigned status
- Speciality tracking

### **Financial**
- Revenue tracking
- Expense categories
- Profit/loss reports
- Tailor payment reconciliation
- Balance due monitoring

---

## 🔐 Security

- **JWT Authentication** — Secure login tokens
- **API Key Header** — All API calls protected
- **Role-based Access** — Admin-only & Tailor-only routes
- **Password Hashing** — (Optional: add bcrypt for production)
- **CORS Protected** — Cross-origin requests validated

---

## 📁 File Structure

```
krupa-boutique/
├── server.js           # Node.js backend (ZERO npm dependencies)
├── index.html          # Complete frontend (admin + tailor)
├── db.json             # File-based database
├── START_SERVER.bat    # Windows launcher
├── package.json        # Project metadata
└── README.md           # This file
```

---

## 🔌 API Reference

### **Authentication**
```
POST /api/auth/login/admin
Body: { email, pass }
Returns: { token, apiKey, role }

POST /api/auth/login/tailor
Body: { phone, pass }
Returns: { token, id, name, speciality, apiKey }
```

### **Orders**
```
GET    /api/orders              # Get all (filtered by role)
GET    /api/orders/:id          # Get one order
POST   /api/orders              # Create order (admin)
PUT    /api/orders/:id          # Update order
DELETE /api/orders/:id          # Delete order (admin)
POST   /api/orders/:id/remark   # Add work remark
```

### **Customers**
```
GET    /api/customers           # Get all (admin sees all, tailor sees assigned)
GET    /api/customers/:id       # Get one customer
POST   /api/customers           # Create customer (admin)
PUT    /api/customers/:id       # Update customer (admin)
DELETE /api/customers/:id       # Delete customer (admin)
```

### **Tailors**
```
GET    /api/tailors             # Get all (admin only)
GET    /api/tailors/me          # Get current tailor profile
GET    /api/tailors/:id         # Get one tailor (admin)
POST   /api/tailors             # Create tailor (admin)
PUT    /api/tailors/:id         # Update tailor (admin)
DELETE /api/tailors/:id         # Delete tailor (admin)
POST   /api/tailors/:id/payment # Record payment (admin)
GET    /api/tailors/:id/attendance
POST   /api/tailors/:id/attendance
```

### **Other**
```
GET    /api/boutique            # Get boutique info
PUT    /api/boutique            # Update boutique (admin)
PUT    /api/boutique/password   # Change admin password
GET    /api/appointments        # Get all (admin)
POST   /api/appointments        # Create appointment (admin)
GET    /api/expenses            # Get all (admin)
POST   /api/expenses            # Create expense (admin)
GET    /api/backup              # Download backup (admin)
POST   /api/restore             # Restore backup (admin)
GET    /api/reports             # Get summary report (admin)
```

---

## 🛠️ Customization

### **Change Admin Password**
1. Login as admin
2. Go to **Profile** → **Change Admin Password**
3. Set new password

### **Update Boutique Info**
1. Go to **Profile**
2. Edit: Name, Owner, Email, Phone, Address, GST
3. Add WhatsApp Booking Link
4. Add Google Calendar Link

### **Add Tailors**
1. Go to **Tailors & Work**
2. Click **+ Add Tailor**
3. Set phone (their login ID) + password
4. Tailors login with: phone + password

### **Create Orders**
1. Go to **Orders**
2. Click **+ New Order**
3. Select customer, garment type, measurements
4. Assign to tailor, set delivery date
5. Collect advance, record status

---

## 📝 Measurement Fields

### **Upper Body (All Garments)**
- Chest, Waist, Hip, Shoulder
- Sleeve Length, Arm Hole
- Front Length, Back Length
- Neck Front, Neck Back, Neck Width
- Blouse/Kurta Length (context-specific)

### **Lower Body**
- Hip, Thigh, Knee, Calf
- Inseam, Waist (pants), Length
- Crotch depth

---

## 💾 Database Structure

```json
{
  "boutique": { name, owner, email, phone, address, gst, logo, whatsapp, calendar },
  "admin": { email, pass },
  "orders": [{ id, cust_id, assigned_to, item, status, total, advance, remarks, measurements... }],
  "customers": [{ id, join_date, name, phone, email, city, notes }],
  "tailors": [{ id, name, phone, password, speciality, status, monthly_salary, payments, join_date }],
  "appointments": [{ id, client_name, date, time, purpose, status }],
  "expenses": [{ id, date, category, description, amount }],
  "attendance": [{ id, tailor_id, date, status }]
}
```

---

## 🐛 Troubleshooting

### **"Node.js is not recognized"**
- Install Node.js from https://nodejs.org
- Restart your computer
- Try again

### **"Port 3000 already in use"**
- Kill the old process:
  ```bash
  taskkill /F /IM node.exe
  ```
- Then run again

### **"Cannot connect to server"**
- Make sure server is running
- Check http://localhost:3000
- Firewall might be blocking it

### **Data lost after restart?**
- Data is stored in `db.json`
- Backup it before major updates:
  - Admin Panel → Profile → Download Backup

---

## 📦 Production Checklist

- [ ] Change admin password
- [ ] Set boutique name & contact info
- [ ] Add all tailors with secure passwords
- [ ] Update WhatsApp booking link
- [ ] Test all features
- [ ] Deploy to cloud (Railway.app or Render.com)
- [ ] Share URL with team
- [ ] Setup regular backups

---

## 📞 Support

**For issues:**
1. Check troubleshooting section above
2. Verify all files are in same folder
3. Ensure Node.js is installed
4. Check file permissions
5. Restart server

---

## 📄 License

MIT — Free for commercial use

---

## 🎉 Credits

Built for **Krupa Boutique** — Professional tailoring management made simple.

✨ **Happy Stitching!** ✨
