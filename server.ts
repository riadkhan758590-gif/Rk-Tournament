import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import multer from "multer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");
const UPLOADS_DIR = path.join(__dirname, "uploads", "products");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpg, .png, and .webp files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Load initial data
let appData = {
  users: [],
  matches: [],
  appConfig: {
    bkash: '01950-849094',
    nagad: '01939296244',
    whatsapp: 'https://wa.me/8801950849094',
    telegram: 'https://t.me/riad_topup',
    referralBonus: 10,
    matchRules: "1. No hacking allowed.\n2. Team up is strictly prohibited.\n3. Room ID & Password will be shared 15 mins before match.\n4. Decisions of admins are final.",
    dailyRewardAmount: 1,
    dailyRewardXP: 20,
    isDiscussionEnabled: true,
    spinPrizes: [
      { type: 'balance', amount: 5, color: '#f97316' },
      { type: 'xp', amount: 50, color: '#14b8a6' },
      { type: 'balance', amount: 2, color: '#f97316' },
      { type: 'xp', amount: 20, color: '#14b8a6' },
      { type: 'balance', amount: 10, color: '#f97316' },
      { type: 'xp', amount: 100, color: '#14b8a6' },
      { type: 'balance', amount: 1, color: '#f97316' },
      { type: 'xp', amount: 10, color: '#14b8a6' },
    ],
    isMaintenanceMode: false,
    maintenanceMessage: "App is under maintenance. Please check back later.",
    featureMaintenance: {
      topup: false,
      shop: false,
      spin: false,
      matches: false,
      withdraw: false,
      wallet: false,
      discussion: false,
      leaderboard: false,
      results: false,
      support: false,
      notifications: false,
    },
    scheduledAnnouncements: [],
    ipBanList: [],
    liveCommentaryUrl: '',
    isLiveCommentaryActive: false,
    featureToggles: {
      loan: true,
      sponsorship: true,
      nft: true,
      ppv: true,
      affiliate: true,
      metaverse: true,
      dailyQuests: true,
      birthdaySurprise: true
    },
    isKillSwitchActive: false
  },
  missions: [
    { id: 'mission_1', title: 'First Match', description: 'Join 1 match today.', reward: 5, xpReward: 50, requirement: 1, type: 'matches' },
    { id: 'mission_2', title: 'Warrior', description: 'Kill 5 players in total today.', reward: 10, xpReward: 100, requirement: 5, type: 'kills' },
    { id: 'mission_3', title: 'Champion', description: 'Win 1 match today.', reward: 20, xpReward: 200, requirement: 1, type: 'wins' },
    { id: 'mission_4', title: 'Daily Spinner', description: 'Spin the wheel 1 time today.', reward: 2, xpReward: 20, requirement: 1, type: 'spin' },
    { id: 'mission_5', title: 'Check-in', description: 'Check-in today.', reward: 2, xpReward: 20, requirement: 1, type: 'checkin' },
  ],
  topupPackages: [
    { id: 'tp_1', name: '115 Diamonds', category: 'In-Game', diamonds: 115, price: 85, bonus: 0, tag: 'Starter', status: 'Active' },
    { id: 'tp_2', name: '240 Diamonds', category: 'In-Game', diamonds: 240, price: 165, bonus: 0, status: 'Active' },
    { id: 'tp_3', name: '355 Diamonds', category: 'In-Game', diamonds: 355, price: 250, bonus: 0, tag: 'Best Value', status: 'Active' },
    { id: 'tp_4', name: '505 Diamonds', category: 'In-Game', diamonds: 505, price: 340, bonus: 0, tag: 'Popular', status: 'Active' },
    { id: 'tp_5', name: '610 Diamonds', category: 'In-Game', diamonds: 610, price: 420, bonus: 0, status: 'Active' },
    { id: 'tp_6', name: '1240 Diamonds', category: 'In-Game', diamonds: 1240, price: 830, bonus: 0, tag: 'Pro', status: 'Active' },
  ],
  topupRequests: [],
  withdrawRequests: [],
  notifications: [],
  messages: [],
  banners: [],
  matchResults: [],
  userReports: [],
  payments: [],
  shopItems: [
    { id: 'frame_gold', name: 'Golden Frame', description: 'A shiny golden frame for your profile.', price: 500, type: 'frame', color: '#FFD700' },
    { id: 'frame_neon', name: 'Neon Blue Frame', description: 'Glow in the dark with this neon blue frame.', price: 300, type: 'frame', color: '#00FFFF' },
    { id: 'frame_crimson', name: 'Crimson Fury', description: 'Intense red frame for aggressive players.', price: 400, type: 'frame', color: '#FF0000' },
    { id: 'frame_emerald', name: 'Emerald Guardian', description: 'A rare emerald green frame.', price: 600, type: 'frame', color: '#50C878' },
    { id: 'frame_obsidian', name: 'Obsidian Shadow', description: 'The darkest frame for the stealthiest players.', price: 800, type: 'frame', color: '#1A1A1A' },
    { id: 'frame_diamond', name: 'Diamond Frame', description: 'The rarest frame for the top players.', price: 2000, type: 'frame', color: '#B9F2FF' },
    { id: 'frame_ruby', name: 'Ruby Frame', description: 'A vibrant ruby red frame.', price: 1200, type: 'frame', color: '#E0115F' },
    { id: 'badge_vip', name: 'VIP Badge', description: 'Show everyone your VIP status.', price: 1000, type: 'badge', color: '#FF00FF' },
    { id: 'badge_pro', name: 'Pro Player', description: 'A badge for the elite competitors.', price: 1500, type: 'badge', color: '#FF4500' },
    { id: 'badge_legend', name: 'Legendary Badge', description: 'A badge for the true legends of RK Tournament.', price: 2500, type: 'badge', color: '#FFD700' },
    { id: 'card_entry', name: 'Special Entry Card', description: 'Use this to join any match for free.', price: 200, type: 'entry_card' },
    { id: 'name_red', name: 'Red Name', description: 'Make your name stand out in red.', price: 300, type: 'name_color', color: '#FF0000' },
    { id: 'name_gold', name: 'Gold Name', description: 'The ultimate prestige name color.', price: 500, type: 'name_color', color: '#FFD700' },
    { id: 'name_green', name: 'Green Name', description: 'A fresh green color for your name.', price: 300, type: 'name_color', color: '#00FF00' },
    { id: 'name_cyan', name: 'Cyan Name', description: 'A cool cyan color for your name.', price: 400, type: 'name_color', color: '#00FFFF' },
    { id: 'name_magenta', name: 'Magenta Name', description: 'A bold magenta color for your name.', price: 400, type: 'name_color', color: '#FF00FF' },
    { id: 'name_orange', name: 'Orange Name', description: 'A bright orange color for your name.', price: 400, type: 'name_color', color: '#FFA500' },
  ],
  matchTemplates: [],
  transactionLogs: [],
  promoCodes: [],
  matchComments: [],
  predictions: [],
  auditorLogs: [],
  mysteryBoxes: [],
  sponsorships: [],
  nftBadges: [],
  mapVotes: { Kalahari: 0, Solara: 0, Nexttara: 0, Bermuda: 0, Purgatory: 0 },
};

