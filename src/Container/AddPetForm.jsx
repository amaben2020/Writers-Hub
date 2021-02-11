import React, { useState } from "react";

const AddPetForm = ({ setPets }) => {
	console.log(setPets);
	const [name, setName] = useState();
	const [age, setAge] = useState();

	const handleSubmit = (e) => {
		e.preventDefault();
		setPets((prev) => prev.concat({ name, age, id: Date.now() }));
		setAge("");
		setName("");
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<fieldset>
					<legend>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Name"
						/>
						<input
							onChange={(e) => setAge(e.target.value)}
							value={age}
							placeholder="Age"
						/>
						<button>Add pet</button>
					</legend>
				</fieldset>
			</form>
		</div>
	);
};

export default AddPetForm;
