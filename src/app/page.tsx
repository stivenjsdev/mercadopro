import AuthComponent from "@/components/auth/AuthComponent";
import { Skeleton } from "@/components/ui/skeleton";
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
          <Suspense fallback={<Skeleton className="h-[36px] w-full" />}>
            <AuthComponent />
          </Suspense>
        </div>
      </main>
    </>
  );
}
