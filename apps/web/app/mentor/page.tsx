import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const requests = [
  { id: "r1", student: "Alice", subject: "Analyse", status: "En attente" },
  { id: "r2", student: "Bob", subject: "React", status: "En attente" },
];

export default function MentorPage() {
  return (
    <div className="mx-auto max-w-7xl p-6" data-testid="mentor-dashboard">
      <PageHeading
        title="Espace mentor"
        description="Demandes d'accompagnement (fixture)."
        actions={<Badge variant="secondary">2 en attente</Badge>}
      />
      <div className="mt-8 rounded-lg border border-border">
        <Table data-testid="mentor-table">
          <TableHeader>
            <TableRow>
              <TableHead>Étudiant</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.student}</TableCell>
                <TableCell>{r.subject}</TableCell>
                <TableCell>{r.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
