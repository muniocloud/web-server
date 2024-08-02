export enum DURATION {
  SHORT = 1,
  MEDIUM = 2,
  LONG = 3,
}

export enum LEVEL {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
}

export enum STATUS {
  CREATED = 1,
  STARTED = 2,
  FINISHED = 3,
}

export const LEVEL_LABEL = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

export const DURATION_LABEL = {
  1: 'Short (3 ~ 5 messages)',
  2: 'Medium (6 ~ 10 messages)',
  3: 'Long (11 ~ 20 mensagens)',
};

export enum STATUS_LABEL {
  CREATED = 1,
  STARTED = 2,
  FINISHED = 3,
}

export enum CONTEXT {
  ROUTINE = 'Routine',
  CINEMA = 'Cinema',
  SCHOOL = 'School',
  HOBBIES = 'Hobbies',
  TRAVEL = 'Travel',
  WORK = 'Work',
  SHOPPING = 'Shopping',
  SOCIAL_LIFE = 'Social Life',
  HEALTH_WELLNESS = 'Health & Wellness',
  FAMILY_LIFE = 'Family Life',
  DINNING_OUT = 'Dining Out',
}
