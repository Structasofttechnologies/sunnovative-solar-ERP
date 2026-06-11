const express    = require('express');
const dotenv     = require('dotenv');
const cors       = require('cors');
const connectDB  = require('./config/db');
dotenv.config();

connectDB();

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));


//-routes--------------------------

// ── Routes ──────────────────────────────────────────
app.use('/api/epc/auth',      require('./routes/epcAuthRoutes'));
app.use('/api/epc/enquiries', require('./routes/epcEnquiryRoutes'));
app.use('/api/epc/orders',    require('./routes/epcOrderRoutes'));
app.use('/api/epc/projects',  require('./routes/epcProjectRoutes'));
app.use('/api/epc/team',      require('./routes/epcTeamRoutes'));
app.use('/api/epc/calendar',  require('./routes/epcCalenderRoutes'));
app.use('/api/epc/plans',     require('./routes/epcPlanRoutes'));

app.get('/',(req,res)=>{res.json({message:'Welcome to Sunnovative EPC API'})});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
 
// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));