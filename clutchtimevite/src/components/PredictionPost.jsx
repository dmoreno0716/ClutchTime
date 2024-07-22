import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const PredictionPost = ({
  prediction,
  onLike,
  onComment,
  styles,
  userFullName,
}) => {
  const [newComment, setNewComment] = useState("");

  const formatDate = (timestamp) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    } else if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString();
    } else {
      return "Unknown time";
    }
  };

  return (
    <div style={styles.post}>
      <div style={styles.postContent}>
        <div style={styles.postHeader}>
          <span style={styles.userName}>{userFullName || "Unknown User"}</span>
          <span style={styles.postTime}>
            {formatDate(prediction.timestamp)}
          </span>
        </div>
        <p>
          Prediction: {prediction.homeTeam} {prediction.predictedHomeScore} -{" "}
          {prediction.predictedAwayScore} {prediction.awayTeam}
        </p>
        <div style={styles.postActions}>
          <button
            style={styles.actionButton}
            onClick={() => onLike(prediction.id)}
          >
            {prediction.likes ? prediction.likes.length : 0} Likes
          </button>
          <button style={styles.actionButton}>
            {prediction.comments ? prediction.comments.length : 0} Comments
          </button>
        </div>
        {prediction.comments &&
          prediction.comments.map((comment, commentIndex) => (
            <div key={commentIndex} style={styles.comment}>
              <strong>{comment.user}: </strong>
              {comment.content}
            </div>
          ))}
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          style={styles.commentInput}
        />
        <button
          onClick={() => {
            onComment(prediction.id, newComment);
            setNewComment("");
          }}
          style={styles.postButton}
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default PredictionPost;
