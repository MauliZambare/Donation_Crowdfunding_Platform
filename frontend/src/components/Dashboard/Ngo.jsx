import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ImageUpload from "../ImageUpload/ImageUpload";
import { createCampaign, deleteCampaign, getCampaigns } from "../../services/api";
import "./Ngo.css";

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";

const Ngo = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
    imageUrl: "",
  });
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!loggedInUser || loggedInUser.userType?.toLowerCase() !== "ngo") {
      window.location.href = "/login";
    } else {
      fetchMyCampaigns();
    }
  }, []);

  const fetchMyCampaigns = async () => {
    try {
      const res = await getCampaigns();
      console.log("NGO campaigns API response:", res.data);
      const myCampaigns = res.data.filter((campaign) => campaign.creatorId === loggedInUser.id);
      myCampaigns.forEach((campaign) => console.log("NGO campaign item:", campaign));
      setCampaigns(myCampaigns);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch campaigns: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        targetAmount: Number(formData.targetAmount),
        deadline: formData.deadline,
        creatorId: loggedInUser.id,
        imageUrl: formData.imageUrl,
      };
      console.log("Create campaign payload:", payload);
      const response = await createCampaign(payload);
      console.log("Create campaign response:", response.data);

      Swal.fire("Success", "Campaign posted!", "success");
      setFormData({ title: "", description: "", targetAmount: "", deadline: "", imageUrl: "" });
      setShowForm(false);
      fetchMyCampaigns();
    } catch (err) {
      Swal.fire("Error", "Failed to post campaign: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCampaign(id);
      Swal.fire("Deleted!", "Campaign deleted successfully", "success");
      fetchMyCampaigns();
    } catch (err) {
      Swal.fire("Error", "Failed to delete campaign: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleCommentSubmit = (campaignId) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      user: loggedInUser.name,
      timestamp: new Date().toLocaleString(),
      replies: [],
    };

    setComments((prev) => ({
      ...prev,
      [campaignId]: [...(prev[campaignId] || []), comment],
    }));

    setNewComment("");
  };

  const handleReplySubmit = (campaignId, commentId, replyText) => {
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now(),
      text: replyText,
      user: loggedInUser.name,
      timestamp: new Date().toLocaleString(),
    };

    setComments((prev) => {
      const updatedComments = prev[campaignId].map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, replies: [...comment.replies, reply] };
        }
        return comment;
      });

      return { ...prev, [campaignId]: updatedComments };
    });
  };

  return (
    <div className="ngo-container">
      <div className="ngo-header">
        <h1>My Campaigns</h1>
        <p>Manage and track your fundraising campaigns</p>
      </div>

      <div className="create-campaign-section">
        <button className="create-campaign-btn" onClick={() => setShowForm(!showForm)}>
          <i className="icon-plus"></i>
          {showForm ? "Cancel" : "Create New Campaign"}
        </button>

        {showForm && (
          <div className="campaign-form-modal">
            <div className="modal-content">
              <h2>Create New Campaign</h2>
              <form onSubmit={handleSubmit} className="post-form">
                <div className="form-group">
                  <label>Campaign Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter campaign title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe your campaign"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Amount (INR)</label>
                    <input
                      type="number"
                      name="targetAmount"
                      placeholder="Enter target amount"
                      value={formData.targetAmount}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Deadline</label>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Campaign Image</label>
                  <ImageUpload
                    imageUrl={formData.imageUrl}
                    onUploadSuccess={(imageUrl) => setFormData((prev) => ({ ...prev, imageUrl }))}
                  />
                </div>

                <button type="submit" className="submit-btn">
                  <i className="icon-upload"></i>
                  Publish Campaign
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="campaigns-grid">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="ngo-campaign-card">
            <div className="campaign-image">
              <img
                src={resolveCampaignImageUrl(campaign)}
                alt={campaign.title || "Campaign"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE_URL;
                }}
              />
              <div className="campaign-actions">
                <button className="action-btn edit-btn">
                  <i className="icon-edit"></i>
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(campaign.id)}>
                  <i className="icon-delete"></i>
                </button>
              </div>
            </div>

            <div className="card-content">
              <div className="campaign-header">
                <h3>{campaign.title}</h3>
                <div className="campaign-stats">
                  <span className="raised">INR {campaign.raisedAmount || 0}</span>
                  <span className="target">raised of INR {campaign.targetAmount}</span>
                </div>
              </div>

              <p className="campaign-description">{campaign.description}</p>

              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, ((campaign.raisedAmount || 0) / campaign.targetAmount) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  {Math.min(100, Math.round(((campaign.raisedAmount || 0) / campaign.targetAmount) * 100))}% funded
                </div>
              </div>

              <div className="campaign-meta">
                <div className="meta-item">
                  <i className="icon-calendar"></i>
                  <span>{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "No deadline"}</span>
                </div>
                <div className="meta-item">
                  <i className="icon-users"></i>
                  <span>{campaign.donors || 0} donors</span>
                </div>
              </div>

              <div className="comments-section">
                <h4>Comments ({comments[campaign.id]?.length || 0})</h4>

                <div className="comments-list">
                  {comments[campaign.id]?.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <strong>{comment.user}</strong>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                      <p>{comment.text}</p>

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="replies">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="reply">
                              <div className="comment-header">
                                <strong>{reply.user}</strong>
                                <span className="comment-time">{reply.timestamp}</span>
                              </div>
                              <p>{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="reply-form">
                        <input
                          type="text"
                          placeholder="Reply to comment..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleReplySubmit(campaign.id, comment.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
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
                  <button onClick={() => handleCommentSubmit(campaign.id)}>
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

export default Ngo;

function resolveCampaignImageUrl(campaign) {
  const imageUrl = campaign?.imageUrl || campaign?.image || "";
  if (!imageUrl) return FALLBACK_IMAGE_URL;
  if (imageUrl.startsWith("http://")) {
    return "https://" + imageUrl.substring("http://".length);
  }
  return imageUrl;
}
