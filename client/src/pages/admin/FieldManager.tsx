import { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CustomFieldDefinition, FormField as SharedFormField } from "@shared/schema";
import { DynamicForm } from "@/components/widgets/DynamicForm";
import {
  SUPPORTED_CRM_FIELD_TYPES,
  type SupportedCrmFieldType,
  coerceDefaultValue,
  mapDefinitionToFormField,
} from "@/lib/crm-field-utils";

const CRM_OBJECTS = [
  {
    value: "company",
    label: "Companies",
    description: "Fields stored on the company record",
  },
  {
    value: "contact",
    label: "Contacts",
    description: "Fields stored on individual contacts",
  },
  {
    value: "deal",
    label: "Deals",
    description: "Pipeline-specific fields for opportunities",
  },
  {
    value: "email",
    label: "Emails",
    description: "Metadata captured alongside logged emails",
  },
  {
    value: "phone_call",
    label: "Phone Calls",
    description: "Metadata for outbound & inbound call logs",
  },
  {
    value: "meeting",
    label: "Meetings",
    description: "Fields for scheduled customer meetings",
  },
  {
    value: "task",
    label: "Tasks",
    description: "Workflow fields for follow-up tasks",
  },
] as const;

type CrmObjectType = (typeof CRM_OBJECTS)[number]["value"];

const FIELD_TYPE_VALUES = SUPPORTED_CRM_FIELD_TYPES;

type SupportedFieldType = SupportedCrmFieldType;

const FIELD_TYPE_LABELS: Record<SupportedFieldType, string> = {
  text: "Short Text",
  textarea: "Long Text",
  number: "Number",
  currency: "Currency",
  boolean: "Yes / No",
  date: "Date",
  datetime: "Date & Time",
  select: "Dropdown",
};

const formSchema = z.object({
  fieldLabel: z.string().min(2, "Field label is required"),
  fieldKey: z
    .string()
    .min(2, "Field key is required")
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores only"),
  fieldType: z.enum(FIELD_TYPE_VALUES),
  description: z.string().optional(),
  required: z.boolean().optional(),
  isActive: z.boolean().optional(),
  orderIndex: z.number().min(0).optional(),
  defaultValue: z.string().optional(),
  minValue: z.string().optional(),
  maxValue: z.string().optional(),
  pattern: z.string().optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1, "Label required"),
        value: z.string().min(1, "Value required"),
      })
    )
    .optional(),
});

type FieldFormValues = z.infer<typeof formSchema>;

const BASE_FORM_FIELDS: Record<CrmObjectType, SharedFormField[]> = {
  company: [
    { name: "name", label: "Company Name", type: "text", required: true },
    { name: "domain", label: "Website", type: "text", required: false },
    { name: "industry", label: "Industry", type: "text", required: false },
  ],
  contact: [
    { name: "firstName", label: "First Name", type: "text", required: true },
    { name: "lastName", label: "Last Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: false },
  ],
  deal: [
    { name: "name", label: "Deal Name", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: false },
    { name: "stage", label: "Stage", type: "text", required: false },
  ],
  email: [
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "direction", label: "Direction", type: "text", required: false },
  ],
  phone_call: [
    { name: "subject", label: "Call Subject", type: "text", required: false },
    { name: "callType", label: "Call Type", type: "text", required: false },
  ],
  meeting: [
    { name: "title", label: "Meeting Title", type: "text", required: true },
    { name: "meetingType", label: "Type", type: "text", required: false },
    { name: "startTime", label: "Start Time", type: "text", required: false },
  ],
  task: [
    { name: "title", label: "Task Title", type: "text", required: true },
    { name: "dueDate", label: "Due Date", type: "text", required: false },
    { name: "priority", label: "Priority", type: "text", required: false },
  ],
};

const style = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

