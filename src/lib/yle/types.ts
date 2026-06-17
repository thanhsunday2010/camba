export interface YleSkillNodeData {
  id: string;
  label: string;
  emoji: string;
  href: string;
  progressPct: number;
  completed: number;
  total: number;
  locked?: boolean;
}
