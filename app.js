const exp = require('express');

const dashboardRoutes = require('./routes/dashboardRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productsRouter = require('./routes/productsRoutes');

const errorControllers = require('./controllers/errorControllers');
const appError = require('./utils/appError');

const rateLimit = require('express-rate-limit');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = exp();

//security
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, try again later',
});

// app.use('/api', limiter)

app.use(limiter);

app.use(helmet());

app.use(bodyParser.json());
app.use(exp.json({ limit: '10Kb' }));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// app.enable('trust proxy');

// !!!! the cros options depens on the cloud service this api will run on -- it may needs addtion settings
// app.use(cors());
app.use(cors({ origin: 'http://localhost:5173' })); // Replace with your frontend's URL

// app.options('*', cors());
app.use(exp.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  console.log('working');
  res.send({ jason: 'working' });
});

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productsRouter);

app.all('*', (req, res, next) => {
  next(new appError(`can't find ${req.originalUrl}`, 404));
});

app.use(errorControllers);

module.exports = app;
