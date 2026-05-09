import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { fetchProducts } from '../api.js';

export default function Products() {
    const { category } = useParams();
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (category) params.category = category;
        if (q) params.q = q;
        fetchProducts(params)
            .then(setProducts)
            .finally(() => setLoading(false));
    }, [category, q]);

    const heading = q
        ? `Search results for "${q}"`
        : category
            ? `${category} Watches`
            : 'All Watches';

    return (
        <section className="section">
            <div className="container">
                <h2 style={{ textTransform: 'capitalize' }}>{heading}</h2>
                <p className="subtitle">{products.length} timepieces available</p>

                {loading ? (
                    <p>Loading…</p>
                ) : products.length === 0 ? (
                    <div className="empty">
                        {q ? `No watches match "${q}".` : 'No products in this category yet.'}
                    </div>
                ) : (
                    <div className="grid">
                        {products.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
