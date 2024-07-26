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
  arrayRemove,
  startAfter,
  addDoc,
  serverTimestamp,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  fetchBundesligaNews,
  fetchEPLNews,
  fetchLaLigaNews,
  fetchNewsInfo,
  fetchUCLNews,
} from "../../services/api/getNewsInfo";
import PredictionForm from "../PredictionForm";
import PredictionPost from "../PredictionPost";
import stopwords from "stopwords-en";
import axios from "axios";

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

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [followedLeagues, setFollowedLeagues] = useState([]);
  const [news, setNews] = useState([]);
  const [allContent, setAllContent] = useState([]);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  //UseEffect for fetching leagues and news based on currentUser
  useEffect(() => {
    const fetchUserLeaguesAndNews = async () => {
      if (currentUser) {
        setInitialLoading(true);
        let allNews = [];
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setFollowedLeagues(userData.followedLeagues || []);

            //fetches news for followed leagues
            let newsId = 1;

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
                    id: `news_${newsId++}`, //assigns unique ID to each news item
                    likes: news.likes || [],
                    comments: news.comments || [],
                  })),
                ];
              }
            }
          }
          const newsRef = collection(db, "news");
          const newsSnapshot = await getDocs(newsRef);
          const firestoreNews = newsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          //merge fetched news with firestore data
          allNews = allNews.map((news) => {
            const firestoreItem = firestoreNews.find(
              (item) => item.id === news.id
            );
            return firestoreItem ? { ...news, ...firestoreItem } : news;
          });

          //sorts news by date if needed
          allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
          setNews(allNews.slice(0, 6)); //limiting first render for first 6 articles
        } catch (error) {
          console.error("Error fetching user leagues and news: ", error);
        } finally {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    fetchUserLeaguesAndNews();
  }, [currentUser]);

  //UseEffect for loading posts
  useEffect(() => {
    const sortedContent = [...news, ...posts].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : a.timestamp?.toDate();
      const dateB = b.date ? new Date(b.date) : b.timestamp?.toDate();
      return dateB - dateA;
    });
    setAllContent(sortedContent);
  }, [news, posts]);

  //ALGORITHM FOR LIKING NEWS POSTS
  const handleNewsLike = async (newsItem) => {
    if (!currentUser || !newsItem || !newsItem.id) return;

    try {
      const keywords = extractKeywords(
        newsItem.title + " " + newsItem.description
      );

      const newsRef = doc(db, "news", newsItem.id);
      const newsDoc = await getDoc(newsRef);

      let updatedLikes = [];
      if (!newsDoc.exists()) {
        await setDoc(newsRef, {
          ...newsItem,
          likes: [currentUser.uid],
        });
        updatedLikes = [currentUser.uid];
      } else {
        const currentLikes = newsDoc.data().likes || [];
        updatedLikes = currentLikes.includes(currentUser.uid)
          ? currentLikes.filter((uid) => uid !== currentUser.uid)
          : [...currentLikes, currentUser.uid];

        await updateDoc(newsRef, {
          likes: updatedLikes,
        });
      }

      // Update local state
      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === newsItem.id ? { ...item, likes: updatedLikes } : item
        )
      );

      // Fetch recommended news based on keywords
      setRecommendedLoading(true);
      const newRecommendedNews = await fetchRecommendedNews(keywords);
      setRecommendedLoading(false);
      // Update allContent state with new recommended news
      setAllContent((prevContent) => {
        const existingIds = new Set(prevContent.map((item) => item.id));
        const newContent = [
          ...prevContent,
          ...newRecommendedNews
            .filter((item) => !existingIds.has(item.id))
            .map((item) => ({
              ...item,
              id: item.id || `recommended_${Date.now()}_${Math.random()}`,
              type: "recommended",
              league: item.league || "Unknown",
              likes: [],
              comments: [],
            })),
        ];

        // Sort newContent by date
        return newContent.sort((a, b) => {
          const getDate = (item) => {
            if (item.date) return new Date(item.date);
            if (item.timestamp?.toDate) return item.timestamp.toDate();
            if (item.timestamp && typeof item.timestamp === "object")
              return item.timestamp;
            if (item.clientTimestamp) return new Date(item.clientTimestamp);
            return new Date(0); // fallback to epoch time if no valid date found
          };
          return getDate(b) - getDate(a);
        });
      });

      await updateWordWeights(newsItem);
    } catch (error) {
      console.error("Error in handleNewsLike: ", error);
      setRecommendedLoading(false);
    }
  };

  //ALGORITHM FOR COMMENTING ON NEWS POSTS
  const handleNewsComment = async (newsItem, commentText) => {
    if (!currentUser || !newsItem || !newsItem.id) return;
    try {
      const newsRef = doc(db, "news", newsItem.id);

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userFullName = userDoc.exists()
        ? userDoc.data().fullName
        : "Unknown User";

      // create a new comment without serverTimestamp
      const newComment = {
        user: currentUser.uid,
        userFullName: userFullName,
        content: commentText,
        timestamp: new Date().toISOString(),
      };

      // first get the current document
      const newsDoc = await getDoc(newsRef);

      if (!newsDoc.exists()) {
        // if the document doesn't exist, create it
        await setDoc(newsRef, {
          ...newsItem,
          comments: [newComment],
        });
      } else {
        // if it exists, update it
        await updateDoc(newsRef, {
          comments: arrayUnion(newComment),
        });
      }

      // Update local state
      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === newsItem.id
            ? {
                ...item,
                comments: [...(item.comments || []), newComment],
              }
            : item
        )
      );

      // update allContent state
      setAllContent((prevContent) =>
        prevContent.map((item) =>
          item.id === newsItem.id
            ? {
                ...item,
                comments: [...(item.comments || []), newComment],
              }
            : item
        )
      );
      updateWordWeights(newsItem);
    } catch (error) {
      console.error("Error in handleNewsComment: ", error);
    }
  };

  //ALGORITHM FOR LIKING POSTS
  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, "news", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const likes = postData.likes || [];
        const updatedLikes = likes.includes(currentUser.uid)
          ? likes.filter((uid) => uid !== currentUser.uid)
          : [...likes, currentUser.uid];

        await updateDoc(postRef, {
          likes: updatedLikes,
        });

        setAllContent((prevContent) =>
          prevContent.map((item) =>
            item.id === postId
              ? { ...item, likes: [...Feed(item.likes || []), currentUser.uid] }
              : item
          )
        );
      } else {
        console.error("Post not found");
      }

      const likedPost = allContent.find((post) => post.id === postId);
      if (likedPost) {
        const relatedPostsQuery = query(
          collection(db, "posts"),
          where("gameId", "==", likedPost.gameId),
          limit(5)
        );
        const relatedSnapshot = await getDocs(relatedPostsQuery);
        const relatedPosts = relatedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllContent((prevContent) => [...prevContent, ...relatedPosts]);
      }
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };
  //ALGORITHM FOR COMMENTING ON POSTS
  const handleComment = async (postId, commentText) => {
    if (commentText.trim() === "") return;

    const postRef = doc(db, "posts", postId);
    const newComment = {
      user: currentUser.uid,
      content: commentText,
      timestamp: serverTimestamp(),
    };

    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });

    setAllContent((prevContent) =>
      prevContent.map((item) =>
        item.id === postId
          ? { ...item, comments: [...Feed(item.comments || []), newComment] }
          : item
      )
    );
  };

  const PostCard = ({ newsItem, onLike, onComment }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");

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
        <div style={styles.postActions}>
          <button onClick={() => onLike(newsItem)} style={styles.actionButton}>
            {newsItem.likes ? newsItem.likes.length : 0} Likes
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            style={styles.actionButton}
          >
            {newsItem.comments ? newsItem.comments.length : 0} Comments
          </button>
        </div>
        {showComments && (
          <div>
            {newsItem.comments && newsItem.comments.length > 0 ? (
              newsItem.comments.map((comment, index) => (
                <div key={index} style={styles.comment}>
                  <strong>{comment.userFullName}: </strong>
                  {comment.content}
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={styles.commentInput}
            />
            <button
              onClick={() => {
                onComment(newsItem, newComment);
                setNewComment("");
              }}
              style={styles.postButton}
            >
              Comment
            </button>
          </div>
        )}
      </div>
    );
  };

  const handlePredictionPost = async (newPrediction) => {
    try {
      const currentDate = new Date();
      const userDoc = await getDoc(doc(db, "users", newPrediction.userId));
      const userFullName = userDoc.exists()
        ? userDoc.data().fullName
        : "Unknown user";

      const predictionWithName = {
        ...newPrediction,
        userFullName,
        timestamp: serverTimestamp(),
        clientTimestamp: currentDate,
        likes: [],
      };

      const docRef = await addDoc(collection(db, "posts"), predictionWithName);

      setAllContent((prevContent) => {
        const newItem = Object.assign({}, predictionWithName, {
          id: docRef.id,
          timestamp: currentDate,
        });
        return [newItem].concat(prevContent);
      });
    } catch (error) {
      console.error("Error posting prediction: ", error);
    }
  };

  const extractKeywords = (text) => {
    const words = text.toLowerCase().split(/\W+/);
    return words.filter((word) => word && !stopwords.includes(word));
  };

  const fetchRecommendedNews = async (keywords) => {
    try {
      console.log("Fetching recommended news with keywords:", keywords);
      const response = await axios.post(
        "http://localhost:3002/news/recommended",
        {
          keywords: keywords,
          userId: currentUser.uid,
        }
      );

      // Remove duplicates based on article URL
      const uniqueNews = Array.from(
        new Set(response.data.map((article) => article.url))
      ).map((url) => response.data.find((article) => article.url === url));

      console.log("Received unique recommended news:", uniqueNews);
      return uniqueNews;
    } catch (error) {
      console.error("Error fetching recommended news:", error);
      return [];
    }
  };

  const updateWordWeights = async (newsItem) => {
    try {
      const keywords = extractKeywords(
        newsItem.title + " " + newsItem.description
      );
      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        preferredKeywords: arrayUnion(...keywords),
      });

      const wordWeightsRef = doc(db, "wordWeights", "latest");
      await runTransaction(db, async (transaction) => {
        const wordWeightsDoc = await transaction.get(wordWeightsRef);
        const currentWeights = wordWeightsDoc.exists()
          ? wordWeightsDoc.data()
          : {};

        keywords.forEach((word) => {
          currentWeights[word] = (currentWeights[word] || 0) + 1;
        });

        transaction.set(wordWeightsRef, currentWeights);
      });
    } catch (error) {
      console.error("Error updating word weights:", error);
    }
  };

  return (
    <div style={styles.app}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.feed}>
          <PredictionForm onPredictionPost={handlePredictionPost} />

          {initialLoading ? (
            <div style={styles.loadingMore}>Loading initial content...</div>
          ) : (
            <>
              {allContent.map((item, index) => {
                if (item.league) {
                  // This is a news item
                  return (
                    <PostCard
                      key={`news-${item.id}-${index}`}
                      newsItem={item}
                      onLike={handleNewsLike}
                      onComment={handleNewsComment}
                      styles={styles}
                    />
                  );
                } else if (item.type === "prediction") {
                  return (
                    <PredictionPost
                      key={`prediction-${item.id}-${index}`}
                      prediction={item}
                      onLike={handleLike}
                      onComment={handleComment}
                      styles={styles}
                      userFullName={item.userFullName}
                    ></PredictionPost>
                  );
                } else if (item.league || item.type === "recommended") {
                  return (
                    <PostCard
                      key={`news-${item.id}-${index}`}
                      newsItem={item}
                      onLike={handleNewsLike}
                      onComment={handleNewsComment}
                      styles={styles}
                    ></PostCard>
                  );
                } else {
                  // This is a post
                  return (
                    <div key={`post-${item.id}-${index}`} style={styles.post}>
                      <div style={styles.postContent}>
                        <div style={styles.postHeader}>
                          <span style={styles.userName}></span>
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

              {recommendedLoading && (
                <div style={styles.loadingMore}>
                  Loading recommended content...
                </div>
              )}
            </>
          )}

          {loading && (
            <div style={styles.loadingMore}>Loading More Posts...</div>
          )}
          <div ref={ref} style={{ height: "20px" }}></div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
