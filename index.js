const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(express.static('frontend'));
app.use(createProxyMiddleware({ target: 'http://127.0.0.1:8000', changeOrigin: true }));

app.listen(3000);