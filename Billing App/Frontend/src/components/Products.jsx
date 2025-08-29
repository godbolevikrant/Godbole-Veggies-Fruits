import { useEffect, useRef, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api/client';

function Products() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editId, setEditId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const nameInputRef = useRef(null);

  // Load products from backend
  useEffect(() => {
    setLoading(true);
    api.get('/api/products')
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editId && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedName = (name || '').trim();
    const parsedPrice = parseFloat(String(price).trim());
    if (!trimmedName || !Number.isFinite(parsedPrice)) {
      setError('Product name and valid price are required.');
      return;
    }
    if (parsedPrice < 0) {
      setError('Price cannot be negative.');
      return;
    }
    // Duplicate name check (case-insensitive)
    const exists = products.some(p => p._id !== editId && String(p.name).toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      setError('A product with this name already exists.');
      return;
    }
    try {
      setSubmitting(true);
      if (editId) {
        const updated = await api.put(`/api/products/${editId}`, { name: trimmedName, price: parsedPrice });
        setProducts(products.map(p => p._id === editId ? updated : p));
        setEditId(null);
      } else {
        const newProduct = await api.post('/api/products', { name: trimmedName, price: parsedPrice });
        setProducts([...products, newProduct]);
      }
      setName('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setName(product.name);
    setPrice(String(product.price));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const prev = products;
    setProducts(prev.filter(p => p._id !== id));
    try {
      await api.del(`/api/products/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to delete');
      setProducts(prev); // rollback
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setPrice('');
  };

  const filtered = products.filter(p =>
    String(p.name).toLowerCase().includes(search.trim().toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return String(a.name).localeCompare(String(b.name));
      case 'name-desc':
        return String(b.name).localeCompare(String(a.name));
      case 'price-asc':
        return Number(a.price) - Number(b.price);
      case 'price-desc':
        return Number(b.price) - Number(a.price);
      default:
        return 0;
    }
  });

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 text-success">Products</h1>
        {products?.length ? <span className="badge text-bg-light">{products.length} items</span> : null}
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <h5 className="mb-3">{editId ? 'Edit Product' : 'Add New Product'}</h5>
          {error && <div className="alert alert-danger py-2 mb-3" aria-live="polite">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label" htmlFor="prod-name">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Tomato"
                  id="prod-name"
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="prod-price">Price per kg (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g., 40"
                  id="prod-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="col-md-2 d-grid">
                <button type="submit" className="btn btn-success">
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
              {editId && (
                <div className="col-md-12 d-grid">
                  <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit} disabled={submitting}>Cancel Edit</button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">
          <h5 className="mb-3">Product List</h5>
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <div className="row g-2 align-items-end">
                  <div className="col-md-6">
                    <input type="text" className="form-control" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex gap-2">
                      <select className="form-select" style={{ maxWidth: 220 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name-asc">Name A→Z</option>
                        <option value="name-desc">Name Z→A</option>
                        <option value="price-asc">Price low→high</option>
                        <option value="price-desc">Price high→low</option>
                      </select>
                    </div>
                  </div>
                </div>
              </li>
              {sorted.map((product) => (
                <li key={product._id} className="list-group-item">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-auto">
                      <div className="fw-medium">{product.name}</div>
                      <div className="text-muted small d-md-none">₹{product.price}/kg</div>
                    </div>
                    <div className="text-muted d-none d-md-block">₹{product.price}/kg</div>
                    <div>
                      {/* Desktop actions */}
                      <div className="btn-group d-none d-md-inline-flex">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(product)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product._id)}>
                          <FaTrash />
                        </button>
                      </div>
                      {/* Mobile dropdown */}
                      <div className="dropdown d-inline d-md-none">
                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Actions
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li><button className="dropdown-item" onClick={() => handleEdit(product)}>Edit</button></li>
                          <li><button className="dropdown-item text-danger" onClick={() => handleDelete(product._id)}>Delete</button></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {products.length === 0 && (
                <li className="list-group-item text-muted">No products added yet.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;