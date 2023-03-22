import React, { useEffect, useState } from "react";

const Options = ({ options, endOfQuestion }) => {
	const getCorrectOrWrong = (option) => {
		console.log(endOfQuestion);
		if (endOfQuestion) {
			if (endOfQuestion.correctAnswer == option) {
				return "correct";
			} else {
				return "wrong";
			}
		} else {
			return "gray";
		}
	};
	return (
		<ul className="options">
			{options.map((option) => (
				<li className={`options__option shadow ${getCorrectOrWrong(option)}`}>
					{option}
				</li>
			))}
		</ul>
	);
};

export default Options;
