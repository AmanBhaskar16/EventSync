
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "DISPUTED"];

export const ActionsCard = ({ status }: { status: string }) => {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {status === "CONFIRMED" && <Button className="w-full" size="sm">Mark as In Progress</Button>}
        {status === "IN_PROGRESS" && (
          <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">Mark as Completed</Button>
        )}
        {!TERMINAL_STATUSES.includes(status) && (
          <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
            Cancel booking
          </Button>
        )}
      </CardContent>
    </Card>
  );
}