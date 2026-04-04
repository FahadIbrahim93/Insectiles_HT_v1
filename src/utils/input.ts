export const getLaneFromClientX = (
  clientX: number,
  canvasLeft: number,
  canvasWidth: number,
  laneCount: number
): number => {
  if (laneCount <= 0 || canvasWidth <= 0) return -1;

  const relativeX = clientX - canvasLeft;
  if (relativeX < 0 || relativeX >= canvasWidth) return -1;

  const laneWidth = canvasWidth / laneCount;
  const laneIndex = Math.floor(relativeX / laneWidth);
  if (laneIndex < 0 || laneIndex >= laneCount) return -1;
  return laneIndex;
};

export const triggerHaptic = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const getLanesFromSwipe = (startLane: number, endLane: number): number[] => {
  if (startLane < 0 || endLane < 0) return [];
  if (startLane === endLane) return [startLane];

  const direction = startLane < endLane ? 1 : -1;
  const lanes: number[] = [];
  for (let lane = startLane; lane !== endLane + direction; lane += direction) {
    lanes.push(lane);
  }
  return lanes;
};
