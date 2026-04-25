const express = require("express");
const crypto = require("crypto");
const db = require("../config/db");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

/* ======================================================
   🔐 Aadhaar Encryption (AES-256-CBC)
   Stored as VARBINARY in DB
====================================================== */
function encryptAadhaar(aadhaar) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(process.env.AADHAAR_SECRET, "hex");

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(aadhaar, "utf8"),
    cipher.final(),
  ]);

  // store iv + encrypted together
  return Buffer.concat([iv, encrypted]);
}

/* ======================================================
   🔓 Aadhaar Decryption (SERVER ONLY)
====================================================== */
function decryptAadhaar(buffer) {
  const key = Buffer.from(process.env.AADHAAR_SECRET, "hex");

  const iv = buffer.subarray(0, 16);
  const encryptedText = buffer.subarray(16);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/* ======================================================
   🔐 Aadhaar Hash (for duplicate detection)
====================================================== */
function hashAadhaar(aadhaar) {
  return crypto.createHash("sha256").update(aadhaar).digest("hex");
}

/* ======================================================
   🛡️ Mask Aadhaar for UI
====================================================== */
function maskAadhaar(aadhaar) {
  if (!aadhaar || aadhaar.length !== 12) return null;
  return `XXXX-XXXX-${aadhaar.slice(8)}`;
}

/* ======================================================
   🗳️ POST /api/voter/enroll
====================================================== */
router.post("/enroll", auth, (req, res) => {
  const userId = req.user.id;
  const { mobile, dob, aadhaar } = req.body;

  if (!mobile || !dob || !aadhaar) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const aadhaarHash = hashAadhaar(aadhaar);

  // 🔁 Check duplicate: user_id OR mobile OR aadhaar_hash
  db.query(
    `SELECT id FROM voters
     WHERE user_id = ?
        OR mobile = ?
        OR aadhaar_hash = ?`,
    [userId, mobile, aadhaarHash],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (rows.length > 0) {
        return res.status(409).json({
          message: "Voter already enrolled with these details",
        });
      }

      const encryptedAadhaar = encryptAadhaar(aadhaar);

      db.query(
        `INSERT INTO voters
         (user_id, mobile, dob, aadhar_encrypted, aadhaar_hash, is_verified)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [userId, mobile, dob, encryptedAadhaar, aadhaarHash],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              message: "Enrollment failed",
            });
          }

          return res.status(201).json({
            message: "Enrollment successful. Aadhaar verified.",
          });
        }
      );
    }
  );
});

/* ======================================================
   👤 GET /api/voter/me
====================================================== */
router.get("/me", auth, (req, res) => {
  const email = req.user.email;

  db.query(
    `SELECT
        v.id,
        v.mobile,
        v.dob,
        v.is_verified,
        v.created_at,
        v.aadhar_encrypted,
        u.name,
        u.email,
        u.profile_picture,
        u.role
     FROM voters v
     JOIN users u ON v.user_id = u.id
     WHERE u.email = ?`,
    [email],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "Voter not enrolled" });
      }

      const voter = rows[0];

      const decryptedAadhaar = decryptAadhaar(voter.aadhar_encrypted);
      const maskedAadhaar = maskAadhaar(decryptedAadhaar);

      res.json({
        voter: {
          voter_id: `VTR${new Date(voter.created_at).getFullYear()}${voter.id}`,
          name: voter.name,
          email: voter.email,
          profile_picture: voter.profile_picture,
          role: voter.role,
          mobile: voter.mobile,
          dob: voter.dob,
          aadhaar: maskedAadhaar,
          is_verified: voter.is_verified,
          enrolled_at: voter.created_at,
        },
      });
    }
  );
});

module.exports = router;
