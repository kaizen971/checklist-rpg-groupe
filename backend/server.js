require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.SERVER_PORT || process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// OBLIGATOIRE: Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: "checklist-rpg-groupe"
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas & Models
const GuildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  quests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }]
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  role: { type: String, default: 'member' },
  guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
  inventory: [{ itemId: String, quantity: Number }],
  skills: [{ skillId: String, level: Number }],
  cosmetics: [String],
  avatar: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  xpReward: { type: Number, default: 10 },
  goldReward: { type: Number, default: 5 },
  guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const CompletionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: Date.now },
  xpGained: Number,
  goldGained: Number
});

const QuestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['team', 'raid'], default: 'team' },
  guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
  progress: { type: Number, default: 0 },
  goal: { type: Number, required: true },
  rewards: {
    xp: Number,
    gold: Number,
    items: [String]
  },
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Guild = mongoose.model('Guild', GuildSchema);
const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);
const Completion = mongoose.model('Completion', CompletionSchema);
const Quest = mongoose.model('Quest', QuestSchema);

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Routes

// Health check
app.get('/checklist-rpg-groupe/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Auth Routes
app.post('/checklist-rpg-groupe/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/checklist-rpg-groupe/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).populate('guildId');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/checklist-rpg-groupe/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('guildId').select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guild Routes
app.get('/checklist-rpg-groupe/guilds', async (req, res) => {
  try {
    const guilds = await Guild.find().populate('members');
    res.json(guilds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/checklist-rpg-groupe/guilds', async (req, res) => {
  try {
    const guild = new Guild(req.body);
    await guild.save();
    res.status(201).json(guild);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/checklist-rpg-groupe/guilds/:id', async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id).populate('members').populate('quests');
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    res.json(guild);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/checklist-rpg-groupe/guilds/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const guildId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Vérifier que la guilde existe
    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Vérifier si l'utilisateur est déjà dans une guilde
    if (user.guildId) {
      return res.status(400).json({ error: 'User is already in a guild' });
    }

    // Vérifier si l'utilisateur est déjà membre de cette guilde
    if (guild.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member of this guild' });
    }

    // Ajouter l'utilisateur à la guilde
    guild.members.push(userId);
    await guild.save();

    // Mettre à jour l'utilisateur avec l'ID de la guilde
    user.guildId = guildId;
    await user.save();

    // Retourner la guilde mise à jour
    const updatedGuild = await Guild.findById(guildId).populate('members');
    res.json(updatedGuild);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Routes
app.get('/checklist-rpg-groupe/users', async (req, res) => {
  try {
    const users = await User.find().populate('guildId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/checklist-rpg-groupe/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/checklist-rpg-groupe/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('guildId');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/checklist-rpg-groupe/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Task Routes
app.get('/checklist-rpg-groupe/tasks', async (req, res) => {
  try {
    const { guildId, type } = req.query;
    const filter = {};
    if (guildId) filter.guildId = guildId;
    if (type) filter.type = type;

    const tasks = await Task.find(filter).populate('createdBy');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/checklist-rpg-groupe/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();

    // Broadcast new task via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'NEW_TASK', data: task }));
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/checklist-rpg-groupe/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Completion Routes
app.post('/checklist-rpg-groupe/completions', async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    // Get task details
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Create completion
    const completion = new Completion({
      taskId,
      userId,
      xpGained: task.xpReward,
      goldGained: task.goldReward
    });
    await completion.save();

    // Update user stats
    const user = await User.findById(userId);
    user.xp += task.xpReward;
    user.gold += task.goldReward;

    // Level up logic
    const xpNeeded = user.level * 100;
    if (user.xp >= xpNeeded) {
      user.level += 1;
      user.xp -= xpNeeded;
    }

    await user.save();

    // Broadcast completion via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'TASK_COMPLETED',
          data: { completion, user }
        }));
      }
    });

    res.status(201).json({ completion, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/checklist-rpg-groupe/completions', async (req, res) => {
  try {
    const { userId, taskId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (taskId) filter.taskId = taskId;

    const completions = await Completion.find(filter)
      .populate('taskId')
      .populate('userId')
      .sort({ completedAt: -1 });
    res.json(completions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quest Routes
app.get('/checklist-rpg-groupe/quests', async (req, res) => {
  try {
    const { guildId } = req.query;
    const filter = {};
    if (guildId) filter.guildId = guildId;

    const quests = await Quest.find(filter);
    res.json(quests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/checklist-rpg-groupe/quests', async (req, res) => {
  try {
    const quest = new Quest(req.body);
    await quest.save();
    res.status(201).json(quest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/checklist-rpg-groupe/quests/:id/progress', async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });

    quest.progress += 1;
    if (quest.progress >= quest.goal) {
      quest.status = 'completed';
    }

    await quest.save();

    // Broadcast quest progress via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'QUEST_PROGRESS', data: quest }));
      }
    });

    res.json(quest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Stats Routes
app.get('/checklist-rpg-groupe/stats/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const completions = await Completion.find({ userId });
    const totalXP = completions.reduce((sum, c) => sum + (c.xpGained || 0), 0);
    const totalGold = completions.reduce((sum, c) => sum + (c.goldGained || 0), 0);
    const totalTasks = completions.length;

    res.json({
      userId,
      totalTasks,
      totalXP,
      totalGold,
      completions: completions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leaderboard
app.get('/checklist-rpg-groupe/leaderboard', async (req, res) => {
  try {
    const { guildId } = req.query;
    const filter = {};
    if (guildId) filter.guildId = guildId;

    const users = await User.find(filter)
      .sort({ level: -1, xp: -1 })
      .limit(100)
      .select('username level xp gold');

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
