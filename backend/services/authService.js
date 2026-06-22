// FILE: backend/services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // Percorso corretto per la nuova struttura

class authService {
  static async register(email, password) {
    const passwordHash = await bcrypt.hash(password, 12);
    
    try {
      const result = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
        [email.toLowerCase(), passwordHash]
      );
      return result.rows[0];
    } catch (error) {
      if (error && error.code === "23505") {
        throw new Error("EMAIL_IN_USE");
      }
      throw error;
    }
  }

  static async login(email, password) {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET_MISSING");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return token;
  }
}

module.exports = authService;