import clsx from "clsx";

type BadgeVariant = "blue" | "green" | "amber" | "red" | "gray";

const styles: Record<BadgeVariant, string> = {
  blue: "bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300",
  green: "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400",
  amber: "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
  red: "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400",
  gray: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
};

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "gray",
  dot,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-[11px] font-semibold px-[9px] py-[3px] rounded-full",
        styles[variant],
        className,
      )}
    >
      {dot && <span className="w-[5px] h-[5px] rounded-full bg-current" />}
      {children}
    </span>
  );
}
