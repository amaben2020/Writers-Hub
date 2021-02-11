import React, { useState, useEffect } from "react";
import AddPetForm from "./AddPetForm";

const App = () => {
	const [pets, setPets] = useState([]);
	const deleteId = () => {
		// eslint-disable-next-line
		setPets((prev) => prev.filter((pet) => pet.id != pet.id));
		// eslint-disable-next-line
	};

	//runs whenever the component mounts
	useEffect(() => {
		if (localStorage.getItem("petsData")) {
			setPets(JSON.parse(localStorage.setItem("petsData")));
		}
	}, []);

	// runs only when the pets state changes
	useEffect(() => {
		localStorage.setItem("petsData", JSON.stringify(pets));
	}, [pets]);

	return (
		<div>
			<ul>
				{" "}
				{pets.map((pet) => (
					<li key={pet.id}>
						{pet.name} , {pet.age}
						<button onClick={deleteId}>Delete</button>
					</li>
				))}
			</ul>
			<AddPetForm setPets={setPets} />
		</div>
	);
};

export default App;