if (fs.existsSync(DATA_FILE)) {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const parsedData = JSON.parse(data);
    appData = {
      ...appData,
      ...parsedData,
      appConfig: {
        ...appData.appConfig,
        ...(parsedData.appConfig || {}),
        featureMaintenance: {
          ...appData.appConfig.featureMaintenance,
          ...(parsedData.appConfig?.featureMaintenance || {})
        },
        featureToggles: {
          ...appData.appConfig.featureToggles,
          ...(parsedData.appConfig?.featureToggles || {})
        }
      }
    };
  } catch (e) {
    console.error("Error loading data.json", e);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2));
  } catch (e) {
    console.error("Error saving data.json", e);
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000
  });

  const PORT = 3000;

  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // IP Blocking Middleware
  app.use((req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipString = Array.isArray(clientIp) ? clientIp[0] : clientIp;
    
    if (ipString && appData.appConfig.ipBanList.includes(ipString)) {
      return res.status(403).send(`
        <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #000; color: #ff4444; font-family: sans-serif; text-align: center; padding: 20px;">
          <h1 style="font-size: 3rem; margin-bottom: 10px;">ACCESS DENIED</h1>
          <p style="font-size: 1.2rem; color: #888;">Your IP address (${ipString}) has been permanently banned from this platform.</p>
          <div style="margin-top: 20px; padding: 10px 20px; border: 1px solid #ff4444; border-radius: 5px;">
            Reason: Security Violation / Policy Breach
          </div>
        </div>
      `);
    }
    next();
  });

  // Admin Login API
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || "Riadkhan75";
    const adminPass = process.env.ADMIN_PASSWORD || "205090";

    if (username === adminUser && password === adminPass) {
      res.json({ success: true, role: 'admin' });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Image Upload API
  app.post("/api/upload/product", upload.single('image'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  });

  // Delete Image API
  app.delete("/api/delete/image", (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      return res.status(400).json({ success: false, message: "Invalid image URL" });
    }
    const filePath = path.join(__dirname, imageUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ success: false, message: "Error deleting file" });
      }
    } else {
      res.status(404).json({ success: false, message: "File not found" });
    }
  });

  // Socket.io for real-time updates
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send initial data to the client
    socket.emit("init_data", appData);

    // Handle data updates from clients
    socket.on("update_data", (newData) => {
      // Deep merge appConfig if it exists in newData
      if (newData.appConfig) {
        appData.appConfig = {
          ...appData.appConfig,
          ...newData.appConfig,
          featureMaintenance: {
            ...(appData.appConfig.featureMaintenance || {}),
            ...(newData.appConfig.featureMaintenance || {})
          },
          featureToggles: {
            ...(appData.appConfig.featureToggles || {}),
            ...(newData.appConfig.featureToggles || {})
          }
        };
        delete newData.appConfig;
      }
      
      // Merge other properties
      appData = { ...appData, ...newData };
      saveData();
      // Broadcast the updated data to all other clients
      socket.broadcast.emit("data_updated", appData);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
