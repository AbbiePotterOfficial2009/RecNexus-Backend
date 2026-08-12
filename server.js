const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let serverOnline = false;

// Credentials (CHANGE THESE IMMEDIATELY)
const ADMIN_USER = "Coach";
const ADMIN_PASS = "ChangeMe123!";

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.get('/api/admin/status', (req, res) => res.json({ isOnline: serverOnline }));

app.post('/api/admin/toggle', (req, res) => {
    serverOnline = req.body.isOnline;
    res.json({ success: true, isOnline: serverOnline });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
