import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useUserAuth } from '../context/UserAuthContext.jsx';

export default function Checkout() {
    const { items, subtotal, clearCart, withBox, boxFee } = useCart();
    const { user } = useUserAuth();
    const navigate = useNavigate();

    const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
    const total = subtotal + shipping + boxFee;

    const [step, setStep] = useState('address'); // 'address' | 'pay' | 'done'
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    });
    const [paymentRef, setPaymentRef] = useState('');
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (items.length === 0 && step !== 'done') navigate('/cart');
    }, [items, step, navigate]);

    const upi = useMemo(() => {
        const payee = 'manishgupta21feb@oksbi'; // demo UPI VPA
        const name = encodeURIComponent('Genzdial');
        const note = encodeURIComponent(`Order from ${user?.name || 'customer'}`);
        const amt = total.toFixed(2);
        return `upi://pay?pa=${payee}&pn=${name}&am=${amt}&cu=INR&tn=${note}`;
    }, [total, user]);

    const qrUrl = useMemo(() => {
        const data = encodeURIComponent(upi);
        return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${data}`;
    }, [upi]);

    const submitAddress = (e) => {
        e.preventDefault();
        setError('');
        const required = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
        for (const k of required) {
            if (!String(address[k] || '').trim()) {
                setError('Please fill all required fields');
                return;
            }
        }
        if (address.phone.replace(/\D/g, '').length !== 10) {
            setError('Enter a valid 10-digit mobile number');
            return;
        }
        if (address.pincode.replace(/\D/g, '').length !== 6) {
            setError('Enter a valid 6-digit pincode');
            return;
        }
        setStep('pay');
    };

    const placeOrder = async () => {
        setPlacing(true);
        setError('');
        try {
            const { data } = await api.post('/orders', {
                items, address, subtotal, shipping, total, paymentRef, withBox, boxFee,
            });
            setOrder(data);
            setStep('done');
            clearCart();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <section className="container section">
            <h2>Checkout</h2>
            <div className="checkout-steps">
                <span className={step === 'address' ? 'active' : (step === 'pay' || step === 'done' ? 'done' : '')}>1. Address</span>
                <span className={step === 'pay' ? 'active' : (step === 'done' ? 'done' : '')}>2. Payment</span>
                <span className={step === 'done' ? 'active' : ''}>3. Confirm</span>
            </div>

            <div className="checkout-grid">
                <div className="checkout-main">
                    {step === 'address' && (
                        <form className="address-form" onSubmit={submitAddress}>
                            <h3>Shipping Address</h3>
                            <div className="form-row">
                                <input placeholder="Full Name*" value={address.fullName}
                                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                                <input placeholder="Mobile Number*" inputMode="numeric" maxLength={10} value={address.phone}
                                    onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '') })} />
                            </div>
                            <input placeholder="Address Line 1*" value={address.line1}
                                onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                            <input placeholder="Address Line 2 (optional)" value={address.line2}
                                onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                            <div className="form-row">
                                <input placeholder="City*" value={address.city}
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                                <input placeholder="State*" value={address.state}
                                    onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <input placeholder="Pincode*" inputMode="numeric" maxLength={6} value={address.pincode}
                                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })} />
                                <input placeholder="Country" value={address.country} readOnly />
                            </div>
                            {error && <div className="login-error">{error}</div>}
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Continue to Payment →</button>
                        </form>
                    )}

                    {step === 'pay' && (
                        <div className="pay-step">
                            <h3>Scan to Pay</h3>
                            <p style={{ color: 'var(--muted)' }}>Use any UPI app (GPay, PhonePe, Paytm) to scan & pay ₹{total}.</p>
                            <div className="qr-box">
                                <img src={qrUrl} alt="UPI QR" width={240} height={240} />
                                <div className="qr-amount">₹{total}</div>
                            </div>
                            <label className="pay-ref">
                                <span>UPI / Transaction Reference (optional)</span>
                                <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="e.g. 4321XXXXXXXX" />
                            </label>
                            {error && <div className="login-error">{error}</div>}
                            <div className="pay-actions">
                                <button className="btn-secondary" onClick={() => setStep('address')}>← Back</button>
                                <button className="btn-primary" disabled={placing} onClick={placeOrder}>
                                    {placing ? 'Placing…' : 'CONFIRM ORDER'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'done' && order && (
                        <div className="order-success">
                            <div className="order-tick">✓</div>
                            <h3>Order placed!</h3>
                            <p>Order ID: <strong>{order._id}</strong></p>
                            <p>Total: <strong>₹{order.total}</strong></p>
                            <p style={{ color: 'var(--muted)' }}>We've sent a confirmation. Track it in your account.</p>
                            <button className="btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
                        </div>
                    )}
                </div>

                <aside className="checkout-summary">
                    <h3 style={{ marginTop: 0 }}>Order Summary</h3>
                    {items.map((i) => (
                        <div key={i._id} className="sum-row">
                            <img src={i.image} alt="" />
                            <div style={{ flex: 1 }}>
                                <div className="sum-name">{i.name}</div>
                                <div className="sum-qty">Qty {i.qty}</div>
                            </div>
                            <div className="sum-price">₹{i.price * i.qty}</div>
                        </div>
                    ))}
                    <div className="row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div className="row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                    {withBox && (
                        <div className="row"><span>Original box</span><span>₹{boxFee}</span></div>
                    )}
                    <div className="row total"><span>Total</span><span>₹{total}</span></div>
                </aside>
            </div>
        </section>
    );
}