export default function FieldManagerPage() {
  const { toast } = useToast();
  const [activeObject, setActiveObject] = useState<CrmObjectType>("company");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [fieldKeyDirty, setFieldKeyDirty] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, any> | null>(null);

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fieldLabel: "",
      fieldKey: "",
      fieldType: "text",
      required: false,
      isActive: true,
      options: [],
    },
  });

  const { fields: optionFields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const fieldsQuery = useQuery<CustomFieldDefinition[]>({
    queryKey: ["/api/crm/custom-fields", activeObject],
  });

  const sortedFields = useMemo(() => {
    return (fieldsQuery.data || []).slice().sort((a, b) => a.orderIndex - b.orderIndex);
  }, [fieldsQuery.data]);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/custom-fields", activeObject] });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  };

  const createMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/crm/custom-fields", payload);
      return res.json();
    },
    onSuccess: () => {
      mutationOptions.onSuccess?.();
      toast({
        title: "Field created",
        description: "Custom field saved successfully.",
      });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    ...mutationOptions,
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/crm/custom-fields/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      mutationOptions.onSuccess?.();
      toast({
        title: "Field updated",
        description: "Changes saved successfully.",
      });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    ...mutationOptions,
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/crm/custom-fields/${id}`);
    },
    onSuccess: () => {
      mutationOptions.onSuccess?.();
      toast({
        title: "Field deleted",
        description: "Field removed from this object.",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    ...mutationOptions,
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/crm/custom-fields/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      mutationOptions.onSuccess?.();
    },
  });

  const reorderMutation = useMutation({
    ...mutationOptions,
    mutationFn: async ({ id, orderIndex }: { id: string; orderIndex: number }) => {
      const res = await apiRequest("PUT", `/api/crm/custom-fields/${id}`, { orderIndex });
      return res.json();
    },
    onSuccess: () => {
      mutationOptions.onSuccess?.();
    },
  });

  const fieldLabelValue = form.watch("fieldLabel");

  useEffect(() => {
    if (!dialogOpen) return;
    if (fieldKeyDirty || editingField) return;
    if (!fieldLabelValue) {
      form.setValue("fieldKey", "");
      return;
    }
    const slug = slugify(fieldLabelValue);
    form.setValue("fieldKey", slug);
  }, [fieldLabelValue, fieldKeyDirty, editingField, dialogOpen, form]);

  useEffect(() => {
    if (!dialogOpen) {
      form.reset({
        fieldLabel: "",
        fieldKey: "",
        fieldType: "text",
        required: false,
        isActive: true,
        options: [],
        defaultValue: "",
        minValue: "",
        maxValue: "",
        orderIndex: sortedFields.length,
      });
      setFieldKeyDirty(false);
      return;
    }

    if (editingField) {
      form.reset({
        fieldLabel: editingField.fieldLabel,
        fieldKey: editingField.fieldKey,
        fieldType: editingField.fieldType as SupportedFieldType,
        description: editingField.description ?? "",
        required: editingField.required ?? false,
        isActive: editingField.isActive ?? true,
        orderIndex: editingField.orderIndex ?? 0,
        defaultValue:
          editingField.defaultValue === null ||
          editingField.defaultValue === undefined
            ? ""
            : String(editingField.defaultValue),
        minValue: editingField.validation?.min?.toString() ?? "",
        maxValue: editingField.validation?.max?.toString() ?? "",
        pattern: editingField.validation?.pattern ?? "",
        options: editingField.options && editingField.options.length > 0 ? editingField.options : [],
      });
    } else {
      form.reset({
        fieldLabel: "",
        fieldKey: "",
        fieldType: "text",
        required: false,
        description: "",
        isActive: true,
        orderIndex: sortedFields.length,
        options: [],
        defaultValue: "",
        minValue: "",
        maxValue: "",
        pattern: "",
      });
    }
  }, [dialogOpen, editingField, form, sortedFields.length]);

  const handleSubmit = form.handleSubmit((values) => {
    const payload = buildPayload(values, activeObject);
    if (editingField) {
      updateMutation.mutate({ id: editingField.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  });

  const currentObjectMeta = CRM_OBJECTS.find((obj) => obj.value === activeObject);

  const previewConfig = useMemo(() => {
    const customFields = sortedFields.map(mapDefinitionToFormField);
    const baseFields = BASE_FORM_FIELDS[activeObject] || [];
    return {
      title: `${currentObjectMeta?.label || "Record"} Form Preview`,
      description: "This preview combines the default system fields with your custom fields.",
      fields: [...baseFields, ...customFields],
      submitButtonText: "Preview Submit",
      successMessage: "Preview submission captured!",
    };
  }, [activeObject, sortedFields, currentObjectMeta]);

  return (
    <ProtectedRoute>
      <Helmet>
        <title>CRM Field Manager | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold">CRM Field Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Configure custom fields for companies, contacts, deals, activities, and tasks.
                </p>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <Tabs value={activeObject} onValueChange={(value) => setActiveObject(value as CrmObjectType)}>
                <TabsList className="flex flex-wrap gap-2">
                  {CRM_OBJECTS.map((object) => (
                    <TabsTrigger
                      key={object.value}
                      value={object.value}
                      className="capitalize"
                    >
                      {object.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={activeObject} className="mt-6">
                  <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <Card className="border-dashed">
                      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle>{currentObjectMeta?.label} Fields</CardTitle>
                          <CardDescription>
                            {currentObjectMeta?.description}
                          </CardDescription>
                        </div>
                        <Button onClick={openCreateDialog} data-testid="button-new-field">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Field
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {fieldsQuery.isLoading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                            <Skeleton className="h-14 w-full" />
                          </div>
                        ) : sortedFields.length === 0 ? (
                          <div className="py-12 text-center space-y-3">
                            <p className="text-base font-medium">No custom fields yet</p>
                            <p className="text-sm text-muted-foreground">
                              Click &quot;Add Field&quot; to capture more context for this record type.
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="max-h-[540px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Field</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Required</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sortedFields.map((field, index) => (
                                  <TableRow key={field.id}>
                                    <TableCell>
                                      <div className="font-medium">{field.fieldLabel}</div>
                                      <p className="text-xs text-muted-foreground">
                                        {field.fieldKey}
                                      </p>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">
                                        {FIELD_TYPE_LABELS[field.fieldType as SupportedFieldType] || field.fieldType}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={field.required ? "default" : "outline"}>
                                        {field.required ? "Required" : "Optional"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Switch
                                        checked={field.isActive !== false}
                                        onCheckedChange={(checked) =>
                                          toggleActiveMutation.mutate({ id: field.id, isActive: checked })
                                        }
                                        disabled={toggleActiveMutation.isPending}
                                      />
                                    </TableCell>
                                    <TableCell className="flex items-center justify-end gap-2">
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          disabled={index === 0 || reorderMutation.isPending}
                                          onClick={() => moveField(field, index - 1)}
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          disabled={index === sortedFields.length - 1 || reorderMutation.isPending}
                                          onClick={() => moveField(field, index + 1)}
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openEditDialog(field)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => confirmDelete(field)}
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
                        <CardHeader>
                          <CardTitle>Form Preview</CardTitle>
                          <CardDescription>
                            Generated using base fields plus your custom fields.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DynamicForm
                            config={previewConfig}
                            onSubmit={(values) => setPreviewData(values)}
                            className="shadow-none border border-dashed"
                          />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Preview Output</CardTitle>
                          <CardDescription>
                            Submitted values from the preview form.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {previewData ? (
                            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-64">
                              {JSON.stringify(previewData, null, 2)}
                            </pre>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Submit the preview form to inspect the payload.
                            </p>
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

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingField ? "Edit Custom Field" : "Create Custom Field"}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Attach reusable metadata to the {currentObjectMeta?.label?.toLowerCase()} object.
            </p>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fieldLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Annual Contract Value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fieldKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="annual_contract_value"
                          {...field}
                          onChange={(event) => {
                            setFieldKeyDirty(true);
                            field.onChange(event);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fieldType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value as SupportedFieldType)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pick a data type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FIELD_TYPE_VALUES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {FIELD_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? sortedFields.length}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Helper Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Shown beneath the field label in CRM forms."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Required Field</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enforce completion on this object.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Toggle visibility on record pages.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {["number", "currency"].includes(form.watch("fieldType")) && (
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Value</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Value</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {form.watch("fieldType") === "text" && (
                <FormField
                  control={form.control}
                  name="pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validation Pattern</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional regex, e.g. ^[A-Z]{3}$" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("fieldType") === "select" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Dropdown Options</FormLabel>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => append({ label: "", value: "" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {optionFields.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Add at least one option for dropdowns.
                      </p>
                    )}
                    {optionFields.map((option, index) => (
                      <div key={option.id ?? index} className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`options.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase text-muted-foreground tracking-wide">
                                Label
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enterprise" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`options.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel className="text-xs uppercase text-muted-foreground tracking-wide">
                                  Value
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="enterprise" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="self-end"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="defaultValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional default shown on new records" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingField ? "Save Changes" : "Create Field"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );

  function openCreateDialog() {
    setEditingField(null);
    setDialogOpen(true);
    setFieldKeyDirty(false);
  }

  function openEditDialog(field: CustomFieldDefinition) {
    setEditingField(field);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingField(null);
    setFieldKeyDirty(false);
  }

  function confirmDelete(field: CustomFieldDefinition) {
    const confirmed = window.confirm(
      `Delete custom field "${field.fieldLabel}" from ${currentObjectMeta?.label}? This cannot be undone.`
    );
    if (confirmed) {
      deleteMutation.mutate(field.id);
    }
  }

  function moveField(field: CustomFieldDefinition, newIndex: number) {
    const nextIndex = Math.max(0, Math.min(sortedFields.length - 1, newIndex));
    reorderMutation.mutate({ id: field.id, orderIndex: nextIndex });
  }
}

function buildPayload(values: FieldFormValues, objectType: CrmObjectType) {
  const validation: Record<string, any> = {};
  if (values.minValue) validation.min = Number(values.minValue);
  if (values.maxValue) validation.max = Number(values.maxValue);
  if (values.pattern) validation.pattern = values.pattern;

  const payload: Record<string, any> = {
    objectType,
    fieldLabel: values.fieldLabel,
    fieldKey: values.fieldKey,
    fieldType: values.fieldType,
    description: values.description || null,
    required: values.required ?? false,
    options: values.fieldType === "select" ? values.options || [] : [],
    validation,
    defaultValue: coerceDefaultValue(values.fieldType, values.defaultValue),
    orderIndex: values.orderIndex ?? 0,
    isActive: values.isActive ?? true,
  };

  return payload;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

