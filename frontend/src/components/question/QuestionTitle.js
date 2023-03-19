import React from "react";

const QuestionTitle = ({ currentQuestion, questionNumber }) => {
	return (
		<div className="question">
			<div className="question__number">Question {questionNumber}/10</div>
			<h2 className="question__title shadow">{currentQuestion.question}</h2>
		</div>
	);
};

export default QuestionTitle;
