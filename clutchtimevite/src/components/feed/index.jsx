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
import PredictionForm from "../PredictionForm";
import PredictionPost from "../PredictionPost";
import stopwords from "stopwords-en";

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
  const [feedArticles, setFeedArticles] = useState([]);
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comment, setComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
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

      setLoading(true);
      const postsRef = collection(db, "posts");

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setLoading(false);
          return;
        }
        const userData = userDocSnap.data();
        const following = userData.followingUsers || [];

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
    setAllContent(sortedContent);
  }, [news, posts]);

  const handleNewsLike = async (newsItem) => {
    const keywords = extractKeywords(
      newsItem.title + " " + newsItem.description
    );

    if (!currentUser || !newsItem || !newsItem.id) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const newsRef = doc(db, "news", newsItem.id);
      const newsDoc = await getDoc(newsRef);

      //stores keywords
      await updateDoc(userRef, {
        preferredKeywords: arrayUnion(...keywords),
      });

      let currentLikes = [];
      if (!newsDoc.exists()) {
        // if the document doesn't exist, create it
        await setDoc(newsRef, {
          ...newsItem,
          likes: [currentUser.uid],
        });
        currentLikes = [currentUser.uid];
      } else {
        currentLikes = newsDoc.data().likes || [];
      }

      const userIndex = currentLikes.indexOf(currentUser.uid);
      let updatedLikes;
      if (userIndex > -1) {
        // user already liked, so unlike
        updatedLikes = currentLikes.filter((uid) => uid !== currentUser.uid);
      } else {
        // user hasn't liked, so add like
        updatedLikes = [...currentLikes, currentUser.uid];
      }

      // update Firestore
      await updateDoc(newsRef, {
        likes: updatedLikes,
      });
      // update local state
      setNews((prevNews) => {
        const newNews = prevNews.map((item) =>
          item.id === newsItem.id ? { ...item, likes: updatedLikes } : item
        );
        return newNews;
      });

      // fetch related news
      const relatedNewsQuery = query(
        collection(db, "news"),
        where("league", "==", newsItem.league),
        limit(5)
      );
      const relatedSnapshot = await getDocs(relatedNewsQuery);
      const relatedNews = relatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update allContent
      setAllContent((prevContent) => {
        const updatedContent = prevContent.map((item) =>
          item.id === newsItem.id ? { ...item, likes: updatedLikes } : item
        );
        relatedNews.forEach((relatedItem) => {
          if (!updatedContent.some((item) => item.id === relatedItem.id)) {
            updatedContent.push(relatedItem);
          }
        });
        const sortedContent = updatedContent.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : a.timestamp?.toDate();
          const dateB = b.date ? new Date(b.date) : b.timestamp?.toDate();
          return dateB - dateA;
        });
        return sortedContent;
      });
    } catch (error) {
      console.error("Error in handleNewsLike: ", error);
    }
  };

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
    } catch (error) {
      console.error("Error in handleNewsComment: ", error);
    }
  };

  const fetchRecommendedNews = async () => {
    const allNewsPosts = await fetchAllNewsPosts();

    const userRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userKeywords = userDoc.exists()
      ? userDoc.data().preferredKeywords || []
      : [];

    const rankedNews = allNewsPosts.map((newsPost) => ({
      ...newsPost,
      score: calculateRanking(newsPost, userKeywords, currentUser.uid),
    }));

    rankedNews.sort((a, b) => b.score - a.score);
    return rankedNews.slice(0, 3); // returns top 3 recommended news posts
  };

  useEffect(() => {
    const combineContent = async () => {
      let recommendedNews = [];
      if (news.length > 0) {
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

    setAllContent((prevContent) =>
      prevContent.map((item) =>
        item.id === postId
          ? { ...item, likes: [...Feed(item.likes || []), currentUser.uid] }
          : item
      )
    );

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
  };

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
    try {
      const docRef = await addDoc(collection(db, "news"), {
        title: newsData.title,
        content: newsData.content,
        league: newsData.league,
        date: serverTimestamp(),
        likes: [],
        comments: [],
      });

      await updateDoc(docRef, {
        id: docRef.id,
      });
    } catch (error) {
      console.error("error adding document: ", error);
    }
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

  const handlePredictionPost = (newPrediction) => {
    setAllContent((prevContent) => [newPrediction, ...prevContent]);
  };

  const extractKeywords = (text) => {
    const words = text.toLowerCase().split(/\W+/); //converts text to lowercas and splits into words

    return words.filter((word) => word && !stopwords.includes(word)); //filters out stopwords and empty string
  };

  const calculateRanking = (article, userKeywords, currentUserId) => {
    //calculates keyword score
    const articleKeywords = extractKeywords(
      article.title + " " + article.description
    );
    const keywordScore = articleKeywords.filter((keyword) =>
      userKeywords.includes(keyword)
    ).length;

    //calculates user action score
    const likeWeight = article.likes.includes(currentUserId) ? 1 : 0;
    const commentWeight =
      article.comments.filter((comment) => comment.user === currentUserId)
        .length * 5;
    const actionScore = likeWeight + commentWeight;

    //combine scores
    const totalScore = keywordScore * 2 + actionScore;
    return totalScore;
  };

  const getRecommendations = async (
    userId,
    newsPosts,
    numRecommendations = 5
  ) => {
    //fetches user profile from firebase
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    const userKeywords = userDoc.data().preferredKeywords || [];

    const scores = newsPosts.map((newsPost) => ({
      ...newsPost,
      score: calculateRanking(newsPost, userKeywords, userId),
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, numRecommendations);
  };

  const fetchAllNewsPosts = async () => {
    try {
      const newsRef = collection(db, "news");
      const snapshot = await getDocs(newsRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      "Error fetching news posts: ", error;
      return [];
    }
  };

  const RecommendedNewsPosts = ({ userId }) => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
      const fetchRecommendations = async () => {
        const allNewsPosts = await fetchAllNewsPosts();
        const recommendedNewsPosts = await getRecommendations(
          userId,
          allNewsPosts
        );
        setRecommendations(recommendedNewsPosts);
      };
      fetchRecommendations();
    }, [userId]);

    return (
      <div>
        {recommendations.map((newsPost) => (
          <PostCard
            key={newsPost.id}
            newsItem={newsPost}
            onLike={handleNewsLike}
            onComment={handleNewsComment}
          />
        ))}
      </div>
    );
  };

  const fetchFeedNewsPosts = async () => {
    const allNewsPosts = await fetchAllNewsPosts();
    const recommendedNewsPosts = await getRecommendations(
      currentUser.uid,
      allNewsPosts
    );
    setNews(recommendedNewsPosts);
  };

  return (
    <div style={styles.app}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.feed}>
          <PredictionForm
            onPredictionPost={handlePredictionPost}
          ></PredictionForm>
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
            } else if (item.predictedHomeScore !== undefined) {
              return (
                <PredictionPost
                  key={`prediction-${item.id}-${index}`}
                  prediction={item}
                  onLike={handleLike}
                  onComment={handleComment}
                  styles={styles}
                ></PredictionPost>
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
