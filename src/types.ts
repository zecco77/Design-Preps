export interface InterviewQuestion {
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  testing: string;
  idealAnswer: string;
  sampleAnswer?: string;
}

export interface QuestionCategory {
  name: string;
  questions: InterviewQuestion[];
}

export interface GenerationResponse {
  categories: QuestionCategory[];
}
