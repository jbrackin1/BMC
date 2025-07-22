/** @format */

import React, { useState } from "react";
import QuestionsCheckbox from "./QuestionsCheckbox";
import RadioQuestions from "./RadioQuestions";
import TextInput from "../inputs/InputText.js";
import "./FormElements.css";
import { generatePatientReport } from "../../utils/reportGenerator.js";
import { useNavigate } from "react-router-dom";



function HealthQuestionsForm({ gender }) {


	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		diabetes: "",
		cholesterol: "",
		hbp: "",
		autoimmune: "",
		thyroid: "",
		stress: "",
		vegan: "",
		statins: "",
		migraines: "",
		asthma: "",
		viral: "",
		gum: "",
		sleep: "",
		depression: "",
		anemia: "",
		hemochromatosis: "",
		hearing: "",
		cataracts: "",
		mold: "",
		heavyMetals: "",
		alcohol: "",
		cognitionWilling: "",
		cognitionScore: "",
		hrtFemale: "",
		hrtMale: "",
		ed: "",
	});

	const handleChange = (id, value) => {
		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const report = generatePatientReport(formData, gender);
		navigate("/report", { state: { report } });
	};

	return (
		<form className="intake-form" onSubmit={handleSubmit}>
			<h2>Health Questions</h2>

			<RadioQuestions
				id="diabetes"
				label="Do you have pre-Diabetes or diabetes?"
				options={["Yes", "No", "Unsure"]}
				value={formData.diabetes}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="cholesterol"
				label="Do you currently have high cholesterol or use statins?"
				options={["Yes", "No", "Unsure"]}
				value={formData.cholesterol}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="statins"
				label="Do you currently take a statin medication?"
				options={["Yes", "No"]}
				value={formData.statins}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="hbp"
				label="Do you have high blood pressure (hypertension)?"
				options={["Yes", "No", "Unsure"]}
				value={formData.hbp}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="autoimmune"
				label="Have you been diagnosed with or suspect you have an autoimmune condition?"
				options={["Yes", "No", "Unsure"]}
				value={formData.autoimmune}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="thyroid"
				label="Have you ever been diagnosed with hypothyroidism?"
				options={["Yes", "No", "Unsure"]}
				value={formData.thyroid}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="stress"
				label="Do you have chronic stress?"
				options={["Yes", "No"]}
				value={formData.stress}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="vegan"
				label="Are you on a vegan diet?"
				options={["Yes", "No"]}
				value={formData.vegan}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="migraines"
				label="Have you been diagnosed with migraines?"
				options={["Yes", "No"]}
				value={formData.migraines}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="asthma"
				label="Do you have severe allergies or allergic asthma?"
				options={["Yes", "No"]}
				value={formData.asthma}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="viral"
				label="Have you ever been diagnosed with chronic viral infections?"
				options={["Yes", "No"]}
				value={formData.viral}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="gum"
				label="Have you been diagnosed with gum disease?"
				options={["Yes", "No"]}
				value={formData.gum}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="sleep"
				label="Do you have insomnia, anxiety, or sleep disorders?"
				options={["Yes", "No", "Unsure"]}
				value={formData.sleep}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="depression"
				label="Do you currently suffer from depression?"
				options={["Yes", "No", "Unsure"]}
				value={formData.depression}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="anemia"
				label="Have you ever been diagnosed with anemia?"
				options={["Yes", "No", "Unsure"]}
				value={formData.anemia}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="hemochromatosis"
				label="Have you ever been diagnosed with hemochromatosis?"
				options={["Yes", "No", "Unsure"]}
				value={formData.hemochromatosis}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="hearing"
				label="Do you have difficulty hearing or have you been diagnosed with hearing loss?"
				options={["Yes", "No"]}
				value={formData.hearing}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="cataracts"
				label="Have you ever been diagnosed with cataracts?"
				options={["Yes", "No", "Unsure"]}
				value={formData.cataracts}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="mold"
				label="Have you ever been exposed to mold in food or your environment for an extended time?"
				options={["Yes", "No", "Unsure"]}
				value={formData.mold}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="heavyMetals"
				label="Have you ever been exposed to heavy metals?"
				options={["Yes", "No", "Unsure"]}
				value={formData.heavyMetals}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="alcohol"
				label="Do you currently drink alcohol?"
				options={["Yes", "No"]}
				value={formData.alcohol}
				onChange={handleChange}
			/>

			<RadioQuestions
				id="cognitionWilling"
				label="Would you be willing to take an online 10-minute cognition test?"
				options={["Yes", "No", "Unsure"]}
				value={formData.cognitionWilling}
				onChange={handleChange}
			/>

			<TextInput
				id="cognitionScore"
				label="If taken, what was your cognition score?"
				value={formData.cognitionScore}
				onChange={(e) => handleChange("cognitionScore", e.target.value)}
			/>

			{gender === "female" && (
				<RadioQuestions
					id="hrtFemale"
					label="As a woman, are you considering or currently using HRT?"
					options={["Yes", "No"]}
					value={formData.hrtFemale}
					onChange={handleChange}
				/>
			)}

			{gender === "male" && (
				<>
					<RadioQuestions
						id="hrtMale"
						label="As a man, are you considering or currently using HRT?"
						options={["Yes", "No"]}
						value={formData.hrtMale}
						onChange={handleChange}
					/>
					<RadioQuestions
						id="ed"
						label="Have you experienced erectile dysfunction and used or considered medication like Viagra?"
						options={["Yes", "No"]}
						value={formData.ed}
						onChange={handleChange}
					/>
				</>
			)}

			<button type="submit" className="btn">
				Submit
			</button>
		</form>
	);
}

export default HealthQuestionsForm;
