
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import api from "./services/api";
import "./App.css";

const tokenKey = "medical_store_token";

const navLink = { color: "#e2e8f0", background: "#2563eb", padding: "7px 12px", borderRadius: 8, textDecoration: "none", fontWeight: 600 };

const NavBar = ({ user, logout }) => (
  <div className="topbar">
    <div>
      <h1>Online Medical Store</h1>
      <small>Buy medicine online securely</small>
    </div>
    <div className="nav-links">
      <Link to="/" style={navLink}>Home</Link>
      <Link to="/medicines" style={navLink}>Shop</Link>
      <Link to="/cart" style={navLink}>Cart</Link>
      <Link to="/orders" style={navLink}>Orders</Link>
      <Link to="/upload" style={navLink}>Prescription</Link>
      <Link to="/account" style={navLink}>Account</Link>
      {user?.role === "admin" && <Link to="/admin" style={navLink}>Admin Dashboard</Link>}
      {!user && <Link to="/admin-login" style={navLink}>Admin Login</Link>}
      {user ? <button className="btn-link" onClick={logout}>Logout</button> : <Link to="/login" style={navLink}>Login</Link>}
    </div>
  </div>
);

function Home() {
  return (
    <div className="page">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2>Online Medical Store</h2>
          <p style={{ fontSize: "1rem", color: "#334155" }}>Order medicines safely, manage prescriptions, and get fast delivery. Built for patients, doctors, and pharmacists.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="button" to="/medicines">Shop Now</Link>
            <Link className="button" to="/upload">Upload Prescription</Link>
          </div>
        </div>
        <div style={{ width: 260, background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "white", borderRadius: 10, padding: 16 }}>
          <h4>Quick Actions</h4>
          <ul style={{ paddingLeft: 20 }}>
            <li>Search medicines in real-time</li>
            <li>Upload your prescription</li>
            <li>Track order status & invoices</li>
          </ul>
        </div>
      </div>
      <div className="card-grid" style={{ marginTop: 14 }}>
        <div className="card"><h4>Browse Medicines</h4><p>Search by name, brand, category and filter quickly.</p></div>
        <div className="card"><h4>Prescription Upload</h4><p>Upload JPG/PNG/PDF and track approval status.</p></div>
        <div className="card"><h4>Checkout and Payments</h4><p>Choose payment mode with secure order handling.</p></div>
        <div className="card"><h4>Admin Reporting</h4><p>Admins can manage users, stocks, and verify prescriptions.</p></div>
      </div>
    </div>
  );
}

function Login({ loginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;
      localStorage.setItem(tokenKey, token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loginSuccess(res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="page">
      <h2>Login</h2>
      <form className="form-grid" onSubmit={submit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {error && <p className="alarm">{error}</p>}
      <p>Don’t have an account? <Link to="/register">Register</Link></p>
      <p><small>Need help? <Link to="/reset-password">Reset Password</Link></small></p>
      <p><small>Admin? <Link to="/admin-login">Admin Login</Link></small></p>
    </div>
  );
}

function AdminLogin({ loginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.user.role !== "admin") { setError("Only admin can login here."); return; }
      const token = res.data.token;
      localStorage.setItem(tokenKey, token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loginSuccess(res.data.user);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.msg || "Admin login failed");
    }
  };

  return (
    <div className="page">
      <h2>Admin Login</h2>
      <form className="form-grid" onSubmit={submit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login as Admin</button>
      </form>
      {error && <p className="alarm">{error}</p>}
      <p>Use admin credentials from backend user table.</p>
    </div>
  );
}

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { email, newPassword });
      setMsg("Password reset successful.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Reset failed");
      setMsg("");
    }
  };

  return (
    <div className="page">
      <h2>Reset Password</h2>
      <form className="form-grid" onSubmit={submit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
        <button type="submit">Reset Password</button>
      </form>
      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {error && <p className="alarm">{error}</p>}
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "patient" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) { setError("Complete all fields"); return; }
    if (form.password.length < 6) { setError("Password must be 6+ chars"); return; }
    try {
      await api.post("/auth/register", form);
      setMsg("Registered successfully. Please login.");
      setError("");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="page">
      <h2>Register</h2>
      <form className="form-grid" onSubmit={submit}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="pharmacist">Pharmacist</option>
        </select>
        <button type="submit">Create Account</button>
      </form>
      {error && <p className="alarm">{error}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}
    </div>
  );
}

