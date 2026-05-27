import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/alert";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Separator } from "../components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import { Skeleton } from "../components/skeleton";
import { Toaster } from "../components/sonner";
import { Textarea } from "../components/textarea";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";

const meta = {
  title: "Documentation/Catalog",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Listing des 11 primitives MVP — une entrée par composant dans la sidebar. Pour le détail des variantes, voir aussi **Components/**.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function CatalogSection({
  index,
  name,
  importPath,
  children,
}: {
  index: number;
  name: string;
  importPath: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border px-6 py-10 last:border-b-0">
      <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
        {String(index).padStart(2, "0")} · Primitive
      </p>
      <h2 className="mt-2 mb-1 text-2xl font-semibold text-foreground">{name}</h2>
      <p className="mb-6 font-mono text-xs text-muted-foreground">{importPath}</p>
      <div className="max-w-2xl">{children}</div>
    </section>
  );
}

/** Vue d’ensemble — toutes les primitives sur une page (scroll). */
export const ListingComplet: Story = {
  name: "00 · Listing complet",
  render: () => (
    <div className="mx-auto max-w-3xl bg-background">
      <header className="border-b border-border px-6 py-8">
        <h1 className="m-0 text-3xl font-semibold text-foreground">
          Catalogue primitives
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Onze composants MVP. Utilise la sidebar{" "}
          <strong className="text-foreground">Documentation → Catalog → 01…11</strong> pour
          les voir un par un, ou fais défiler cette page.
        </p>
        <ul className="mt-4 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "01 Alert",
            "02 Badge",
            "03 Button",
            "04 Card",
            "05 Input",
            "06 Label",
            "07 Separator",
            "08 Skeleton",
            "09 Textarea",
            "10 Sonner (Toast)",
            "11 Select",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </header>

      <CatalogSection
        index={1}
        name="Alert"
        importPath='@allaboard/ui/components/alert'
      >
        <div className="space-y-3">
          <Alert>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>Message neutre.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>Impossible de charger le feed.</AlertDescription>
          </Alert>
        </div>
      </CatalogSection>

      <CatalogSection index={2} name="Badge" importPath='@allaboard/ui/components/badge'>
        <div className="flex flex-wrap gap-2">
          <Badge>default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="destructive">destructive</Badge>
        </div>
      </CatalogSection>

      <CatalogSection index={3} name="Button" importPath='@allaboard/ui/components/button'>
        <div className="flex flex-wrap gap-2">
          <Button>default</Button>
          <Button variant="secondary">secondary</Button>
          <Button variant="outline">outline</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="destructive">destructive</Button>
        </div>
      </CatalogSection>

      <CatalogSection index={4} name="Card" importPath='@allaboard/ui/components/card'>
        <Card>
          <CardHeader>
            <CardTitle>Titre carte</CardTitle>
            <CardDescription>Sous-titre ou métadonnées.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="m-0 text-sm text-foreground">Contenu principal.</p>
          </CardContent>
        </Card>
      </CatalogSection>

      <CatalogSection index={5} name="Input" importPath='@allaboard/ui/components/input'>
        <div className="grid gap-3">
          <Input placeholder="Champ texte" />
          <Input aria-invalid placeholder="État invalide" />
        </div>
      </CatalogSection>

      <CatalogSection index={6} name="Label" importPath='@allaboard/ui/components/label'>
        <div className="grid gap-2">
          <Label htmlFor="catalog-label">Libellé de champ</Label>
          <Input id="catalog-label" placeholder="Associé à un input" />
        </div>
      </CatalogSection>

      <CatalogSection index={7} name="Separator" importPath='@allaboard/ui/components/separator'>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Au-dessus</p>
          <Separator />
          <p className="text-sm text-muted-foreground">En-dessous</p>
        </div>
      </CatalogSection>

      <CatalogSection index={8} name="Skeleton" importPath='@allaboard/ui/components/skeleton'>
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </CatalogSection>

      <CatalogSection index={9} name="Textarea" importPath='@allaboard/ui/components/textarea'>
        <Textarea rows={3} placeholder="Texte multiligne" />
      </CatalogSection>

      <CatalogSection
        index={10}
        name="Sonner (Toast)"
        importPath='@allaboard/ui/components/sonner'
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Button onClick={() => toast.success("Toast catalogue")}>Afficher un toast</Button>
          <Toaster />
        </ThemeProvider>
      </CatalogSection>

      <CatalogSection index={11} name="Select" importPath='@allaboard/ui/components/select'>
        <Select defaultValue="javascript">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="rails">Rails</SelectItem>
          </SelectContent>
        </Select>
      </CatalogSection>
    </div>
  ),
};

export const AlertCatalog: Story = {
  name: "01 · Alert",
  render: () => (
    <div className="p-8">
      <CatalogSection index={1} name="Alert" importPath='@allaboard/ui/components/alert'>
        <div className="space-y-3">
          <Alert>
            <AlertTitle>Connexion requise</AlertTitle>
            <AlertDescription>Message informatif.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Impossible de charger le feed</AlertTitle>
            <AlertDescription>Feed HTTP 502</AlertDescription>
          </Alert>
        </div>
      </CatalogSection>
    </div>
  ),
};

export const BadgeCatalog: Story = {
  name: "02 · Badge",
  render: () => (
    <div className="p-8">
      <CatalogSection index={2} name="Badge" importPath='@allaboard/ui/components/badge'>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">mentor</Badge>
          <Badge variant="outline">javascript</Badge>
        </div>
      </CatalogSection>
    </div>
  ),
};

export const ButtonCatalog: Story = {
  name: "03 · Button",
  render: () => (
    <div className="p-8">
      <CatalogSection index={3} name="Button" importPath='@allaboard/ui/components/button'>
        <div className="flex flex-wrap gap-2">
          <Button>Nouvelle demande</Button>
          <Button variant="outline">Retour</Button>
          <Button disabled>Envoi…</Button>
        </div>
      </CatalogSection>
    </div>
  ),
};

export const CardCatalog: Story = {
  name: "04 · Card",
  render: () => (
    <div className="p-8">
      <CatalogSection index={4} name="Card" importPath='@allaboard/ui/components/card'>
        <Card className="transition-colors hover:border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Titre feed</CardTitle>
            <CardDescription>Auteur : bob · 26 mai 2026</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="secondary">mentor</Badge>
          </CardContent>
        </Card>
      </CatalogSection>
    </div>
  ),
};

export const InputCatalog: Story = {
  name: "05 · Input",
  render: () => (
    <div className="p-8">
      <CatalogSection index={5} name="Input" importPath='@allaboard/ui/components/input'>
        <Input placeholder="Tags (optionnel)" />
      </CatalogSection>
    </div>
  ),
};

export const LabelCatalog: Story = {
  name: "06 · Label",
  render: () => (
    <div className="p-8">
      <CatalogSection index={6} name="Label" importPath='@allaboard/ui/components/label'>
        <Label htmlFor="cat-label-demo">Mot de passe MVP</Label>
      </CatalogSection>
    </div>
  ),
};

export const SeparatorCatalog: Story = {
  name: "07 · Separator",
  render: () => (
    <div className="p-8">
      <CatalogSection index={7} name="Separator" importPath='@allaboard/ui/components/separator'>
        <Separator className="my-4" />
      </CatalogSection>
    </div>
  ),
};

export const SkeletonCatalog: Story = {
  name: "08 · Skeleton",
  render: () => (
    <div className="p-8">
      <CatalogSection index={8} name="Skeleton" importPath='@allaboard/ui/components/skeleton'>
        <Skeleton className="h-28 w-full max-w-md rounded-lg" />
      </CatalogSection>
    </div>
  ),
};

export const TextareaCatalog: Story = {
  name: "09 · Textarea",
  render: () => (
    <div className="p-8">
      <CatalogSection index={9} name="Textarea" importPath='@allaboard/ui/components/textarea'>
        <Textarea rows={4} placeholder="Titre / description de la demande" />
      </CatalogSection>
    </div>
  ),
};

export const SonnerCatalog: Story = {
  name: "10 · Sonner (Toast)",
  render: () => (
    <div className="p-8">
      <CatalogSection
        index={10}
        name="Sonner (Toast)"
        importPath='@allaboard/ui/components/sonner'
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Button onClick={() => toast("Notification catalogue")}>Toast</Button>
          <Toaster />
        </ThemeProvider>
      </CatalogSection>
    </div>
  ),
};

export const SelectCatalog: Story = {
  name: "11 · Select",
  render: () => (
    <div className="p-8">
      <CatalogSection index={11} name="Select" importPath='@allaboard/ui/components/select'>
        <Select defaultValue="mentor">
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="help">Aide</SelectItem>
          </SelectContent>
        </Select>
      </CatalogSection>
    </div>
  ),
};
