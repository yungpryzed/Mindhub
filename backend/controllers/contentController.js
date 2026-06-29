const contentService = require("../services/contentService");

class contentController {
  static async getAllUserContents(req, res) {
    try {
      const { userId } = req.user;
      const contents = await contentService.getAllContentsForUser(userId);
      return res.status(200).json(contents);
    } catch (error) {
      console.error("Get all user contents error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async create(req, res) {
    try {
      const { userId } = req.user;
      const content = await contentService.createContent(userId, req.body);
      return res.status(201).json(content);
    } catch (error) {
      console.error("Create content error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async get(req, res) {
    try {
      const { userId } = req.user;
      const contents = await contentService.getContents(userId, req.query.parent_id);
      return res.status(200).json(contents);
    } catch (error) {
      console.error("Get contents error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async getFolders(req, res) {
    try {
      const { userId } = req.user;
      const folders = await contentService.getFolders(userId);
      return res.status(200).json(folders);
    } catch (error) {
      console.error("Get folders error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async getFolderContents(req, res) {
    try {
      const { userId } = req.user;
      const contents = await contentService.getFolderContents(userId, req.params.parent_id);
      return res.status(200).json(contents);
    } catch (error) {
      console.error("Get folder contents error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async bulkMove(req, res) {
    try {
      const { userId } = req.user;
      const { itemIds, targetFolderId } = req.body;
      const moved = await contentService.bulkMove(userId, itemIds, targetFolderId);
      return res.status(200).json({ movedCount: moved.length });
    } catch (error) {
      console.error("Bulk move error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async mergeToFolder(req, res) {
    try {
      const { userId } = req.user;
      const { source_id, target_id, type, folder_title = "Cartella" } = req.body;
      
      if (!source_id || !target_id || !type) {
        return res.status(400).json({ message: "source_id, target_id e type sono obbligatori." });
      }

      const folder = await contentService.mergeToFolder(userId, source_id, target_id, type, folder_title);
      return res.status(201).json({ folder_id: folder.id });
    } catch (error) {
      console.error("Merge to folder error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async reorder(req, res) {
    try {
      const { userId } = req.user;
      const items = Array.isArray(req.body) ? req.body : req.body.items || [];
      
      if (!Array.isArray(items) || !items.length) {
        return res.status(400).json({ message: "items è obbligatorio." });
      }

      await contentService.reorderContents(userId, items);
      return res.status(200).json({ message: "Ordine aggiornato." });
    } catch (error) {
      console.error("Reorder error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { userId } = req.user;
      const { status, position } = req.body;
      
      if (!status || !["visto", "da_vedere"].includes(status)) {
        return res.status(400).json({ message: "status non valido." });
      }

      const content = await contentService.updateStatus(userId, req.params.id, status, position);
      if (!content) return res.status(404).json({ message: "Film non trovato o non autorizzato." });

      return res.status(200).json(content);
    } catch (error) {
      console.error("Update movie status error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async delete(req, res) {
    try {
      const { userId } = req.user;
      const deleted = await contentService.deleteContent(userId, req.params.id);
      
      if (!deleted) return res.status(404).json({ message: "Contenuto non trovato o non autorizzato." });

      return res.status(200).json({ message: "Contenuto eliminato." });
    } catch (error) {
      console.error("Delete content error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async update(req, res) {
    try {
      const { userId } = req.user;
      const content = await contentService.updateContent(userId, req.params.id, req.body);
      
      if (content === null) return res.status(400).json({ message: "Nessun dato da aggiornare." });
      if (!content) return res.status(404).json({ message: "Contenuto non trovato o non autorizzato." });

      return res.status(200).json(content);
    } catch (error) {
      console.error("Update content error:", error);
      return res.status(error.status || 500).json({ message: error.message || "Internal server error." });
    }
  }

  static async updateMovieReview(req, res) {
    try {
      const { userId } = req.user;
      const { contentId, rating, notes } = req.body;

      if (!contentId) {
        return res.status(400).json({ message: "contentId è obbligatorio." });
      }

      const content = await contentService.updateMovieReview(userId, contentId, rating, notes);

      if (!content) {
        return res.status(404).json({ message: "Contenuto non trovato o non autorizzato." });
      }

      return res.status(200).json(content);
    } catch (error) {
      console.error("Errore durante il salvataggio della recensione:", error);
      return res.status(error.status || 500).json({ message: error.message || "Errore interno del server." });
    }
  }
}

module.exports = contentController;
