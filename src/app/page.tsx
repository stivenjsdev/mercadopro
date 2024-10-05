import ImageSearch from "@/components/search/ImageSearch";
import TermSearch from "@/components/search/TermSearch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <header className="w-full">
        <h1 className="text-2xl text-center py-2 font-bold">
          <div className="">
            <Image
              src="/images/logomercadopro.png"
              alt="Logo"
              width={400}
              height={100}
              className="mx-auto"
              // style={{ clipPath: 'inset(50px 0 50px 0)' }}
            />
          </div>
          {/* Mercado<span className="text-[#FFCF00]">Pro</span> */}
          <span className="text-base block font-light">
            Tu Titulo y Descripción de Producto Generado con IA
          </span>
        </h1>
      </header>
      <main className="p-4">
        <div className="w-full max-w-lg mx-auto space-y-4">
          <Tabs defaultValue="term" className="w-full">
            <TabsList className="w-full flex flex-row">
              <TabsTrigger value="term" className="flex-1">
                Titulo de Producto
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1">
                Descripción de Producto
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
    </>
  );
}
