import { auth } from "../../firebase/firebase";
import { getUserInfo } from "../api/getUserInfo";

export const fetchUserData = async (setUserData, setIsLoading) => {
  console.log("Fetching User Data...");
  if (auth.currentUser) {
    try {
      const userId = auth.currentUser.uid;
      const userInfo = await getUserInfo(userId);
      setUserData(userInfo);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  } else {
    console.log("No user is currently signed in.");
    setIsLoading(false);
  }
};
