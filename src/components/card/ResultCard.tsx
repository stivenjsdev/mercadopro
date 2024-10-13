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

interface ResultsCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  status: Status;
}

export default function ResultCard({
  title,
  description,
  children,
  status,
}: ResultsCardProps) {
  if (status === "loading") {
    return <ResultCardSkeleton />;
  }

  if (status === "error") {
    return <ResultCardError title={title} />;
  }

  if (!children) {
    return null;
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

const ResultCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-3/4 rounded-xl" />
      <Skeleton className="h-3 w-full rounded-xl" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

const ResultCardError = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>Error: {title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-red-500">
        Se produjo un error al procesar la información. Por favor inténtalo
        nuevamente.
      </p>
    </CardContent>
  </Card>
);
