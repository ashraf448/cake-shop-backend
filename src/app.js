
// import express              from 'express';
// import cors                 from 'cors';
// import helmet               from 'helmet';
// import morgan               from 'morgan';
// import compression          from 'compression';
// import rateLimit            from 'express-rate-limit';
// import path                 from 'path';
// import { fileURLToPath }    from 'url';

// import authRoutes           from './routes/authRoutes.js';
// import productRoutes        from './routes/productRoutes.js';
// import orderRoutes          from './routes/orderRoutes.js';
// import wishlistRoutes       from './routes/wishlistRoutes.js';
// import customOrderRoutes    from './routes/customOrderRoutes.js';
// import reviewRoutes         from './routes/reviewRoutes.js';
// import notificationRoutes   from './routes/notificationRoutes.js';
// import heroRoutes           from './routes/heroRoutes.js';
// import errorHandler         from './middleware/errorHandler.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname  = path.dirname(__filename);

// const app = express();

// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// app.use(cors({
//   origin: [
//     process.env.CLIENT_URL    || 'http://localhost:5173',
//     process.env.DASHBOARD_URL || 'http://localhost:5174',
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// }));

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, max: 200,
//   standardHeaders: true, legacyHeaders: false,
//   message: { success: false, message: 'Too many requests, try again later.' },
// });
// app.use('/api/', limiter);
// app.use('/api/auth/login',    rateLimit({ windowMs: 15*60*1000, max: 100 }));
// app.use('/api/auth/register', rateLimit({ windowMs: 15*60*1000, max: 100 }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// app.use(compression());

// if (process.env.NODE_ENV !== 'test') {
//   app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// }

// app.get('/health', (req, res) => {
//   res.json({ success: true, message: 'E-commerce API is running 🚀', time: new Date().toISOString() });
// });

// app.use('/api/auth',           authRoutes);
// app.use('/api/products',       productRoutes);
// app.use('/api/orders',         orderRoutes);
// app.use('/api/wishlist',       wishlistRoutes);
// app.use('/api/custom-orders',  customOrderRoutes);
// app.use('/api/reviews',        reviewRoutes);
// app.use('/api/notifications',  notificationRoutes);
// app.use('/api/hero',           heroRoutes);

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
// });

// app.use(errorHandler);

// export default app;



import express              from 'express';
import cors                 from 'cors';
import helmet               from 'helmet';
import morgan               from 'morgan';
import compression          from 'compression';
import rateLimit            from 'express-rate-limit';
import path                 from 'path';
import { fileURLToPath }    from 'url';

import authRoutes           from './routes/authRoutes.js';
import productRoutes        from './routes/productRoutes.js';
import orderRoutes          from './routes/orderRoutes.js';
import wishlistRoutes       from './routes/wishlistRoutes.js';
import customOrderRoutes    from './routes/customOrderRoutes.js';
import reviewRoutes         from './routes/reviewRoutes.js';
import notificationRoutes   from './routes/notificationRoutes.js';
import heroRoutes           from './routes/heroRoutes.js';
import offerRoutes          from './routes/offerRoutes.js';
import errorHandler         from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: [
    process.env.CLIENT_URL    || 'http://localhost:5173',
    process.env.DASHBOARD_URL || 'http://localhost:5174',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later.' },
});
app.use('/api/', limiter);
app.use('/api/auth/login',    rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use('/api/auth/register', rateLimit({ windowMs: 15*60*1000, max: 100 }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'E-commerce API is running 🚀', time: new Date().toISOString() });
});

app.use('/api/auth',           authRoutes);
app.use('/api/products',       productRoutes);
app.use('/api/orders',         orderRoutes);
app.use('/api/wishlist',       wishlistRoutes);
app.use('/api/custom-orders',  customOrderRoutes);
app.use('/api/reviews',        reviewRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/hero',           heroRoutes);
app.use('/api/offer-settings', offerRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

export default app;