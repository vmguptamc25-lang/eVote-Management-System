const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const db = require("../config/db");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // ✅ Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // ✅ Check user
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, users) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }

        // 🆕 New user
        if (users.length === 0) {
          const insertQuery = `
            INSERT INTO users
            (name, email, google_id, profile_picture, role, auth_provider, last_login)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
          `;

          const values = [
            name,
            email,
            googleId,
            picture,
            "VOTER",
            "GOOGLE",
          ];

          db.query(insertQuery, values, (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "User creation failed" });
            }

            const user = {
              id: result.insertId,
              name,
              email,
              role: "VOTER",
              picture,
            };

            return sendJwt(res, user);
          });

        } else {
          // 🔁 Existing user
          const user = users[0];

          if (!user.is_active) {
            return res.status(403).json({ message: "Account is deactivated" });
          }

          db.query(
            "UPDATE users SET last_login = NOW() WHERE id = ?",
            [user.id]
          );

          return sendJwt(res, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            picture: user.profile_picture,
          });
        }
      }
    );

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Google Authentication Failed" });
  }
});

// 🔐 JWT → HTTP-ONLY COOKIE
function sendJwt(res, user) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(200).json({
    message: "Login successful",
    user,
  });
}

router.get("/me", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    db.query(
      "SELECT id, name, email, role, profile_picture FROM users WHERE id = ?",
      [decoded.id],
      (err, users) => {
        if (err || users.length === 0) {
          return res.status(401).json({ message: "Invalid session" });
        }

        res.json({ user: users[0] });
      }
    );
  } catch {
    res.status(401).json({ message: "Session expired" });
  }
});


module.exports = router;
