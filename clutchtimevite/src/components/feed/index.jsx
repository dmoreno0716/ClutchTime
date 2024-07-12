import React, { useState } from "react";
import Sidebar from "../Sidebar";
import { useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../../contexts/authContext";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  startAfter,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#15202b",
    color: "white",
  },
  mainContent: {
    flexGrow: 1,
    overflowY: "auto",
    borderLeft: "1px solid #38444d",
    borderRight: "1px solid #38444d",
  },
  feed: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  createPost: {
    borderBottom: "1px solid #38444d",
    padding: "15px",
  },
  postOptions: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "10px",
  },
  post: {
    display: "flex",
    borderBottom: "1px solid #38444d",
    padding: "15px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "10px",
  },
  postContent: {
    flexGrow: 1,
  },
  postHeader: {
    marginBottom: "5px",
  },
  userName: {
    fontWeight: "bold",
    marginRight: "5px",
  },
  userHandle: {
    color: "#8899a6",
  },
  postTime: {
    color: "#8899a6",
  },
  postActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  actionButton: {
    background: "none",
    border: "none",
    color: "#8899a6",
    cursor: "pointer",
  },
  rightSidebar: {
    width: "300px",
    padding: "15px",
  },
  searchBar: {
    width: "100%",
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#253341",
    color: "white",
  },
  transfers: {
    marginTop: "20px",
  },
  transferItem: {
    backgroundColor: "#192734",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "10px",
  },
  transferTitle: {
    margin: "0 0 5px 0",
  },
  transferTime: {
    fontSize: "0.8em",
    color: "#8899a6",
  },
  matchData: {
    backgroundColor: "#192734",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px",
  },
  liveIndicator: {
    color: "red",
    fontWeight: "bold",
  },
  teams: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "5px",
  },
  predictionInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #38444d",
    backgroundColor: "#253341",
    color: "white",
    marginBottom: "10px",
  },
  postButton: {
    padding: "10px 20px",
    backgroundColor: "#1DA1F2",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  },
  loadingMore: {
    textAlign: "center",
    padding: "20px",
    color: "#8899a6",
  },
};

const Feed = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState("");
  const [lastVisible, setLastVisible] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = useCallback(
    async (lastDoc = null) => {
      if (!currentUser || loading || !hasMore) return;

      console.log("Fetching posts for user: ", currentUser.uid); //logging current user object

      setLoading(true);
      const postsRef = collection(db, "posts");

      try {
        // const userDoc = await getDocs(doc(db, "users", currentUser.uid));
        // const userData = userDoc.data();
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.error("User document does not exist");
          setLoading(false);
          return;
        }
        const userData = userDocSnap.data();
        console.log("User data: ", userData); //logging user data to test

        const following = userData.followingUsers || [];
        console.log("Following users: ", following); //logging to see if data is being picked up

        let q = query(
          postsRef,
          where("authorId", "in", [currentUser.uid, ...following]),
          orderBy("timestamp", "desc"),
          limit(10)
        );

        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size: ", querySnapshot.size); //logging query snapshot size

        const fetchedPosts = await Promise.all(
          querySnapshot.docs.map(async (postDoc) => {
            const postData = postDoc.data();
            console.log("Post data: ", postData); //logging to see if post data is being read

            const authorDocRef = doc(db, "users", postData.authorId);
            const authorDocSnap = await getDoc(authorDocRef);
            const authorData = authorDocSnap.exists()
              ? authorDocSnap.data()
              : {};

            return {
              id: postDoc.id,
              ...postData,
              author: {
                id: postData.authorId,
                fullName: authorData.fullName || "Unknown User",
                profileImg: authorData.profileImg || null,
              },
            };
          })
        );

        console.log("Fetched posts: ", fetchedPosts); //logging to see if posts got fetched

        setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === 10);
      } catch (error) {
        console.error("Error fetching posts", error);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loading, hasMore]
  );

  useEffect(() => {
    if (currentUser && !loading && hasMore) {
      fetchPosts();
    }
  }, [currentUser, fetchPosts, loading, hasMore]);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      fetchPosts(lastVisible);
    }
  }, [inView, fetchPosts, lastVisible, loading, hasMore]);

  const handleLike = async (postId) => {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      likes: arrayUnion(currentUser.uid),
    });
    // fetch related posts based on the liked post
    const likedPost = posts.find((post) => post.id === postId);
    if (likedPost) {
      const relatedPostsQuery = query(
        collection(db, "posts"),
        where("type", "==", likedPost.type),
        where("relevantTo", "array-contains-any", likedPost.relevantTo),
        limit(5)
      );
      const relatedSnapshot = await getDocs(relatedPostsQuery);
      const relatedPosts = relatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts((prevPosts) => [...prevPosts, ...relatedPosts]);
    }
  };

  const handleComment = async (postId) => {
    if (comment.trim() === "") return;
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        user: currentUser.fullName,
        content: comment,
        timestamp: new Date(),
      }),
    });
    setComment("");
    fetchPosts(); // re-fetch posts to show new comment
  };

  const createPost = async (content) => {
    try {
      await addDoc(collection(db, "posts"), {
        authorId: currentUser.uid,
        content: content,
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
      });
    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  const followUser = async (userIdToFollow) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        followingUsers: arrayUnion(userIdToFollow),
      });
    } catch (error) {
      console.error("Error following user: ", error);
    }
  };

  return (
    <div style={styles.app}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.feed}>
          {posts.map((post) => (
            <div key={post.id} style={styles.post}>
              <img
                src={post.author.profileImg || `https://via.placeholder.com/40`}
                alt={postauthor.fullName}
                style={styles.avatar}
              />
              <div style={styles.postContent}>
                <div style={styles.postHeader}>
                  <span style={styles.userName}>{post.author.fullName}</span>
                  <span style={styles.postTime}>
                    {post.timestamp && post.timestamp.toDate
                      ? post.timestamp.toDate().toLocaleString()
                      : "unknown time"}
                  </span>
                </div>
                <p>{post.content}</p>
                {post.type === "match" && (
                  <div style={styles.matchData}>
                    <span style={styles.liveIndicator}>{post.matchStatus}</span>
                    <div style={styles.teams}>
                      <div>
                        {post.teamA} {post.scoreA}
                      </div>
                      <div>
                        {post.teamB} {post.scoreB}
                      </div>
                    </div>
                  </div>
                )}
                {post.type === "news" && post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="News"
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                )}
                <div style={styles.postActions}>
                  <button style={styles.actionButton}>
                    {post.comments ? post.comments.length : 0} Comments
                  </button>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.likes ? post.likes.length : 0} Likes
                  </button>
                </div>
                {post.comments &&
                  post.comments.map((comment, index) => (
                    <div key={index} style={styles.comment}>
                      <strong>{comment.user}: </strong>
                      {comment.content}
                    </div>
                  ))}
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  style={styles.commentInput}
                />
                <button
                  onClick={() => handleComment(post.id)}
                  style={styles.postButton}
                >
                  Comment
                </button>
              </div>
            </div>
          ))}
          {loading && (
            <div style={styles.loadingMore}>Loading More Posts...</div>
          )}
          <div ref={ref} style={{ height: "20px " }}></div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
