import { useEffect, useState } from 'react';
import { fetchProducts } from '../api.js';
import ProductCard from './ProductCard.jsx';

export default function BestSellers({ title = 'Best Sellers', tag = 'Best Seller', limit = 5 }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchProducts({ limit })
            .then((data) => setItems(Array.isArray(data) ? data.slice(0, limit) : []))
            .catch(() => { });
    }, [limit]);

    if (!items.length) return null;

    return (
        <section className="bestsellers">
            <div className="bs-head">
                <h2>{title}</h2>
            </div>
            <div className="bs-grid">
                {items.map((p) => (
                    <ProductCard key={p._id} product={{ ...p, tag: p.tag || tag }} />
                ))}
            </div>
        </section>
    );
}
