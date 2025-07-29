const { Product, UserFavorite } = require("../models");

// Add to favorites
const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already in favorites
    const existingFavorite = await UserFavorite.findOne({
      where: {
        userId: req.user.id,
        productId: productId,
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    await UserFavorite.create({
      userId: req.user.id,
      productId: productId,
    });

    res.json({ message: "Product added to favorites" });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await UserFavorite.destroy({
      where: {
        userId: req.user.id,
        productId: productId,
      },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Product not found in favorites" });
    }

    res.json({ message: "Product removed from favorites" });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await UserFavorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          include: [
            {
              model: require("../models/Category"),
              as: "category",
              attributes: ["id", "name", "slug"],
            },
          ],
        },
      ],
    });

    res.json(favorites.map((fav) => fav.Product));
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};
