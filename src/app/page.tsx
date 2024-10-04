import ImageSearch from "@/components/search/ImageSearch";
import TermSearch from "@/components/search/TermSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl text-center py-2 font-bold">
        Mercado<span className="text-[#FFCF00]">Pro</span>
        <span className="text-xs block font-light">
          Generador palabras claves de productos por: Sergio Jimenez
        </span>
      </h1>
      <div className="w-full max-w-lg mx-auto space-y-4">
        <Tabs defaultValue="term" className="w-full">
          <TabsList className="w-full flex flex-row">
            <TabsTrigger value="term" className="flex-1">
              Titulo Por Termino
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1">
              Descripción Por Imagen
            </TabsTrigger>
          </TabsList>
          <TabsContent value="term">
            <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
              {/* Componente Consulta por Termino */}
              <TermSearch />
            </Suspense>
          </TabsContent>
          <TabsContent value="image">
            <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
              {/* Componente Generar por URL de Imagen */}
              <ImageSearch />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
