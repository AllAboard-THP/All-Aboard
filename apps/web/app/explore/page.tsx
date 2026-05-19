import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedEmpty } from "@/components/feed/feed-empty";
import { PageHeading } from "@/components/page-heading";

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6" data-testid="explore-page">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Explorer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeading
        title="Explorer"
        description="Parcourir par matière et niveau (MVP — contenu à brancher)."
      />

      <Tabs defaultValue="matieres" className="mt-8">
        <TabsList>
          <TabsTrigger value="matieres">Matières</TabsTrigger>
          <TabsTrigger value="niveaux">Niveaux</TabsTrigger>
        </TabsList>
        <TabsContent value="matieres">
          <FeedEmpty message="Aucune matière publiée pour le moment." />
        </TabsContent>
        <TabsContent value="niveaux">
          <FeedEmpty message="Filtres par niveau — à venir." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
