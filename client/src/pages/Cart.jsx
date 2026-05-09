import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
    const { items, updateQty, removeFromCart, subtotal, clearCart } = useCart();
    const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
    const total = subtotal + shipping;

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
                                    <button className="link-remove" onClick={() => removeFromCart(i._id)}>Remove</button>
                                </div>
                            </div>
                            <div style={{ fontWeight: 800 }}>₹{i.price * i.qty}</div>
                        </div>
                    ))}
                    <button className="link-remove" onClick={clearCart}>Clear cart</button>
                </div>

                <div className="summary">
                    <h3 style={{ marginTop: 0 }}>Order Summary</h3>
                    <div className="row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div className="row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                    <div className="row total"><span>Total</span><span>₹{total}</span></div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: 14 }}>
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
