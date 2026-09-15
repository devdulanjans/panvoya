import { useState } from 'react';

export default function GeneralQuestions({ questions = [], heading, subtitle }) {
  const displayHeading = heading || 'General Questions';
  const [openQuestion, setOpenQuestion] = useState(0);

  if (questions.length === 0) return null;

  return (
    <section className="general-questions" aria-labelledby="general-questions-heading">
      <header className="questions-heading">
        <h2 id="general-questions-heading">{displayHeading}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="questions-list">
        {questions.map((item, index) => {
          const isOpen = index === openQuestion;
          return (
            <article className={`question-item ${isOpen ? 'open' : ''}`} key={item.id}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpenQuestion(isOpen ? -1 : index)}>
                <span>{item.question}</span>
                <small className="question-icon" aria-hidden="true">⌄</small>
              </button>
              {isOpen && <p>{item.answer}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
