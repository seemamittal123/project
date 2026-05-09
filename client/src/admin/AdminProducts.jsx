import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

const empty = {
    name: '', brand: 'GenZdial', description: '', image: '',
    price: 0, mrp: 0, rating: 4.5, reviews: 0,
    category: 'unisex', tag: '', stock: 25,
    trending: false, newArrival: false,
};

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const load = () => {
        setFetching(true);
        return api.get('/products')
            .then((r) => setProducts(r.data))
            .finally(() => setFetching(false));
    };

    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing('new'); setForm(empty); };
    const startEdit = (p) => { setEditing(p._id); setForm({ ...empty, ...p }); };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editing === 'new') await api.post('/products', form);
            else await api.put(`/products/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this product?')) return;
        await api.delete(`/products/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const onImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onChange('image', reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Products</h1>
                <button className="btn-primary" onClick={startNew}>+ Add Product</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New Product' : 'Edit Product'}</h3>
                    <div className="grid-2">
                        <div>
                            <label>Name</label>
                            <input value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
                        </div>
                        <div>
                            <label>Brand</label>
                            <input value={form.brand} onChange={(e) => onChange('brand', e.target.value)} />
                        </div>
                        <div>
                            <label>Price (₹)</label>
                            <input type="number" value={form.price} onChange={(e) => onChange('price', +e.target.value)} required />
                        </div>
                        <div>
                            <label>MRP (₹)</label>
                            <input type="number" value={form.mrp} onChange={(e) => onChange('mrp', +e.target.value)} required />
                        </div>
                        <div>
                            <label>Category</label>
                            <select value={form.category} onChange={(e) => onChange('category', e.target.value)}>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="smart">Smart</option>
                                <option value="luxury">Luxury</option>
                                <option value="sports">Sports</option>
                                <option value="unisex">Unisex</option>
                            </select>
                        </div>
                        <div>
                            <label>Tag (Best Seller / New Launch / blank)</label>
                            <input value={form.tag} onChange={(e) => onChange('tag', e.target.value)} />
                        </div>
                        <div>
                            <label>Rating</label>
                            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => onChange('rating', +e.target.value)} />
                        </div>
                        <div>
                            <label>Stock</label>
                            <input type="number" value={form.stock} onChange={(e) => onChange('stock', +e.target.value)} />
                        </div>
                        <div className="span-2">
                            <label>Description</label>
                            <textarea rows="3" value={form.description} onChange={(e) => onChange('description', e.target.value)} />
                        </div>
                        <div className="span-2">
                            <label>Image URL or upload</label>
                            <input value={form.image} onChange={(e) => onChange('image', e.target.value)} placeholder="https://…" />
                            <input type="file" accept="image/*" onChange={onImage} style={{ marginTop: 8 }} />
                            {form.image && <img src={form.image} alt="preview" className="img-preview" />}
                        </div>
                        <label className="check"><input type="checkbox" checked={form.trending} onChange={(e) => onChange('trending', e.target.checked)} /> Trending</label>
                        <label className="check"><input type="checkbox" checked={form.newArrival} onChange={(e) => onChange('newArrival', e.target.checked)} /> New arrival</label>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={cancel}>Cancel</button>
                        <button className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
                    </div>
                </form>
            )}

            {fetching ? (
                <Loader label="Loading products…" />
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Flags</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p._id}>
                                <td><img src={p.image} alt="" className="thumb" /></td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <small className="muted">{p.brand}</small>
                                </td>
                                <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                                <td>₹{p.price} <small className="muted" style={{ textDecoration: 'line-through' }}>₹{p.mrp}</small></td>
                                <td>{p.stock}</td>
                                <td>
                                    {p.trending && <span className="pill">Trending</span>}
                                    {p.newArrival && <span className="pill">New</span>}
                                    {p.tag && <span className="pill">{p.tag}</span>}
                                </td>
                                <td>
                                    <button onClick={() => startEdit(p)}>Edit</button>
                                    <button className="btn-danger" onClick={() => remove(p._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30 }} className="muted">No products yet.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
