import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Status } from "@/types/formsData";
import React from "react";

interface ImageResultsCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  status: Status;
}

export function ResultCard({
  title,
  description,
  children,
  status,
}: ImageResultsCardProps) {
  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            An error occurred while processing the image. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {children && (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      )}
    </>
  );
}
