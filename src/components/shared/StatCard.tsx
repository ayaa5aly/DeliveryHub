import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  colorClass?: string;
  iconColorClass?: string;
  href?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  colorClass = "text-zinc-100",
  iconColorClass = "text-zinc-500 bg-zinc-900 border-zinc-800",
  href,
  className,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[120px] transition-all duration-300",
        href && "hover:border-zinc-700 cursor-pointer hover:bg-zinc-900/80 active:scale-[0.99]",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {title}
          </span>
          <p className={cn("text-3xl font-extrabold tracking-tight mt-0.5", colorClass)}>
            {value}
          </p>
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg border", iconColorClass)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {description && (
        <span className="text-[10px] text-zinc-500 font-semibold mt-2.5">{description}</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    );
  }

  return content;
}
