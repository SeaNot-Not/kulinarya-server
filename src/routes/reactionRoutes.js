import express from "express";

// Imported Controllers
import {
  toggleReaction,
  fetchAllReactions,
  getTopReactedPost,
  getOverallReactions,
} from "../controllers/reactionController.js";

// Imported Middlewares
import authenticateUser from "../middleware/authenticateUser.js";

//  ------------------------------------------------------------

const router = express.Router();
router.get("/overall-reactions", getOverallReactions);
router.get("/top-reacted", getTopReactedPost);
router.get("/:recipeId", fetchAllReactions);
router.post("/:recipeId/toggle", authenticateUser, toggleReaction);

export default router;
