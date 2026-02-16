import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCampaigns, getSocialPostCaptions } from "../../services/api";
import "./Home.css";

const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [socialCaptions, setSocialCaptions] = useState({});
  const [shareLoading, setShareLoading] = useState({});
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
      const res = await getCampaigns();
      console.log("Campaign API response:", res.data);
      setCampaigns(res.data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const handleDonate = (campaignId, campaignTitle) => {
    navigate("/payment", {
      state: { campaignId, campaignTitle },
    });
  };

  const handleCommentSubmit = (campaignId) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      user: loggedInUser.name,
      timestamp: new Date().toLocaleString(),
    };

    setComments((prev) => ({
      ...prev,
      [campaignId]: [...(prev[campaignId] || []), comment],
    }));

    setNewComment("");
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const ensureSocialCaptions = async (campaignId) => {
    if (socialCaptions[campaignId]) {
      return socialCaptions[campaignId];
    }

    setShareLoading((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const response = await getSocialPostCaptions(campaignId);
      const captions = response?.data;
      if (!captions || (!captions.instagram && !captions.twitter && !captions.whatsapp)) {
        throw new Error("Invalid caption payload");
      }
      setSocialCaptions((prev) => ({ ...prev, [campaignId]: captions }));
      return captions;
    } catch (error) {
      console.error("Failed to fetch social captions:", error);
      toast.error("Unable to generate share caption right now.");
      return null;
    } finally {
      setShareLoading((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.error("Clipboard API failed:", error);
    }

    try {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "absolute";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(input);
      return copied;
    } catch (error) {
      console.error("Fallback clipboard copy failed:", error);
      return false;
    }
  };

  const handleInstagramShare = async (campaignId) => {
    const captions = await ensureSocialCaptions(campaignId);
    if (!captions?.instagram) return;

    const copied = await copyToClipboard(captions.instagram);
    if (copied) {
      toast.info("Caption copied, paste in Instagram.");
    } else {
      toast.error("Could not copy caption to clipboard.");
    }

    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const handleTwitterShare = async (campaignId) => {
    const captions = await ensureSocialCaptions(campaignId);
    if (!captions?.twitter) return;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(captions.twitter)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleWhatsAppShare = async (campaignId) => {
    const captions = await ensureSocialCaptions(campaignId);
    if (!captions?.whatsapp) return;

    const url = `https://wa.me/?text=${encodeURIComponent(captions.whatsapp)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyCaption = async (campaignId) => {
    const captions = await ensureSocialCaptions(campaignId);
    const caption = captions?.instagram || captions?.twitter || captions?.whatsapp;
    if (!caption) return;

    const copied = await copyToClipboard(caption);
    if (copied) {
      toast.success("Caption copied to clipboard.");
    } else {
      toast.error("Could not copy caption to clipboard.");
    }
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

      <div className="instagram-feed">
        {campaigns.map((campaign) => {
          console.log("Campaign item:", campaign);
          const campaignImage = resolveCampaignImageUrl(campaign);
          const ngoName = getNgoDisplayName(campaign);

          return (
            <div key={campaign.id} className="post-card">
              <div className="post-header">
                <div className="poster-info">
                  <div className="poster-avatar">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1160&q=80"
                      alt="Avatar"
                    />
                  </div>
                  <div className="poster-details">
                    <h4>{ngoName}</h4>
                    <span>{formatTimeAgo(campaign.createdAt)}</span>
                  </div>
                </div>
                <button className="more-options">...</button>
              </div>

              <div className="post-image">
                <img
                  src={campaignImage}
                  alt={campaign.title || "Campaign"}
                  onClick={() => openImageModal(campaignImage)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE_URL;
                  }}
                />
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
                <p>
                  Liked by <strong>user123</strong> and <strong>245 others</strong>
                </p>
              </div>

              <div className="post-caption">
                <p>
                  <strong>{ngoName}</strong> {campaign.title}
                </p>
              </div>

              <div className="share-section">
                <div className="share-section-header">
                  <h4>Share Post</h4>
                  {shareLoading[campaign.id] && <span className="share-loading">Generating caption...</span>}
                </div>
                <div className="share-buttons">
                  <button
                    className="share-btn instagram"
                    onClick={() => handleInstagramShare(campaign.id)}
                    disabled={!!shareLoading[campaign.id]}
                  >
                    Instagram
                  </button>
                  <button
                    className="share-btn twitter"
                    onClick={() => handleTwitterShare(campaign.id)}
                    disabled={!!shareLoading[campaign.id]}
                  >
                    Twitter (X)
                  </button>
                  <button
                    className="share-btn whatsapp"
                    onClick={() => handleWhatsAppShare(campaign.id)}
                    disabled={!!shareLoading[campaign.id]}
                  >
                    WhatsApp
                  </button>
                  <button
                    className="share-btn copy"
                    onClick={() => handleCopyCaption(campaign.id)}
                    disabled={!!shareLoading[campaign.id]}
                  >
                    Copy Caption
                  </button>
                </div>
              </div>

              <div className="post-details">
                <div className="progress-container">
                  <div className="progress-text">
                    <span>INR {campaign.raisedAmount || 0} raised of INR {campaign.targetAmount}</span>
                    <span>
                      {Math.min(100, Math.round(((campaign.raisedAmount || 0) / campaign.targetAmount) * 100))}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, ((campaign.raisedAmount || 0) / campaign.targetAmount) * 100)}%` }}
                    ></div>
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
              </div>

              <div className="post-comments">
                <h4>Comments ({comments[campaign.id]?.length || 0})</h4>

                <div className="comments-list">
                  {comments[campaign.id]?.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <strong>{comment.user}</strong>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                  {comments[campaign.id]?.length > 2 && (
                    <button className="view-all-comments">View all {comments[campaign.id]?.length} comments</button>
                  )}
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

              {loggedInUser?.userType?.toLowerCase() === "donor" && (
                <div className="donate-section">
                  <button className="donate-btn" onClick={() => handleDonate(campaign.id, campaign.title)}>
                    <i className="icon-heart"></i>
                    Donate Now
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeImageModal}>
              x
            </button>
            <img src={selectedImage} alt="Enlarged view" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

function resolveCampaignImageUrl(campaign) {
  const imageUrl = campaign?.imageUrl || campaign?.image || "";
  if (!imageUrl) return FALLBACK_IMAGE_URL;
  if (imageUrl.startsWith("http://")) {
    return "https://" + imageUrl.substring("http://".length);
  }
  return imageUrl;
}

function getNgoDisplayName(campaign) {
  return campaign?.ngoName || campaign?.organization || "Campaign Organizer";
}

function formatTimeAgo(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "Just now";
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
