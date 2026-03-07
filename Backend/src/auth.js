import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "..", "data", "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

function ensureDataDir() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readUsers() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function findUserByEmail(email) {
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser({ email, password, name, country }) {
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: "An account with this email already exists" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    email: email.trim().toLowerCase(),
    passwordHash: hash,
    name: (name || "").trim(),
    country: (country || "").trim(),
  };
  users.push(user);
  writeUsers(users);
  return { user: { email: user.email, name: user.name, country: user.country } };
}

export async function verifyUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { error: "Invalid email or password" };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password" };
  return { user: { email: user.email, name: user.name, country: user.country } };
}

export function signToken(user) {
  return jwt.sign(
    { email: user.email, sub: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = findUserByEmail(payload.email);
    if (!user) return null;
    return { email: user.email, name: user.name, country: user.country };
  } catch {
    return null;
  }
}
