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
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  fetchBundesligaNews,
  fetchEPLNews,
  fetchLaLigaNews,
  fetchNewsInfo,
  fetchUCLNews,
} from "../../services/api/getNewsInfo";
import PostCard from "../PostCard";

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
  postCard: {
    backgroundColor: "#192734",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "15px",
    borderBottom: "1px solid #38444d",
  },
  postTitle: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#ffffff",
  },
  postLeague: {
    fontSize: "14px",
    color: "#8899a6",
    marginBottom: "10px",
  },
  postDescription: {
    fontSize: "16px",
    marginBottom: "10px",
    color: "#ffffff",
  },
  postLink: {
    color: "#1DA1F2",
    textDecoration: "none",
  },

  comment: {
    backgroundColor: "#22303c",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "10px",
  },
  commentInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #38444d",
    backgroundColor: "#253341",
    color: "white",
    marginBottom: "10px",
  },
};

const Feed = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState("");
  const [lastVisible, setLastVisible] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [followedLeagues, setFollowedLeagues] = useState([]);
  const [news, setNews] = useState([]);
  const [allContent, setAllContent] = useState([]);


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

        const fetchedPosts = await Promise.all(
          querySnapshot.docs.map(async (postDoc) => {
            const postData = postDoc.data();

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
  useEffect(() => {
    const fetchUserLeaguesAndNews = async () => {
      if (currentUser) {
        let allNews = [];
        try {
          //fetches users followed leagues
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setFollowedLeagues(userData.followedLeagues || []);

            //fetches news for followed leagues

            for (const league of userData.followedLeagues) {
              let leagueNews;
              switch (league) {
                case "laliga":
                  leagueNews = await fetchLaLigaNews();
                  break;
                case "epl":
                  leagueNews = await fetchEPLNews();
                  break;
                case "bundesliga":
                  leagueNews = await fetchBundesligaNews();
                  break;
                case "ucl":
                  leagueNews = await fetchUCLNews();
                  break;
                default:
                  break;
              }

              if (leagueNews) {
                allNews = [
                  ...allNews,
                  ...leagueNews.map((news) => ({
                    ...news,
                    league,
                    likes: news.likes || [],
                    comments: news.comments || [],
                  })),
                ];
              }
            }
          }
          console.log("fetched news: ", allNews);
          //sorts news by date if needed
          allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
          setNews(allNews.slice(0, 6)); //limiting first render for first 6 articles
        } catch (error) {
          console.error("Error fetching user leagues and news: ", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserLeaguesAndNews();
  }, [currentUser]);

  useEffect(() => {
    const sortedContent = [...news, ...posts].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : a.timestamp?.toDate();
      const dateB = b.date ? new Date(b.date) : b.timestamp?.toDate();
      return dateB - dateA;
    });
    console.log("sorted content: ", sortedContent);
    setAllContent(sortedContent);
  }, [news, posts]);

  const handleNewsLike = async (newsItem) => {
    if (!currentUser) return; //ensures user is logged in

    const newsRef = doc(db, "news", newsItem.id);
    const userRef = doc(db, "users", currentUser.uid);

    try {
      //updates database
      await updateDoc(newsRef, {
        likes: arrayUnion(currentUser.uid),
      });

      await updateDoc(userRef, {
        likedNews: arrayUnion(newsItem.id),
      });

      //updates local state
      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === newsItem.id
            ? { ...item, likes: [...(item.likes || []), currentUser.uid] }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };

  const handleNewsComment = async (newsItem, commentText) => {
    if (!currentUser) return; //same as before, ensures users logged in

    const newsRef = doc(db, "news", newsItem.id);
    const userRef = doc(db, "users", currentUser.uid);

    const newComment = {
      user: currentUser.uid,
      content: commentText,
      timestamp: serverTimestamp(),
    };

    try {
      //updates database
      await updateDoc(newsRef, {
        comments: arrayUnion(newComment),
      });

      await updateDoc(userRef, {
        commentedNews: arrayUnion(newsItem.id),
      });

      //update localstate
      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === newsItem.id
            ? {
                ...item,
                comments: [
                  ...Feed(item.comments || []),
                  { ...newComment, timestamp: new Date() },
                ],
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const calculateWeight = (newsItem) => {
    const likeWeight = newsItem.likes.includes(currentUser.uid) ? 1 : 0;
    const commentWeight =
      newsItem.comments.filter((comment) => comment.user === currentUser.uid)
        .length * 5;
    return likeWeight + commentWeight;
  };

  const fetchRecommendedNews = async () => {
    //fetch from backend
    const newsRef = collection(db, "news");
    const newsSnapshot = await getDocs(newsRef);
    const allNews = newsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const weightedNews = allNews.map((item) => ({
      ...item,
      weight: calculateWeight(item),
    }));
    weightedNews.sort((a, b) => b.weight - a.weight);
    return weightedNews.slice(0, 3); // returns top 3 recommended articles
  };

  useEffect(() => {
    const combineContent = async () => {
      let recommendedNews = [];
      if (news.some((item) => calculateWeight(item) > 0)) {
        recommendedNews = await fetchRecommendedNews();
      }
      const sortedContent = [...news, ...recommendedNews, ...posts].sort(
        (a, b) => {
          const dateA = a.date ? new Date(a.date) : a.timestamp?.toDate();
          const dateB = b.date ? new Date(b.date) : b.timestamp?.toDate();
          return dateB - dateA;
        }
      );
      setAllContent(sortedContent);
    };

    combineContent();
  }, [news, posts]);

  //ALGORITHM FOR LIKING POSTS
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

  const PostCard = ({ newsItem }) => {
    return (
      <div style={styles.postCard}>
        <h3 style={styles.postTitle}>{newsItem.title}</h3>
        <p style={styles.postLeague}>{newsItem.league.toUpperCase()}</p>
        <p style={styles.postDescription}>{newsItem.description}</p>
        <a
          href={newsItem.url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.postLink}
        >
          Read more
        </a>
      </div>
    );
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

  const saveNewsItem = async (newsData) => {
    await addDoc(collection(db, "news"), {
      title: newsData.title,
      content: newsData.content,
      league: newsData.league,
      date: serverTimestamp(),
      likes: [],
      comments: [],
    });
  };

  const createUserDocument = async (user) => {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      fullName: user.fullName,
      followedLeagues: [],
      likedNews: [],
      commentedNews: [],
    });
  };

  return (
    <div style={styles.app}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.feed}>
          {allContent.map((item, index) => {
            if (item.league) {
              // This is a news item
              return (
                <PostCard
                  key={`news-${index}`}
                  newsItem={item}
                  onLike={handleNewsLike}
                  onComment={handleNewsComment}
                  styles={styles}
                />
              );
            } else {
              // This is a post
              return (
                <div key={`post-${item.id}`} style={styles.post}>
                  <img
                    src={
                      item.author.profileImg || `https://via.placeholder.com/40`
                    }
                    alt={item.author.fullName}
                    style={styles.avatar}
                  />
                  <div style={styles.postContent}>
                    <div style={styles.postHeader}>
                      <span style={styles.userName}>
                        {item.author.fullName}
                      </span>
                      <span style={styles.postTime}>
                        {item.timestamp && item.timestamp.toDate
                          ? item.timestamp.toDate().toLocaleString()
                          : "unknown time"}
                      </span>
                    </div>
                    <p>{item.content}</p>
                    {item.type === "match" && (
                      <div style={styles.matchData}>
                        <span style={styles.liveIndicator}>
                          {item.matchStatus}
                        </span>
                        <div style={styles.teams}>
                          <div>
                            {item.teamA} {item.scoreA}
                          </div>
                          <div>
                            {item.teamB} {item.scoreB}
                          </div>
                        </div>
                      </div>
                    )}
                    {item.type === "news" && item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt="News"
                        style={{ width: "100%", borderRadius: "10px" }}
                      />
                    )}
                    <div style={styles.postActions}>
                      <button style={styles.actionButton}>
                        {item.comments ? item.comments.length : 0} Comments
                      </button>
                      <button
                        style={styles.actionButton}
                        onClick={() => handleLike(item.id)}
                      >
                        {item.likes ? item.likes.length : 0} Likes
                      </button>
                    </div>
                    {item.comments &&
                      item.comments.map((comment, commentIndex) => (
                        <div key={commentIndex} style={styles.comment}>
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
                      onClick={() => handleComment(item.id)}
                      style={styles.postButton}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              );
            }
          })}

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
