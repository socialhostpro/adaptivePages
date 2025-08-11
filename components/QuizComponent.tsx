
import React, { useState } from 'react';
import type { Quiz, LandingPageTheme } from '../src/types';

interface QuizComponentProps {
  quiz: Quiz;
  theme: LandingPageTheme;
  isCompleted: boolean;
  onAttempt: (score: number, totalQuestions: number, passed: boolean) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, theme, isCompleted, onAttempt }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    const correctAnswers = quiz.questions.reduce((acc, q) => acc + (answers[q.id] === q.correctOptionId ? 1 : 0), 0);
    const passed = correctAnswers === quiz.questions.length;
    setScore(correctAnswers);
    setSubmitted(true);
    onAttempt(correctAnswers, quiz.questions.length, passed);
  };
  
  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const passed = score === quiz.questions.length;

  if (isCompleted) {
    return (
        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-center">
            <h3 className="font-bold text-green-800 dark:text-green-300">Quiz Passed!</h3>
            <p className="text-sm text-green-700 dark:text-green-400">You scored {quiz.questions.length}/{quiz.questions.length}.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-slate-200">{quiz.title}</h3>
      {quiz.questions.map((q, index) => (
        <div key={q.id}>
          <p className="font-semibold text-gray-700 dark:text-slate-300">
            {index + 1}. {q.text}
          </p>
          <div className="mt-2 space-y-2">
            {q.options.map(opt => {
              const isSelected = answers[q.id] === opt.id;
              const isCorrect = opt.id === q.correctOptionId;
              let bgColor = 'hover:bg-gray-100 dark:hover:bg-slate-700';
              if (submitted) {
                 if (isCorrect) bgColor = 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500';
                 else if (isSelected) bgColor = 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500';
              }
              
              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswerChange(q.id, opt.id)}
                  disabled={submitted}
                  className={`w-full text-left p-2 rounded-md border dark:border-slate-600 ${bgColor} ${isSelected && !submitted ? `ring-2 ring-${theme.primaryColorName}-500` : ''}`}
                >
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <button 
        onClick={handleSubmit}
        disabled={Object.keys(answers).length !== quiz.questions.length || submitted}
        className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold text-white bg-${theme.primaryColorName}-600 hover:bg-${theme.primaryColorName}-700 disabled:bg-gray-400`}
      >
        Submit Answers
      </button>

      {submitted && (
        <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-center">
          <h4 className="font-bold text-lg">Your Score: {score} / {quiz.questions.length}</h4>
          {passed ? (
            <p className="text-green-600 dark:text-green-400 mt-1">Excellent! You passed.</p>
          ) : (
            <>
              <p className="text-red-600 dark:text-red-400 mt-1">Not quite. Please review and try again.</p>
              <button onClick={handleRetry} className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Retry Quiz</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
