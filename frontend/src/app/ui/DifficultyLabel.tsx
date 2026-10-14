const styles: Record<string, string> = {
  easy: "text-emerald-400",
  med: "text-orange-300",
  medium: "text-orange-300",
  hard: "text-red-400",
};

const labels: Record<string, string> = {
  easy: "easy",
  med: "medium",
  medium: "medium",
  hard: "hard",
};

export default function DifficultyLabel({ diff }: { diff?: string }) {
  const key = (diff || "easy").toLowerCase();
  return (
    <span
      className={`text-xs font-medium lowercase tracking-wide ${styles[key] || styles.easy}`}
    >
      {labels[key] || "easy"}
    </span>
  );
}
