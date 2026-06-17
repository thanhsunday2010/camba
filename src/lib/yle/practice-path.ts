import {
  YLE_ORBIT_NODES,
  YLE_PRACTICE_ORDER,
  yleSkillPath,
  type YleLevel,
  type YleOrbitNodeId,
} from "@/lib/yle/constants";
import type { YleSkillNodeData } from "@/lib/yle/types";

export interface YleContinueSuggestion {
  nodeId: YleOrbitNodeId;
  href: string;
  label: string;
  emoji: string;
  reason: string;
  progressPct: number;
  stepIndex: number;
  totalSteps: number;
}

export function suggestYleContinue(
  level: YleLevel,
  nodes: YleSkillNodeData[]
): YleContinueSuggestion | null {
  const byId = new Map(nodes.map((n) => [n.id as YleOrbitNodeId, n]));
  const totalSteps = YLE_PRACTICE_ORDER.length;

  for (let i = 0; i < YLE_PRACTICE_ORDER.length; i++) {
    const nodeId = YLE_PRACTICE_ORDER[i]!;
    const node = byId.get(nodeId);
    if (!node || node.locked) continue;

    const incomplete = node.total === 0 || node.completed < node.total || node.progressPct < 100;
    if (incomplete) {
      const def = YLE_ORBIT_NODES.find((n) => n.id === nodeId);
      return {
        nodeId,
        href: node.href || yleSkillPath(level, nodeId),
        label: node.label,
        emoji: node.emoji,
        reason:
          node.completed === 0
            ? "Bước tiếp theo trên lộ trình hôm nay"
            : `Đang dở · ${node.progressPct}% hoàn thành`,
        progressPct: node.progressPct,
        stepIndex: i + 1,
        totalSteps,
      };
    }
  }

  const mock = byId.get("MOCK");
  if (mock && !mock.locked) {
    return {
      nodeId: "MOCK",
      href: mock.href,
      label: mock.label,
      emoji: mock.emoji,
      reason: "Đã luyện đủ kỹ năng — thử mock full!",
      progressPct: mock.progressPct,
      stepIndex: totalSteps,
      totalSteps,
    };
  }

  const first = byId.get("READING");
  if (first && !first.locked) {
    return {
      nodeId: "READING",
      href: first.href,
      label: first.label,
      emoji: first.emoji,
      reason: "Luyện lại từ đầu để giữ phong độ",
      progressPct: first.progressPct,
      stepIndex: 1,
      totalSteps,
    };
  }

  return null;
}

export function getNextYleSkillAfter(
  level: YleLevel,
  currentNodeId: YleOrbitNodeId
): { href: string; label: string; emoji: string } | null {
  const idx = YLE_PRACTICE_ORDER.indexOf(currentNodeId);
  if (idx < 0) return null;

  for (let i = idx + 1; i < YLE_PRACTICE_ORDER.length; i++) {
    const nextId = YLE_PRACTICE_ORDER[i]!;
    const def = YLE_ORBIT_NODES.find((n) => n.id === nextId);
    if (!def) continue;
    return {
      href: yleSkillPath(level, nextId),
      label: def.label,
      emoji: def.emoji,
    };
  }
  return null;
}

export function yleHubHref(level: YleLevel): string {
  return `/yle/${level}`;
}
