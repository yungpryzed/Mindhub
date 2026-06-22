// FILE: backend/controllers/TmdbController.js
const tmdbService = require("../services/TmdbService");

class TmdbController {
  static async search(req, res) {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({ message: "Missing query parameter." });
    }

    try {
      const results = await tmdbService.searchMovies(query);
      return res.status(200).json({ results });
    } catch (error) {
      if (error.message === "TMDB_API_KEY_MISSING") {
        return res.status(500).json({ message: "TMDB_API_KEY is not set." });
      }
      
      if (error.message.startsWith("TMDB_API_ERROR")) {
        const parts = error.message.split(":");
        const status = parts[1];
        const errorBody = parts.slice(2).join(":");
        console.error("TMDB error:", status, errorBody);
        return res.status(502).json({ message: "TMDB request failed.", status: parseInt(status, 10) });
      }

      console.error("TMDB search error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
}

module.exports = TmdbController;