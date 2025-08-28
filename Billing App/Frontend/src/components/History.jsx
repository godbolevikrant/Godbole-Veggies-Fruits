import { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
import { FaFileAlt, FaPrint, FaTrash } from "react-icons/fa";
import Print from "./Print";

function History() {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billToDownload, setBillToDownload] = useState(null);
  const downloadRef = useRef();

  // Fetch bills and products from backend
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:5000/api/bills").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bills");
        return res.json();
      }),
      fetch("http://localhost:5000/api/products").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      }),
    ])
      .then(([billsData, productsData]) => {
        setBills(billsData);
        setProducts(productsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Handle PDF download
  const handleDownload = async (bill) => {
    setBillToDownload(bill);
    setTimeout(async () => {
      try {
        const input = downloadRef.current;
        if (!input) throw new Error("Bill content not found");
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save(`Bill-${bill._id || bill.id}.pdf`);
      } catch (err) {
        alert("Failed to download bill PDF. Please try again.\n" + err.message);
      } finally {
        setBillToDownload(null);
      }
    }, 200);
  };

  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => downloadRef.current,
    documentTitle: `Bill-${billToDownload?._id || billToDownload?.id || "unknown"}`,
    onAfterPrint: () => setBillToDownload(null),
  });

  // Handle bill deletion
  const handleDelete = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/bills/${billId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bill");
      setBills(bills.filter((bill) => (bill._id || bill.id) !== billId));
    } catch (err) {
      alert("Failed to delete bill. Please try again.\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter bills by search and sort by date (newest first)
  const filteredBills = bills
    .filter((bill) => {
      const query = search.toLowerCase();
      const customer = bill.customerName ? bill.customerName.toLowerCase() : "";
      const id = String(bill._id || bill.id);
      const date = new Date(bill.date).toLocaleString().toLowerCase();
      return customer.includes(query) || id.includes(query) || date.includes(query);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 text-success">Bill History</h1>
      <div className="mb-4 d-flex justify-content-center">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by customer, bill ID, or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="card shadow">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : error ? (
          <div className="text-center p-4 text-danger">Error: {error}</div>
        ) : (
          <ul className="list-group list-group-flush">
            {filteredBills.length === 0 ? (
              <li className="list-group-item text-center text-muted">No bills found.</li>
            ) : (
              filteredBills.map((bill) => (
                <li key={bill._id || bill.id} className="list-group-item">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <FaFileAlt className="me-2 text-success" />
                      <strong>Bill #{bill._id || bill.id}</strong> -{" "}
                      {new Date(bill.date).toLocaleString()}
                    </div>
                    <span className="fw-bold text-success">
                      ₹{(bill.grandTotal ?? bill.total).toFixed(2)}
                    </span>
                  </div>

                  {/* Customer Name */}
                  {bill.customerName && (
                    <div className="mt-1">
                      <strong>Customer:</strong> {bill.customerName}
                    </div>
                  )}

                  {/* Financial Breakdown */}
                  <div className="mt-1">
                    <small>
                      Subtotal: ₹{(bill.subtotal || 0).toFixed(2)} | Discount: ₹
                      {(bill.discount || 0).toFixed(2)} | Delivery: ₹
                      {(bill.deliveryCharges || 0).toFixed(2)} | Outstanding: ₹
                      {(bill.outstanding || 0).toFixed(2)}
                    </small>
                  </div>

                  {/* Purchased Products */}
                  <ul className="mt-2 mb-2">
                    {bill.items.map((item, index) => {
                      const product = products.find((p) => (p._id || p.id) === item.productId);
                      const price =
                        item.price !== undefined ? item.price : product?.price || 0;
                      return (
                        <li key={index}>
                          {product?.name || "Unknown"} - {item.quantity}kg @ ₹
                          {price.toFixed(2)}/kg
                        </li>
                      );
                    })}
                  </ul>

                  {/* Download, Print, and Delete Buttons */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-success btn-sm mt-2"
                      onClick={() => handleDownload(bill)}
                    >
                      <FaPrint className="me-2" /> Download PDF
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={() => {
                        setBillToDownload(bill);
                        handlePrint();
                      }}
                    >
                      <FaPrint className="me-2" /> Print Bill
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm mt-2"
                      onClick={() => handleDelete(bill._id || bill.id)}
                    >
                      <FaTrash className="me-2" /> Delete Bill
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
        {/* Off-screen download component for the selected bill */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            zIndex: -1,
            width: "800px",
          }}
        >
          {billToDownload && <Print ref={downloadRef} bill={billToDownload} products={products} />}
        </div>
      </div>
    </div>
  );
}

export default History;
