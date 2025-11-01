require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = process.env.GATEWAY_PORT || 5000;
const USERS_TARGET = process.env.USERS_PORT || 'http://localhost:5001';
const STUDENTS_TARGET = process.env.STUDENTS_PORT || 'http://localhost:5002';
const OTP_TARGET = process.env.OTP_PORT || 'http://localhost:5003';
const TRANSACTIONS_TARGET = process.env.TRANSACTIONS_PORT || 'http://localhost:5004';

// ================= CORS =================
const corsOptions = {
  origin: "http://localhost:5173", // FE đang chạy ở 5173
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOptions));

const proxyOptions = (target) => ({
  target: target,
  changeOrigin: true,
  secure: false,
  ws: true,
  cookieDomainRewrite: "localhost",
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
});

app.get('/health', (_, res) => res.json({ ok: true, service: 'gateway' }));

//User service
app.use('/api/users', createProxyMiddleware({ 
  ...proxyOptions(USERS_TARGET), 
  pathRewrite: { '^/api/users': '' }
}));

//Student service
app.use('/api/students', createProxyMiddleware({ 
  ...proxyOptions(STUDENTS_TARGET),
  pathRewrite: { '^/api/students': '' } 
}));

//OTP service
app.use('/api/otp', createProxyMiddleware({
  ...proxyOptions(OTP_TARGET),
  pathRewrite: { '^/api/otp': '' } 
}));

//Transaction service
app.use('/api/transactions', createProxyMiddleware({
  ...proxyOptions(TRANSACTIONS_TARGET),
  pathRewrite: { '^/api/transactions': '' }
}));

app.listen(PORT, () => console.log(`API Gateway on ${PORT}`));
