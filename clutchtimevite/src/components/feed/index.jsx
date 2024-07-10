import React, { useState } from "react";
import Sidebar from "../Sidebar";

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
};

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: "Designsta",
      username: "@inner",
      content: "Twitterdagi ayol-erkak qarama-qarshiliginlardan o",
      time: "25m",
      likes: 8,
      comments: 10,
      retweets: 1,
    },
    {
      id: 2,
      user: "cloutexhibition",
      username: "@RajLaboti",
      content: "YPIP dasturining bu yilgi sezoni ham o",
      time: "22m",
      likes: 4,
      comments: 0,
      retweets: 5,
    },
    {
      id: 3,
      user: "CreativePhoto",
      username: "@cloutexhibition",
      content: "Real Madrid will win 2-0 against Barca!!",
      time: "1h",
      likes: 9,
      comments: 0,
      retweets: 5,
      matchData: {
        status: "LIVE",
        teamA: "Australia",
        teamB: "England",
        scoreA: 2,
        scoreB: 0,
      },
    },
  ]);

  const [prediction, setPrediction] = useState("");

  const [transfers, setTransfers] = useState([
    {
      id: 1,
      title: "Results And Scores From The Premier League...!!",
      time: "5 Hours Ago",
    },
    {
      id: 2,
      title: "Here Are The Top 100 Players And Managers",
      time: "11 Oct 2023, 06:00 AM",
    },
    {
      id: 3,
      title: "Results And Scores From The Premier League...!!",
      time: "10 Oct 2023, 08:00 PM",
    },
    {
      id: 4,
      title: "Join Or Start A Competition Now!",
      time: "10 Oct 2023, 02:40 PM",
    },
  ]);

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handlePredictionChange = (e) => {
    setPrediction(e.target.value);
  };

  const handlePostPrediction = () => {
    if (prediction.trim() !== "") {
      const newPost = {
        id: posts.length + 1,
        user: "John Doe", // Replace with actual user name
        username: "@johndoe", // Replace with actual username
        content: prediction,
        time: "Just now",
        likes: 0,
        comments: 0,
        retweets: 0,
      };
      setPosts([newPost, ...posts]);
      setPrediction("");
    }
  };

  return (
    <div style={styles.app}>
      <Sidebar />
      <div style={styles.mainContent}>
        <div style={styles.feed}>
          <div style={styles.createPost}>
            <h2>Home</h2>
            <input
              type="text"
              value={prediction}
              onChange={handlePredictionChange}
              placeholder="Make a prediction..."
              style={styles.predictionInput}
            />
            <button onClick={handlePostPrediction} style={styles.postButton}>
              Post Prediction
            </button>
          </div>
          {posts.map((post) => (
            <div key={post.id} style={styles.post}>
              <img
                src={`https://via.placeholder.com/40`}
                alt={post.user}
                style={styles.avatar}
              />
              <div style={styles.postContent}>
                <div style={styles.postHeader}>
                  <span style={styles.userName}>{post.user}</span>
                  <span style={styles.userHandle}>{post.username}</span>
                  <span style={styles.postTime}>{post.time}</span>
                </div>
                <p>{post.content}</p>
                {post.matchData && (
                  <div style={styles.matchData}>
                    <span style={styles.liveIndicator}>LIVE</span>
                    <div style={styles.teams}>
                      <div>
                        {post.matchData.teamA} {post.matchData.scoreA}
                      </div>
                      <div>
                        {post.matchData.teamB} {post.matchData.scoreB}
                      </div>
                    </div>
                  </div>
                )}
                <div style={styles.postActions}>
                  <button style={styles.actionButton}>
                    {post.comments} Comments
                  </button>
                  <button style={styles.actionButton}>
                    {post.retweets} Retweets
                  </button>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.likes} Likes
                  </button>
                  <button style={styles.actionButton}>Share</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.rightSidebar}>
        <div>
          <input
            type="text"
            placeholder="Search Feed..."
            style={styles.searchBar}
          />
        </div>
        <div style={styles.transfers}>
          <h3>My Teams Transfers</h3>
          {transfers.map((transfer) => (
            <div key={transfer.id} style={styles.transferItem}>
              <h4 style={styles.transferTitle}>{transfer.title}</h4>
              <span style={styles.transferTime}>{transfer.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