function Medicines({ setCart, user }) {
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const qs = [];
      if (query) qs.push(`q=${encodeURIComponent(query)}`);
      if (category) qs.push(`category=${encodeURIComponent(category)}`);
      if (sort) qs.push(`sortBy=${encodeURIComponent(sort)}`);
      const res = await api.get(`/medicines${qs.length ? `?${qs.join("&")}` : ""}`);
      setMedicines(res.data);
    } catch (err) {
      console.error("Could not load medicines", err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!query) { setSuggestions([]); return; }
    const lower = query.toLowerCase();
    setSuggestions(medicines.filter((m) => m.name.toLowerCase().includes(lower)).slice(0, 5));
  }, [query, medicines]);

  const addToCart = (medicine) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === medicine.id);
      if (existing) return prev.map((p) => p.id === medicine.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { id: medicine.id, name: medicine.name, price: medicine.price, quantity: 1, prescription_required: medicine.prescription_required }];
    });
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Medicines</h2>
        <button className="button" onClick={load}>Refresh</button>
      </div>
      <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: 12 }}>
        <input placeholder="Search name/brand/category" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="Prescription drugs">Prescription drugs</option>
          <option value="OTC">OTC</option>
          <option value="Wellness">Wellness</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="relevance">Relevance</option>
          <option value="popularity">Popularity</option>
        </select>
        <button className="button" onClick={load}>Apply</button>
      </div>
      {query && suggestions.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <strong>Quick suggestions:</strong> {suggestions.map((s) => <button key={s.id} className="button-sm" onClick={() => setQuery(s.name)} style={{ margin: 2 }}>{s.name}</button>)}
        </div>
      )}
      {loading ? <p>Loading...</p> : <div className="card-grid">{medicines.map((med) => {
        const price = Number(med.price) || 0;
        return (
          <div key={med.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{med.name}</strong>
              <span className="badge">{med.category}</span>
            </div>
            <p>{med.brand}</p>
            <p>${price.toFixed(2)} <small>stock {med.stock}</small></p>
            <p><span className="badge">{med.prescription_required ? "Requires Prescription" : "OTC"}</span> {' '}
            {new Date(med.expiry_date).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 90 ? <span className="badge" style={{background:'#f59e0b', color:'#fff'}}>Expires soon</span> : null}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="button-sm" onClick={() => addToCart({ ...med, price })}>Add to Cart</button>
              <Link className="button-sm" style={{ textDecoration:'none' }} to={`/medicines/${med.id}`}>View details</Link>
            </div>
          </div>
        );
      })}</div>}
      {!user && <p className="alert">Login to add items and place order.</p>}
    </div>
  );
}

