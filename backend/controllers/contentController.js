const contentService = require("../services/contentService"); // Already lowercase, no change needed
const pool = require("../config/db");

class contentController {
  static async getAllUserContents(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      // Assuming contentService will be updated to include this method
      // to fetch all contents for a user, filtered only by userId.
      const contents = await contentService.getAllContentsForUser(userId);
      return res.status(200).json(contents);
    } catch (error) {
      console.error("Get all user contents error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async create(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const { type, title } = req.body;
      if (!type || !title) return res.status(400).json({ message: "type e title sono obbligatori." });

      const content = await contentService.createContent(userId, req.body);
      return res.status(201).json(content);
    } catch (error) {
      console.error("Create content error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async get(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const contents = await contentService.getContents(userId, req.query.parent_id);
      return res.status(200).json(contents);
    } catch (error) {
      console.error("Get contents error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async getFolders(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const folders = await contentService.getFolders(userId);
      return res.status(200).json(folders);
    } catch (error) {
      console.error("Get folders error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async getFolderContents(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const contents = await contentService.getFolderContents(userId, req.params.parent_id);
      return res.status(200).json(contents);
    } catch (error) {
      console.error("Get folder contents error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async bulkMove(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const { itemIds, targetFolderId } = req.body;
      if (!Array.isArray(itemIds) || !itemIds.length) {
        return res.status(400).json({ message: "itemIds è obbligatorio." });
      }

      const moved = await contentService.bulkMove(userId, itemIds, targetFolderId);
      return res.status(200).json({ movedCount: moved.length });
    } catch (error) {
      console.error("Bulk move error:", error);
      return res.status(500).json({ message: error.message || "Internal server error." });
    }
  }

  static async mergeToFolder(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const { source_id, target_id, type, folder_title = "Cartella" } = req.body;
      if (!source_id || !target_id || !type) {
        return res.status(400).json({ message: "source_id, target_id e type sono obbligatori." });
      }

      const folder = await contentService.mergeToFolder(userId, source_id, target_id, type, folder_title);
      return res.status(201).json({ folder_id: folder.id });
    } catch (error) {
      console.error("Merge to folder error:", error);
      if (error.message === "Elementi non trovati.") return res.status(404).json({ message: error.message });
      if (error.message === "Gli elementi non sono nello stesso contenitore.") return res.status(400).json({ message: error.message });
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async reorder(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const items = Array.isArray(req.body) ? req.body : req.body.items || [];
      if (!Array.isArray(items) || !items.length) {
        return res.status(400).json({ message: "items è obbligatorio." });
      }

      await contentService.reorderContents(userId, items);
      return res.status(200).json({ message: "Ordine aggiornato." });
    } catch (error) {
      console.error("Reorder error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async updateStatus(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const { status, position } = req.body;
      if (!status || !["visto", "da_vedere"].includes(status)) {
        return res.status(400).json({ message: "status non valido." });
      }

      const content = await contentService.updateStatus(userId, req.params.id, status, position);
      if (!content) return res.status(404).json({ message: "Film non trovato." });

      return res.status(200).json(content);
    } catch (error) {
      console.error("Update movie status error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async delete(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const deleted = await contentService.deleteContent(userId, req.params.id);
      if (!deleted) return res.status(404).json({ message: "Contenuto non trovato." });

      return res.status(200).json({ message: "Contenuto eliminato." });
    } catch (error) {
      console.error("Delete content error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Utente non autenticato." });

      const content = await contentService.updateContent(userId, req.params.id, req.body);
      
      if (content === null) return res.status(400).json({ message: "Nessun dato da aggiornare." });
      if (!content) return res.status(404).json({ message: "Contenuto non trovato." });

      return res.status(200).json(content);
    } catch (error) {
      console.error("Update content error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }

  static async updateMovieReview(req, res) {
    try {
      const { contentId, rating, notes } = req.body;

      if (!contentId) {
        return res.status(400).json({ message: "contentId è obbligatorio." });
      }

      const query = `
        UPDATE contents 
        SET payload = payload || jsonb_build_object('review_rating', $1::int, 'review_notes', $2::text)
        WHERE id = $3
        RETURNING *;
      `;

      const values = [rating, notes, contentId];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Contenuto non trovato." });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Errore durante il salvataggio della recensione:", error);
      return res.status(500).json({ message: "Errore interno del server durante il salvataggio della recensione." });
    }
  }
}

module.exports = contentController;
