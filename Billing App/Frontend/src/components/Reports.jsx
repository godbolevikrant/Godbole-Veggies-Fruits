import React, { useState, useEffect } from "react";

function getPeriodBills(bills, period) {
  const now = new Date();
  return bills.filter((bill) => {
    const billDate = new Date(bill.date);
    if (period === "daily") {
      return (
        billDate.getDate() === now.getDate() &&
        billDate.getMonth() === now.getMonth() &&
        billDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === "monthly") {
      return (
        billDate.getMonth() === now.getMonth() &&
        billDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === "yearly") {
      return billDate.getFullYear() === now.getFullYear();
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
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/bills')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch bills');
        return res.json();
      })
      .then(data => setBills(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const periodBills = getPeriodBills(bills, period);
  const summary = getSummary(periodBills);

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4 text-success">Reports</h1>
      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn btn-outline-success mx-2${period === "daily" ? "active" : ""}`}
          onClick={() => setPeriod("daily")}
        >
          Daily
        </button>
        <button
          className={`btn btn-outline-success mx-2${period === "monthly" ? "active" : ""}`}
          onClick={() => setPeriod("monthly")}
        >
          Monthly
        </button>
        <button
          className={`btn btn-outline-success mx-2${period === "yearly" ? "active" : ""}`}
          onClick={() => setPeriod("yearly")}
        >
          Yearly
        </button>
      </div>
      <div className="card p-4 mb-4">
        <h4 className="mb-3">Summary</h4>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-danger">Error: {error}</p>
        ) : (
          <>
            <p><strong>Total Sales:</strong> ₹{summary.totalSales.toFixed(2)}</p>
            <p><strong>Number of Bills:</strong> {summary.billCount}</p>
          </>
        )}
      </div>
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
                <strong>Bill #{bill._id || bill.id}</strong> - ₹{bill.total.toFixed(2)} - {bill.customerName || "No customer"} - {new Date(bill.date).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Reports;