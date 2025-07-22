/** @format */

import React from "react";
import "./FormElements.css";

function QuestionsCheckbox({ id, label, options, values = [], onChange }) {
	return (
		<div className="question-block">
			<label className="question-label">{label}</label>
			<div className="question-options">
				{options.map((opt) => (
					<label key={opt} className="checkbox-option">
						<input
							type="checkbox"
							name={id}
							value={opt}
							checked={values.includes(opt)}
							onChange={(e) => {
								const checked = e.target.checked;
								const value = e.target.value;
								let updated;
								if (checked) {
									updated = [...values, value];
								} else {
									updated = values.filter((v) => v !== value);
								}
								onChange(id, updated);
							}}
						/>
						{opt}
					</label>
				))}
			</div>
		</div>
	);
}

export default QuestionsCheckbox;
// This component renders a question block with a label and a set of checkbox options.