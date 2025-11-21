import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DynamicForm } from "@/components/widgets/DynamicForm";
import type { CustomFieldDefinition, FormConfig, FormField } from "@shared/schema";
import { mapDefinitionToFormField } from "@/lib/crm-field-utils";

type CrmObjectType =
  | "company"
  | "contact"
  | "deal"
  | "email"
  | "phone_call"
  | "meeting"
  | "task";

interface ColumnConfig {
  key: string;
  label: string;
  render?: (record: any) => ReactNode;
  className?: string;
}

interface CrmEntityConfig {
  key: string;
  label: string;
  description: string;
  objectType: CrmObjectType;
  apiPath: string;
  baseFields: FormField[];
  listColumns: ColumnConfig[];
  timelineKey?: "companyId" | "contactId" | "dealId";
  ctaLabel: string;
}

const CRM_ENTITY_CONFIGS: CrmEntityConfig[] = [
  {
    key: "companies",
    label: "Companies",
    description: "Manage organizations in your CRM.",
    objectType: "company",
    apiPath: "/api/crm/companies",
    baseFields: [
      { name: "name", label: "Company Name", type: "text", required: true },
      { name: "domain", label: "Domain", type: "text" },
      { name: "industry", label: "Industry", type: "text" },
      { name: "website", label: "Website", type: "text" },
    ],
    listColumns: [
      {
        key: "name",
        label: "Company",
        render: (record) => (
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-muted-foreground">{record.domain}</div>
          </div>
        ),
      },
      { key: "industry", label: "Industry" },
      {
        key: "updatedAt",
        label: "Updated",
        render: (record) =>
          record.updatedAt ? new Date(record.updatedAt).toLocaleDateString() : "—",
      },
    ],
    timelineKey: "companyId",
    ctaLabel: "New Company",
  },
  {
    key: "contacts",
    label: "Contacts",
    description: "Track the people tied to each company.",
    objectType: "contact",
    apiPath: "/api/crm/contacts",
    baseFields: [
      { name: "firstName", label: "First Name", type: "text", required: true },
      { name: "lastName", label: "Last Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "title", label: "Title", type: "text" },
      { name: "companyId", label: "Company ID", type: "text" },
    ],
    listColumns: [
      {
        key: "name",
        label: "Contact",
        render: (record) => (
          <div>
            <div className="font-medium">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{record.email}</div>
          </div>
        ),
      },
      { key: "title", label: "Title" },
      { key: "companyId", label: "Company ID" },
    ],
    timelineKey: "contactId",
    ctaLabel: "New Contact",
  },
  {
    key: "deals",
    label: "Deals",
    description: "Monitor open opportunities and revenue.",
    objectType: "deal",
    apiPath: "/api/crm/deals",
    baseFields: [
      { name: "name", label: "Deal Name", type: "text", required: true },
      { name: "companyId", label: "Company ID", type: "text" },
      { name: "contactId", label: "Contact ID", type: "text" },
      { name: "ownerId", label: "Owner ID", type: "text" },
      { name: "stage", label: "Stage", type: "text" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "open" },
          { label: "Won", value: "won" },
          { label: "Lost", value: "lost" },
        ],
      },
      { name: "amount", label: "Amount", type: "number" },
      { name: "closeDate", label: "Close Date", type: "text" },
      { name: "source", label: "Source", type: "text" },
    ],
    listColumns: [
      {
        key: "name",
        label: "Deal",
        render: (record) => (
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-muted-foreground">{record.companyId}</div>
          </div>
        ),
      },
      {
        key: "stage",
        label: "Stage",
        render: (record) => (
          <Badge variant="outline" className="capitalize">
            {record.stage || "N/A"}
          </Badge>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        render: (record) =>
          typeof record.amount === "number"
            ? `$${record.amount.toLocaleString()}`
            : "—",
      },
    ],
    timelineKey: "dealId",
    ctaLabel: "New Deal",
  },
  {
    key: "emails",
    label: "Emails",
    description: "Log email activity for stakeholders.",
    objectType: "email",
    apiPath: "/api/crm/emails",
    baseFields: [
      { name: "companyId", label: "Company ID", type: "text" },
      { name: "contactId", label: "Contact ID", type: "text" },
      { name: "dealId", label: "Deal ID", type: "text" },
      { name: "ownerId", label: "Owner ID", type: "text" },
      { name: "subject", label: "Subject", type: "text", required: true },
      { name: "body", label: "Body", type: "textarea" },
      {
        name: "direction",
        label: "Direction",
        type: "select",
        options: [
          { label: "Outbound", value: "outbound" },
          { label: "Inbound", value: "inbound" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Logged", value: "logged" },
          { label: "Draft", value: "draft" },
        ],
      },
      { name: "sentAt", label: "Sent At", type: "text" },
    ],
    listColumns: [
      {
        key: "subject",
        label: "Subject",
        render: (record) => (
          <div>
            <div className="font-medium">{record.subject}</div>
            <div className="text-xs text-muted-foreground">{record.contactId}</div>
          </div>
        ),
      },
      {
        key: "direction",
        label: "Direction",
        render: (record) => (
          <Badge variant="outline" className="capitalize">
            {record.direction}
          </Badge>
        ),
      },
      {
        key: "sentAt",
        label: "Sent",
        render: (record) =>
          record.sentAt ? new Date(record.sentAt).toLocaleString() : "Scheduled",
      },
    ],
    ctaLabel: "Log Email",
  },
  {
    key: "phone_calls",
    label: "Phone Calls",
    description: "Capture phone conversations.",
    objectType: "phone_call",
    apiPath: "/api/crm/phone-calls",
    baseFields: [
      { name: "companyId", label: "Company ID", type: "text" },
      { name: "contactId", label: "Contact ID", type: "text" },
      { name: "dealId", label: "Deal ID", type: "text" },
      { name: "ownerId", label: "Owner ID", type: "text" },
      {
        name: "callType",
        label: "Call Type",
        type: "select",
        options: [
          { label: "Outbound", value: "outbound" },
          { label: "Inbound", value: "inbound" },
        ],
      },
      { name: "subject", label: "Subject", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "durationSeconds", label: "Duration (seconds)", type: "number" },
      { name: "outcome", label: "Outcome", type: "text" },
      { name: "calledAt", label: "Called At", type: "text" },
    ],
    listColumns: [
      {
        key: "subject",
        label: "Subject",
        render: (record) => (
          <div>
            <div className="font-medium">{record.subject || "Untitled Call"}</div>
            <div className="text-xs text-muted-foreground">{record.contactId}</div>
          </div>
        ),
      },
      { key: "callType", label: "Type" },
      {
        key: "calledAt",
        label: "Called",
        render: (record) =>
          record.calledAt ? new Date(record.calledAt).toLocaleString() : "—",
      },
    ],
    ctaLabel: "Log Phone Call",
  },
  {
    key: "meetings",
    label: "Meetings",
    description: "Document meetings across the pipeline.",
    objectType: "meeting",
    apiPath: "/api/crm/meetings",
    baseFields: [
      { name: "companyId", label: "Company ID", type: "text" },
      { name: "contactId", label: "Contact ID", type: "text" },
      { name: "dealId", label: "Deal ID", type: "text" },
      { name: "ownerId", label: "Owner ID", type: "text" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "agenda", label: "Agenda", type: "textarea" },
      { name: "meetingType", label: "Meeting Type", type: "text" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Scheduled", value: "scheduled" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
      { name: "startTime", label: "Start Time", type: "text" },
      { name: "endTime", label: "End Time", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "conferencingLink", label: "Conferencing Link", type: "text" },
    ],
    listColumns: [
      { key: "title", label: "Title" },
      { key: "meetingType", label: "Type" },
      {
        key: "startTime",
        label: "Start",
        render: (record) =>
          record.startTime ? new Date(record.startTime).toLocaleString() : "—",
      },
    ],
    ctaLabel: "Schedule Meeting",
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "Assign follow-up work to your team.",
    objectType: "task",
    apiPath: "/api/crm/tasks",
    baseFields: [
      { name: "companyId", label: "Company ID", type: "text" },
      { name: "contactId", label: "Contact ID", type: "text" },
      { name: "dealId", label: "Deal ID", type: "text" },
      { name: "ownerId", label: "Owner ID", type: "text" },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "open" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
        ],
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Low", value: "low" },
          { label: "Normal", value: "normal" },
          { label: "High", value: "high" },
        ],
      },
      { name: "dueDate", label: "Due Date", type: "text" },
      { name: "reminderAt", label: "Reminder At", type: "text" },
    ],
    listColumns: [
      { key: "title", label: "Task" },
      {
        key: "status",
        label: "Status",
        render: (record) => (
          <Badge variant="outline" className="capitalize">
            {record.status}
          </Badge>
        ),
      },
      {
        key: "dueDate",
        label: "Due",
        render: (record) =>
          record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "—",
      },
    ],
    ctaLabel: "New Task",
  },
];

