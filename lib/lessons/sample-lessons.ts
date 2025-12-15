/**
 * @fileoverview Sample Lesson Data
 * @description Demo lessons with exercises for testing
 */

import { ExerciseData, LessonContent } from "@/types/lesson";

export interface LessonData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  estimatedTime: number; // minutes
  content: LessonContent;
  exercises: ExerciseData[];
}

export const SAMPLE_LESSONS: Record<string, LessonData> = {
  "present-simple": {
    id: "present-simple",
    title: "Present Simple Tense",
    description: "Learn when and how to use the present simple tense",
    category: "tenses",
    difficulty: "beginner",
    xpReward: 10,
    estimatedTime: 5,
    content: {
      introduction:
        "The present simple tense is one of the most common tenses in English. We use it to talk about habits, routines, facts, and general truths.",
      rules: [
        {
          title: "For habits and routines",
          explanation:
            "Use present simple for actions that happen regularly or repeatedly.",
          examples: [
            "I wake up at 7 AM every day.",
            "She drinks coffee every morning.",
            "They play football on weekends.",
          ],
        },
        {
          title: "For facts and general truths",
          explanation:
            "Use present simple for things that are always or generally true.",
          examples: [
            "The sun rises in the east.",
            "Water boils at 100°C.",
            "Dogs are loyal animals.",
          ],
        },
        {
          title: "Third person singular (he/she/it)",
          explanation:
            "Add -s or -es to the verb for third person singular subjects.",
          examples: [
            "He works in a bank.",
            "She watches TV every evening.",
            "It rains a lot in England.",
          ],
        },
      ],
      tips: [
        "Remember: I/You/We/They + verb, He/She/It + verb + s",
        "Use 'do/does' for questions and negatives",
        "Time expressions: every day, always, usually, sometimes, never",
      ],
    },
    exercises: [
      {
        id: "ps-1",
        type: "multiple_choice",
        question: "She ___ to school every day.",
        options: ["go", "goes", "going", "gone"],
        correctAnswer: "goes",
        hint: "Think about the subject - is it third person singular?",
        explanation:
          "'She' is third person singular, so we add -s to the verb: goes.",
      },
      {
        id: "ps-2",
        type: "fill_in_blank",
        question: "Complete the sentence:",
        sentence: "My father ___ the newspaper every morning.",
        correctAnswer: "reads",
        hint: "The subject is 'My father' (he)",
        explanation:
          "'My father' is third person singular (he), so we use 'reads' with an -s.",
      },
      {
        id: "ps-3",
        type: "multiple_choice",
        question: "Water ___ at 100 degrees Celsius.",
        options: ["boil", "boils", "boiling", "boiled"],
        correctAnswer: "boils",
        hint: "This is a scientific fact. What's the subject?",
        explanation:
          "'Water' is third person singular (it), so we use 'boils'. This is also a general fact.",
      },
      {
        id: "ps-4",
        type: "sentence_correction",
        question: "Find and fix the error:",
        sentence: "He work in a hospital.",
        correctAnswer: "He works in a hospital.",
        hint: "Check the verb form for third person singular",
        explanation:
          "'He' requires the verb to have -s: 'works' not 'work'.",
      },
      {
        id: "ps-5",
        type: "fill_in_blank",
        question: "Complete the sentence:",
        sentence: "They always ___ breakfast together.",
        correctAnswer: "eat",
        hint: "The subject is 'They' (plural)",
        explanation:
          "'They' is plural, so we use the base form of the verb without -s.",
      },
      {
        id: "ps-6",
        type: "word_order",
        question: "Arrange the words:",
        options: ["usually", "I", "at", "wake", "up", "7 AM"],
        correctAnswer: "I usually wake up at 7 AM",
        hint: "Subject comes first, then adverb of frequency",
        explanation:
          "In present simple, adverbs of frequency (usually) come after the subject and before the main verb.",
      },
    ],
  },

  "past-simple": {
    id: "past-simple",
    title: "Past Simple Tense",
    description: "Learn to talk about completed actions in the past",
    category: "tenses",
    difficulty: "beginner",
    xpReward: 10,
    estimatedTime: 5,
    content: {
      introduction:
        "The past simple tense is used to talk about completed actions in the past. It's one of the most important tenses for telling stories and describing past events.",
      rules: [
        {
          title: "Regular verbs",
          explanation: "Add -ed to the base form of regular verbs.",
          examples: [
            "I walked to school yesterday.",
            "She played tennis last week.",
            "They watched a movie.",
          ],
        },
        {
          title: "Irregular verbs",
          explanation:
            "Many common verbs have irregular past forms that you need to memorize.",
          examples: [
            "I went to the store. (go → went)",
            "She ate breakfast. (eat → ate)",
            "They saw a bird. (see → saw)",
          ],
        },
        {
          title: "Negatives and questions",
          explanation:
            "Use 'did not' (didn't) for negatives and 'did' for questions. The main verb stays in base form.",
          examples: [
            "I didn't go to school.",
            "Did you see the movie?",
            "She didn't eat lunch.",
          ],
        },
      ],
      tips: [
        "Time expressions: yesterday, last week/month/year, ago, in 2020",
        "All subjects use the same form: I/You/He/She/We/They went",
        "Remember: did + base form for questions and negatives",
      ],
    },
    exercises: [
      {
        id: "pst-1",
        type: "multiple_choice",
        question: "I ___ to the cinema yesterday.",
        options: ["go", "went", "going", "gone"],
        correctAnswer: "went",
        hint: "'Yesterday' tells us this is past tense",
        explanation:
          "'Go' is an irregular verb. Its past simple form is 'went'.",
      },
      {
        id: "pst-2",
        type: "fill_in_blank",
        question: "Complete the sentence:",
        sentence: "She ___ her homework last night.",
        correctAnswer: "did",
        hint: "Think about the past form of 'do'",
        explanation: "'Do' becomes 'did' in the past simple.",
      },
      {
        id: "pst-3",
        type: "sentence_correction",
        question: "Find and fix the error:",
        sentence: "They didn't went to the party.",
        correctAnswer: "They didn't go to the party.",
        hint: "After 'didn't', what form should the verb take?",
        explanation:
          "After 'didn't', we use the base form of the verb, not the past form.",
      },
      {
        id: "pst-4",
        type: "multiple_choice",
        question: "We ___ a great time at the beach last summer.",
        options: ["have", "has", "had", "having"],
        correctAnswer: "had",
        hint: "'Last summer' indicates past tense",
        explanation:
          "'Have' becomes 'had' in the past simple. 'Last summer' tells us it's past.",
      },
      {
        id: "pst-5",
        type: "fill_in_blank",
        question: "Complete the sentence:",
        sentence: "The children ___ happily in the park.",
        correctAnswer: "played",
        hint: "Add -ed to regular verbs",
        explanation:
          "'Play' is a regular verb. We add -ed to make the past simple: 'played'.",
      },
    ],
  },

  "articles-a-an": {
    id: "articles-a-an",
    title: "A vs An",
    description: "Learn when to use 'a' and when to use 'an'",
    category: "articles",
    difficulty: "beginner",
    xpReward: 10,
    estimatedTime: 4,
    content: {
      introduction:
        "'A' and 'an' are indefinite articles. They are used before singular, countable nouns when we are not talking about a specific item.",
      rules: [
        {
          title: "Use 'a' before consonant sounds",
          explanation:
            "Use 'a' when the following word starts with a consonant sound.",
          examples: [
            "a book",
            "a car",
            "a university (sounds like 'yoo')",
            "a European country",
          ],
        },
        {
          title: "Use 'an' before vowel sounds",
          explanation:
            "Use 'an' when the following word starts with a vowel sound (a, e, i, o, u).",
          examples: [
            "an apple",
            "an elephant",
            "an hour (the 'h' is silent)",
            "an honest person",
          ],
        },
        {
          title: "Sound matters, not spelling",
          explanation:
            "The choice depends on the SOUND, not the spelling of the word.",
          examples: [
            "a uniform (u sounds like 'yoo')",
            "an umbrella (u sounds like 'uh')",
            "a one-way street (one sounds like 'won')",
          ],
        },
      ],
      tips: [
        "Say the word out loud to hear if it starts with a vowel or consonant sound",
        "Silent 'h' words use 'an': an hour, an honor",
        "Remember: it's about the SOUND, not the letter",
      ],
    },
    exercises: [
      {
        id: "aa-1",
        type: "multiple_choice",
        question: "I saw ___ elephant at the zoo.",
        options: ["a", "an", "the", "no article"],
        correctAnswer: "an",
        hint: "What sound does 'elephant' start with?",
        explanation:
          "'Elephant' starts with a vowel sound (e), so we use 'an'.",
      },
      {
        id: "aa-2",
        type: "multiple_choice",
        question: "She is ___ university student.",
        options: ["a", "an"],
        correctAnswer: "a",
        hint: "Listen to how 'university' sounds when you say it",
        explanation:
          "'University' starts with a 'yoo' sound (consonant), so we use 'a'.",
      },
      {
        id: "aa-3",
        type: "fill_in_blank",
        question: "Complete the sentence:",
        sentence: "I'll be back in ___ hour.",
        correctAnswer: "an",
        hint: "Is the 'h' in 'hour' pronounced?",
        explanation:
          "The 'h' in 'hour' is silent, so it starts with a vowel sound. We use 'an'.",
      },
      {
        id: "aa-4",
        type: "sentence_correction",
        question: "Find and fix the error:",
        sentence: "He is an honest man.",
        correctAnswer: "He is an honest man.",
        hint: "Actually, check if this sentence is correct",
        explanation:
          "This sentence is actually correct! 'Honest' has a silent 'h', so we use 'an'.",
      },
      {
        id: "aa-5",
        type: "multiple_choice",
        question: "This is ___ one-time offer.",
        options: ["a", "an"],
        correctAnswer: "a",
        hint: "How does 'one' sound when you say it?",
        explanation:
          "'One' sounds like 'won' (starts with 'w' consonant sound), so we use 'a'.",
      },
    ],
  },

  "prepositions-time": {
    id: "prepositions-time",
    title: "Prepositions of Time",
    description: "Learn to use at, on, and in for time expressions",
    category: "prepositions",
    difficulty: "beginner",
    xpReward: 10,
    estimatedTime: 5,
    content: {
      introduction:
        "Prepositions of time (at, on, in) help us talk about when things happen. Each one is used with different time expressions.",
      rules: [
        {
          title: "AT - for specific times",
          explanation:
            "Use 'at' for clock times, mealtimes, and specific moments.",
          examples: [
            "at 9 o'clock",
            "at noon / at midnight",
            "at breakfast / at lunch",
            "at the weekend (British English)",
          ],
        },
        {
          title: "ON - for days and dates",
          explanation: "Use 'on' for days of the week and specific dates.",
          examples: [
            "on Monday",
            "on July 4th",
            "on my birthday",
            "on Christmas Day",
          ],
        },
        {
          title: "IN - for longer periods",
          explanation:
            "Use 'in' for months, years, seasons, and parts of the day.",
          examples: [
            "in January",
            "in 2024",
            "in summer / in winter",
            "in the morning / in the evening",
          ],
        },
      ],
      tips: [
        "AT = specific point: at 3pm, at night",
        "ON = specific day: on Friday, on March 15",
        "IN = longer period: in May, in the 1990s",
        "Exception: at night (not 'in the night')",
      ],
    },
    exercises: [
      {
        id: "pt-1",
        type: "multiple_choice",
        question: "The meeting is ___ 3 o'clock.",
        options: ["at", "on", "in"],
        correctAnswer: "at",
        hint: "What do we use for clock times?",
        explanation: "We use 'at' for specific clock times: at 3 o'clock.",
      },
      {
        id: "pt-2",
        type: "multiple_choice",
        question: "I was born ___ 1995.",
        options: ["at", "on", "in"],
        correctAnswer: "in",
        hint: "What do we use for years?",
        explanation: "We use 'in' for years: in 1995.",
      },
      {
        id: "pt-3",
        type: "fill_in_blank",
        question: "Complete the sentence:",
        sentence: "We have English class ___ Monday.",
        correctAnswer: "on",
        hint: "What preposition goes with days of the week?",
        explanation: "We use 'on' for days of the week: on Monday.",
      },
      {
        id: "pt-4",
        type: "sentence_correction",
        question: "Find and fix the error:",
        sentence: "I usually wake up on 7 AM.",
        correctAnswer: "I usually wake up at 7 AM.",
        hint: "Check the preposition for clock times",
        explanation: "We use 'at' for clock times, not 'on': at 7 AM.",
      },
      {
        id: "pt-5",
        type: "multiple_choice",
        question: "It often snows ___ winter.",
        options: ["at", "on", "in"],
        correctAnswer: "in",
        hint: "What do we use for seasons?",
        explanation: "We use 'in' for seasons: in winter, in summer.",
      },
      {
        id: "pt-6",
        type: "fill_in_blank",
        question: "Complete the sentence:",
        sentence: "The party is ___ Saturday evening.",
        correctAnswer: "on",
        hint: "When a day is mentioned, which preposition do we use?",
        explanation:
          "When we mention a specific day, we use 'on': on Saturday evening.",
      },
    ],
  },
};

/**
 * Get lesson by ID
 */
export function getLessonById(lessonId: string): LessonData | null {
  return SAMPLE_LESSONS[lessonId] || null;
}

/**
 * Get all lesson IDs
 */
export function getAllLessonIds(): string[] {
  return Object.keys(SAMPLE_LESSONS);
}

/**
 * Shuffle array (for randomizing options)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
