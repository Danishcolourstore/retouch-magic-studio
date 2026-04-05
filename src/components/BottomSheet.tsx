import React, { useRef, useCallback } from "react";
import { GripHorizontal } from "lucide-react";

interface BottomSheetProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  expanded,
  onExpandedChange,
  children,
}) => {
  const dragRef = useRef<{ startY: number; wasExpanded: boolean } | null>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = { startY: e.clientY, wasExpanded: expanded };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [expanded]
  );

  const handleDragEnd = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const delta = e.clientY - dragRef.current.startY;
      if (Math.abs(delta) > 30) {
        onExpandedChange(delta < 0);
      }
      dragRef.current = null;
    },
    [onExpandedChange]
  );

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl transition-all duration-300 ease-out ${
        expanded ? "max-h-[70vh]" : "max-h-16"
      }`}
    >
      <div
        className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
      >
        <GripHorizontal className="w-6 h-6 text-muted-foreground" />
      </div>
      {expanded && (
        <div className="px-4 pb-6 overflow-y-auto max-h-[calc(70vh-3rem)]">
          {children}
        </div>
      )}
    </div>
  );
};

export default BottomSheet;
