import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api/client';

function Products() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editId, setEditId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load products from backend
  useEffect(() => {
    setLoading(true);
    api.get('/api/products')
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!name || !price) {
        setError('Product name and price are required.');
        return;
      }
      if (editId) {
        const updated = await api.put(`/api/products/${editId}`, { name, price: parseFloat(price) });
        setProducts(products.map(p => p._id === editId ? updated : p));
        setEditId(null);
      } else {
        const newProduct = await api.post('/api/products', { name, price: parseFloat(price) });
        setProducts([...products, newProduct]);
      }
      setName('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setName(product.name);
    setPrice(product.price);
  };

  const handleDelete = async (id) => {
    await api.del(`/api/products/${id}`);
    setProducts(products.filter(p => p._id !== id));
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 text-success">Products</h1>
        {products?.length ? <span className="badge text-bg-light">{products.length} items</span> : null}
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <h5 className="mb-3">{editId ? 'Edit Product' : 'Add New Product'}</h5>
          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Tomato"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Price per kg (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g., 40"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2 d-grid">
                <button type="submit" className="btn btn-success">
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
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
              {products.map((product) => (
                <li key={product._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span className="fw-medium">{product.name}</span>
                  <span className="text-muted">₹{product.price}/kg</span>
                  <span>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(product)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product._id)}>
                      <FaTrash />
                    </button>
                  </span>
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