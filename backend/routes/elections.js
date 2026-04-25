const express = require("express");

const db = require("../config/pooldb");
const requireAuth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");

const router = express.Router();

// User fetching all elections
router.get("/all", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, description, status, start_time, end_time
      FROM elections
      ORDER BY start_time DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching elections" });
  }
});

// GET all elections with vote count
router.get("/allElectionVote", async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.status,
        e.start_time,
        e.end_time,
        COUNT(v.id) AS total_votes
      FROM elections e
      LEFT JOIN votes v 
        ON e.id = v.election_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching elections" });
  }
});
// get election id based on user id


router.get("/ids/:userId", async (req, res) => {
  try {

    const userId = req.params.userId;
    
    // get voter id from voters table
    const [voter] = await db.query(
      "SELECT id FROM voters WHERE user_id = ?",
      [userId]
    );


    if (voter.length === 0) {
      return res.status(404).json({ message: "Voter not found" });
    }

    const voterId = voter[0].id;

    // get election ids
    const [elections] = await db.query(
      "SELECT election_id FROM election_voters WHERE voter_id = ?",
      [voterId]
    );

    res.json(elections);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🗳️ CREATE ELECTION (ADMIN ONLY)
 */
router.post(
  "/create",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        start_time,
        end_time,
        result_published_at,
        total_votes,
      } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Election title is required" });
      }

      const [result] = await db.query(
        `INSERT INTO elections
        (title, description, status, start_time, end_time, result_published_at, total_votes, created_by)
        VALUES (?, ?, 'CREATED', ?, ?, ?, ?, ?)`,
        [
          title,
          description || null,
          start_time || null,
          end_time || null,
          result_published_at || null,
          total_votes || 0,
          req.user.id,
        ]
      );

      res.status(201).json({
        message: "Election created successfully",
        election_id: result.insertId,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Database error" });
    }
  }
);

/**
 * 📋 GET ALL ELECTIONS (ADMIN ONLY)
 */
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          id,
          title,
          description,
          start_time,
          end_time,
          status,
          total_votes,
          result_published_at,
          created_by,
          created_at
        FROM elections
        ORDER BY created_at DESC
      `);

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch elections" });
    }
  }
);

/**
 * ✏️ UPDATE ELECTION (ADMIN ONLY)
 */
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const { id } = req.params;
    const { title, start_time, end_time, status } = req.body;

    try {
      await db.query(
        `UPDATE elections 
         SET title=?, start_time=?, end_time=?, status=?
         WHERE id=?`,
        [title, start_time, end_time, status, id]
      );

      res.json({ message: "Election updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update election" });
    }
  }
);

/**
 * 🗑 DELETE ELECTION (ADMIN ONLY)
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      await db.query(
        "DELETE FROM elections WHERE id=?",
        [req.params.id]
      );

      res.json({ message: "Election deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete election" });
    }
  }
);
/**
 * GET SINGLE ELECTION BY ID (Edit Election Page)
 * ADMIN ONLY
 */
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [rows] = await db.query(
        `
        SELECT
          id,
          title,
          description,
          status,
          start_time,
          end_time,
          result_published_at,
          total_votes,
          created_by,
          created_at
        FROM elections
        WHERE id = ?
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Election not found",
        });
      }

      res.json({
        election: rows[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to fetch election",
      });
    }
  }
);
/**
 * 📄 GET ELECTION DETAILS BY ID
 */
router.get("/detail/:id", async (req, res) => {

  const { id } = req.params;

  try {

    const [rows] = await db.query(
      `SELECT
        id,
        title,
        description,
        status,
        start_time,
        end_time,
        result_published_at,
        total_votes,
        created_by,
        created_at
      FROM elections
      WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Election not found"
      });
    }

    res.json({
      election: rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch election details"
    });

  }

});

module.exports = router;
