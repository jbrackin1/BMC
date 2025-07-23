/** @format */

import React from "react";
import PatientDemographicsForm from "../../components/forms/PatientDemographicsForm";
import HealthQuestionsForm from "../../components/forms/HealthQuestionsForm";

function IntakeForm() {
	return (
		<div className="form-section">
			<div className="form-container">
				<h2>Get Started</h2>
				<PatientDemographicsForm />
			</div>
			<div className="form-container">
				<HealthQuestionsForm />
			</div>
		</div>
	);
}

export default IntakeForm;
