import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full text-center py-2">
      <div className="w-auto inline-block mx-auto">
        <Image
          src="/images/logomercadopro.png"
          alt="MercadoPro Logo"
          width={400}
          height={157}
          priority
        />
      </div>
      <h1 className="text-base block font-light">
        Tu Titulo y Descripción de Producto Generado con IA
      </h1>
    </header>
  );
}
