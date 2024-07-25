import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export const followUser = async (currentUserId, userToFollowId) => {
  const currentUserRef = doc(db, "users", currentUserId);
  const userToFollowRef = doc(db, "users", userToFollowId);

  await updateDoc(currentUserRef, {
    following: arrayUnion(userToFollowId),
  });

  await updateDoc(userToFollowRef, {
    followers: arrayUnion(currentUserId),
  });
};

export const unFollowUser = async (currentUserId, userToUnfollowId) => {
  const currentUserRef = doc(db, "users", currentUserId);
  const userToUnfollowRef = doc(db, "users", userToUnfollowId);

  await updateDoc(currentUserRef, {
    following: arrayRemove(userToUnfollowId),
  });

  await updateDoc(userToUnfollowRef, {
    followers: arrayRemove(currentUserId),
  });
};
