/** @format */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import './patientReport.css';
import { useAuth } from '../../auth/AuthContext';

function PatientReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;
  const submittedAt = report?.submittedAt
    ? new Date(report.submittedAt).toLocaleString()
    : '';
  const { user } = useAuth();

  if (!report) {
    return <div className="patient-report-page"></div>;
  }

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`BetterMindCare – Patient Report`, 10, 5);
    doc.text(`${report.userEmail}`, 10, 10);
    let y = 20;

    doc.text(`Generated on ` + submittedAt, 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Recommendations:', 10, y);
    y += 8;

    report.report.forEach((item) => {
      doc.setFont(undefined, 'bold');
      doc.text(`• ${item.title}`, 10, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      const wrapped = doc.splitTextToSize(item.body, 180);
      doc.text(wrapped, 10, y);
      y += wrapped.length * 6;
    });

    if (report.labRecommendations.length) {
      y += 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Recommended Labs:', 10, y);
      y += 8;
      report.labRecommendations.forEach((lab) => {
        doc.setFont(undefined, 'normal');
        doc.text(`• ${lab}`, 10, y);
        y += 6;
      });
    }

    doc.save('BetterMindCare_Report.pdf');
  };

  return (
    <div className="patient-report-page">
      <h1>{report.userEmail} Patient Report</h1>
      <p className="timestamp">Generated on {submittedAt}</p>
      {console.log(report)}
      <section className="report-section">
        <h2>Summary</h2>
        <p>
          This report provides a personalized overview based on your intake
          data. The recommendations are evidence-based and designed to support
          brain health, lifestyle improvements, and prevention strategies.
        </p>
      </section>

      <section className="report-section">
        <h2>Lab Recommendations</h2>
        {report.labRecommendations.length ? (
          <ul>
            {[...new Set(report.labRecommendations)].map((lab, index) => (
              <li key={index}>
                <strong>{lab}:</strong> Recommended for follow-up testing.
              </li>
            ))}
          </ul>
        ) : (
          <p>No lab recommendations were triggered.</p>
        )}
      </section>

      <section className="report-section">
        <h2>Personalized Recommendations</h2>
        {report.report.length ? (
          <ul>
            {report.report.map((item, index) => (
              <li key={index}>
                <strong>{item.title}:</strong> {item.body}
              </li>
            ))}
          </ul>
        ) : (
          <p>No personalized recommendations found.</p>
        )}
      </section>

      <section className="report-section">
        <h2>Next Steps</h2>
        <p>
          You can order additional lab tests, retake your cognition test, or
          discuss your report with a care advisor. Your results and this report
          are always available on your dashboard.
        </p>
      </section>

      <div className="report-actions">
        <button className="btn" onClick={handleDownload}>
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default PatientReport;
