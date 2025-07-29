const express = require("express");
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} = require("../controllers/userController");
const { auth } = require("../config/auth");

const router = express.Router();

// Favorites routes
router.post("/favorites/:productId", auth, addToFavorites);
router.delete("/favorites/:productId", auth, removeFromFavorites);
router.get("/favorites", auth, getFavorites);

module.exports = router;
