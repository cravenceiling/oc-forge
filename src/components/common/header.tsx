import Link from "next/link";
import { GithubBadge } from "@/components/common/github-badge";
import { ModeToggle } from "@/components/theme/theme-toggle";

export function Header() {
  return (
    <header className="border-b border-border shrink-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <span className="text-xl font-semibold">oc forge</span>
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          <GithubBadge />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
