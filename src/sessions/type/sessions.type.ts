export type Lesson = {
  phrase: string;
  id: number;
};

export type Session = {
  userId: number;
  id: number;
  status: string;
  lessons: number;
  level: number;
  context: string;
  feedback: string;
  rating: number;
};

export type AwnseredLesson = {
  id: number;
  feedback: string;
  rating: number;
};
