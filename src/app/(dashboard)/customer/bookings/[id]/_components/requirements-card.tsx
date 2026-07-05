
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RequirementsCard = ({ text }: { text: string }) => {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Your Requirements</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      </CardContent>
    </Card>
  );
}