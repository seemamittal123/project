import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';

const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
);

export default function Cart() {
    const { items, updateQty, removeFromCart, subtotal, clearCart, withBox, setWithBox, boxFee, BOX_FEE } = useCart();
    const { requireAuth } = useUserAuth();
    const navigate = useNavigate();
    const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
    const total = subtotal + shipping + boxFee;

    if (items.length === 0) {
        return (
            <section className="container section">
                <div className="empty">
                    <h2>Your cart is empty 🛒</h2>
                    <p>Find a timepiece you love.</p>
                    <Link to="/shop" className="btn-primary">Browse Watches</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="container section">
            <h2>Your Cart ({items.length})</h2>
            <div className="cart-grid" style={{ marginTop: 20 }}>
                <div>
                    {items.map((i) => (
                        <div className="cart-item" key={i._id}>
                            <img src={i.image} alt={i.name} />
                            <div>
                                <div style={{ fontWeight: 700 }}>{i.name}</div>
                                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{i.brand}</div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                                    <div className="qty">
                                        <button onClick={() => updateQty(i._id, i.qty - 1)}>−</button>
                                        <span>{i.qty}</span>
                                        <button onClick={() => updateQty(i._id, i.qty + 1)}>+</button>
                                    </div>
                                    <button className="cart-trash" onClick={() => removeFromCart(i._id)} aria-label="Remove item" title="Remove">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                            <div style={{ fontWeight: 800 }}>₹{i.price * i.qty}</div>
                        </div>
                    ))}
                    <button className="link-remove" onClick={clearCart}>Clear cart</button>
                </div>

                <div className="summary">
                    <h3 style={{ marginTop: 0 }}>Order Summary</h3>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={withBox}
                            onChange={(e) => setWithBox(e.target.checked)}
                            style={{ marginTop: 3 }}
                        />
                        <span style={{ fontSize: 14 }}>
                            With original box
                            <span style={{ display: 'block', color: 'var(--muted)', fontSize: 12 }}>
                                Adds ₹{BOX_FEE} per watch to your order
                            </span>
                        </span>
                    </label>
                    <div className="row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div className="row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                    {withBox && (
                        <div className="row"><span>Original box</span><span>₹{boxFee}</span></div>
                    )}
                    <div className="row total"><span>Total</span><span>₹{total}</span></div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => requireAuth(() => navigate('/checkout'))}>
                        Proceed to Checkout →
                    </button>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                        Free shipping on orders over ₹1500. Secure checkout.
                    </p>
                </div>
            </div>
        </section>
    );
}
