const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let serverState = {
    isOnline: true,
    totalUsers: 1420,
    activeUsers: 84,
    gameServerStatus: "All Nodes Operational (v3.0)",
    coachAnnouncement: "[COACH - Level 99]: Welcome to RecNexus! Keep your builds secure and follow community guidelines."
};

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.get('/api/admin/data', (req, res) => res.json(serverState));

app.post('/api/admin/update', (req, res) => {
    const { coachAnnouncement, gameServerStatus, isOnline } = req.body;
    if (coachAnnouncement) serverState.coachAnnouncement = coachAnnouncement;
    if (gameServerStatus) serverState.gameServerStatus = gameServerStatus;
    if (isOnline !== undefined) serverState.isOnline = isOnline;
    res.json({ success: true, serverState });
});

app.post('/api/admin/reset-password', (req, res) => {
    const { username, newPassword } = req.body;
    if (username && newPassword) {
        res.json({ success: true, message: Password for user '\' has been successfully reset by support team. });
    } else {
        res.status(400).json({ success: false, message: "Username and new password required." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend & Admin API running on port " + PORT));
