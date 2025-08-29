import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addBill } from '../store/billsSlice';
import { FaPlus, FaTrash } from 'react-icons/fa';
import api from '../api/client';
import Print from './Print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function NewBill() {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const downloadRef = useRef(null);
  const [billToDownload, setBillToDownload] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: '', rate: '' }]);
  const [discount, setDiscount] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState('');
  const [outstanding, setOutstanding] = useState('');
  const [note, setNote] = useState('');

  // Load products
  useEffect(() => {
    api.get('/api/products')
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  // Draft autosave/load
  useEffect(() => {
    const draft = localStorage.getItem('draftBill');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setCustomerName(parsed.customerName || '');
        setItems(parsed.items && Array.isArray(parsed.items) && parsed.items.length ? parsed.items : [{ productId: '', quantity: '', rate: '' }]);
        setDiscount(parsed.discount ?? '');
        setDeliveryCharges(parsed.deliveryCharges ?? '');
        setOutstanding(parsed.outstanding ?? '');
        setNote(parsed.note ?? '');
      } catch {}
    }
  }, []);

  useEffect(() => {
    const payload = {
      customerName,
      items,
      discount,
      deliveryCharges,
      outstanding,
      note,
      ts: Date.now(),
    };
    const id = setTimeout(() => {
      localStorage.setItem('draftBill', JSON.stringify(payload));
    }, 300);
    return () => clearTimeout(id);
  }, [customerName, items, discount, deliveryCharges, outstanding, note]);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: '', rate: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    // When product selected, auto-fill rate from product or last-used rate
    if (field === 'productId') {
      const selected = products.find(p => p._id === value);
      const todayKey = new Date().toISOString().slice(0,10);
      const lastRates = JSON.parse(localStorage.getItem('lastRates') || '{}');
      const lastForToday = (lastRates[todayKey] && lastRates[todayKey][value]) || null;
      if (selected) {
        newItems[index].rate = lastForToday != null ? String(lastForToday) : String(selected.price ?? '');
      }
    }
    // When rate changes, remember last used rate per product for today
    if (field === 'rate') {
      const productId = newItems[index].productId;
      if (productId) {
        const todayKey = new Date().toISOString().slice(0,10);
        const lastRates = JSON.parse(localStorage.getItem('lastRates') || '{}');
        lastRates[todayKey] = lastRates[todayKey] || {};
        const asNum = parseFloat(value);
        if (!isNaN(asNum)) {
          lastRates[todayKey][productId] = asNum;
          localStorage.setItem('lastRates', JSON.stringify(lastRates));
        }
      }
    }
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
    // Client-side validation for items
    const hasInvalidItem = items.some((item) => {
      const qty = parseFloat(item.quantity);
      return !item.productId || isNaN(qty) || qty <= 0;
    });
    if (hasInvalidItem) {
      alert('Please select a product and enter quantity > 0 for all items.');
      return;
    }

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
        quantity: parseFloat(item.quantity) || 0,
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
      note,
    };

    console.log('Saving bill:', billData);

    try {
      const savedBill = await api.post('/api/bills', billData);
      console.log('API response:', savedBill);
      dispatch(addBill(savedBill));

      // Reset form
      setCustomerName('');
      setItems([{ productId: '', quantity: '', rate: '' }]);
      setDiscount('');
      setDeliveryCharges('');
      setOutstanding('');
      setNote('');
      localStorage.removeItem('draftBill');

      // Navigate to History so the user immediately sees the saved bill
      navigate('/history');
    } catch (error) {
      alert(error.message || 'Failed to save bill');
    }
  };

  const handleSaveAsPending = async () => {
    const hasInvalidItem = items.some((item) => {
      const qty = parseFloat(item.quantity);
      return !item.productId || isNaN(qty) || qty <= 0;
    });
    if (hasInvalidItem) {
      alert('Please select a product and enter quantity > 0 for all items.');
      return;
    }
    const outstandingValue = parseFloat(outstanding) || 0;
    if (outstandingValue < 0) {
      alert('Outstanding cannot be negative');
      return;
    }
    const itemsWithPrice = items.map(item => {
      const product = products.find(p => p._id === item.productId);
      const price = parseFloat(item.rate) || (product ? product.price : 0);
      return {
        name: product ? product.name : 'Unknown',
        quantity: parseFloat(item.quantity) || 0,
        price,
        productId: item.productId || undefined,
      };
    });
    const payload = {
      customerName,
      date: new Date().toISOString(),
      discount: parseFloat(discount) || 0,
      deliveryCharges: parseFloat(deliveryCharges) || 0,
      outstanding: outstandingValue,
      status: 'pending',
      items: itemsWithPrice,
      note,
    };
    try {
      const saved = await api.post('/api/pending-bills', payload);

      // Prepare bill object for Print component
      const printableBill = {
        _id: saved._id,
        id: saved._id,
        customerName: saved.customerName || customerName,
        date: saved.date || payload.date,
        items: saved.items && saved.items.length ? saved.items : itemsWithPrice,
        discount: saved.discount ?? payload.discount ?? 0,
        deliveryCharges: saved.deliveryCharges ?? payload.deliveryCharges ?? 0,
        outstanding: saved.outstanding ?? outstandingValue,
        status: saved.status || 'pending',
        note: saved.note || note,
      };

      // Trigger hidden render, then capture to PDF
      setBillToDownload(printableBill);
      setTimeout(async () => {
        try {
          const input = downloadRef.current;
          if (!input) throw new Error('Bill content not found');
          const canvas = await html2canvas(input, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
          pdf.save(`Pending-Bill-${saved._id}.pdf`);
        } catch (e) {
          alert('Saved as pending, but PDF generation failed. You can download from Pending Bills.\n' + (e.message || e));
        } finally {
          setBillToDownload(null);
          // Reset form after PDF attempt
          setCustomerName('');
          setItems([{ productId: '', quantity: '', rate: '' }]);
          setDiscount('');
          setDeliveryCharges('');
          setOutstanding('');
          setNote('');
          localStorage.removeItem('draftBill');
          alert('Saved as pending');
        }
      }, 200);
    } catch (err) {
      alert(err.message || 'Failed to save as pending');
    }
  };

  // Keyboard shortcuts: Ctrl+Enter add item, Ctrl+S save
  const onKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      handleSave();
    }
  }, [addItem, handleSave]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Inline Add Product modal state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');

  const submitNewProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    try {
      const created = await api.post('/api/products', { name: newProdName, price: parseFloat(newProdPrice) });
      setProducts((prev) => [...prev, created]);
      // Preselect in last item if empty
      setItems((prev) => {
        const clone = [...prev];
        const idx = clone.length - 1;
        if (idx >= 0 && !clone[idx].productId) clone[idx].productId = created._id;
        return clone;
      });
      setShowAddProduct(false);
      setNewProdName('');
      setNewProdPrice('');
    } catch (err) {
      alert(err.message || 'Failed to add product');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 text-success">New Bill</h1>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => {
          setCustomerName('');
          setItems([{ productId: '', quantity: '', rate: '' }]);
          setDiscount('');
          setDeliveryCharges('');
          setOutstanding('');
        }}>Reset</button>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4">
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
              <button type="button" className="btn btn-link p-0 mt-1" onClick={() => setShowAddProduct(true)}>+ Add product</button>
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

        {/* Discount Field with presets */}
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
          <div className="mt-2 d-flex gap-2">
            {[0, 10, 20, 50].map(v => (
              <button key={v} type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDiscount(String(v))}>{v}</button>
            ))}
          </div>
        </div>

        {/* Delivery Charges Field with presets */}
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
          <div className="mt-2 d-flex gap-2">
            {[0, 20, 30, 50].map(v => (
              <button key={v} type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDeliveryCharges(String(v))}>{v}</button>
            ))}
          </div>
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
        <div className="text-end" style={{ position: 'sticky', bottom: 0, background: '#fff' }}>
          <h5>Subtotal: ₹{calculateSubtotal().toFixed(2)}</h5>
          <h5>Discount: ₹{(parseFloat(discount) || 0).toFixed(2)}</h5>
          <h5>Delivery Charges: ₹{(parseFloat(deliveryCharges) || 0).toFixed(2)}</h5>
          <h5>Total (After Discount & Delivery): ₹{calculateTotal().toFixed(2)}</h5>
          <h5>Outstanding Balance: ₹{(parseFloat(outstanding) || 0).toFixed(2)}</h5>
          <h4 className="fw-bold text-success">
            Grand Total: ₹{(calculateTotal() + (parseFloat(outstanding) || 0)).toFixed(2)}
          </h4>
          <button className="btn btn-outline-secondary mt-3 me-2" onClick={() => { localStorage.removeItem('draftBill'); setCustomerName(''); setItems([{ productId: '', quantity: '', rate: '' }]); setDiscount(''); setDeliveryCharges(''); setOutstanding(''); setNote(''); }}>Discard Draft</button>
          <div className="btn-group mt-3">
            <button className="btn btn-success" onClick={handleSave} disabled={items.some(i => !i.productId || (parseFloat(i.quantity) || 0) <= 0 || (parseFloat(i.rate) || 0) < 0)}>
              Save Bill
            </button>
            <button className="btn btn-outline-primary" onClick={handleSaveAsPending} disabled={items.some(i => !i.productId || (parseFloat(i.quantity) || 0) <= 0)}>
              Save as Pending
            </button>
          </div>
          {items.some(i => !i.productId || (parseFloat(i.quantity) || 0) <= 0) && (
            <div className="text-danger small mt-2">Please select a product and enter quantity &gt; 0 for all items.</div>
          )}
        </div>
      </div>

      {/* Inline Add Product Modal */}
      {showAddProduct && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Product</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddProduct(false)}></button>
              </div>
              <form onSubmit={submitNewProduct}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price per kg (₹)</label>
                    <input type="number" step="0.01" className="form-control" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Hidden render target for pending bill PDF download */}
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

export default NewBill;
