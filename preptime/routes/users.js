const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("USERS API IS RUNNING");
});

router.get("/userInfo/:userId", async (req, res) => {
  const admin = req.app.locals.admin;
  const db = admin.firestore();

  const userId = req.params.userId;

  try {
    // Get user information from Firestore based on userId
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    const userData = userDoc.data();

    res.send({
      fullName: userData.fullName || "FULL NAME",
      profileImg: userData.profileImg || "IMAGE",
      followers: userData.followers || [],
      following: userData.followingUsers || [],
      favoriteTeams: userData.favoriteTeams || [],
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/followUser", async (req, res) => {
  const admin = req.app.locals.admin;
  const db = admin.firestore();

  // Check if req.body is defined
  if (!req.body) {
    return res.status(400).send({ error: "Request body is missing" });
  }

  const { userToFollowId, currentUserId } = req.body;

  if (!userToFollowId || !currentUserId) {
    return res.status(400).send({ error: "Both userIds are required" });
  }

  try {
    // Get references to both user documents
    const userToFollowRef = db.collection("users").doc(userToFollowId);
    const currentUserRef = db.collection("users").doc(currentUserId);

    // Get both user documents
    const [userToFollowDoc, currentUserDoc] = await Promise.all([
      userToFollowRef.get(),
      currentUserRef.get(),
    ]);

    if (!userToFollowDoc.exists || !currentUserDoc.exists) {
      return res.status(404).send({ error: "One or both users not found" });
    }

    const userToFollowData = userToFollowDoc.data();
    const currentUserData = currentUserDoc.data();

    const userToFollowName = userToFollowData.fullName || "Unknown User";
    const currentUserName = currentUserData.fullName || "Unknown User";

    // Update the documents in a transaction
    await db.runTransaction(async (transaction) => {
      // Add currentUser's full name to userToFollow's followers array
      transaction.update(userToFollowRef, {
        followers: admin.firestore.FieldValue.arrayUnion(currentUserName),
      });

      // Add userToFollow's full name to currentUser's following array
      transaction.update(currentUserRef, {
        followingUsers: admin.firestore.FieldValue.arrayUnion(userToFollowName),
      });
    });

    res.send({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/unfollowUser", async (req, res) => {
  const admin = req.app.locals.admin;
  const db = admin.firestore();

  // Check if req.body is defined
  if (!req.body) {
    return res.status(400).send({ error: "Request body is missing" });
  }

  const { userToUnfollowId, currentUserId } = req.body;

  if (!userToUnfollowId || !currentUserId) {
    return res.status(400).send({ error: "Both userIds are required" });
  }

  try {
    // Get references to both user documents
    const userToUnfollowRef = db.collection("users").doc(userToUnfollowId);
    const currentUserRef = db.collection("users").doc(currentUserId);

    // Get both user documents
    const [userToUnfollowDoc, currentUserDoc] = await Promise.all([
      userToUnfollowRef.get(),
      currentUserRef.get(),
    ]);

    if (!userToUnfollowDoc.exists || !currentUserDoc.exists) {
      return res.status(404).send({ error: "One or both users not found" });
    }

    const userToUnfollowData = userToUnfollowDoc.data();
    const currentUserData = currentUserDoc.data();

    const userToUnfollowName = userToUnfollowData.fullName || "Unknown User";
    const currentUserName = currentUserData.fullName || "Unknown User";

    // Update the documents in a transaction
    await db.runTransaction(async (transaction) => {
      // Remove currentUser's full name from userToUnfollow's followers array
      transaction.update(userToUnfollowRef, {
        followers: admin.firestore.FieldValue.arrayRemove(currentUserName),
      });

      // Remove userToUnfollow's full name from currentUser's following array
      transaction.update(currentUserRef, {
        followingUsers:
          admin.firestore.FieldValue.arrayRemove(userToUnfollowName),
      });
    });

    res.send({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/favoriteTeam", async (req, res) => {
  const admin = req.app.locals.admin;
  const db = admin.firestore();

  if (!req.body) {
    return res.status(400).send({ error: "Request body is missing" });
  }

  const { currentUserId, teamName } = req.body;

  if (!currentUserId || !teamName) {
    return res
      .status(400)
      .send({ error: "Both userId and teamName are required" });
  }

  try {
    const userRef = db.collection("users").doc(currentUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    await userRef.update({
      favoriteTeams: admin.firestore.FieldValue.arrayUnion(teamName),
    });

    res.send({ message: "Successfully favorited team" });
  } catch (error) {
    console.error("Error favoriting team:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/unfavoriteTeam", async (req, res) => {
  const admin = req.app.locals.admin;
  const db = admin.firestore();

  if (!req.body) {
    return res.status(400).send({ error: "Request body is missing" });
  }

  const { currentUserId, teamName } = req.body;

  if (!currentUserId || !teamName) {
    return res
      .status(400)
      .send({ error: "Both userId and teamName are required" });
  }

  try {
    const userRef = db.collection("users").doc(currentUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    await userRef.update({
      favoriteTeams: admin.firestore.FieldValue.arrayRemove(teamName),
    });

    res.send({ message: "Successfully unfavorited team" });
  } catch (error) {
    console.error("Error unfavoriting team:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
