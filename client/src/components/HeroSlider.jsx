import { useEffect, useState } from 'react';
import api from '../api.js';

export default function HeroSlider() {
    const [slides, setSlides] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        api.get('/banners?placement=hero')
            .then((r) => {
                if (Array.isArray(r.data)) setSlides(r.data);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, 4000);
        return () => clearInterval(id);
    }, [slides.length]);

    if (slides.length === 0) return null;

    return (
        <section className="hero-slider">
            <div
                className="hero-slider-track"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {slides.map((s, i) => (
                    <div className="hero-slide" key={s._id || i}>
                        <a href={s.link || '/shop'}>
                            <img src={s.image} alt={s.title || `Banner ${i + 1}`} />
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}
