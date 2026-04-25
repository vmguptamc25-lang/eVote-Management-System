
import Image from 'next/image'
import { useEffect, useState } from "react";
import axios from "axios";
export default function ProfileHeader({ data }) {
  const [faceVerified, setFaceVerified] = useState(false);

  if (!data) return null;

  const fields = [
    data?.email,
    data?.mobile,
    data?.dob,
    data?.profileImage
  ];

  const completed = fields.filter(Boolean).length;
  const percentage = faceVerified
    ? 100
    : Math.round((completed / fields.length) * 100);

  useEffect(() => {
    const checkFace = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/face/me",
          { withCredentials: true }
        );

        if (res.data?.descriptor) {
          setFaceVerified(true);
        }
      } catch (err) {
        setFaceVerified(false);
      }
    };

    checkFace();
  }, []);

  console.log(data.profileImage);
  return (
    <div className="card profile-card shadow">
      <div className="profile-header"></div>

      <div className="card-body">
        <div className="d-flex align-items-center">

          {/* <Image
            src={data.profileImage}
            className="profile-img me-3"
            width={50}
            height={50}
            alt="profile"
          /> */}

          <div className="profile-img-wrapper">
            <svg className="progress-ring" width="90" height="90">
              <circle
                className="progress-ring-bg"
                cx="45"
                cy="45"
                r="40"
                strokeWidth="5"
              />
              <circle
                className="progress-ring-fill"
                cx="45"
                cy="45"
                r="40"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={
                  2 * Math.PI * 40 * (1 - percentage / 100)
                }
              />
            </svg>

            <img
              src={data?.profileImage}
              className="profile-img"
              alt="profile"
            />

            <span className="percentage-text">{percentage}%</span>
          </div>

          <div>
            <h4>
              {data.name}{" "}
              <span className="badge bg-success">
                {data.status}
              </span>
            </h4>

            <small>Voter ID: {data.voterId}</small>

            <p className="mt-2 text-muted">
              {data.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}