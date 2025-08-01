import React, { useEffect, useState } from 'react';

function ScreeningOrder() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pb/lab-requests', { credentials: 'include' })
      .then((res) => res.json())
      .then(setTests)
      .catch((err) => console.error('❌ Failed to load tests:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screening-order-page">
      <h1>Screening Tests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : tests.length ? (
        <ul className="test-list">
          {tests.map((test) => (
            <li key={test.id} className="test-card">
              <strong>{test.name}</strong>
              <p>{test.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tests available.</p>
      )}
    </div>
  );
}

export default ScreeningOrder;