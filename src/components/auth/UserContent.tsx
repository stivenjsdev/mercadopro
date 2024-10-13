import DescriptionSearch from "@/components/search/DescriptionSearch";
import TitleSearch from "@/components/search/TitleSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfo } from "@/types/mercadolibreResponses";
import { Suspense } from "react";

interface UserContentProps {
  userInfo: UserInfo;
}

const UserContent = ({ userInfo }: UserContentProps) => {
  return (
    <>
      <h2 className="text-sm font-light text-center">
        {userInfo.first_name} {userInfo.last_name}
      </h2>
      <Tabs defaultValue="title" className="w-full">
        <TabsList className="w-full flex flex-row">
          <TabsTrigger value="title" className="flex-1">
            Titulo de Producto
          </TabsTrigger>
          <TabsTrigger value="description" className="flex-1">
            Descripción de Producto
          </TabsTrigger>
        </TabsList>
        <TabsContent value="title">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <TitleSearch userData={userInfo} />
          </Suspense>
        </TabsContent>
        <TabsContent value="description">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <DescriptionSearch userData={userInfo} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default UserContent;
