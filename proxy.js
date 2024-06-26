const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();

// Middleware to set CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.get('/proxy', (req, res) => {
    const { target } = req.query;
    if (!target) {
        res.status(400).send('Bad Request: Target URL is required.');
        return;
    }

    const targetUrl = new URL(target);
    const protocol = targetUrl.protocol === 'https:' ? https : http;

    protocol.get(targetUrl, (response) => {
        if (response.statusCode !== 200) {
            res.status(response.statusCode).send('Error: Unable to fetch resource.');
            return;
        }

        response.pipe(res);
    }).on('error', (err) => {
        res.status(500).send('Internal Server Error: ' + err.message);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