function Cart({ cart, setCart, user }) {
  const [payment, setPayment] = useState("Cash on delivery");
  const [receipt, setReceipt] = useState("");
  const [message, setMessage] = useState("");

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

  const placeOrder = async () => {
    if (!user) { setMessage("Please login first"); return; }
    if (cart.length === 0) { setMessage("Cart is empty"); return; }
    const requires = cart.some((i) => i.prescription_required);
    if (requires) {
      setMessage("This order contains prescription items. Upload prescription first.");
      return;
    }
    try {
      await api.post("/orders/create", { items: cart.map((i) => ({ id: i.id, quantity: i.quantity, price: Number(i.price) || 0 })), total, payment_mode: payment, payment_receipt: receipt });
      setMessage("Order placed successfully");
      setCart([]);
      setReceipt("");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Order failure");
    }
  };

  const updateQty = (id, delta) => setCart((prev) => {
    const next = prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item);
    return next;
  });

  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const interactions = [
    ["Amoxicillin", "Warfarin"],
    ["Metformin", "Captopril"],
  ];
  const badItems = cart.map((x) => x.name).filter((x, i, arr) => arr.some((other) => interactions.some((pair) => pair.includes(x) && pair.includes(other) && x !== other)));

  return (
    <div className="page">
      <h2>Cart</h2>
      {cart.length === 0 ? <p>Your cart is empty.</p> : (
        <div>
          {badItems.length > 0 && <div className="alert">Warning: potential drug interaction: {badItems.join(", ")}</div>}
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", padding: "8px 0" }}>
              <div>
                <strong>{item.name}</strong> <small>${Number(item.price).toFixed(2)}</small>
                <div><button className="button-sm" onClick={() => updateQty(item.id, -1)}>-</button> {item.quantity} <button className="button-sm" onClick={() => updateQty(item.id, 1)}>+</button> <button className="button-sm" onClick={() => removeItem(item.id)}>Remove</button></div>
              </div>
              <span>${((Number(item.quantity) || 0) * (Number(item.price) || 0)).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}><strong>Total: ${total.toFixed(2)}</strong></div>
          <div className="form-grid" style={{ marginTop: 8, gridTemplateColumns: "1fr" }}>
            <select value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option>Cash on delivery</option>
              <option>Credit / Debit card</option>
              <option>Bank transfer</option>
              <option>Mobile wallet</option>
            </select>
            <input placeholder="Payment receipt (transaction ID)" value={receipt} onChange={(e) => setReceipt(e.target.value)} />
            <button className="button" onClick={placeOrder}>Place Order</button>
          </div>
          {message && <p className="alarm">{message}</p>}
        </div>
      )}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders/history").then((res) => setOrders(res.data)).catch(() => { setError("Cannot load orders"); setOrders([]); });
  }, []);

  const downloadInvoice = (order) => {
    const lines = [
      `Order ID: ${order.order_id}`,
      `Date: ${order.created_at}`,
      `Total: $${order.total}`,
      `Payment: ${order.payment_mode}`,
      `Status: ${order.status}`,
      "\nThank you for shopping with Online Medical Store"
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.order_id}-invoice.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <h2>Order History</h2>
      {error && <p className="alarm">{error}</p>}
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <div className="card-grid">
          {orders.map((order) => (
            <div className="card" key={order.id}>
              <h4>{order.order_id}</h4>
              <p>Status: {order.status}</p>
              <p>Amount: ${order.total}</p>
              <p>Payment: {order.payment_mode}</p>
              <button className="button-sm" onClick={() => downloadInvoice(order)}>Download Invoice</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MedicineDetails() {
  const [medicine, setMedicine] = useState(null);
  const [error, setError] = useState("");
  const id = window.location.pathname.split("/").pop();

  useEffect(() => {
    if (!id || id === "medicines") return;
    api.get(`/medicines/${id}`).then((res) => setMedicine(res.data)).catch(() => setError("Medicine not found"));
  }, [id]);

  if (!medicine) return <div className="page"><h2>Medicine details</h2><p>{error || "Loading..."}</p></div>;
  const dosage = medicine.prescription_required ? "Take one capsule twice daily with meals." : "Take one tablet once daily.";
  const sideEffects = ["Nausea", "Headache", "Dizziness"];
  const interactions = medicine.name.toLowerCase().includes("metformin") ? ["Alcohol", "Contrast dye"] : ["Blood thinners", "Anti-inflammatory drugs"];

  return (
    <div className="page">
      <h2>{medicine.name}</h2>
      <p><strong>Brand:</strong> {medicine.brand}</p>
      <p><strong>Category:</strong> {medicine.category}</p>
      <p><strong>Price:</strong> ${Number(medicine.price || 0).toFixed(2)}</p>
      <p><strong>Stock:</strong> {medicine.stock}</p>
      <p><strong>Expiry:</strong> {medicine.expiry_date}</p>
      <div className="section"><h4>Dosage</h4><p>{dosage}</p></div>
      <div className="section"><h4>Side Effects</h4><ul>{sideEffects.map((s) => <li key={s}>{s}</li>)}</ul></div>
      <div className="section"><h4>Interactions</h4><ul>{interactions.map((i) => <li key={i}>{i}</li>)}</ul></div>
      <div className="alert">Warning: Always consult your doctor before combining medicines with other treatments.</div>
    </div>
  );
}

function UploadPrescription() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/prescriptions");
      setList(res.data);
    } catch (err) {
      setMsg("Could not load prescriptions");
    }
  };

  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file) { setMsg("Choose a file"); return; }
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post("/prescriptions/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg("Prescription uploaded. Status pending.");
      setFile(null);
      load();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Upload failed");
    }
  };

  return (
    <div className="page">
      <h2>Upload Prescription</h2>
      <div className="form-grid" style={{ gridTemplateColumns: "1fr auto", alignItems: "end" }}>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button className="button" onClick={upload}>Upload</button>
      </div>
      {msg && <p>{msg}</p>}
      <div className="section"><h4>Your prescriptions</h4>{list.length === 0 ? <p>No uploaded prescriptions</p> : <ul>{list.map((p) => <li key={p.id}>{p.file_path} - {p.status}</li>)}</ul>}</div>
    </div>
  );
}

