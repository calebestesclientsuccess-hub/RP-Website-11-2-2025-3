import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SubmissionResponse {
  id: string;
  sessionId: string;
  answers: string;
  finalScore: number | null;
  finalBucketKey: string | null;
  name: string | null;
  email: string | null;
  company: string | null;
  createdAt: string;
  bucketName: string;
}

interface SubmissionsTableProps {
  assessmentId: string;
}

export function SubmissionsTable({ assessmentId }: SubmissionsTableProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [bucketKey, setBucketKey] = useState<string>("all");

  // Build query params
  const queryParams = new URLSearchParams();
  if (startDate) {
    queryParams.append("startDate", startDate.toISOString());
  }
  if (endDate) {
    queryParams.append("endDate", endDate.toISOString());
  }
  if (bucketKey && bucketKey !== "all") {
    queryParams.append("bucketKey", bucketKey);
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/configurable-assessments/${assessmentId}/responses${
    queryString ? `?${queryString}` : ""
  }`;

  const { data: responses, isLoading } = useQuery<SubmissionResponse[]>({
    queryKey: ["/api/configurable-assessments", assessmentId, "responses", startDate, endDate, bucketKey],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }
      return response.json();
    },
  });

  // Get unique bucket keys from responses for filter dropdown
  const uniqueBuckets = Array.from(
    new Set(
      responses?.map((r) => ({
        key: r.finalBucketKey || "",
        name: r.bucketName || "Unknown",
      })) || []
    )
  ).filter((b) => b.key);

  // Deduplicate by key
  const bucketOptions = Array.from(
    new Map(uniqueBuckets.map((b) => [b.key, b])).values()
  );

  const exportCSV = () => {
    if (!responses || responses.length === 0) return;

    const csv = [
      ["Date", "Name", "Email", "Company", "Result", "Score"],
      ...responses.map((r) => [
        format(new Date(r.createdAt), "yyyy-MM-dd HH:mm"),
        r.name || "",
        r.email || "",
        r.company || "",
        r.bucketName || r.finalBucketKey || "",
        r.finalScore?.toString() || "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-responses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setBucketKey("all");
  };

  const hasFilters = startDate || endDate || (bucketKey && bucketKey !== "all");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Start Date Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  data-testid="button-start-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  data-testid="calendar-start-date"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  data-testid="button-end-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  data-testid="calendar-end-date"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Result Bucket Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Result Bucket</label>
            <Select value={bucketKey} onValueChange={setBucketKey}>
              <SelectTrigger className="w-[200px]" data-testid="select-bucket">
                <SelectValue placeholder="All results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-bucket-all">
                  All results
                </SelectItem>
                {bucketOptions.map((bucket) => (
                  <SelectItem
                    key={bucket.key}
                    value={bucket.key}
                    data-testid={`option-bucket-${bucket.key}`}
                  >
                    {bucket.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Export CSV Button */}
        <Button
          onClick={exportCSV}
          disabled={!responses || responses.length === 0}
          data-testid="button-export-csv"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {isLoading ? (
          <div
            className="flex justify-center items-center py-12"
            data-testid="loading-submissions"
          >
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : !responses || responses.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-testid="empty-submissions"
          >
            <p className="text-muted-foreground">No submissions found</p>
            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="mt-2"
                data-testid="button-clear-filters-empty"
              >
                Clear filters to see all submissions
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="header-date">Date</TableHead>
                <TableHead data-testid="header-name">Name</TableHead>
                <TableHead data-testid="header-email">Email</TableHead>
                <TableHead data-testid="header-company">Company</TableHead>
                <TableHead data-testid="header-result">Result Bucket</TableHead>
                <TableHead data-testid="header-score">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <TableRow key={response.id} data-testid={`row-submission-${response.id}`}>
                  <TableCell data-testid={`cell-date-${response.id}`}>
                    {format(new Date(response.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell data-testid={`cell-name-${response.id}`}>
                    {response.name || "-"}
                  </TableCell>
                  <TableCell data-testid={`cell-email-${response.id}`}>
                    {response.email || "-"}
                  </TableCell>
                  <TableCell data-testid={`cell-company-${response.id}`}>
                    {response.company || "-"}
                  </TableCell>
                  <TableCell data-testid={`cell-bucket-${response.id}`}>
                    {response.bucketName || response.finalBucketKey || "-"}
                  </TableCell>
                  <TableCell data-testid={`cell-score-${response.id}`}>
                    {response.finalScore !== null ? response.finalScore : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Results count */}
      {responses && responses.length > 0 && (
        <p className="text-sm text-muted-foreground" data-testid="text-results-count">
          Showing {responses.length} {responses.length === 1 ? "submission" : "submissions"}
        </p>
      )}
    </div>
  );
}
