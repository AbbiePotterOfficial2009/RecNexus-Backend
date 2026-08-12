const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files from root directory
app.use(express.static(path.join(__dirname)));

let serverOnline = true;
let coachAnnouncement = "Core backend infrastructure upgraded with v3.0 network nodes.";
let staffApplications = [];

// Admin / Status API
app.get('/api/admin/data', (req, res) => {
    res.json({
        isOnline: serverOnline,
        coachAnnouncement: coachAnnouncement,
        applications: staffApplications
    });
});

// Staff Application Endpoint
app.post('/api/apply', (req, res) => {
    const { username, email, roleRequested, experience } = req.body;
    staffApplications.push({ username, email, roleRequested, experience, timestamp: new Date() });
    res.json({ success: true, message: 'Application submitted successfully.' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`RecNexus server running on port ${PORT}`);
});
