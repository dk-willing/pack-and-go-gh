"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@pack-and-go/types";
import { useAuth } from "@/components/AuthProvider";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || (roles && !roles.includes(user.role))))
      router.replace("/login");
  }, [isLoading, roles, router, user]);

  if (isLoading || !user || (roles && !roles.includes(user.role))) return null;
  return <>{children}</>;
}
