import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product, qty = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i._id === product._id);
            if (existing) {
                return prev.map((i) =>
                    i._id === product._id ? { ...i, qty: i.qty + qty } : i
                );
            }
            return [...prev, { ...product, qty }];
        });
    };

    const removeFromCart = (id) =>
        setItems((prev) => prev.filter((i) => i._id !== id));

    const updateQty = (id, qty) =>
        setItems((prev) =>
            prev
                .map((i) => (i._id === id ? { ...i, qty: Math.max(0, qty) } : i))
                .filter((i) => i.qty > 0)
        );

    const clearCart = () => setItems([]);

    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, updateQty, clearCart, count, subtotal }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
