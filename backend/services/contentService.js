const pool = require("../config/db"); // Already lowercase, no change needed

class contentService {
  static async getAllContentsForUser(userId) {
    const result = await pool.query(
      "SELECT id, type, title, payload, created_at, updated_at FROM contents WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  }

  static async createContent(userId, data) {
    const { type, title, tags, payload, parent_id, position, status, content_data } = data;
    
    const result = await pool.query(
      "INSERT INTO contents (user_id, type, title, tags, payload, parent_id, position, status, content_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [userId, type, title, tags || [], payload ?? {}, parent_id || null, position || 0, status || null, content_data || null]
    );
    
    return result.rows[0];
  }

  static async getContents(userId, parent_id) {
    const isRoot = !parent_id || parent_id === "root" || parent_id === "null";
    const parentClause = isRoot ? "parent_id IS NULL" : "parent_id = $2";
    const params = isRoot ? [userId] : [userId, parent_id];

    const result = await pool.query(
      `SELECT * FROM contents WHERE user_id = $1 AND ${parentClause} ORDER BY position ASC`,
      params
    );
    
    return result.rows;
  }

  static async getFolders(userId) {
    const result = await pool.query(
      "SELECT id, title, parent_id, type, payload, created_at, updated_at FROM contents WHERE user_id = $1 AND type = 'box' ORDER BY title ASC",
      [userId]
    );
    
    return result.rows;
  }

  static async getFolderContents(userId, parent_id) {
    const result = await pool.query(
      "SELECT * FROM contents WHERE user_id = $1 AND parent_id = $2 ORDER BY position ASC",
      [userId, parent_id]
    );
    
    return result.rows;
  }

  static async bulkMove(userId, itemIds, targetFolderId) {
    if (!Array.isArray(itemIds) || !itemIds.length) {
      throw new Error("itemIds è obbligatorio.");
    }

    const result = await pool.query(
      `UPDATE contents
       SET parent_id = $1
       WHERE user_id = $2
         AND id = ANY($3::uuid[])
       RETURNING id`,
      [targetFolderId ?? null, userId, itemIds]
    );

    return result.rows;
  }

  static async mergeToFolder(userId, source_id, target_id, type, folder_title) {
    await pool.query("BEGIN");
    
    try {
      const itemsResult = await pool.query(
        "SELECT id, parent_id, position FROM contents WHERE user_id = $1 AND id = ANY($2::uuid[])",
        [userId, [source_id, target_id]]
      );

      if (itemsResult.rows.length !== 2) {
        throw new Error("Elementi non trovati.");
      }

      const parentId = itemsResult.rows[0].parent_id;
      const sameParent = itemsResult.rows.every((row) => row.parent_id === parentId);
      
      if (!sameParent) {
        throw new Error("Gli elementi non sono nello stesso contenitore.");
      }

      const minPosition = Math.min(...itemsResult.rows.map((row) => row.position ?? 0));

      const folderResult = await pool.query(
        "INSERT INTO contents (user_id, type, title, tags, payload, parent_id, position) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [userId, "box", folder_title, [], { content_type: type }, parentId, minPosition]
      );
      
      const folder = folderResult.rows[0];

      await pool.query(
        "UPDATE contents SET parent_id = $1, position = $2 WHERE id = $3 AND user_id = $4",
        [folder.id, 0, source_id, userId]
      );

      await pool.query(
        "UPDATE contents SET parent_id = $1, position = $2 WHERE id = $3 AND user_id = $4",
        [folder.id, 1, target_id, userId]
      );

      await pool.query("COMMIT");
      return folder;
      
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }

  static async reorderContents(userId, items) {
    const ids = items.map((i) => i.id);
    const positions = items.map((i) => i.position);

    await pool.query(
      `
      UPDATE contents AS c SET position = v.position
      FROM (SELECT UNNEST($1::uuid[]) AS id, UNNEST($2::int[]) AS position) AS v
      WHERE c.id = v.id AND c.user_id = $3
      `,
      [ids, positions, userId]
    );
  }

  static async updateStatus(userId, id, status, position) {
    const result = await pool.query(
      "UPDATE contents SET status = $1, position = COALESCE($2, position) WHERE id = $3 AND user_id = $4 AND type = $5 RETURNING *",
      [status, position ?? null, id, userId, "movie"]
    );
    
    return result.rows[0];
  }

  static async deleteContent(userId, id) {
    const result = await pool.query(
      `WITH RECURSIVE to_delete AS (
       SELECT id
       FROM contents
       WHERE id = $1 AND user_id = $2
       UNION ALL
       SELECT c.id
       FROM contents c
       INNER JOIN to_delete td ON c.parent_id = td.id
       WHERE c.user_id = $2
       )
       DELETE FROM contents
       WHERE id IN (SELECT id FROM to_delete)
       RETURNING id`,
      [id, userId]
    );
    
    return result.rows[0];
  }

  static async updateContent(userId, id, updates) {
    const { title, tags, payload, type, parent_id, position, status, content_data } = updates;
    const fields = [];
    const values = [];
    let index = 1;

    if (title !== undefined) { fields.push(`title = $${index}`); values.push(title); index++; }
    if (tags !== undefined) { fields.push(`tags = $${index}`); values.push(tags); index++; }
    if (payload !== undefined) { fields.push(`payload = $${index}`); values.push(payload); index++; }
    if (type !== undefined) { fields.push(`type = $${index}`); values.push(type); index++; }
    if (parent_id !== undefined) { fields.push(`parent_id = $${index}`); values.push(parent_id); index++; }
    if (position !== undefined) { fields.push(`position = $${index}`); values.push(position); index++; }
    if (status !== undefined) { fields.push(`status = $${index}`); values.push(status); index++; }
    if (content_data !== undefined) { fields.push(`content_data = $${index}`); values.push(content_data); index++; }

    if (!fields.length) return null;

    values.push(id, userId);

    const result = await pool.query(
      `UPDATE contents SET ${fields.join(", ")} WHERE id = $${index} AND user_id = $${index + 1} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }
}

module.exports = contentService;