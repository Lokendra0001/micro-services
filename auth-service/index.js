const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = 3001;
const usersFilePath = path.join(__dirname, "data", "users.json");

const readUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
      fs.writeFileSync(usersFilePath, "[]");
    }
    return JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
};

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  console.log(
    `Username : ${username} || Email : ${email} || Password :  ${password}`,
  );
  if (!username || !email || !password)
    return res
      .status(400)
      .json({ error: "Username, email, and password required" });

  const users = readUsers();
  if (users.find((u) => u.username === username || u.email === email))
    return res.status(400).json({ error: "User already exists" });

  const newUser = { id: Date.now(), username, email, password }; // In production, hash the password
  users.push(newUser);
  writeUsers(users);

  res.status(201).json({
    message: "User registered",
    user: { id: newUser.id, username, email },
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  res.json({
    message: "Login successful",
    user: { id: user.id, username: user.username, email: user.email },
  });
});

app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(
    users.map((u) => ({ id: u.id, username: u.username, email: u.email })),
  );
});

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on http://localhost:${PORT}`);
});
