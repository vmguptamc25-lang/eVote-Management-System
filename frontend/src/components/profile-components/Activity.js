export default function Activity({ data }) {
  if (!data) return null;
  console.log("last vote:"+data.lastVote);
  return (
    <div className="card p-3 shadow mt-3 card-box">
      <h6 className="section-title">Voting Activity</h6>

      <div className="row">
        <div className="col-md-4">
          <p>
            <strong>Registered On:</strong><br />
            {
              new Date(data?.registeredOn).toLocaleDateString()}
          </p>
        </div>

        <div className="col-md-4">
          <p>
            <strong>Last Vote Cast:</strong><br />
            {data?.lastVote ? (
              <>
                {new Date(data.lastVote.time).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
                <br />
                🗳️ {data.lastVote.election}
              </>
            ) : (
              "N/A"
            )}
          </p>
        </div>

        <div className="col-md-4">
          <p>
            <strong>Status:</strong><br />
            <span className="text-success">
              {data.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}