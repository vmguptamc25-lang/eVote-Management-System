export default function PersonalInfo({ data }) {
  if (!data) return null;
  return (
    <div className="card p-3 shadow card-box">
      <h6 className="section-title">Personal Information</h6>

      <p>📧 {data.email}</p>
      <p>📱 {data.mobile || "N/A"}</p>
      <p>🎂 {new Date(data?.dob).toLocaleDateString() || "N/A"}</p>
      <p>📍 {data.location}</p>
      <p>
        🪪 {data.aadhaarLinked ? "Aadhaar Linked" : "Not Linked"}
      </p>
    </div>
  );
}