import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/intake/my-reports', { credentials: 'include' })
      .then((res) => res.json())
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleView = (report) => {
    navigate('/report', {
      state: {
        report: {
          ...report.report_output, // inner report + labRecommendations
          userEmail: report.user_email, // merge outer
          submittedAt: report.submitted_at // <-- add this
        }
      }
    });
  };

  if (loading) return <p>Loading your reports...</p>;

  return (
    <div className="report-list-page">
      <h1>My Past Reports</h1>
      {reports.length === 0 ? (
        <p>You haven’t submitted any reports yet.</p>
      ) : (
        <ul className="report-list">
          {reports.map((r) => (
            <li key={r.id} className="report-card">
              <p>
                <strong>Date:</strong>{' '}
                {new Date(r.submitted_at || r.created_at).toLocaleDateString()}
              </p>
              <button className="btn" onClick={() => handleView(r)}>
                View Report
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyReports;
