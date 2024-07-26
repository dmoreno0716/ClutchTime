import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { query, collection, where, getDocs } from "firebase/firestore";

export const fetchUserData = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();

    if (userData.following && userData.following.length > 0) {
      const followingQuery = query(
        collection(db, "users"),
        where("__name__", "in", userData.following)
      );
      const followingSnapshot = await getDocs(followingQuery);

      const followingNames = {};
      followingSnapshot.forEach((doc) => {
        followingNames[doc.id] = doc.data().fullName;
      });

      userData.followingNames = followingNames;
    }

    return userData;
  } else {
    console.log("No such user!");
    return null;
  }
};
