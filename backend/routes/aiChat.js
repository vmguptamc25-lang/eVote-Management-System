const express = require("express");
const router = express.Router();

const { aiChat } = require("../controllers/aiController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, (req, res, next) => {
  next();
}, aiChat);

module.exports = router;