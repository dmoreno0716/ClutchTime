const PostCard = ({ newsItem, onLike, onComment, styles }) => {
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
      fontSize: "18px",
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
  };

  //   const handleNewsLike = async (newsItem) => {
  //     const updatedNews = news.map((item) =>
  //       item.id === newsItem.id
  //         ? { ...item, likes: [...item.likes, currentUser.uid] }
  //         : item
  //     );
  //     setNews(updatedNews);

  //update to database
  // };

  //   const handleNewsComment = async (newsItem, comment) => {
  //     const updatedNews = news.map((item) =>
  //       item.id === newsItem.id
  //         ? {
  //             ...item,
  //             comments: [
  //               ...item.comments,
  //               { user: currentUser.uid, content: comment },
  //             ],
  //           }
  //         : item
  //     );
  //     setNews(updatedNews);
  //update to database
  // };

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
        <button
          onClick={() => setShowComments(!showComments)}
          style={styles.actionButton}
        >
          {newsItem.comments.length} Comments
        </button>
      </div>
      {showComments && (
        <div>
          {newsItem.comments.map((comment, index) => (
            <div key={index} style={styles.comment}>
              <strong>{comment.user}: </strong> {comment.content}
            </div>
          ))}
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={styles.commentInput}
          ></input>
          <button
            onClick={() => {
              handleNewsComment(newsItem, newComment);
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
