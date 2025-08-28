import React, { forwardRef } from "react";
import qrCode from '../assets/qr-code.jpeg';
import logo from '../assets/NewLogo.png';

const Print = forwardRef(({ bill = { id: '', date: new Date(), items: [], discount: 0, customerName: '' }, products = [] }, ref) => {
  console.log("bill object:", bill); // Debug entire bill object
  console.log("bill.discount:", bill.discount, typeof bill.discount); // Debug discount specifically

  return (
    <div ref={ref} className="print-container" style={{ padding: "40px", fontFamily: "Roboto, Arial, sans-serif", maxWidth: "800px", margin: "0 auto", letterSpacing: "2px" }}>
      {/* Shop Header */}
      <div style={{ textAlign: "center", borderBottom: "2px solid black", paddingBottom: "20px" }}>
        <img src={logo} alt="Shop Logo" style={{ height: "300px", marginBottom: "15px" }} />
        <p style={{ margin: "5px 0", fontSize: "16px" }}>
          Shop 04, Gandhi Market, Latur, Maharashtra - 413512
        </p>
        <p style={{ margin: "5px 0", fontSize: "16px" }}>
          Phone: +91 9112788838 | Email: Godboleveggies&fruits@gmail.com
        </p>
      </div>

      {/* Bill Header */}
      <div style={{ marginTop: "30px" }}>
        <h3 style={{ margin: "10px 0", fontSize: "20px" }}>Bill #{bill._id || 'N/A'}</h3>
        <p style={{ margin: "5px 0", fontSize: "16px" }}>Date: {new Date(bill.date).toLocaleString()}</p>
        {bill.customerName && (
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            <strong>Customer:</strong> {bill.customerName}
          </p>
        )}
      </div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "30px", fontSize: "16px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "12px", backgroundColor: "#f2f2f2" }}>Product</th>
            <th style={{ border: "1px solid black", padding: "12px", backgroundColor: "#f2f2f2" }}>Qty (kg)</th>
            <th style={{ border: "1px solid black", padding: "12px", backgroundColor: "#f2f2f2" }}>Rate (₹/kg)</th>
            <th style={{ border: "1px solid black", padding: "12px", backgroundColor: "#f2f2f2" }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => {
            const product = products.find(
              (p) => String(p._id || p.id) === String(item.productId)
            );
            const price = item.price !== undefined ? item.price : (product?.price || 0);
            const amount = price * (parseFloat(item.quantity) || 0);
            return (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
                <td style={{ border: "1px solid black", padding: "12px" }}>
                  {item.name || product?.name || "Unknown"}
                </td>
                <td style={{ border: "1px solid black", padding: "12px", textAlign: "center" }}>
                  {item.quantity || 0}
                </td>
                <td style={{ border: "1px solid black", padding: "12px", textAlign: "right" }}>
                  ₹{price.toFixed(2)}
                </td>
                <td style={{ border: "1px solid black", padding: "12px", textAlign: "right" }}>
                  ₹{amount.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Subtotal, Discount, and Total */}
      <div style={{ marginTop: "30px", textAlign: "right", fontSize: "18px" }}>
        {(() => {
          const subtotal = bill.items.reduce((sum, item) => {
            const product = products.find(
              (p) => String(p._id || p.id) === String(item.productId)
            );
            const price = item.price !== undefined ? item.price : (product?.price || 0);
            return sum + price * (parseFloat(item.quantity) || 0);
          }, 0);
          const discount = bill.discount || 0; // Simplified, as schema ensures discount is a number
          const total = subtotal - discount;
          return (
            <>
              <div style={{ fontWeight: "bold", color: "#333" }}>Subtotal: ₹{subtotal.toFixed(2)}</div>
              <div className="discount" style={{ color: "#d32f2f" }}>
                Discount: ₹{discount.toFixed(2)}
                {discount === 0 && <span style={{ fontSize: "14px", color: "#666" }}> (No discount applied)</span>}
              </div>
              <div style={{ fontWeight: "bold", color: "green", fontSize: "20px" }}>Total: ₹{total.toFixed(2)}</div>
            </>
          );
        })()}
      </div>

      {/* QR Code Payment Section */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px", color: "red" }}>
          Scan to Pay (UPI/QR)
        </p>
        <img
          src={qrCode}
          alt="UPI QR Code"
          style={{ height: "160px", marginBottom: "10px" }}
        />
        <p style={{ fontSize: "15px", margin: "5px 0" }}>
          Please scan the QR code above to pay via UPI.<br />
          (कृपया QR कोड स्कॅन करून UPI द्वारे पेमेंट करा.)
        </p>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "40px", borderTop: "1px solid black", paddingTop: "20px" }}>
        <p style={{ margin: "5px 0", fontSize: "16px" }}>Thank you for shopping with us!</p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>Visit again at Godbole Veggies & Fruits</p>
        <p style={{ margin: "5px 0", fontSize: "15px" }}>
          We offer home delivery! Call or WhatsApp +91 9112788838 to place your order.
          (आम्ही घरपोच डिलिव्हरी देतो ऑर्डर देण्यासाठी 9112788838 वर कॉल करा किंवा व्हॉट्सॲप करा.)
        </p>
      </div>
    </div>
  );
});

export default Print;