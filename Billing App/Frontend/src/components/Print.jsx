import React, { forwardRef } from "react";
import qrCode from "../assets/qr-code.jpeg";
import logo from "../assets/NewLogo.png";

const Print = forwardRef(
  (
    {
      bill = {
        id: "",
        date: new Date(),
        items: [],
        discount: 0,
        deliveryCharges: 0,
        outstanding: 0,
        customerName: "",
      },
      products = [],
      paidOverride = undefined,
    },
    ref
  ) => {
    const derivedPaid = String(bill.status || '').toLowerCase() === 'paid' || Number(bill.outstanding || 0) === 0;
    const isPaid = paidOverride != null ? Boolean(paidOverride) : derivedPaid;
    return (
      <div
        ref={ref}
        className="print-container"
        style={{
          padding: "40px",
          fontFamily: "Roboto, Arial, sans-serif",
          maxWidth: "800px",
          margin: "0 auto",
          letterSpacing: "2px",
          position: "relative",
        }}
      >
        {/* PAID/UNPAID Watermark */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-20deg)",
            fontSize: "96px",
            fontWeight: 900,
            color: isPaid ? "rgba(46, 125, 50, 0.07)" : "rgba(211, 47, 47, 0.07)",
            pointerEvents: "none",
            userSelect: "none",
            textTransform: "uppercase",
          }}
        >
          {isPaid ? "PAID" : "UNPAID"}
        </div>
        {/* Shop Header */}
        <div
          style={{
            textAlign: "center",
            borderBottom: "2px solid black",
            paddingBottom: "20px",
          }}
        >
          <img
            src={logo}
            alt="Shop Logo"
            style={{ height: "300px", marginBottom: "15px" }}
          />
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            📍 Shop 04, Gandhi Market, Latur, Maharashtra - 413512
          </p>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            📞 Phone: +91 9112788838 | ✉️ Email: Godboleveggies&fruits@gmail.com
          </p>
        </div>

        {/* Bill Header */}
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ margin: "10px 0", fontSize: "20px" }}>
            Bill #{bill._id || "N/A"}
          </h3>
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            Date: {new Date(bill.date).toLocaleString()}
          </p>
          <div style={{ margin: "5px 0" }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "9999px",
                fontWeight: 700,
                fontSize: "14px",
                color: isPaid ? "#1b5e20" : "#b71c1c",
                backgroundColor: isPaid ? "#c8e6c9" : "#ffcdd2",
              }}
            >
              {isPaid ? "PAID" : "UNPAID"}
            </span>
          </div>
          {bill.customerName && (
            <p style={{ margin: "5px 0", fontSize: "20px"}}>
              <strong>Customer:</strong> {bill.customerName}
            </p>
          )}
        </div>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "30px",
            fontSize: "16px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid black",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Product
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Qty (kg)
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Rate (₹/kg)
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "12px",
                  backgroundColor: "#f2f2f2",
                }}
              >
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => {
              const product = products.find(
                (p) => String(p._id || p.id) === String(item.productId)
              );
              const price =
                item.price !== undefined ? item.price : product?.price || 0;
              const amount = price * (parseFloat(item.quantity) || 0);
              return (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                  }}
                >
                  <td style={{ border: "1px solid black", padding: "12px" }}>
                    {item.name || product?.name || "Unknown"}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    {item.quantity || 0}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "12px",
                      textAlign: "right",
                    }}
                  >
                    ₹{price.toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "12px",
                      textAlign: "right",
                    }}
                  >
                    ₹{amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{ marginTop: "30px", textAlign: "right", fontSize: "18px" }}
        >
          {(() => {
            const subtotal = bill.items.reduce((sum, item) => {
              const product = products.find(
                (p) => String(p._id || p.id) === String(item.productId)
              );
              const price =
                item.price !== undefined ? item.price : product?.price || 0;
              return sum + price * (parseFloat(item.quantity) || 0);
            }, 0);

            const discount = bill.discount || 0;
            const deliveryCharges = bill.deliveryCharges || 0;
            const outstanding = bill.outstanding || 0;
            const grandTotal =
              subtotal - discount + deliveryCharges + outstanding;

            return (
              <>
                <div style={{ fontWeight: "bold", color: "#333333" }}>
                  Subtotal (एकूण रक्कम): ₹{subtotal.toFixed(2)}
                </div>
                <div
                  className="discount"
                  style={{ color: "#1f3ea5", fontWeight: "bold" }}
                >
                  Discount (सवलत): ₹{discount.toFixed(2)}
                </div>
                <div style={{ fontWeight: "bold", color: "#e67e22" }}>
                  Delivery Charges (डिलिव्हरी शुल्क): ₹{deliveryCharges.toFixed(2)}
                </div>
                <div style={{ fontWeight: "bold", color: "#d32f2f" }}>
                  Outstanding (मागील बाकी): ₹{outstanding.toFixed(2)}
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#2e7d32",
                    fontSize: "20px",
                  }}
                >
                  Grand Total (एकूण देय रक्कम): ₹{grandTotal.toFixed(2)}
                </div>
              </>
            );
          })()}
        </div>

        {/* QR Code Payment Section */}
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "red",
            }}
          >
            Scan to Pay (UPI/QR)
          </p>
          <img
            src={qrCode}
            alt="UPI QR Code"
            style={{ height: "160px", marginBottom: "10px" }}
          />
          <p style={{ fontSize: "15px", margin: "5px 0" }}>
            📲 Please scan the QR code above to pay via UPI.
            <br />
            (कृपया QR कोड स्कॅन करून UPI द्वारे पेमेंट करा.)
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            borderTop: "1px solid black",
            paddingTop: "20px",
          }}
        >
          <p style={{ margin: "5px 0", fontSize: "16px" }}>
            Thank you for shopping with us!
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            Visit again at Godbole Veggies & Fruits
          </p>
          <p style={{ margin: "5px 0", fontSize: "15px" }}>
            📦 We offer home delivery! 📞 Call or WhatsApp +91 9112788838 / 9011640340 to
            place your order.
            <br />
            (आम्ही घरपोच डिलिव्हरी देतो ऑर्डर देण्यासाठी 9112788838 वर कॉल करा
            किंवा व्हॉट्सॲप करा.)
          </p>
        </div>
      </div>
    );
  }
);

export default Print;
