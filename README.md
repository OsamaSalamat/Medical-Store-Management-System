# Online Medical Store

## Overview
This is a full-stack pharmacy application built with:
- Backend: Node.js + Express + MySQL
- Frontend: React (React Router + axios)
- JWT authentication, prescription upload, inventory, and admin management

## Complete Setup (Step-by-step)

### 1) Install and Configure MySQL
1. Install MySQL (XAMPP includes MySQL).
2. Start MySQL server.
3. Open MySQL CLI or phpMyAdmin.
4. Create the database and run schema:
   - `CREATE DATABASE medical_store;`
   - Run the SQL file: `database/medical_store.sql`.
5. Confirm tables: `users`, `medicines`, `prescriptions`, `orders`, `order_items`.

### 2) Backend Setup
1. Open terminal in `backend`:
   ```bash
   cd backend
   npm install
   ```
2. If not already configured, open `backend/config/db.js` and update MySQL connection settings (`host`, `user`, `password`, `database`).
3. Start backend:
   ```bash
   npm start
   ```
4. Confirm running:
   - `http://localhost:5000/api/medicines` should return JSON.

### 3) Frontend Setup
1. Open terminal in `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Start React app:
   ```bash
   npm start
   ```
3. App should open at `http://localhost:3000`.

### 4) Default Admin
- Admin email: `admin@medicalstore.com`
- Admin password: `123456789`
- Use `/admin-login` to log in as admin.

## Usage Guide

### User Workflows
1. Register as patient/doctor/pharmacist.
2. Login and browse medicines under Shop.
3. Add items to cart, update quantities, remove items.
4. Upload prescription through Upload Prescription.
5. Place an order with payment mode and transaction receipt.
6. Track order history and download invoice.

### Admin Workflows
1. Login using admin credentials or `/admin-login`.
2. Admin dashboard features:
   - Add/Edit/Delete medicines (expiry tracking included)
   - Low-stock alerts and inventory reports
   - Manage user accounts (create, role update, delete)
   - Approve/reject prescriptions
   - View and manage orders (status updates: Pending, Processing, Shipped, Delivered, Cancelled)

## API Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/reset-password`

### User
- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/change-password`
- `GET /api/users/all` (admin)
- `PUT /api/users/:id/role` (admin)
- `PUT /api/users/:id` (admin)
- `DELETE /api/users/:id` (admin)

### Medicines
- `GET /api/medicines`
- `GET /api/medicines/:id`
- `POST /api/medicines/add` (admin)
- `PUT /api/medicines/:id` (admin)
- `DELETE /api/medicines/:id` (admin)
- `GET /api/medicines/alerts/low-stock` (auth)

### Prescriptions
- `POST /api/prescriptions/upload`
- `GET /api/prescriptions`
- `PUT /api/prescriptions/:id/status` (admin)

### Orders
- `POST /api/orders/create`
- `GET /api/orders/history`
- `GET /api/orders/:id`
- `GET /api/orders/admin/all` (admin)
- `PUT /api/orders/admin/:id/status` (admin)
- `GET /api/orders/reports/inventory` (admin)
- `GET /api/orders/reports/sales` (admin)

## Troubleshooting
- If frontend fails to connect, verify backend is running and API base URL is correct in `frontend/src/services/api.js`.
- If `ECONNREFUSED`, check that backend uses port `5000` and no conflict.
- If login fails, verify user exists in `users` table and password hashed values were seeded.

## Build for Production
1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Use any static server or serve from backend static folder.

## Additional Notes
- This app includes recommended safety features (prescription checks, expiry warning, low stock alerts).
- You can customize roles and add more business rules in backend controllers.
- Use admin panel to keep inventory data clean.

## Second Laptop Setup (Complete Windows Guide)
Use this section when moving the project to another machine.

### 0) Required Software (install first)
1. Install Node.js LTS (includes npm): https://nodejs.org (recommended 18+)
2. Install Git: https://git-scm.com
3. Install VS Code (or your preferred editor)
4. Install MySQL: use XAMPP/WAMP or MySQL Community Server.
   - If using XAMPP, start MySQL from XAMPP Control Panel.
   - If using standalone MySQL, start `MySQL` service.
5. (Optional) Install Postman or Insomnia for API testing.

### 1) Clone repository and open project
```bash
cd C:\Users\<yourname>\Documents
git clone <your-repo-url> online_medical_store_project
cd online_medical_store_project
```
Open folder in VS Code.

### 2) Setup database
1. Open MySQL shell or phpMyAdmin.
2. Create database:
```sql
CREATE DATABASE medical_store;
USE medical_store;
```
3. Import schema:
- In phpMyAdmin, open `Import` and upload `database/medical_store.sql`.
- Or in terminal:
```bash
mysql -u root -p medical_store < database/medical_store.sql
```
(Use your MySQL password if prompted; if blank use just `-u root`.)

### 3) Configure backend connection
Open `backend/config/db.js` and ensure settings match your MySQL user/password:
```js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",   // set your password
  database: "medical_store"
});
```

### 4) Install dependencies and run backend
```bash
cd backend
npm install
npm start
```

Expected: terminal prints `Server running on port 5000`.

### 5) Install dependencies and run frontend
Open new terminal:
```bash
cd frontend
npm install
npm start
```

Expected: React opens at `http://localhost:3000`.

### 6) Default admin login (after seed)
- Admin email: `admin@medicalstore.com`
- Password: `123456789`

### 7) Quick test
1. Open browser to `http://localhost:3000`
2. Login as admin or register a patient.
3. Browse medicines, add to cart, place order.
4. Admin panel: manage inventory, approve prescriptions, update order status.

### 8) Common issues
- If `Cannot connect` from frontend: verify backend at `http://localhost:5000/api/medicines` returns JSON.
- If backend fails on start: check MySQL service is running and credentials in `backend/config/db.js`.
- If port conflict: kill process using port 5000 (for backend) or 3000 (for frontend), then restart.

### 9) If you want one-click start
- I can add `run-all.bat` and `stop-all.bat` scripts in root to start backend+frontend quickly.

---

If you want, I can now also add a short script to auto-reseed the database with sample test data and one-click start commands (`run.bat`).