import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, lazy } from "react";

const AuthComponent = lazy(() => import("@/components/auth/AuthComponent"));

export default function Home() {
  return (
    <Suspense fallback={<Skeleton className="h-[36px] w-full" />}>
      <AuthComponent />
    </Suspense>
  );
}
