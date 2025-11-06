import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ZoneInfo {
  zone: number;
  pages: string[];
  location: string;
}

const zoneData: ZoneInfo[] = [
  { zone: 1, pages: ["Home", "About", "Pricing", "Contact", "Blog Index"], location: "Top of page" },
  { zone: 2, pages: ["Home", "About", "Blog Index"], location: "Below hero section" },
  { zone: 3, pages: ["Home", "About", "Pricing"], location: "Mid-content area" },
  { zone: 4, pages: ["Home", "About", "Pricing", "Contact", "Blog Index"], location: "Mid-to-bottom content" },
  { zone: 5, pages: ["Home", "About"], location: "Lower content section" },
  { zone: 6, pages: ["Home"], location: "Footer area" },
  { zone: 7, pages: ["About"], location: "About-specific section 1" },
  { zone: 8, pages: ["About"], location: "About-specific section 2" },
  { zone: 9, pages: ["Pricing"], location: "Pricing-specific section 1" },
  { zone: 10, pages: ["Pricing"], location: "Pricing-specific section 2" },
  { zone: 11, pages: ["Contact"], location: "Contact-specific section" },
  { zone: 12, pages: ["Blog Index"], location: "Blog-specific section 1" },
  { zone: 13, pages: ["Blog Index"], location: "Blog-specific section 2" },
  { zone: 14, pages: ["Blog Index"], location: "Blog-specific section 3" },
  { zone: 15, pages: ["GTM Engine"], location: "GTM Engine section 1" },
  { zone: 16, pages: ["GTM Engine"], location: "GTM Engine section 2" },
  { zone: 17, pages: ["GTM Engine"], location: "GTM Engine section 3" },
  { zone: 18, pages: ["GTM Engine"], location: "GTM Engine section 4" },
  { zone: 19, pages: ["GTM Engine"], location: "GTM Engine section 5" },
  { zone: 20, pages: ["FAQ"], location: "FAQ section 1" },
  { zone: 21, pages: ["FAQ"], location: "FAQ section 2" },
  { zone: 22, pages: ["FAQ"], location: "FAQ section 3" },
  { zone: 23, pages: ["FAQ"], location: "FAQ section 4" },
  { zone: 24, pages: ["Problem"], location: "Problem section 1" },
  { zone: 25, pages: ["Problem"], location: "Problem section 2" },
  { zone: 26, pages: ["Problem"], location: "Problem section 3" },
  { zone: 27, pages: ["Problem"], location: "Problem section 4" },
  { zone: 28, pages: ["Problem"], location: "Problem section 5" },
  { zone: 29, pages: ["Problem"], location: "Problem section 6" },
  { zone: 30, pages: ["Audit"], location: "Audit section" },
];

interface ZoneReferenceGuideProps {
  trigger?: React.ReactNode;
}

export function ZoneReferenceGuide({ trigger }: ZoneReferenceGuideProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-zone-guide">
            <Info className="w-4 h-4 mr-2" />
            View Zone Guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">Zone Reference Guide</DialogTitle>
          <DialogDescription data-testid="text-dialog-description">
            See where each zone appears across different pages
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24" data-testid="text-header-zone">Zone</TableHead>
                <TableHead data-testid="text-header-used-on">Used On</TableHead>
                <TableHead data-testid="text-header-location">Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zoneData.map((zoneInfo) => (
                <TableRow key={zoneInfo.zone} data-testid={`row-zone-${zoneInfo.zone}`}>
                  <TableCell className="font-medium" data-testid={`text-zone-${zoneInfo.zone}`}>
                    Zone {zoneInfo.zone}
                  </TableCell>
                  <TableCell data-testid={`text-pages-${zoneInfo.zone}`}>
                    {zoneInfo.pages.join(", ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-location-${zoneInfo.zone}`}>
                    {zoneInfo.location}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