function Account({ user, setUser }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", password: ""});
  const [msg, setMsg] = useState("");

  const save = async () => {
    try {
      await api.put("/users/me", form);
      setMsg("Updated");
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) { setMsg(err.response?.data?.msg || "Update error"); }
  };

  return (
    <div className="page">
      <h2>Account</h2>
      <p>Role: {user?.role || "patient"}</p>
      <div className="form-grid" style={{ maxWidth: 360 }}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New password (leave blank)" />
        <button className="button" onClick={save}>Save changes</button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  );
}

function Admin() {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", brand: "", category: "OTC", price: "", stock: "", expiry_date: "", prescription_required: false });
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", password: "123456", role: "patient" });
  const [editMedId, setEditMedId] = useState(null);
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    try {
      const [medRes, orderRes, presRes, usersRes] = await Promise.all([
        api.get("/medicines"),
        api.get("/orders/admin/all"),
        api.get("/prescriptions"),
        api.get("/users/all"),
      ]);
      setMedicines(medRes.data);
      setOrders(orderRes.data);
      setPrescriptions(presRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Admin load error", err);
      setMsg("Could not load admin data. Ensure you are logged in as admin.");
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveMedicine = async () => {
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), prescription_required: form.prescription_required };
      if (editMedId) {
        await api.put(`/medicines/${editMedId}`, payload);
        setMsg("Medicine updated.");
      } else {
        await api.post("/medicines/add", payload);
        setMsg("Medicine added.");
      }
      setForm({ name: "", brand: "", category: "OTC", price: "", stock: "", expiry_date: "", prescription_required: false });
      setEditMedId(null);
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Save failed");
    }
  };

  const editMedicine = (med) => {
    setEditMedId(med.id);
    setForm({
      name: med.name || "",
      brand: med.brand || "",
      category: med.category || "OTC",
      price: med.price || "",
      stock: med.stock || "",
      expiry_date: med.expiry_date || "",
      prescription_required: !!med.prescription_required,
    });
    setMsg("Editing medicine. Save to update.");
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    try {
      await api.delete(`/medicines/${id}`);
      setMsg("Medicine deleted.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Delete failed");
    }
  };

  const addUser = async (user) => {
    try {
      await api.post("/auth/register", user);
      setMsg("User added.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Add user failed");
    }
  };

  const updateUserRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      setMsg("User role updated.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Update failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setMsg("User deleted.");
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Delete failed");
    }
  };

  const updatePrescriptionStatus = async (id, status) => {
    await api.put(`/prescriptions/${id}/status`, { status });
    loadData();
  };

  const updateOrderAdminStatus = async (id, status) => {
    await api.put(`/orders/admin/${id}/status`, { status });
    loadData();
  };

  return (
    <div className="page">
      <h2>Admin Panel</h2>
      <div className="card-grid">
        <div className="card"><h4>Total medicines</h4><p>{medicines.length}</p></div>
        <div className="card"><h4>Total orders</h4><p>{orders.length}</p></div>
        <div className="card"><h4>Pending prescriptions</h4><p>{prescriptions.filter((p) => p.status === "pending").length}</p></div>
      </div>

      <div className="section">
        <h3>Add New Medicine</h3>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input placeholder="Expiry date" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          <div style={{ gridColumn: "span 2" }}><label><input type="checkbox" checked={form.prescription_required} onChange={(e) => setForm({ ...form, prescription_required: e.target.checked })} /> Requires prescription</label></div>
          <div style={{ display: "flex", gap: 8, gridColumn: "span 2" }}>
            <button className="button" onClick={saveMedicine}>{editMedId ? "Update medicine" : "Save medicine"}</button>
            {editMedId && <button className="button" onClick={() => { setEditMedId(null); setForm({ name: "", brand: "", category: "OTC", price: "", stock: "", expiry_date: "", prescription_required: false }); setMsg(""); }}>Cancel edit</button>}
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Inventory</h3>
        {medicines.length === 0 ? <p>No medicines yet.</p> : <div className="card-grid">{medicines.map((m) => (
          <div className="card" key={m.id}>
            <p><strong>{m.name}</strong> ({m.category})</p>
            <p>Brand: {m.brand}</p>
            <p>Price: ${Number(m.price).toFixed(2)} | Stock: {m.stock}</p>
            <p>Expiry: {m.expiry_date}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="button-sm" onClick={() => editMedicine(m)}>Edit</button>
              <button className="button-sm" onClick={() => deleteMedicine(m.id)}>Delete</button>
            </div>
          </div>
        ))}</div>}
      </div>

      <div className="section">
        <h3>Orders</h3>
        {orders.length === 0 ? <p>No orders.</p> : <div className="card-grid">{orders.map((o) => (
          <div className="card" key={o.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><strong>{o.order_id}</strong><br/><small>{new Date(o.created_at).toLocaleString()}</small></div>
              <span className="badge">{o.status}</span>
            </div>
            <p>Total: ${Number(o.total).toFixed(2)}</p>
            <p>Payment: {o.payment_mode || "Unknown"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {['Pending','Processing','Shipped','Delivered','Cancelled'].map((status) => (
                <button key={`${o.id}-${status}`} className="button-sm" style={{ background: o.status === status ? '#2563eb' : '#475569' }} onClick={() => updateOrderAdminStatus(o.id, status)}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}</div>}
      </div>

      <div className="section">
        <h3>Users & Permissions</h3>
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8, marginBottom: 12 }}>
          <input placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <input placeholder="Phone" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="patient">patient</option>
            <option value="doctor">doctor</option>
            <option value="pharmacist">pharmacist</option>
            <option value="admin">admin</option>
          </select>
          <button className="button" onClick={() => addUser(newUser)}>Create user</button>
        </div>
        {users.length === 0 ? <p>No users found.</p> : <div className="card-grid">{users.map((u) => (
          <div className="card" key={u.id}>
            <p><strong>{u.name || u.email}</strong></p>
            <p>{u.email}</p>
            <div style={{ marginBottom: 6 }}><strong>Role:</strong> <select value={u.role} onChange={async (e) => { await updateUserRole(u.id, e.target.value); }}>{["patient","doctor","pharmacist","admin"].map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="button-sm" onClick={() => deleteUser(u.id)}>Delete</button>
            </div>
          </div>
        ))}</div>}
      </div>

      <div className="section">
        <h3>Prescriptions</h3>
        {prescriptions.length === 0 ? <p>No prescriptions</p> : <div className="card-grid">{prescriptions.map((p) => (
          <div className="card" key={p.id}>
            <p><strong>{p.user_name || "User"}</strong> - {new Date(p.created_at || p.createdAt || Date.now()).toLocaleDateString()}</p>
            <p>Status: {p.status}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="button-sm" onClick={() => updatePrescriptionStatus(p.id, "approved")}>Approve</button>
              <button className="button-sm" onClick={() => updatePrescriptionStatus(p.id, "rejected")}>Reject</button>
            </div>
          </div>
        ))}</div>}
      </div>

      <div className="section">
        <h3>Low Stock Alerts</h3>
        {medicines.filter((m) => Number(m.stock) <= 10).length === 0 ? <p>All items stocked.</p> : <ul>{medicines.filter((m) => Number(m.stock) <= 10).map((m) => <li key={m.id}>{m.name} low stock ({m.stock})</li>)}</ul>}
      </div>

      <div className="section">
        <h3>Sales & Inventory Reports</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button className="button" onClick={() => {
            api.get("/orders/reports/inventory").then((res) => setMsg(`Inventory: ${JSON.stringify(res.data).slice(0,120)}...`)).catch(() => setMsg("Could not load inventory report"));
          }}>Load inventory report</button>
          <button className="button" onClick={() => {
            api.get("/orders/reports/sales").then((res) => setMsg(`Sales: ${JSON.stringify(res.data).slice(0,120)}...`)).catch(() => setMsg("Could not load sales report"));
          }}>Load sales report</button>
        </div>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/users/me").then((res) => setUser(res.data)).catch(() => { localStorage.removeItem(tokenKey); });
    }
  }, []);

  const logout = () => { localStorage.removeItem(tokenKey); setUser(null); delete api.defaults.headers.common["Authorization"]; };

  return (
    <Router>
      <div className="app-shell">
        <NavBar user={user} logout={logout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login loginSuccess={setUser} />} />
          <Route path="/admin-login" element={<AdminLogin loginSuccess={setUser} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/medicines" element={<Medicines setCart={setCart} user={user} />} />
          <Route path="/medicines/:id" element={<MedicineDetails />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} user={user} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/upload" element={<UploadPrescription />} />
          <Route path="/account" element={<Account user={user} setUser={setUser} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

