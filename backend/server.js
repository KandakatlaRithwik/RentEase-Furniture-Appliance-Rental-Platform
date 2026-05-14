const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();
connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}


app.use('/api/', apiLimiter);

app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/products',    require('./routes/productRoutes'));
app.use('/api/orders',      require('./routes/orderRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin',       require('./routes/adminRoutes'));

app.get('/', (req, res) => res.json({ message:'RentEase API', status:'OK', version:'2.0.0' }));

app.use('*', (req, res) => res.status(404).json({ success:false, message:`Route ${req.originalUrl} not found` }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  if (err.name === 'ValidationError')   return res.status(400).json({ success:false, message: Object.values(err.errors).map(e=>e.message).join('. ') });
  if (err.code === 11000)               return res.status(400).json({ success:false, message: `${Object.keys(err.keyValue)[0]} already exists` });
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success:false, message:'Invalid token' });
  res.status(err.statusCode || 500).json({ success:false, message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 5002;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Server on port ${PORT} [${process.env.NODE_ENV}]`));
}

module.exports = { app };
