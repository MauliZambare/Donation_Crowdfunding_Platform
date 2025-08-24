import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Home.css";

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

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
    Swal.fire("Donate", `Donation flow for campaign ID: ${campaignId}`, "info");
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

      <div className="campaign-grid">
        {campaigns.map((c) => (
          <div key={c.id} className="campaign-card">
            <div className="campaign-image">
              {c.image && <img src={`http://localhost:8080${c.image}`} alt={c.title} />}
              <div className="campaign-category">Education</div>
            </div>
            
            <div className="card-content">
              <div className="campaign-header">
                <h3>{c.title}</h3>
                <div className="campaign-stats">
                  <span className="raised">₹{c.raisedAmount || 0}</span>
                  <span className="target">raised of ₹{c.targetAmount}</span>
                </div>
              </div>
              
              <p className="campaign-description">{c.description}</p>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, ((c.raisedAmount || 0) / c.targetAmount) * 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {Math.min(100, Math.round(((c.raisedAmount || 0) / c.targetAmount) * 100))}% funded
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
              
              {loggedInUser?.userType?.toLowerCase() === "donor" && (
                <button className="donate-btn" onClick={() => handleDonate(c.id)}>
                  <i className="icon-heart"></i>
                  Donate Now
                </button>
              )}
              
              <div className="comments-section">
                <h4>Comments ({comments[c.id]?.length || 0})</h4>
                
                <div className="comments-list">
                  {comments[c.id]?.map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <strong>{comment.user}</strong>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;