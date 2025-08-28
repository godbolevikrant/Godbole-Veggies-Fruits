import { useState, useEffect, useRef } from "react";
import api from "../api/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Print from "./Print";

function PendingBills() {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState("");
  const [outstanding, setOutstanding] = useState("");
  const [status, setStatus] = useState("pending");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [billToDownload, setBillToDownload] = useState(null);
  const downloadRef = useRef();

  // Fetch products (for print price fallback) and pending bills
  useEffect(() => {
    // load products once
    api.get('/api/products').then((data) => setProducts(data || [])).catch(() => {});
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, from, to, q, skip, limit]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (q) params.set('q', q);
      params.set('skip', String(skip));
      params.set('limit', String(limit));
      const data = await api.get(`/api/pending-bills?${params.toString()}`);
      setBills(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching pending bills:", err);
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      setError("");
      await api.post(`/api/pending-bills/${id}/mark-paid`, {});
      setBills((prev) => prev.filter((b) => b._id !== id));
      setTotal((t) => Math.max((t || 1) - 1, 0));
    } catch (err) {
      console.error("Error marking paid:", err);
      setError(err.message || 'Failed to mark as paid');
      fetchBills();
    }
  };

  // Download PDF for a pending bill
  const handleDownload = async (bill) => {
    setBillToDownload(bill);
    setTimeout(async () => {
      try {
        const input = downloadRef.current;
        if (!input) throw new Error("Bill content not found");
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save(`Pending-Bill-${bill._id}.pdf`);
      } catch (err) {
        alert("Failed to download bill PDF. Please try again.\n" + err.message);
      } finally {
        setBillToDownload(null);
      }
    }, 200);
  };

  // No print flow — sharing handled via WhatsApp and PDF download only

  // Share via WhatsApp (opens WhatsApp with prefilled text)
  const handleShareWhatsApp = (bill) => {
    const subtotal = (bill.items || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
    const totalDue = subtotal + (Number(bill.outstanding) || 0);
    const lines = [
      `Godbole Veggies & Fruits`,
      `Pending Bill`,
      `Customer: ${bill.customerName}`,
      `Date: ${new Date(bill.date).toLocaleString()}`,
      `Items:`,
      ...(bill.items || []).map(it => `- ${it.name}: ${it.quantity} kg @ ₹${Number(it.price).toFixed(2)}`),
      `Outstanding: ₹${Number(bill.outstanding || 0).toFixed(2)}`,
      `Total Due: ₹${totalDue.toFixed(2)}`,
    ];
    const text = encodeURIComponent(lines.join('\n'));
    const phoneDigits = (bill.phone || '').replace(/\D/g, '');
    const url = phoneDigits ? `https://wa.me/${phoneDigits}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Save new bill
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newBill = {
      customerName,
      date,
      outstanding: parseFloat(outstanding) || 0,
      status,
      note,
      phone,
    };

    try {
      setError("");
      const savedBill = await api.post('/api/pending-bills', newBill);
      setBills([savedBill, ...bills]);
      setTotal(total + 1);
      // Reset form
      setCustomerName("");
      setDate("");
      setOutstanding("");
      setStatus("pending");
      setNote("");
      setPhone("");
    } catch (err) {
      console.error("Error saving bill:", err);
      setError(err.message || 'Failed to save');
    }
  };

  // Delete bill
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      setError("");
      const prev = bills;
      setBills(prev.filter((bill) => bill._id !== id));
      setTotal(Math.max(total - 1, 0));
      await api.del(`/api/pending-bills/${id}`);
    } catch (err) {
      console.error("Error deleting bill:", err);
      setError(err.message || 'Failed to delete');
      fetchBills();
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 text-success">Pending Bills</h1>
        <div className="d-flex align-items-center gap-2">
          {loading ? <span className="badge text-bg-secondary">Loading...</span> : null}
          <span className="badge text-bg-light">{total} items</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select className="form-select" value={filterStatus} onChange={(e) => { setSkip(0); setFilterStatus(e.target.value); }}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">From</label>
            <input type="date" className="form-control" value={from} onChange={(e) => { setSkip(0); setFrom(e.target.value); }} />
          </div>
          <div className="col-md-2">
            <label className="form-label">To</label>
            <input type="date" className="form-control" value={to} onChange={(e) => { setSkip(0); setTo(e.target.value); }} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Search Customer</label>
            <input type="text" className="form-control" placeholder="Type name..." value={q} onChange={(e) => { setSkip(0); setQ(e.target.value); }} />
          </div>
          <div className="col-md-2 text-end">
            <div className="btn-group w-100">
              <button className="btn btn-outline-secondary" onClick={() => { setSkip(0); fetchBills(); }}>Refresh</button>
              <select className="form-select" value={limit} onChange={(e) => { setSkip(0); setLimit(parseInt(e.target.value, 10)); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bill Form */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <h5 className="mb-3">Add Pending Bill</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              step="0.01"
              className="form-control"
              placeholder="Outstanding (₹)"
              value={outstanding}
              onChange={(e) => setOutstanding(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-success w-100">
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Pending Bills List */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light sticky-top">
            <tr>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Outstanding (₹)</th>
              <th>Grand Total (₹)</th>
              <th>Status</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.length > 0 ? (
              bills.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.customerName}</td>
                  <td>{new Date(bill.date).toLocaleDateString()}</td>
                  <td>₹{bill.outstanding}</td>
                  <td>
                    {(() => {
                      const subtotal = (bill.items || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
                      const grand = subtotal + (Number(bill.outstanding) || 0);
                      return `₹${grand.toFixed(2)}`;
                    })()}
                  </td>
                  <td>
                    {bill.status === "paid" ? (
                      <span className="badge bg-success">Paid</span>
                    ) : (
                      <span className="badge bg-danger">Pending</span>
                    )}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 240 }}>{bill.note}</td>
                  <td>
                    <div className="btn-group">
                      {bill.status !== 'paid' && (
                        <button className="btn btn-sm btn-outline-success" onClick={() => handleMarkPaid(bill._id)} disabled={loading}>Mark Paid</button>
                      )}
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(bill)} disabled={loading}>Download PDF</button>
                      <button className="btn btn-sm btn-outline-dark" onClick={() => handleShareWhatsApp(bill)} disabled={loading}>WhatsApp</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(bill._id)} disabled={loading}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No pending bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">Showing {bills.length} of {total}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={skip === 0 || loading} onClick={() => setSkip(Math.max(skip - limit, 0))}>Prev</button>
          <button className="btn btn-outline-secondary" disabled={skip + limit >= total || loading} onClick={() => setSkip(skip + limit)}>Next</button>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger mt-3" role="alert">{error}</div>
      ) : null}

      {/* Hidden render target for download/print */}
      {billToDownload ? (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={downloadRef}>
            <Print bill={billToDownload} products={products} paidOverride={false} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default PendingBills;
