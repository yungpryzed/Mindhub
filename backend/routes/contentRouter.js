const express = require("express");
const contentController = require("../controllers/contentController"); // Already lowercase, no change needed
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protezione globale delle rotte contenuti tramite JWT
router.use(authMiddleware);

router.get("/all", contentController.getAllUserContents);
router.post("/", contentController.create);
router.get("/", contentController.get);
router.get("/folders", contentController.getFolders);
router.get("/folder/:parent_id", contentController.getFolderContents);
router.put("/bulk-move", contentController.bulkMove);
router.post("/merge-to-folder", contentController.mergeToFolder);
router.put("/reorder", contentController.reorder);
router.put("/:id/status", contentController.updateStatus);
router.delete("/:id", contentController.delete);
router.put("/review", contentController.updateMovieReview);
router.put("/:id", contentController.update);

module.exports = router;