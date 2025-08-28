import React, { useState, useEffect } from "react";

function getPeriodItems(items, period) {
  if (!Array.isArray(items)) return [];
  const now = new Date();
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    if (period === "daily") {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === "monthly") {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === "yearly") {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return false;
  });
}

function getSummary(bills) {
  return {
    totalSales: bills.reduce((sum, bill) => sum + bill.total, 0),
    billCount: bills.length,
  };
}

function Reports() {
  const [bills, setBills] = useState([]);
  const [manualEntries, setManualEntries] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [manualAmount, setManualAmount] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const API_KEY = import.meta.env.VITE_API_KEY || 'dev-secret-key';

  // ✅ Fetch bills & manual entries
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/bills`, { headers: { 'X-API-KEY': API_KEY } }).then((res) => res.json()),
      fetch(`${API_BASE}/api/manual-entries`, { headers: { 'X-API-KEY': API_KEY } }).then((res) => res.json()),
    ])
      .then(([billsData, manualData]) => {
        setBills(billsData);
        setManualEntries(manualData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const periodBills = getPeriodItems(bills, period);
  const periodManuals = getPeriodItems(manualEntries, period);

  const summary = getSummary(periodBills);

  const totalManualSales = periodManuals
    .filter((m) => m.type === "sale")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalExpenses = periodManuals
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + m.amount, 0);

  const dailyEarnings = summary.totalSales + totalManualSales - totalExpenses;

  // ✅ Add manual sale
  const handleAddManualSale = async (e) => {
    e.preventDefault();
    if (!manualAmount) return;
    const entry = { type: "sale", amount: parseFloat(manualAmount) };
    const res = await fetch(`${API_BASE}/api/manual-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", 'X-API-KEY': API_KEY },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    setManualEntries([...manualEntries, data]);
    setManualAmount("");
  };

  // ✅ Add expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount) return;
    const entry = { type: "expense", amount: parseFloat(expenseAmount) };
    const res = await fetch(`${API_BASE}/api/manual-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", 'X-API-KEY': API_KEY },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    setManualEntries([...manualEntries, data]);
    setExpenseAmount("");
  };

  // ✅ Delete manual entry
  const handleDeleteEntry = async (id) => {
    await fetch(`${API_BASE}/api/manual-entries/${id}`, {
      method: "DELETE",
      headers: { 'X-API-KEY': API_KEY },
    });
    setManualEntries(manualEntries.filter((m) => m._id !== id));
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4 text-success">Reports</h1>

      {/* Period selector */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn btn-outline-success mx-2${period === "daily" ? " active" : ""}`}
          onClick={() => setPeriod("daily")}
        >
          Daily
        </button>
        <button
          className={`btn btn-outline-success mx-2${period === "monthly" ? " active" : ""}`}
          onClick={() => setPeriod("monthly")}
        >
          Monthly
        </button>
        <button
          className={`btn btn-outline-success mx-2${period === "yearly" ? " active" : ""}`}
          onClick={() => setPeriod("yearly")}
        >
          Yearly
        </button>
      </div>

      {/* Summary Card */}
      <div className="card p-4 mb-4">
        <h4 className="mb-3">Summary</h4>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-danger">Error: {error}</p>
        ) : (
          <>
            <p><strong>Total Sales (Bills):</strong> ₹{summary.totalSales.toFixed(2)}</p>
            <p><strong>Manual Sales:</strong> ₹{totalManualSales.toFixed(2)}</p>
            <p><strong>Total Expenses:</strong> ₹{totalExpenses.toFixed(2)}</p>
            <hr />
            <p className="fw-bold text-primary">
              Net Earnings = (Sales + Manual) – Expenses = ₹{dailyEarnings.toFixed(2)}
            </p>
            <p><strong>Number of Bills:</strong> {summary.billCount}</p>
          </>
        )}
      </div>

      {/* Manual Sales & Expenses Forms */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Add Manual Sale</h5>
            <form onSubmit={handleAddManualSale} className="d-flex">
              <input
                type="number"
                className="form-control me-2"
                placeholder="Enter amount"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />
              <button className="btn btn-success">Add</button>
            </form>
            <ul className="list-group mt-3">
              {periodManuals.filter((m) => m.type === "sale").map((m) => (
                <li key={m._id} className="list-group-item d-flex justify-content-between align-items-center">
                  ₹{m.amount}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteEntry(m._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Add Expense</h5>
            <form onSubmit={handleAddExpense} className="d-flex">
              <input
                type="number"
                className="form-control me-2"
                placeholder="Enter expense"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
              <button className="btn btn-danger">Add</button>
            </form>
            <ul className="list-group mt-3">
              {periodManuals.filter((m) => m.type === "expense").map((exp) => (
                <li key={exp._id} className="list-group-item d-flex justify-content-between align-items-center text-danger">
                  ₹{exp.amount}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteEntry(exp._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="card p-4">
        <h4 className="mb-3">Bills</h4>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-danger">Error: {error}</p>
        ) : periodBills.length === 0 ? (
          <p className="text-muted">No bills found for this period.</p>
        ) : (
          <ul className="list-group">
            {periodBills.map((bill) => (
              <li key={bill._id || bill.id} className="list-group-item">
                <strong>Bill #{bill._id || bill.id}</strong> - ₹{bill.total.toFixed(2)} -{" "}
                {bill.customerName || "No customer"} - {new Date(bill.date).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Reports;
