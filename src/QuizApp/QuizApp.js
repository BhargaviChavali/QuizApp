import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuizApp.css';

function Quiz() {
  const [questions, setQuestions] = useState({ easy: [], medium: [], hard: [] });
  const [currentLevel, setCurrentLevel] = useState('easy');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prizeMoney, setPrizeMoney] = useState(0);

  const levels = ['easy', 'medium', 'hard'];
  const levelPrizeMoney = [1000, 2000, 3000, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const [easyResponse, mediumResponse, hardResponse] = await Promise.all([
          axios.get('https://the-trivia-api.com/api/questions', { params: { limit: 5, difficulty: 'easy' } }),
          axios.get('https://the-trivia-api.com/api/questions', { params: { limit: 5, difficulty: 'medium' } }),
          axios.get('https://the-trivia-api.com/api/questions', { params: { limit: 5, difficulty: 'hard' } }),
        ]);

        setQuestions({
          easy: easyResponse.data,
          medium: mediumResponse.data,
          hard: hardResponse.data,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching the questions:', error);
      }
    };
    fetchQuestions();

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === questions[currentLevel][currentQuestion].correctAnswer) {
      setScore(score + 1);
      setPrizeMoney(prizeMoney + levelPrizeMoney[score]);
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    } else {
      alert("Wrong answer! The quiz will continue.");
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions[currentLevel].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else if (levels.indexOf(currentLevel) < levels.length - 1) {
      const nextLevel = levels[levels.indexOf(currentLevel) + 1];
      setCurrentLevel(nextLevel);
      setCurrentQuestion(0);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setCurrentLevel('easy');
      setCurrentQuestion(0);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  return (
    <div className="quiz-container">
      <div className="background-overlay">
        <div className="quiz-card">
          <div className="header">
            <div className="score">Score: {score}</div>
            <div className="question-counter">{currentQuestion + 1}/{questions[currentLevel].length}</div>
            <div className="timer">{timeLeft} Seconds</div>
            <div className="prize-money">Prize Money: ${prizeMoney}</div>
          </div>
          {isLoading ? (
            <div className="loading">Loading questions...</div>
          ) : (
            questions[currentLevel].length > 0 && currentQuestion < questions[currentLevel].length && (
              <div className="question-section">
                <h2 dangerouslySetInnerHTML={{ __html: questions[currentLevel][currentQuestion].question }} />
                <div className="options">
                  {questions[currentLevel][currentQuestion].incorrectAnswers.concat(questions[currentLevel][currentQuestion].correctAnswer)
                    .sort()
                    .map((answer, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(answer)}
                        className={
                          isAnswered
                            ? answer === questions[currentLevel][currentQuestion].correctAnswer
                              ? 'correct-answer'
                              : answer === selectedAnswer
                              ? 'incorrect-answer'
                              : ''
                            : ''
                        }
                        dangerouslySetInnerHTML={{ __html: answer }}
                        disabled={isAnswered}
                      />
                    ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;