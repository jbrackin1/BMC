/** @format */

import React from "react";
import "./FormElements.css";

function RadioQuestions({ id, label, options, value, onChange }) {
	return (
		<div className="question-block">
			<label className="question-label">{label}</label>
			<div className="question-options">
				{options.map((opt) => (
					<label key={opt} className="radio-option">
						<input
							type="radio"
							name={id}
							value={opt}
							checked={value === opt}
							onChange={(e) => onChange(id, e.target.value)}
						/>
						{opt}
					</label>
				))}
			</div>
		</div>
	);
}

export default RadioQuestions;
// This component renders a question block with a label and a set of radio options.