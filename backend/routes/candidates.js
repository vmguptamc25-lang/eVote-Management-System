const express = require("express");
const router = express.Router();
const db = require("../config/pooldb.js"); // mysql2 pool
const multer = require("multer");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


// 🔍 VERIFY ELECTION
router.get("/verify/:id", async (req, res) => {
  try {
    const electionId = req.params.id;

    const query = "SELECT * FROM elections WHERE id = ?";

    const [result] = await db.execute(query, [electionId]);

    if (result.length === 0) {
      return res.status(404).json({
        message: "Election Not Found"
      });
    }

    res.json(result[0]);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// ➕ ADD CANDIDATE (With Duplicate Check)
router.post("/add", upload.single("image"), async (req, res) => {

  try {

    const { election_id, name, party } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!election_id || !name) {
      return res.status(400).json({
        message: "Election ID and Candidate Name are required"
      });
    }

    // 🔍 Step 1: Check if candidate already exists
    const checkQuery = `
      SELECT * FROM candidates 
      WHERE election_id = ? AND name = ?
    `;

    const [results] = await db.execute(checkQuery, [election_id, name]);

    if (results.length > 0) {
      return res.status(400).json({
        message: "Candidate already exists for this election"
      });
    }

    // ✅ Step 2: Insert new candidate
    const insertQuery = `
      INSERT INTO candidates (election_id, name, party, image)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(insertQuery, [
      election_id,
      name,
      party,
      image
    ]);

    res.status(201).json({
      message: "Candidate Added Successfully",
      candidateId: result.insertId
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

router.get("/election/:electionId", async (req, res) => {

  try {

    const electionId = req.params.electionId;
    const [rows] = await db.query(
      `SELECT 
        id,
        election_id,
        name,
        party,
        image,
        created_at
      FROM candidates
      WHERE election_id = ?`,
      [electionId]
    );

    res.json(rows);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Error fetching candidates" });

  }

});


module.exports = router;




























// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");
// const multer = require("multer");

// // Multer config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// const upload = multer({ storage });


// // 🔍 VERIFY ELECTION
// router.get("/verify/:id", (req, res) => {
//   const electionId = req.params.id;

//   const query = "SELECT * FROM elections WHERE id = ?";

//   db.query(query, [electionId], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "Election Not Found" });
//     }

//     res.json(result[0]);
//   });
  
// });

// // ➕ ADD CANDIDATE (With Duplicate Check)
// router.post("/add", upload.single("image"), (req, res) => {
  
//   const { election_id, name, party } = req.body;
//   const image = req.file ? req.file.filename : null;

//   if (!election_id || !name) {
//     return res.status(400).json({
//       message: "Election ID and Candidate Name are required"
//     });
//   }

//   // 🔍 Step 1: Check if candidate already exists
//   const checkQuery = `
//     SELECT * FROM candidates 
//     WHERE election_id = ? AND name = ?
//   `;

//   db.query(checkQuery, [election_id, name], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err });
//     }

//     if (results.length > 0) {
//       return res.status(400).json({
//         message: "Candidate already exists for this election"
//       });
//     }

//     // ✅ Step 2: Insert new candidate
//     const insertQuery = `
//       INSERT INTO candidates (election_id, name, party, image)
//       VALUES (?, ?, ?, ?)
//     `;

//     db.query(insertQuery, [election_id, name, party, image], (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: err });
//       }

//       res.status(201).json({
//         message: "Candidate Added Successfully",
//         candidateId: result.insertId
//       });
//     });

//   });
// });


// module.exports = router;
