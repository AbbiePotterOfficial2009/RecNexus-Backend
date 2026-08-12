const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let serverState = {
    isOnline: false, // false = public site shows maintenance overlay; true = public site online
    totalUsers: 1420,
    activeUsers: 84,
    gameServerStatus: "All Nodes Operational (v3.0 - Road to 2027/2028)",
    coachAnnouncement: "[COACH - Level 99]: RecNexus is currently undergoing scheduled deep-core maintenance.",
    activeMap: "Nexus_Arena_v2",
    maps: [
        { id: 1, name: "Nexus_Arena_v2", status: "Active", mode: "Standard VR", playersMax: 32 },
        { id: 2, name: "Cyber_Suburbs_Classic", status: "Standby", mode: "Nostalgia Desktop", playersMax: 64 },
        { id: 3, name: "Neon_Lobby_2027", status: "Maintenance", mode: "Hub", playersMax: 100 }
    ],
    staffMailboxes: {
        "Coach": [
            { id: 1, sender: "System", subject: "Level 99 Clearance Active", message: "Welcome back, Coach. You have full oversight over maintenance status, applications, and user restrictions.", timestamp: "2026-08-12 12:00" }
        ]
    },
    staffApplications: [
        { id: 101, username: "CyberKnight99", email: "knight@example.com", roleRequested: "Senior Moderator", experience: "Managed large VR communities for 3 years.", status: "Pending", timestamp: "2026-08-12 14:20" }
    ],
    registeredUsers: [
        { username: "AbbiePotter", role: "Coach", level: 99, status: "Active" },
        { username: "CyberKnight99", role: "Pending Staff", level: 1, status: "Pre-Registered" }
    ]
};

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.get('/api/admin/data', (req, res) => res.json(serverState));

// Toggle Public Site Maintenance Status
app.post('/api/admin/toggle-status', (req, res) => {
    const { isOnline } = req.body;
    if (isOnline !== undefined) {
        serverState.isOnline = isOnline;
        res.json({ success: true, message: `Public site status updated. Online: ${isOnline}`, serverState });
    } else {
        res.status(400).json({ success: false, message: "Invalid status value." });
    }
});

app.post('/api/admin/update', (req, res) => {
    const { coachAnnouncement, gameServerStatus } = req.body;
    if (coachAnnouncement) serverState.coachAnnouncement = coachAnnouncement;
    if (gameServerStatus) serverState.gameServerStatus = gameServerStatus;
    res.json({ success: true, serverState });
});

app.post('/api/apply', (req, res) => {
    const { username, email, roleRequested, experience } = req.body;
    if (!username || !email) {
        return res.status(400).json({ success: false, message: "Username and email are required." });
    }
    const newApp = {
        id: Date.now(),
        username,
        email,
        roleRequested: roleRequested || "Staff Member",
        experience: experience || "None provided",
        status: "Pending",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    serverState.staffApplications.unshift(newApp);
    res.json({ success: true, message: "Staff application submitted successfully! Awaiting Coach review." });
});

app.post('/api/admin/applications/approve', (req, res) => {
    const { appId } = req.body;
    const appIndex = serverState.staffApplications.findIndex(a => a.id == appId);
    if (appIndex !== -1) {
        const approvedApp = serverState.staffApplications[appIndex];
        approvedApp.status = "Approved";
        
        const existingUser = serverState.registeredUsers.find(u => u.username === approvedApp.username);
        if (existingUser) {
            existingUser.role = approvedApp.roleRequested;
            existingUser.level = 15;
            existingUser.status = "Active";
        } else {
            serverState.registeredUsers.push({
                username: approvedApp.username,
                role: approvedApp.roleRequested,
                level: 15,
                status: "Active"
            });
        }

        if (!serverState.staffMailboxes[approvedApp.username]) {
            serverState.staffMailboxes[approvedApp.username] = [];
        }
        serverState.staffMailboxes[approvedApp.username].unshift({
            id: Date.now(),
            sender: "Coach (Level 99)",
            subject: "Staff Application Approved!",
            message: `Congratulations ${approvedApp.username}! Your application for ${approvedApp.roleRequested} has been approved by Coach.`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });

        res.json({ success: true, message: `Application approved for ${approvedApp.username}!`, serverState });
    } else {
        res.status(404).json({ success: false, message: "Application not found." });
    }
});

app.post('/api/admin/applications/reject', (req, res) => {
    const { appId } = req.body;
    const app = serverState.staffApplications.find(a => a.id == appId);
    if (app) {
        app.status = "Rejected";
        res.json({ success: true, message: "Application rejected.", serverState });
    } else {
        res.status(404).json({ success: false, message: "Application not found." });
    }
});

app.post('/api/admin/users/restrict', (req, res) => {
    const { username, action } = req.body;
    const user = serverState.registeredUsers.find(u => u.username === username);
    if (user) {
        if (user.role === 'Coach') {
            return res.status(403).json({ success: false, message: "Cannot restrict the Coach account." });
        }
        user.status = action === 'ban' ? "Restricted / Banned" : "Active";
        res.json({ success: true, message: `User ${username} status updated to: ${user.status}`, serverState });
    } else {
        res.status(404).json({ success: false, message: "User not found." });
    }
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
    serverState.staffMailboxes[recipient].unshift({
        id: Date.now(),
        sender: sender || "Staff",
        subject: subject || "Internal Memo",
        message: message || "",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    res.json({ success: true, message: `Email dispatched to ${recipient}` });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend Admin API running on port " + PORT));
