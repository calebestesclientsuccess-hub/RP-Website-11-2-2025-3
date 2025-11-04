import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, Calendar } from "lucide-react";
import type { AssessmentResponse } from "@shared/schema";

export default function AssessmentAdminDashboard() {
  const [searchEmail, setSearchEmail] = useState("");
  const [bucketFilter, setBucketFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: assessments = [], isLoading, refetch } = useQuery<AssessmentResponse[]>({
    queryKey: ['/api/assessments'],
  });

  const filteredAssessments = assessments.filter((assessment) => {
    if (bucketFilter && assessment.bucket !== bucketFilter) return false;
    if (searchEmail && !assessment.q20?.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    if (startDate && new Date(assessment.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(assessment.createdAt) > new Date(endDate)) return false;
    return true;
  });

  const bucketCounts = assessments.reduce((acc, assessment) => {
    const bucket = assessment.bucket || 'unassigned';
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportToCSV = () => {
    const headers = [
      'ID', 'Session ID', 'Email', 'Bucket', 'Completed', 'Used Calculator', 'Created At',
      'Q1_Philosophy', 'Q2_SaleType', 'Q3_CriticalPiece', 'Q4_Urgency', 'Q5_Consequence',
      'Q6_Owner', 'Q7_ProblemType', 'Q8_CurrentAllocation', 'Q9_PipelineTrouble',
      'Q10a1_SDRCount', 'Q10a2_OtherCount', 'Q10b1_DataSource', 'Q10b2_ICP',
      'Q10c1_TrainingVideo', 'Q10c2_CloseRate', 'Q11_Budget',
      'Q13_LTV', 'Q14_WinRate', 'Q15_ContractTerm', 'Q16_GrossMargin',
      'Q17_SalesCycle', 'Q18_DealSize', 'Q19_AdditionalContext'
    ];
    
    const rows = filteredAssessments.map(a => [
      a.id,
      a.sessionId || '',
      a.q20 || '',
      a.bucket || '',
      a.completed ? 'Yes' : 'No',
      a.usedCalculator ? 'Yes' : 'No',
      new Date(a.createdAt).toLocaleString(),
      a.q1 || '',
      a.q2 || '',
      a.q3 || '',
      a.q4 || '',
      a.q5 || '',
      a.q6 || '',
      a.q7 || '',
      a.q8 || '',
      a.q9 || '',
      a.q10a1 || '',
      a.q10a2 || '',
      a.q10b1 || '',
      a.q10b2 || '',
      a.q10c1 || '',
      a.q10c2 || '',
      a.q11 || '',
      a.q13 || '',
      a.q14 || '',
      a.q15 || '',
      a.q16 || '',
      a.q17 || '',
      a.q18 || '',
      a.q19 || '',
    ].map(field => `"${String(field).replace(/"/g, '""')}"`));

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-assessments-${new Date().toISOString()}.csv`;
    a.click();
  };

  const getBucketBadgeVariant = (bucket: string | null) => {
    switch (bucket) {
      case 'hot-mql-architect': return 'default';
      case 'architecture-gap': return 'secondary';
      case 'person-trap': return 'destructive';
      case 'agency': return 'outline';
      case 'freelancer': return 'outline';
      default: return 'secondary';
    }
  };

  const getBucketLabel = (bucket: string | null) => {
    switch (bucket) {
      case 'hot-mql-architect': return 'Hot MQL';
      case 'architecture-gap': return 'Architecture Gap';
      case 'person-trap': return 'Person Trap';
      case 'agency': return 'Agency';
      case 'freelancer': return 'Freelancer';
      default: return 'Unassigned';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Assessment Admin Dashboard | Revenue Party"
        description="Admin dashboard for pipeline assessment submissions"
      />

      <div className="pt-32 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-dashboard">
              Assessment Submissions
            </h1>
            <p className="text-lg text-muted-foreground">
              View and manage all pipeline assessment submissions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Object.entries(bucketCounts).map(([bucket, count]) => (
              <Card key={bucket} className="p-4">
                <div className="text-sm text-muted-foreground mb-1">{getBucketLabel(bucket)}</div>
                <div className="text-3xl font-bold">{count}</div>
              </Card>
            ))}
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Filters</h3>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Email</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bucket</label>
                  <Select value={bucketFilter} onValueChange={setBucketFilter}>
                    <SelectTrigger data-testid="select-bucket">
                      <SelectValue placeholder="All Buckets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Buckets</SelectItem>
                      <SelectItem value="hot-mql-architect">Hot MQL</SelectItem>
                      <SelectItem value="architecture-gap">Architecture Gap</SelectItem>
                      <SelectItem value="person-trap">Person Trap</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchEmail('');
                    setBucketFilter('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={exportToCSV}
                  disabled={filteredAssessments.length === 0}
                  data-testid="button-export"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  Loading submissions...
                </div>
              ) : filteredAssessments.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No submissions found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Bucket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Calculator</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment) => (
                      <TableRow key={assessment.id} data-testid={`row-assessment-${assessment.id}`}>
                        <TableCell className="font-medium">
                          {assessment.q20 || 'No email provided'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBucketBadgeVariant(assessment.bucket)}>
                            {getBucketLabel(assessment.bucket)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assessment.completed ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              In Progress
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {assessment.usedCalculator ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const data = JSON.stringify(assessment, null, 2);
                              const blob = new Blob([data], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `assessment-${assessment.id}.json`;
                              a.click();
                            }}
                            data-testid={`button-download-${assessment.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAssessments.length} of {assessments.length} submissions
          </div>
        </div>
      </div>
    </div>
  );
}
