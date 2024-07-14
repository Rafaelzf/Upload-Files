"use client";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { FileIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideNav() {
  const pathname = usePathname();
  return (
    <div className="w-40">
      <Link href="/dashboard/files">
        <Button
          variant={"link"}
          className={clsx("flex gap-4", {
            "text-blue-600": pathname.includes("/dashboard/files"),
          })}
        >
          <FileIcon /> All files
        </Button>
      </Link>

      <Link href="/dashboard/favorites">
        <Button
          variant={"link"}
          className={clsx("flex gap-4", {
            "text-blue-600": pathname.includes("/dashboard/favorites"),
          })}
        >
          <StarIcon /> Favorites
        </Button>
      </Link>
    </div>
  );
}
