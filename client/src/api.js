import axios from 'axios';

// Resolve API base URL with environment-aware defaults.
// - In dev (vite dev server): falls back to local backend on :5000.
// - In prod build: VITE_API_URL must be set on Vercel (otherwise we use a same-origin /api,
//   which works if the backend is behind the same domain via rewrites).
const ENV_URL = import.meta.env.VITE_API_URL;
const DEFAULT_DEV_URL = 'https://project-bpwe.onrender.com/api';
const DEFAULT_PROD_URL = '/api'; // same-origin fallback for production

const API_BASE = (
    ENV_URL ||
    (import.meta.env.DEV ? DEFAULT_DEV_URL : DEFAULT_PROD_URL)
).replace(/\/+$/, '');

export const API_URL = API_BASE;
export const SERVER_ORIGIN = API_BASE.replace(/\/api$/, '') || window.location.origin;

if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[api] base URL =', API_BASE);
}

const api = axios.create({ baseURL: API_BASE });

// Resolve image/video URLs that may be relative (e.g. /uploads/...)
export const assetUrl = (u) => {
    if (!u) return '';
    if (/^(https?:|data:|blob:)/i.test(u)) return u;
    return `${SERVER_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`;
};

// Restore admin token on page reload
const storedToken = localStorage.getItem('admin_token');
if (storedToken) api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

export const fetchProducts = (params = {}) =>
    api.get('/products', { params }).then((r) => r.data);

export const fetchProduct = (id) =>
    api.get(`/products/${id}`).then((r) => r.data);

export default api;
