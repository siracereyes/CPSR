
import { Rubric, Category } from './types';

export const RUBRICS: Record<string, Rubric> = {
  'News Writing': {
    category: 'News Writing',
    criteria: [
      { id: 'lead', label: 'Lead', description: 'Clear, focused, and impactful', maxScore: 20 },
      { id: 'content', label: 'Content', description: 'Accuracy, relevance, and sourcing', maxScore: 30 },
      { id: 'structure', label: 'Structure', description: 'Inverted pyramid and transitions', maxScore: 40 },
      { id: 'ethics', label: 'Ethics', description: 'Objectivity and fairness', maxScore: 10 },
    ]
  },
  'Editorial Writing': {
    category: 'Editorial Writing',
    criteria: [
      { id: 'content', label: 'Content', description: 'Clarity of stance and arguments', maxScore: 40 },
      { id: 'persuasion', label: 'Persuasion', description: 'Impact and logic', maxScore: 50 },
      { id: 'ethics', label: 'Ethics', description: 'Constructive criticism', maxScore: 10 },
    ]
  },
  'Feature Writing': {
    category: 'Feature Writing',
    criteria: [
      { id: 'creative_content', label: 'Creative Content', description: 'Unique angle and interest', maxScore: 40 },
      { id: 'style', label: 'Literary Style', description: 'Word choice and flow', maxScore: 60 },
    ]
  },
  'Column Writing': {
    category: 'Column Writing',
    criteria: [
      { id: 'voice', label: 'Voice', description: 'Personality and style', maxScore: 30 },
      { id: 'insight', label: 'Insight', description: 'Depth of analysis', maxScore: 50 },
      { id: 'impact', label: 'Impact', description: 'Reader engagement', maxScore: 20 },
    ]
  },
  'Radio Broadcasting': {
    category: 'Radio Broadcasting',
    criteria: [
      { id: 'anchor', label: 'Best Anchor', description: 'Voice quality and delivery', maxScore: 20 },
      { id: 'presenter', label: 'Best News Presenter', description: 'Clarity and pace', maxScore: 20 },
      { id: 'technical', label: 'Technical App', description: 'SFX and timing', maxScore: 30 },
      { id: 'script', label: 'Script', description: 'Content and format', maxScore: 30 },
    ]
  },
  'TV Broadcasting': {
    category: 'TV Broadcasting',
    criteria: [
      { id: 'anchor', label: 'Best Anchor', description: 'On-camera presence', maxScore: 20 },
      { id: 'reporter', label: 'Best Reporter', description: 'Storytelling/Delivery', maxScore: 20 },
      { id: 'production', label: 'Production Value', description: 'Graphics and editing', maxScore: 30 },
      { id: 'content', label: 'Broadcast Content', description: 'Information flow', maxScore: 30 },
    ]
  }
};

// Map similar categories
RUBRICS['Sports Writing'] = RUBRICS['News Writing'];
RUBRICS['Science & Technology Writing'] = RUBRICS['News Writing'];

export const CATEGORIES: Category[] = [
  'News Writing',
  'Editorial Writing',
  'Sports Writing',
  'Science & Technology Writing',
  'Feature Writing',
  'Column Writing',
  'Radio Broadcasting',
  'TV Broadcasting'
];

export const LEVELS = ['Elementary', 'Secondary'];
export const MEDIUMS = ['English', 'Filipino'];
