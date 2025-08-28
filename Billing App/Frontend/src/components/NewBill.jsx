import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addBill } from '../store/billsSlice';
import { FaPlus, FaTrash } from 'react-icons/fa';

function NewBill() {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();

  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: '' }]);
  const [discount, setDiscount] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: '' }]);
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
      return total + (product ? product.price * (parseFloat(item.quantity) || 0) : 0);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - (parseFloat(discount) || 0);
  };

  const handleSave = async () => {
    const discountValue = parseFloat(discount) || 0;
    if (discountValue < 0) {
      alert('Discount cannot be negative');
      return;
    }

    const itemsWithPrice = items.map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        ...item,
        price: product ? product.price : 0,
        name: product ? product.name : 'Unknown' // Add product name for schema
      };
    });

    const billData = {
      customerName,
      items: itemsWithPrice,
      discount: discountValue,
      total: calculateTotal(),
      date: new Date().toISOString(),
    };

    console.log('Saving bill:', billData); // Debug bill data

    try {
      const response = await fetch('http://localhost:5000/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });
      const savedBill = await response.json();
      console.log('API response:', savedBill); // Debug API response

      dispatch(addBill(savedBill)); // Dispatch to Redux
      // Reset form
      setCustomerName('');
      setItems([{ productId: '', quantity: '' }]);
      setDiscount('');
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
            <div className="col-md-5">
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
            <div className="col-md-4">
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

        {/* Add Item Button */}
        <button className="btn btn-outline-success mb-3" onClick={addItem}>
          <FaPlus /> Add Item
        </button>

        {/* Total & Save */}
        <div className="text-end">
          <h5>Subtotal: ₹{calculateSubtotal().toFixed(2)}</h5>
          <h5>Discount: ₹{(parseFloat(discount) || 0).toFixed(2)}</h5>
          <h5>Total: ₹{calculateTotal().toFixed(2)}</h5>
          <button className="btn btn-success mt-3" onClick={handleSave}>
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewBill;