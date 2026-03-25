export interface Activity {
  id: string;
  day: number;
  title: string;
  description: string;
  duration: string;
  material: string;
}

export interface Week {
  number: number;
  title: string;
  activities: Activity[];
}

export interface Phase {
  id: number;
  title: string;
  subtitle: string;
  focus: string;
  description: string;
  learningGoals: string[];
  weeks: Week[];
}

export interface ChapterSection {
  title: string;
  content: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  sections: ChapterSection[];
}

export interface Story {
  title: string;
  content: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface Milestone {
  period: string;
  expectation: string;
  successIndicator: string;
}

export interface SpecialSound {
  digraph: string;
  sound: string;
  examples: string;
  howToTeach: string;
}

export interface ExtraActivity {
  phase: number;
  activities: {
    title: string;
    content: string;
  }[];
}

export interface BookContent {
  title: string;
  subtitle: string;
  introduction: {
    title: string;
    content: string;
  };
  chapters: Chapter[];
  phases: Phase[];
  wordLists: {
    phase2: string[];
    phase3: string[];
    highFrequency: string[];
    fluencyPhrases: string[];
  };
  stories: Story[];
  faq: FAQItem[];
  glossary: GlossaryItem[];
  scientificBasis: {
    title: string;
    content: string;
    references: string[];
  };
  milestones: Milestone[];
  milestonesTip: string;
  specialSounds: SpecialSound[];
  extraActivities: ExtraActivity[];
  finalWord: {
    title: string;
    content: string;
  };
}
