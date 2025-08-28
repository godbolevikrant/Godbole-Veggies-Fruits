import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addBill } from '../store/billsSlice';
import { FaPlus, FaTrash } from 'react-icons/fa';

function NewBill() {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();

  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: '', rate: '' }]);
  const [discount, setDiscount] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState('');
  const [outstanding, setOutstanding] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const API_KEY = import.meta.env.VITE_API_KEY || 'dev-secret-key';

  useEffect(() => {
    fetch(`${API_BASE}/api/products`, { headers: { 'X-API-KEY': API_KEY } })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: '', rate: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const product = products.find((p) => p._id === item.productId);
      const price = parseFloat(item.rate) || (product ? product.price : 0); // manual override
      return total + price * (parseFloat(item.quantity) || 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountValue = parseFloat(discount) || 0;
    const deliveryValue = parseFloat(deliveryCharges) || 0;
    return subtotal - discountValue + deliveryValue;
  };

  const handleSave = async () => {
    const discountValue = parseFloat(discount) || 0;
    const deliveryValue = parseFloat(deliveryCharges) || 0;
    const outstandingValue = parseFloat(outstanding) || 0;

    if (discountValue < 0 || deliveryValue < 0 || outstandingValue < 0) {
      alert('Discount, Delivery Charges and Outstanding cannot be negative');
      return;
    }

    const itemsWithPrice = items.map(item => {
      const product = products.find(p => p._id === item.productId);
      const price = parseFloat(item.rate) || (product ? product.price : 0);
      return {
        ...item,
        price,
        name: product ? product.name : 'Unknown'
      };
    });

    const billData = {
      customerName,
      items: itemsWithPrice,
      subtotal: calculateSubtotal(),
      discount: discountValue,
      deliveryCharges: deliveryValue,
      total: calculateTotal(),
      outstanding: outstandingValue,
      grandTotal: calculateTotal() + outstandingValue,
      date: new Date().toISOString(),
    };

    console.log('Saving bill:', billData);

    try {
      const response = await fetch(`${API_BASE}/api/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
        body: JSON.stringify(billData)
      });
      const savedBill = await response.json();
      console.log('API response:', savedBill);

      dispatch(addBill(savedBill));

      // Reset form
      setCustomerName('');
      setItems([{ productId: '', quantity: '', rate: '' }]);
      setDiscount('');
      setDeliveryCharges('');
      setOutstanding('');
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 text-success">Create New Bill</h1>
      <div className="card p-4 shadow">
        {/* Customer Name */}
        <div className="mb-4">
          <label className="form-label fw-bold">Customer Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        {/* Bill Items */}
        {items.map((item, index) => (
          <div key={index} className="row g-3 mb-3 align-items-center">
            <div className="col-md-4">
              <select
                className="form-select"
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} (₹{product.price}/kg)
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Quantity (kg)"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Rate (₹/kg)"
                value={item.rate}
                onChange={(e) => updateItem(index, 'rate', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-danger"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        {/* Add Item Button */}
        <button className="btn btn-outline-success mb-3" onClick={addItem}>
          <FaPlus /> Add Item
        </button>

        {/* Discount Field */}
        <div className="mb-4">
          <label className="form-label fw-bold">Discount (₹)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            placeholder="Enter discount amount"
            value={discount}
            min="0"
            onChange={e => setDiscount(e.target.value)}
          />
        </div>

        {/* Delivery Charges Field */}
        <div className="mb-4">
          <label className="form-label fw-bold">Delivery Charges (₹)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            placeholder="Enter delivery charges"
            value={deliveryCharges}
            min="0"
            onChange={e => setDeliveryCharges(e.target.value)}
          />
        </div>

        {/* Outstanding Balance Field */}
        <div className="mb-4">
          <label className="form-label fw-bold">Outstanding Balance (₹)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            placeholder="Enter outstanding balance"
            value={outstanding}
            min="0"
            onChange={e => setOutstanding(e.target.value)}
          />
        </div>

        {/* Totals */}
        <div className="text-end">
          <h5>Subtotal: ₹{calculateSubtotal().toFixed(2)}</h5>
          <h5>Discount: ₹{(parseFloat(discount) || 0).toFixed(2)}</h5>
          <h5>Delivery Charges: ₹{(parseFloat(deliveryCharges) || 0).toFixed(2)}</h5>
          <h5>Total (After Discount & Delivery): ₹{calculateTotal().toFixed(2)}</h5>
          <h5>Outstanding Balance: ₹{(parseFloat(outstanding) || 0).toFixed(2)}</h5>
          <h4 className="fw-bold text-success">
            Grand Total: ₹{(calculateTotal() + (parseFloat(outstanding) || 0)).toFixed(2)}
          </h4>
          <button className="btn btn-success mt-3" onClick={handleSave}>
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewBill;
