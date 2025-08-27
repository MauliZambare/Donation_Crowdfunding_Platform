import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Home.css";

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser) {
      window.location.href = "/login";
    } else {
      fetchCampaigns();
    }
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/campaigns");
      setCampaigns(res.data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const handleDonate = (campaignId) => {
    navigate('/payment')
  };

  const handleCommentSubmit = (campaignId) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      text: newComment,
      user: loggedInUser.name,
      timestamp: new Date().toLocaleString(),
    };

    setComments(prev => ({
      ...prev,
      [campaignId]: [...(prev[campaignId] || []), comment]
    }));

    setNewComment("");
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Sample gallery images for demonstration

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">Support Meaningful Causes</h1>
        <p className="home-subtitle">Discover campaigns making a difference in communities worldwide</p>
      </div>
      
      <div className="campaigns-header">
        <h2>Featured Campaigns</h2>
        <div className="filter-options">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Education</button>
          <button className="filter-btn">Healthcare</button>
          <button className="filter-btn">Environment</button>
        </div>
      </div>

      <div className="instagram-feed">
        {campaigns.map((c) => (
          <div key={c.id} className="post-card">
            <div className="post-header">
              <div className="poster-info">
                <div className="poster-avatar">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80" alt="Avatar" />
                </div>
                <div className="poster-details">
                  <h4>{c.organization || "Campaign Organizer"}</h4>
                  <span>2 days ago</span>
                </div>
              </div>
              <button className="more-options">⋯</button>
            </div>

            <div className="post-image">
              {c.image ? (
                <img 
                  src={`http://localhost:8080${c.image}`} 
                  alt={c.title}
                  onClick={() => openImageModal(`http://localhost:8080${c.image}`)}
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Default campaign"
                  onClick={() => openImageModal("https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80")}
                />
              )}
            </div>

            <div className="post-actions">
              <div className="action-buttons">
                <button className="action-btn">
                  <i className="icon-heart"></i>
                </button>
                <button className="action-btn">
                  <i className="icon-comment"></i>
                </button>
                <button className="action-btn">
                  <i className="icon-share"></i>
                </button>
              </div>
              <button className="action-btn">
                <i className="icon-bookmark"></i>
              </button>
            </div>

            <div className="post-likes">
              <p>Liked by <strong>user123</strong> and <strong>245 others</strong></p>
            </div>

            <div className="post-caption">
              <p><strong>{c.organization || "Organization"}</strong> {c.title}</p>
            </div>

            <div className="post-details">
              <div className="progress-container">
                <div className="progress-text">
                  <span>₹{c.raisedAmount || 0} raised of ₹{c.targetAmount}</span>
                  <span>{Math.min(100, Math.round(((c.raisedAmount || 0) / c.targetAmount) * 100))}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, ((c.raisedAmount || 0) / c.targetAmount) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="campaign-meta">
                <div className="meta-item">
                  <i className="icon-calendar"></i>
                  <span>{c.deadline ? new Date(c.deadline).toLocaleDateString() : "No deadline"}</span>
                </div>
                <div className="meta-item">
                  <i className="icon-users"></i>
                  <span>{c.donors || 0} donors</span>
                </div>
              </div>
            </div>

            <div className="post-comments">
              <h4>Comments ({comments[c.id]?.length || 0})</h4>
              
              <div className="comments-list">
                {comments[c.id]?.slice(0, 2).map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <strong>{comment.user}</strong>
                      <span className="comment-time">{comment.timestamp}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))}
                {comments[c.id]?.length > 2 && (
                  <button className="view-all-comments">View all {comments[c.id]?.length} comments</button>
                )}
              </div>
              
              <div className="comment-form">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={() => handleCommentSubmit(c.id)}>
                  <i className="icon-send"></i>
                </button>
              </div>
            </div>

            {loggedInUser?.userType?.toLowerCase() === "donor" && (
              <div className="donate-section">
                <button className="donate-btn" onClick={() => handleDonate(c.id)}>
                  <i className="icon-heart"></i>
                  Donate Now
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeImageModal}>×</button>
            <img src={selectedImage} alt="Enlarged view" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;