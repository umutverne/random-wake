import type { Task, MathTask, TypingTask, SequenceTask, ShakeTask, DifficultyLevel, TaskType } from '../types';

// Turkish sentences for typing task
const turkishSentences = {
  1: [
    'Günaydın dünya',
    'Bugün güzel bir gün',
    'Kahve zamanı geldi',
    'Güneş doğuyor',
    'Yeni bir başlangıç',
  ],
  2: [
    'Erken kalkan yol alır derler',
    'Bugün harika şeyler olacak',
    'Her yeni gün bir fırsattır',
    'Başarı sabırla gelir',
    'Mutluluk küçük şeylerde gizli',
  ],
  3: [
    'Hayatta en hakiki mürşit ilimdir fendir',
    'Başarının sırrı azimle çalışmaktır',
    'Zorluklar bizi güçlendirir ve karakterimizi şekillendirir',
    'Her sabah yeni umutlarla uyanmak en güzel hediyedir',
    'Düşlerinizin peşinden gitmeye bugün başlayın',
  ],
};

// English sentences for typing task
const englishSentences = {
  1: [
    'Good morning world',
    'Today is a great day',
    'Time for coffee',
    'The sun is rising',
    'A new beginning',
  ],
  2: [
    'The early bird catches the worm',
    'Great things will happen today',
    'Every new day is an opportunity',
    'Success comes with patience',
    'Happiness is hidden in small things',
  ],
  3: [
    'The secret of getting ahead is getting started',
    'Believe you can and you are halfway there',
    'Challenges make us stronger and shape our character',
    'Waking up with new hopes every morning is the best gift',
    'Start chasing your dreams today and never give up',
  ],
};

/**
 * Generate a random math problem based on difficulty
 */
export const generateMathTask = (difficulty: DifficultyLevel): MathTask => {
  let num1: number, num2: number, operator: string, answer: number, question: string;

  switch (difficulty) {
    case 1: // Easy: 2-digit addition/subtraction
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
      answer = operator === '+' ? num1 + num2 : num1 - num2;
      question = `${num1} ${operator} ${num2} = ?`;
      break;

    case 2: // Medium: 2-digit multiplication
      num1 = Math.floor(Math.random() * 12) + 2;
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;

    case 3: // Hard: 3-digit operations or multi-step
      num1 = Math.floor(Math.random() * 100) + 100;
      num2 = Math.floor(Math.random() * 100) + 50;
      const num3 = Math.floor(Math.random() * 10) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '-' && num2 > num1) [num1, num2] = [num2, num1];
      const intermediate = operator === '+' ? num1 + num2 : num1 - num2;
      answer = intermediate * num3;
      question = `(${num1} ${operator} ${num2}) × ${num3} = ?`;
      break;

    default:
      return generateMathTask(1);
  }

  return {
    type: 'math',
    question,
    answer,
    difficulty,
  };
};

/**
 * Generate a typing task based on difficulty
 */
export const generateTypingTask = (difficulty: DifficultyLevel, language: 'tr' | 'en' = 'tr'): TypingTask => {
  const sentences = language === 'tr' ? turkishSentences : englishSentences;
  const options = sentences[difficulty];
  const text = options[Math.floor(Math.random() * options.length)];

  return {
    type: 'typing',
    text,
    difficulty,
  };
};

/**
 * Generate a number sequence task based on difficulty
 */
export const generateSequenceTask = (difficulty: DifficultyLevel): SequenceTask => {
  let length: number;

  switch (difficulty) {
    case 1:
      length = 4;
      break;
    case 2:
      length = 6;
      break;
    case 3:
      length = 8;
      break;
    default:
      length = 4;
  }

  let sequence = '';
  for (let i = 0; i < length; i++) {
    sequence += Math.floor(Math.random() * 10).toString();
  }

  return {
    type: 'sequence',
    sequence,
    difficulty,
  };
};

/**
 * Generate a shake task based on difficulty
 */
export const generateShakeTask = (difficulty: DifficultyLevel): ShakeTask => {
  let requiredShakes: number;

  switch (difficulty) {
    case 1:
      requiredShakes = 10;
      break;
    case 2:
      requiredShakes = 20;
      break;
    case 3:
      requiredShakes = 30;
      break;
    default:
      requiredShakes = 10;
  }

  return {
    type: 'shake',
    requiredShakes,
    difficulty,
  };
};

/**
 * Generate a task based on type and difficulty
 */
export const generateTask = (
  taskType: TaskType,
  difficulty: DifficultyLevel,
  language: 'tr' | 'en' = 'tr'
): Task => {
  switch (taskType) {
    case 'math':
      return generateMathTask(difficulty);
    case 'typing':
      return generateTypingTask(difficulty, language);
    case 'sequence':
      return generateSequenceTask(difficulty);
    case 'shake':
      return generateShakeTask(difficulty);
    default:
      return generateMathTask(difficulty);
  }
};

/**
 * Validate task answer
 */
export const validateTaskAnswer = (task: Task, answer: string | number): boolean => {
  switch (task.type) {
    case 'math':
      return Number(answer) === task.answer;
    case 'typing':
      return answer.toString().trim().toLowerCase() === task.text.toLowerCase();
    case 'sequence':
      return answer.toString() === task.sequence;
    case 'shake':
      return Number(answer) >= task.requiredShakes;
    default:
      return false;
  }
};

/**
 * Get difficulty increased by snooze count
 */
export const getDifficultyForSnooze = (
  baseDifficulty: DifficultyLevel,
  snoozeCount: number
): DifficultyLevel => {
  const newDifficulty = Math.min(3, baseDifficulty + snoozeCount) as DifficultyLevel;
  return newDifficulty;
};
