import React, { useState } from "react";

const PostCard = ({ newsItem, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const styles = {
    postCard: {
      backgroundColor: "#f0f0f0",
      borderRadius: "8px",
      padding: "15px",
      marginBottom: "15px",
    },
    postTitle: {
      fontSize: "18px",
      marginBottom: "10px",
    },
    postLeague: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "10px",
    },
    postDescription: {
      fontSize: "16px",
      marginBottom: "10px",
    },
    postLink: {
      color: "#0066cc",
      textDecoration: "none",
    },
    postActions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "10px",
    },
    actionButton: {
      background: "none",
      border: "none",
      color: "#0066cc",
      cursor: "pointer",
    },
    comment: {
      backgroundColor: "#e6e6e6",
      borderRadius: "4px",
      padding: "5px",
      marginBottom: "5px",
    },
    commentInput: {
      width: "100%",
      padding: "5px",
      marginBottom: "5px",
    },
    postButton: {
      backgroundColor: "#0066cc",
      color: "white",
      border: "none",
      padding: "5px 10px",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };

  return (
    <div>
      <div style={styles.postCard}>
        <h3 style={styles.postTitle}>{newsItem.title}</h3>
        <p style={styles.postLeague}>{newsItem.league.toUpperCase()}</p>
        <p style={styles.postDescription}>{newsItem.description}</p>
        <a>
          href={newsItem.url}
          target="_blank" rel="noopener noreferrer" style={styles.postLink}
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
                  <strong>{comment.user}: </strong>
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
    </div>
  );
};

export default PostCard;
