import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Ngo.css";

const Ngo = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
    file: null
  });
  const [previewImage, setPreviewImage] = useState(null);
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
      const res = await axios.get("http://localhost:8080/api/campaigns");
      const myCampaigns = res.data.filter(c => c.creatorId === loggedInUser.id);
      setCampaigns(myCampaigns);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch campaigns: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "file") {
      const file = e.target.files[0];
      setFormData({ ...formData, file });
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("campaign", new Blob([JSON.stringify({ ...formData, creatorId: loggedInUser.id })], { type: "application/json" }));
      if (formData.file) data.append("file", formData.file);

      await axios.post("http://localhost:8080/api/campaigns", data, { headers: { "Content-Type": "multipart/form-data" } });

      Swal.fire("Success", "Campaign posted!", "success");
      setFormData({ title: "", description: "", targetAmount: "", deadline: "", file: null });
      setPreviewImage(null);
      setShowForm(false);
      fetchMyCampaigns();
    } catch (err) {
      Swal.fire("Error", "Failed to post campaign: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/campaigns/${id}`);
      Swal.fire("Deleted!", "Campaign deleted successfully", "success");
      fetchMyCampaigns();
    } catch (err) {
      Swal.fire("Error", "Failed to delete campaign: " + (err.response?.data?.message || err.message), "error");
    }
  };

  return (
    <div className="ngo-container">
      <div className="mb-3">
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Post Campaign"}
        </button>
      </div>

      {showForm && (
        <form className="post-form-card" onSubmit={handleSubmit}>
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
          <input type="number" name="targetAmount" placeholder="Target Amount" value={formData.targetAmount} onChange={handleChange} required />
          <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} required />
          <input type="file" name="file" onChange={handleChange} accept="image/*" />
          {previewImage && <img src={previewImage} alt="preview" className="preview-img" />}
          <button type="submit" className="btn btn-primary">Post Campaign</button>
        </form>
      )}

      <h3>My Campaigns</h3>
      <div className="campaign-grid">
        {campaigns.map(c => (
          <div key={c.id} className="ngo-campaign-card">
            {c.image && <img src={`http://localhost:8080${c.image}`} alt={c.title} className="campaign-img" />}
            <div className="card-content">
              <h5>{c.title}</h5>
              <p>{c.description}</p>
              <p><strong>Target:</strong> ₹{c.targetAmount}</p>
              <p><strong>Deadline:</strong> {c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"}</p>
              <div className="d-flex gap-2">
                <button className="btn btn-warning">Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ngo;
