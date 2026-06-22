// FILE: backend/controllers/authController.js
const authService = require("../services/AuthService");

class AuthController {
  static async register(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    try {
      const user = await authService.register(email, password);
      return res.status(201).json({ user });
    } catch (error) {
      if (error.message === "EMAIL_IN_USE") {
        return res.status(409).json({ message: "Email already in use." });
      }
      console.error("Register error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    try {
      const token = await authService.login(email, password);
      return res.status(200).json({ token });
    } catch (error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
}

module.exports = AuthController;