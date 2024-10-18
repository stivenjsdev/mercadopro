import ResultCard from "@/components/card/ResultCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Status } from "@/types/formsData";
import {
  Category,
  SearchResponse,
  TrendsResponse,
} from "@/types/mercadolibreResponses";
import { capitalizeWords } from "@/utils";

type TitleAccordionProps = {
  productNameStorage: string;
  productNameKeywords: string[];
  imageKeywords: string[];
  categories: Category[];
  trends: TrendsResponse[][];
  searches: SearchResponse | null;
  suggestedTitles: string[];
  productNameKeywordsStatus: Status;
  searchesStatus: Status;
  trendsStatus: Status;
  categoriesStatus: Status;
  status: Status;
  imageStatus: Status;
  suggestTitles: (
    productName: string,
    productNameKeywords: string[],
    imageKeywords: string[],
    trends: TrendsResponse[][]
  ) => void;
};

export default function TitleAccordion({
  productNameStorage,
  productNameKeywords,
  imageKeywords,
  categories,
  trends,
  searches,
  suggestedTitles,
  productNameKeywordsStatus,
  searchesStatus,
  trendsStatus,
  categoriesStatus,
  status,
  imageStatus,
  suggestTitles,
}: TitleAccordionProps) {
  return (
    <Accordion
      defaultValue="item-6"
      type="single"
      collapsible
      className="w-full"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>
          Palabras claves por nombre de producto
        </AccordionTrigger>
        <AccordionContent>
          <ResultCard
            title="Palabras claves por nombre de producto"
            description="Estas son las sugerencias de búsqueda generadas por ML a partir del nombre de tu producto."
            status={productNameKeywordsStatus}
          >
            {productNameKeywords &&
              productNameKeywords.length > 0 &&
              productNameKeywords.map((productNameKeyword, index) => (
                <p key={index + productNameKeyword}>{productNameKeyword}</p>
              ))}
          </ResultCard>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>
          Palabras claves por imagen de producto
        </AccordionTrigger>
        <AccordionContent>
          <ResultCard
            title="Palabras claves por imagen de producto"
            description="Estas son las palabras claves generadas por IA a partir de la imagen otorgada de tu producto."
            status={imageStatus}
          >
            {imageKeywords &&
              imageKeywords.length > 0 &&
              imageKeywords.map((imageKeyword, index) => (
                <p key={`${index}-${imageKeyword}`}>{imageKeyword}</p>
              ))}
          </ResultCard>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>Categorías</AccordionTrigger>
        <AccordionContent>
          <ResultCard
            title="Categorías"
            description="Estas son las categorías encontradas en las búsquedas de tu producto."
            status={categoriesStatus}
          >
            {categories &&
              categories.length !== 0 &&
              categories.map((category) => (
                <p key={category.id} className="p-3">
                  {category.path_from_root.map((path) => path.name).join(" > ")}
                </p>
              ))}
          </ResultCard>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4">
        <AccordionTrigger>Tendencias</AccordionTrigger>
        <AccordionContent>
          <ResultCard
            title="Tendencias"
            description="Estas son las búsquedas más populares, ordenadas de la mayor a la menor para las categorías encontradas relacionadas a tu producto."
            status={trendsStatus}
          >
            {trends &&
              trends.length !== 0 &&
              trends.map((categoryTrends, i) => (
                <div key={i + "trendList"} className="p-3">
                  {categoryTrends.map((trend, j) => (
                    <p key={`${j}${i}-${trend.keyword}`}>
                      <span className="font-bold w-[25.5px] inline-block">
                        {j + 1}.
                      </span>{" "}
                      {trend.keyword}
                    </p>
                  ))}
                </div>
              ))}
          </ResultCard>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5">
        <AccordionTrigger>Búsquedas de Mercadolibre</AccordionTrigger>
        <AccordionContent>
          <ResultCard
            title="Búsquedas de Mercadolibre"
            description="Estos son los títulos de los productos encontrados en ML relacionados a tu producto."
            status={searchesStatus}
          >
            {searches &&
              searches.results.map((result) => (
                <div key={result.id} className="p-3">
                  <p>{result.title} </p>
                  <p className="text-xs">({result.title.length} caracteres)</p>
                </div>
              ))}
          </ResultCard>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-6">
        <AccordionTrigger className="font-extrabold">
          Titulo de Producto Sugerido
        </AccordionTrigger>
        <AccordionContent>
          <ResultCard
            title="Titulo de Producto Sugerido"
            description="Estas son las sugerencias de títulos generadas por IA para tu producto, utilizando todas las palabras claves anteriores."
            status={status}
          >
            {suggestedTitles && suggestedTitles.length !== 0 && (
              <>
                <Button
                  className="w-full"
                  onClick={() =>
                    suggestTitles(
                      productNameStorage,
                      productNameKeywords || [],
                      imageKeywords || [],
                      trends || []
                    )
                  }
                >
                  Generar de Nuevo
                </Button>
                {suggestedTitles.map((title, index) => {
                  if (title)
                    return (
                      <div key={index} className="p-3">
                        <p>{capitalizeWords(title.trim())} </p>
                        <p className="text-xs">({title.length} caracteres)</p>
                      </div>
                    );
                })}
              </>
            )}
          </ResultCard>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
