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
    coachAnnouncement: "[COACH - Level 99]: Welcome to RecNexus! Keep your builds secure and follow community guidelines.",
    activeMap: "Nexus_Arena_v2",
    maps: [
        { id: 1, name: "Nexus_Arena_v2", status: "Active", mode: "Standard VR", playersMax: 32 },
        { id: 2, name: "Cyber_Suburbs_Classic", status: "Standby", mode: "Nostalgia Desktop", playersMax: 64 },
        { id: 3, name: "Neon_Lobby_2027", status: "Maintenance", mode: "Hub", playersMax: 100 }
    ],
    staffMailboxes: {
        "AbbiePotter": [
            { id: 1, sender: "System", subject: "Welcome Admin", message: "Your Level 99 Coach permissions are active.", timestamp: "2026-08-12 10:00" }
        ],
        "Mod_Alex": [
            { id: 1, sender: "AbbiePotter", subject: "Community Report", message: "Please review the latest custom world uploads.", timestamp: "2026-08-12 11:30" }
        ]
    }
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

app.post('/api/admin/maps/switch', (req, res) => {
    const { mapName } = req.body;
    const targetMap = serverState.maps.find(m => m.name === mapName);
    if (targetMap) {
        serverState.activeMap = mapName;
        serverState.maps.forEach(m => m.status = m.name === mapName ? "Active" : "Standby");
        res.json({ success: true, message: `Active map successfully changed to ${mapName}`, serverState });
    } else {
        res.status(400).json({ success: false, message: "Map not found." });
    }
});

app.get('/api/admin/mail/:staffName', (req, res) => {
    const staffName = req.params.staffName;
    const inbox = serverState.staffMailboxes[staffName] || [];
    res.json({ success: true, staff: staffName, inbox });
});

app.post('/api/admin/mail/send', (req, res) => {
    const { sender, recipient, subject, message } = req.body;
    if (!serverState.staffMailboxes[recipient]) {
        serverState.staffMailboxes[recipient] = [];
    }
    const newMail = {
        id: Date.now(),
        sender: sender || "Anonymous Staff",
        subject: subject || "Internal Memo",
        message: message || "",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    serverState.staffMailboxes[recipient].unshift(newMail);
    res.json({ success: true, message: `Email successfully sent to ${recipient}` });
});

app.post('/api/admin/reset-password', (req, res) => {
    const { username, newPassword } = req.body;
    if (username && newPassword) {
        res.json({ success: true, message: `Password for user '${username}' has been successfully reset by support team.` });
    } else {
        res.status(400).json({ success: false, message: "Username and new password required." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend & Admin API running on port " + PORT));
