const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// 登入
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.json({ success: false, msg: '查無此員工編號' });
  }

  if (!user.active) {
    return res.json({ success: false, msg: '此帳號已停用' });
  }

  if (user.password !== password) {
    return res.json({ success: false, msg: '密碼錯誤' });
  }

  return res.json({
    success: true,
    role: user.role,
    mustChange: !!user.mustChange
  });
});

// 修改密碼
app.post('/change-password', (req, res) => {
  const { id, newPassword } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.json({ success: false, msg: '找不到帳號' });
  }

  users[userIndex].password = newPassword;
  users[userIndex].mustChange = false;
  writeUsers(users);

  return res.json({ success: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🔥 Server running on port ' + PORT);
});