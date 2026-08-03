import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';

export type InsertEdgeData = {
  index: number;
  onInsert: (index: number) => void;
};

export default function InsertEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeData = data as InsertEdgeData | undefined;

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />

      {edgeData && (
        <EdgeLabelRenderer>
          <button
            type="button"
            aria-label="Insert stage here"
            onClick={() => edgeData.onInsert(edgeData.index)}
            className="nodrag nopan flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-input)] text-ink-500 outline-none transition-colors duration-150 hover:border-brand-600 hover:bg-[var(--color-surface-hover)] hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <Plus size={14} strokeWidth={2.6} />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