const ENTITY_MAP = Object.fromEntries(CRM_ENTITY_CONFIGS.map((cfg) => [cfg.key, cfg]));

const style: CSSProperties = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

interface FormContext {
  entity: CrmEntityConfig;
  mode: "create" | "edit";
  record?: any;
  initialValues?: Record<string, any>;
}

export default function CrmWorkspacePage() {
  const { toast } = useToast();
  const [activeKey, setActiveKey] = useState<string>("companies");
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [formContext, setFormContext] = useState<FormContext | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const activeEntity = ENTITY_MAP[activeKey] || CRM_ENTITY_CONFIGS[0];

  const recordsQuery = useQuery<{ data: any[] }>({
    queryKey: [activeEntity.apiPath],
  });

  const formCustomFieldsQuery = useQuery<CustomFieldDefinition[]>({
    queryKey: ["/api/crm/custom-fields", formContext?.entity.objectType],
    enabled: Boolean(formContext),
  });

  const activityEnabled =
    Boolean(selectedRecord) && Boolean(activeEntity.timelineKey);

  const emailsQuery = useQuery<{ data: any[] }>({
    queryKey: ["/api/crm/emails"],
    enabled: activityEnabled,
  });
  const phoneCallsQuery = useQuery<{ data: any[] }>({
    queryKey: ["/api/crm/phone-calls"],
    enabled: activityEnabled,
  });
  const meetingsQuery = useQuery<{ data: any[] }>({
    queryKey: ["/api/crm/meetings"],
    enabled: activityEnabled,
  });
  const tasksQuery = useQuery<{ data: any[] }>({
    queryKey: ["/api/crm/tasks"],
    enabled: activityEnabled,
  });

  useEffect(() => {
    setSelectedRecord(null);
  }, [activeKey]);

  const mutationOptions = {
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  };

  const saveMutation = useMutation({
    ...mutationOptions,
    mutationFn: async ({
      entity,
      values,
      record,
    }: {
      entity: CrmEntityConfig;
      values: Record<string, any>;
      record?: any;
    }) => {
      const customDefs = await queryClient.ensureQueryData<CustomFieldDefinition[]>({
        queryKey: ["/api/crm/custom-fields", entity.objectType],
      });
      const payload = splitPayload(entity, values, customDefs || []);
      const method = record ? "PUT" : "POST";
      const url = record ? `${entity.apiPath}/${record.id}` : entity.apiPath;
      const res = await apiRequest(method, url, payload);
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.entity.apiPath] });
      toast({
        title: `Saved ${variables.entity.label}`,
        description: `The ${variables.entity.label.toLowerCase()} was saved successfully.`,
      });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    ...mutationOptions,
    mutationFn: async ({ entity, id }: { entity: CrmEntityConfig; id: string }) => {
      await apiRequest("DELETE", `${entity.apiPath}/${id}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.entity.apiPath] });
      toast({
        title: "Deleted record",
        description: "Record removed successfully.",
      });
      if (selectedRecord?.id === variables.id) {
        setSelectedRecord(null);
      }
    },
  });

  const records = recordsQuery.data?.data ?? [];
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((record) =>
      JSON.stringify(record).toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  const formConfig: FormConfig | null = useMemo(() => {
    if (!formContext) return null;
    const customDefs = formCustomFieldsQuery.data || [];
    const customFields = customDefs.map(mapDefinitionToFormField);
    return {
      title: formContext.mode === "create"
        ? formContext.entity.ctaLabel
        : `Edit ${formContext.entity.label}`,
      description: formContext.entity.description,
      fields: [...formContext.entity.baseFields, ...customFields],
      submitButtonText: formContext.mode === "create" ? "Create Record" : "Save Changes",
      successMessage: "Saved!",
    };
  }, [formContext, formCustomFieldsQuery.data]);

  const timelineEntries = useMemo(() => {
    if (!activityEnabled || !selectedRecord || !activeEntity.timelineKey) {
      return [];
    }
    const key = activeEntity.timelineKey;
    const id = selectedRecord.id;
    const combined = [
      ...filterByTimelineKey(emailsQuery.data?.data, key, id).map((item) => ({
        type: "Email",
        title: item.subject || "Email",
        timestamp: item.sentAt || item.createdAt,
        description: item.body,
      })),
      ...filterByTimelineKey(phoneCallsQuery.data?.data, key, id).map((item) => ({
        type: "Call",
        title: item.subject || "Phone Call",
        timestamp: item.calledAt || item.createdAt,
        description: item.notes,
      })),
      ...filterByTimelineKey(meetingsQuery.data?.data, key, id).map((item) => ({
        type: "Meeting",
        title: item.title || "Meeting",
        timestamp: item.startTime || item.createdAt,
        description: item.agenda,
      })),
      ...filterByTimelineKey(tasksQuery.data?.data, key, id).map((item) => ({
        type: "Task",
        title: item.title || "Task",
        timestamp: item.dueDate || item.createdAt,
        description: item.status,
      })),
    ];

    return combined
      .filter((entry) => entry.timestamp)
      .sort(
        (a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime(),
      )
      .slice(0, 10);
  }, [
    activityEnabled,
    selectedRecord,
    activeEntity.timelineKey,
    emailsQuery.data?.data,
    phoneCallsQuery.data?.data,
    meetingsQuery.data?.data,
    tasksQuery.data?.data,
  ]);

  const detailCustomFields = selectedRecord?.customFields
    ? Object.entries(selectedRecord.customFields)
    : [];

  return (
    <ProtectedRoute>
      <Helmet>
        <title>CRM Workspace | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold">CRM Workspace</h1>
                <p className="text-sm text-muted-foreground">
                  Unified view of companies, contacts, deals, and activities.
                </p>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <Tabs value={activeKey} onValueChange={setActiveKey}>
                <TabsList className="flex flex-wrap gap-2">
                  {CRM_ENTITY_CONFIGS.map((entity) => (
                    <TabsTrigger key={entity.key} value={entity.key}>
                      {entity.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={activeKey} className="mt-6">
                  <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <Card>
                      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle>{activeEntity.label}</CardTitle>
                          <CardDescription>{activeEntity.description}</CardDescription>
                          <div className="flex gap-2">
                            <Input
                              value={searchTerm}
                              onChange={(event) => setSearchTerm(event.target.value)}
                              placeholder={`Search ${activeEntity.label.toLowerCase()}...`}
                            />
                            <Button onClick={() => openCreateForm(activeEntity)}>
                              <Plus className="h-4 w-4 mr-2" />
                              {activeEntity.ctaLabel}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {recordsQuery.isLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                          </div>
                        ) : filteredRecords.length === 0 ? (
                          <div className="py-12 text-center space-y-2">
                            <p className="font-medium">No records yet</p>
                            <p className="text-sm text-muted-foreground">
                              Click &quot;{activeEntity.ctaLabel}&quot; to add your first entry.
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="max-h-[560px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {activeEntity.listColumns.map((col) => (
                                    <TableHead key={col.key} className={col.className}>
                                      {col.label}
                                    </TableHead>
                                  ))}
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredRecords.map((record) => (
                                  <TableRow
                                    key={record.id}
                                    className={selectedRecord?.id === record.id ? "bg-muted/40" : ""}
                                    onClick={() => setSelectedRecord(record)}
                                  >
                                    {activeEntity.listColumns.map((col) => (
                                      <TableCell key={col.key}>
                                        {col.render ? col.render(record) : record[col.key] ?? "—"}
                                      </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openEditForm(activeEntity, record)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => confirmDelete(activeEntity, record)}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        )}
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                          <div>
                            <CardTitle>Record Details</CardTitle>
                            <CardDescription>
                              {selectedRecord
                                ? "Inspect base fields, custom fields, and timeline."
                                : "Select a row to view details."}
                            </CardDescription>
                          </div>
                          {selectedRecord && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Actions <ChevronDown className="h-4 w-4 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditForm(activeEntity, selectedRecord)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Record
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => confirmDelete(activeEntity, selectedRecord)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Record
                                </DropdownMenuItem>
                                {activeEntity.timelineKey && (
                                  <>
                                    <DropdownMenuItem onClick={() => openActivityForm("emails")}>
                                      Log Email
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openActivityForm("phone_calls")}>
                                      Log Phone Call
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openActivityForm("meetings")}>
                                      Schedule Meeting
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openActivityForm("tasks")}>
                                      Create Task
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </CardHeader>
                        <CardContent>
                          {selectedRecord ? (
                            <div className="space-y-4 text-sm">
                              {activeEntity.baseFields.map((field) => (
                                <div key={field.name} className="flex justify-between gap-2">
                                  <span className="text-muted-foreground">{field.label}</span>
                                  <span className="font-medium text-right">
                                    {selectedRecord[field.name] ?? "—"}
                                  </span>
                                </div>
                              ))}
                              {detailCustomFields.length > 0 && (
                                <>
                                  <div className="pt-2 border-t">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                                      Custom Fields
                                    </p>
                                    <div className="mt-2 space-y-2">
                                      {detailCustomFields.map(([key, value]) => (
                                        <div key={key} className="flex justify-between gap-2">
                                          <span className="text-muted-foreground">{key}</span>
                                          <span className="font-medium text-right">
                                            {String(value ?? "—")}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Choose a record to view richer context.
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <CardTitle>Activity Timeline</CardTitle>
                            <CardDescription>
                              {selectedRecord
                                ? "Recent emails, calls, meetings, and tasks."
                                : "Select a company, contact, or deal to see related activity."}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {timelineEntries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {selectedRecord
                                ? "No related activity yet."
                                : "Select a record to view its activity timeline."}
                            </p>
                          ) : (
                            <ul className="space-y-4">
                              {timelineEntries.map((entry, idx) => (
                                <li key={`${entry.type}-${idx}`} className="border-l pl-4">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline">{entry.type}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {entry.timestamp
                                        ? new Date(entry.timestamp).toLocaleString()
                                        : ""}
                                    </span>
                                  </div>
                                  <p className="font-medium mt-1">{entry.title}</p>
                                  {entry.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                      {entry.description}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>

      <Dialog open={Boolean(formContext && formConfig)} onOpenChange={(open) => (open ? null : closeForm())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formConfig?.title}</DialogTitle>
            <CardDescription>{formConfig?.description}</CardDescription>
          </DialogHeader>
          {formConfig && (
            <DynamicForm
              config={formConfig}
              initialValues={formContext?.initialValues}
              onSubmit={async (values) => {
                if (!formContext) return;
                await saveMutation.mutateAsync({
                  entity: formContext.entity,
                  values,
                  record: formContext.record,
                });
              }}
              className="shadow-none border border-dashed"
            />
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );

  function openCreateForm(entity: CrmEntityConfig) {
    setFormContext({
      entity,
      mode: "create",
      initialValues: {},
    });
  }

  function openEditForm(entity: CrmEntityConfig, record: any) {
    setFormContext({
      entity,
      mode: "edit",
      record,
      initialValues: buildInitialValues(entity, record),
    });
  }

  function openActivityForm(targetKey: string) {
    if (!selectedRecord) return;
    const activityEntity = ENTITY_MAP[targetKey];
    if (!activityEntity) return;
    const initialValues: Record<string, any> = {};
    if (activityEntity.baseFields.some((field) => field.name === "companyId") && activeEntity.timelineKey === "companyId") {
      initialValues.companyId = selectedRecord.id;
    }
    if (activityEntity.baseFields.some((field) => field.name === "contactId") && activeEntity.timelineKey === "contactId") {
      initialValues.contactId = selectedRecord.id;
    }
    if (activityEntity.baseFields.some((field) => field.name === "dealId") && activeEntity.timelineKey === "dealId") {
      initialValues.dealId = selectedRecord.id;
    }

    setFormContext({
      entity: activityEntity,
      mode: "create",
      initialValues,
    });
  }

  function closeForm() {
    setFormContext(null);
  }

  function confirmDelete(entity: CrmEntityConfig, record: any) {
    const confirmed = window.confirm(`Delete this ${entity.label}? This cannot be undone.`);
    if (confirmed) {
      deleteMutation.mutate({ entity, id: record.id });
    }
  }
}

function buildInitialValues(entity: CrmEntityConfig, record: any) {
  const baseValues = entity.baseFields.reduce((acc, field) => {
    acc[field.name] = record[field.name] ?? "";
    return acc;
  }, {} as Record<string, any>);
  return { ...baseValues, ...(record.customFields || {}) };
}

function splitPayload(
  entity: CrmEntityConfig,
  values: Record<string, any>,
  customDefs: CustomFieldDefinition[]
) {
  const baseFieldNames = new Set(entity.baseFields.map((field) => field.name));
  const customKeys = new Set(customDefs.map((def) => def.fieldKey));

  const payload: Record<string, any> = {};
  const customPayload: Record<string, any> = {};

  for (const [key, value] of Object.entries(values)) {
    if (baseFieldNames.has(key)) {
      payload[key] = value;
    } else if (customKeys.has(key)) {
      customPayload[key] = value;
    }
  }

  if (Object.keys(customPayload).length > 0) {
    payload.customFields = customPayload;
  }

  return payload;
}

function filterByTimelineKey(
  records: any[] | undefined,
  key: "companyId" | "contactId" | "dealId",
  id: string
) {
  if (!records) return [];
  return records.filter((record) => record[key] === id);
}

