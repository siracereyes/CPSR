
import { Rubric, Category } from './types';

export const RUBRICS: Record<string, Rubric> = {
  'News Writing': {
    category: 'News Writing',
    criteria: [
      { id: 'form', label: 'Form and Style', description: 'Technicalities, lead, organization (40%)', maxScore: 40 },
      { id: 'content', label: 'Content', description: 'Accuracy, relevance, depth (50%)', maxScore: 50 },
      { id: 'ethics', label: 'Ethics', description: 'Fairness and objectivity (10%)', maxScore: 10 },
    ]
  },
  'Editorial Writing': {
    category: 'Editorial Writing',
    criteria: [
      { id: 'form', label: 'Form and Style', description: 'Technicalities, lead, organization (40%)', maxScore: 40 },
      { id: 'content', label: 'Content', description: 'Logical arguments, stance (50%)', maxScore: 50 },
      { id: 'ethics', label: 'Ethics', description: 'Constructive criticism (10%)', maxScore: 10 },
    ]
  },
  'Sports Writing': {
    category: 'Sports Writing',
    criteria: [
      { id: 'form', label: 'Form and Style', description: 'Action-packed lead, terminology (40%)', maxScore: 40 },
      { id: 'content', label: 'Content', description: 'Game highlights, quotes (50%)', maxScore: 50 },
      { id: 'ethics', label: 'Ethics', description: 'Impartiality (10%)', maxScore: 10 },
    ]
  },
  'Science & Technology Writing': {
    category: 'Science & Technology Writing',
    criteria: [
      { id: 'form', label: 'Form and Style', description: 'Clarity, simple language (40%)', maxScore: 40 },
      { id: 'content', label: 'Content', description: 'Scientific accuracy, relevance (50%)', maxScore: 50 },
      { id: 'ethics', label: 'Ethics', description: 'Objectivity (10%)', maxScore: 10 },
    ]
  },
  'Feature Writing': {
    category: 'Feature Writing',
    criteria: [
      { id: 'content', label: 'Creative Content/Angle', description: 'Human interest, unique angle (40%)', maxScore: 40 },
      { id: 'style', label: 'Literary Style', description: 'Word choice, flow, impact (60%)', maxScore: 60 },
    ]
  },
  'Column Writing': {
    category: 'Column Writing',
    criteria: [
      { id: 'voice', label: 'Personality/Voice', description: 'Authorial tone and style (30%)', maxScore: 30 },
      { id: 'insight', label: 'Depth of Insight', description: 'Analysis and logic (50%)', maxScore: 50 },
      { id: 'impact', label: 'Impact', description: 'Reader engagement (20%)', maxScore: 20 },
    ]
  },
  'Radio Broadcasting': {
    category: 'Radio Broadcasting',
    criteria: [
      { id: 'anchor', label: 'Anchor Performance', description: 'Diction and delivery (20%)', maxScore: 20 },
      { id: 'presenter', label: 'News Presenter', description: 'Clarity and pace (20%)', maxScore: 20 },
      { id: 'technical', label: 'Technical Application', description: 'SFX/Mix quality (30%)', maxScore: 30 },
      { id: 'script', label: 'Script Quality', description: 'Structure and content (30%)', maxScore: 30 },
    ]
  },
  'TV Broadcasting': {
    category: 'TV Broadcasting',
    criteria: [
      { id: 'anchor', label: 'Anchor Presence', description: 'Visual and vocal delivery (20%)', maxScore: 20 },
      { id: 'reporter', label: 'Reporter Performance', description: 'On-cam delivery (20%)', maxScore: 20 },
      { id: 'production', label: 'Production Value', description: 'Editing and graphics (30%)', maxScore: 30 },
      { id: 'content', label: 'Broadcast Content', description: 'Flow and depth (30%)', maxScore: 30 },
    ]
  }
};

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
