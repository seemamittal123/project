import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        fetchProduct(id).then(setProduct).catch(() => setProduct(null));
    }, [id]);

    if (!product) {
        return <div className="container section"><p>Loading…</p></div>;
    }

    const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    return (
        <section className="container">
            <div className="pd">
                <div className="pd-img"><img src={product.image} alt={product.name} /></div>
                <div>
                    <p style={{ color: 'var(--brand)', fontWeight: 700, margin: 0, letterSpacing: 1 }}>
                        {product.brand?.toUpperCase()}
                    </p>
                    <h1>{product.name}</h1>
                    <div className="stars" style={{ color: '#f59e0b', marginBottom: 10 }}>
                        ★★★★★ <small style={{ color: 'var(--muted)' }}>{product.rating?.toFixed(1)} · {product.reviews} reviews</small>
                    </div>

                    <div className="price-big">
                        ₹{product.price}
                        {off > 0 && <span className="mrp">₹{product.mrp}</span>}
                        {off > 0 && <span style={{ color: '#ef4444', fontSize: 16, marginLeft: 10 }}>- {off}% OFF</span>}
                    </div>

                    <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{product.description}</p>

                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', margin: '20px 0' }}>
                        <div className="qty">
                            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                            <span>{qty}</span>
                            <button onClick={() => setQty((q) => q + 1)}>+</button>
                        </div>
                        <button className="btn-primary" onClick={() => { addToCart(product, qty); navigate('/cart'); }}>
                            Add to Cart →
                        </button>
                    </div>

                    <ul style={{ paddingLeft: 18, color: 'var(--muted)', lineHeight: 1.8 }}>
                        <li>2-year international warranty</li>
                        <li>Free shipping on prepaid orders</li>
                        <li>30-day easy returns</li>
                        <li>100% authentic, brand-sealed</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
