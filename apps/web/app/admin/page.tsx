import { PageHeading } from "@/components/page-heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const users = [
  { id: "1", email: "alice@school.fr", role: "Étudiant", status: "Actif" },
  { id: "2", email: "bob@school.fr", role: "Mentor", status: "Actif" },
  { id: "3", email: "admin@allaboard.app", role: "Admin", status: "Actif" },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl p-6" data-testid="admin-dashboard">
      <PageHeading
        title="Administration"
        description="Tableau de bord admin MVP (données fixture)."
      />
      <div className="mt-8 rounded-lg border border-border">
        <Table data-testid="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
