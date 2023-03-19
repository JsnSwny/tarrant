import React, { useEffect, useState } from "react";

const Options = ({ options }) => {
	return (
		<ul className="options">
			{options.map((option) => (
				<li className="options__option shadow">{option}</li>
			))}
		</ul>
	);
};

export default Options;
