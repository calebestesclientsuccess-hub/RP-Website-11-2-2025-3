import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Loader2, Plus, Trash2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertCampaignSchema, 
  type Campaign,
  type AssessmentConfig,
  calculatorConfigSchema,
  formConfigSchema,
  type CalculatorInput,
  type FormField as FormFieldType,
  seoMetadataSchema,
} from "@shared/schema";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = insertCampaignSchema.extend({
  campaignName: z.string().min(1, "Campaign name is required"),
  contentType: z.enum(["calculator", "form", "collection", "embedded-assessment"]),
  displayAs: z.enum(["inline", "popup"]),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  overlayOpacity: z.number().min(0).max(100).default(50),
  dismissible: z.boolean().default(true),
  animation: z.enum(["fade", "slide-up", "slide-down", "scale"]).default("fade"),
  targetPages: z.array(z.string()).min(1, "At least one page must be selected"),
  seoMetadata: z.string().optional(),
});

export default function CampaignForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/campaigns/:id/edit");
  const isEdit = !!params?.id;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: campaign, isLoading: isLoadingCampaign } = useQuery<Campaign>({
    queryKey: ["/api/campaigns", params?.id],
    enabled: isEdit && !!params?.id,
  });

  const { data: assessments } = useQuery<AssessmentConfig[]>({
    queryKey: ["/api/assessments"],
  });

  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInput[]>([
    { name: "", label: "", type: "number", defaultValue: 0 }
  ]);
  const [calculatorFormula, setCalculatorFormula] = useState("");
  const [calculatorResultLabel, setCalculatorResultLabel] = useState("Result");
  const [calculatorResultUnit, setCalculatorResultUnit] = useState("");
  const [calculatorTitle, setCalculatorTitle] = useState("");
  const [calculatorDescription, setCalculatorDescription] = useState("");
  const [calculatorJsonText, setCalculatorJsonText] = useState("");
  const [calculatorJsonValid, setCalculatorJsonValid] = useState<boolean | null>(null);
  const [calculatorJsonErrors, setCalculatorJsonErrors] = useState<string[]>([]);

  const [formFields, setFormFields] = useState<FormFieldType[]>([
    { name: "", label: "", type: "text", required: false }
  ]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubmitButtonText, setFormSubmitButtonText] = useState("Submit");
  const [formSuccessMessage, setFormSuccessMessage] = useState("Thank you for your submission!");
  const [formJsonText, setFormJsonText] = useState("");
  const [formJsonValid, setFormJsonValid] = useState<boolean | null>(null);
  const [formJsonErrors, setFormJsonErrors] = useState<string[]>([]);

  const [collectionType, setCollectionType] = useState<"testimonials" | "videos" | "blogs" | "custom">("testimonials");
  const [collectionCustomJson, setCollectionCustomJson] = useState("");

  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");

  const [magicPrompt, setMagicPrompt] = useState("");

  // SEO Metadata state
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");

  // Target Pages state
  const [targetPages, setTargetPages] = useState<string[]>(["home"]);
  const [allPagesChecked, setAllPagesChecked] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignName: "",
      contentType: "calculator",
      displayAs: "inline",
      targetZone: "zone-1",
      isActive: true,
      widgetConfig: "",
      theme: "auto",
      size: "medium",
      overlayOpacity: 50,
      dismissible: true,
      animation: "fade",
      targetPages: ["home"],
      seoMetadata: "",
    },
  });

  const contentType = form.watch("contentType");
  const displayAs = form.watch("displayAs");
  const currentTargetZone = form.watch("targetZone");
  const currentTargetPages = form.watch("targetPages");

  useEffect(() => {
    if (campaign && isEdit) {
      // Parse SEO metadata if present
      if (campaign.seoMetadata) {
        try {
          const seoData = JSON.parse(campaign.seoMetadata);
          setMetaTitle(seoData.metaTitle || "");
          setMetaDescription(seoData.metaDescription || "");
          setOgImage(seoData.ogImage || "");
        } catch (e) {
          console.error("Failed to parse SEO metadata:", e);
        }
      }

      // Set target pages
      const pages = campaign.targetPages || ["home"];
      setTargetPages(pages);
      setAllPagesChecked(pages.includes("all"));

      form.reset({
        campaignName: campaign.campaignName,
        contentType: campaign.contentType as "calculator" | "form" | "collection" | "embedded-assessment",
        displayAs: campaign.displayAs as "inline" | "popup",
        targetZone: campaign.targetZone || "zone-1",
        isActive: campaign.isActive,
        widgetConfig: campaign.widgetConfig || "",
        theme: (campaign as any).theme || "auto",
        size: (campaign as any).size || "medium",
        overlayOpacity: (campaign as any).overlayOpacity || 50,
        dismissible: (campaign as any).dismissible !== undefined ? (campaign as any).dismissible : true,
        animation: (campaign as any).animation || "fade",
        targetPages: pages,
        seoMetadata: campaign.seoMetadata || "",
      });

      if (campaign.widgetConfig) {
        try {
          const config = JSON.parse(campaign.widgetConfig);
          
          if (campaign.contentType === "calculator") {
            setCalculatorInputs(config.inputs || []);
            setCalculatorFormula(config.formula || "");
            setCalculatorResultLabel(config.resultLabel || "Result");
            setCalculatorResultUnit(config.resultUnit || "");
            setCalculatorTitle(config.title || "");
            setCalculatorDescription(config.description || "");
            setCalculatorJsonText(campaign.widgetConfig);
          } else if (campaign.contentType === "form") {
            setFormFields(config.fields || []);
            setFormTitle(config.title || "");
            setFormDescription(config.description || "");
            setFormSubmitButtonText(config.submitButtonText || "Submit");
            setFormSuccessMessage(config.successMessage || "Thank you for your submission!");
            setFormJsonText(campaign.widgetConfig);
          } else if (campaign.contentType === "collection") {
            setCollectionType(config.collectionType || "testimonials");
            if (config.collectionType === "custom") {
              setCollectionCustomJson(campaign.widgetConfig);
            }
          } else if (campaign.contentType === "embedded-assessment") {
            setSelectedAssessmentId(config.assessmentId || "");
          }
        } catch (e) {
          console.error("Failed to parse widget config:", e);
        }
      }
    }
  }, [campaign, isEdit, form]);

  useEffect(() => {
    if (contentType === "calculator") {
      updateCalculatorConfig();
    } else if (contentType === "form") {
      updateFormConfig();
    } else if (contentType === "collection") {
      updateCollectionConfig();
    } else if (contentType === "embedded-assessment") {
      updateAssessmentConfig();
    }
  }, [
    contentType,
    calculatorInputs,
    calculatorFormula,
    calculatorResultLabel,
    calculatorResultUnit,
    calculatorTitle,
    calculatorDescription,
    formFields,
    formTitle,
    formDescription,
    formSubmitButtonText,
    formSuccessMessage,
    collectionType,
    collectionCustomJson,
    selectedAssessmentId,
  ]);

  const updateCalculatorConfig = () => {
    const config = {
      title: calculatorTitle,
      description: calculatorDescription,
      inputs: calculatorInputs,
      formula: calculatorFormula,
      resultLabel: calculatorResultLabel,
      resultUnit: calculatorResultUnit,
    };
    form.setValue("widgetConfig", JSON.stringify(config));
  };

  const updateFormConfig = () => {
    const config = {
      title: formTitle,
      description: formDescription,
      fields: formFields,
      submitButtonText: formSubmitButtonText,
      successMessage: formSuccessMessage,
    };
    form.setValue("widgetConfig", JSON.stringify(config));
  };

  const updateCollectionConfig = () => {
    if (collectionType === "custom" && collectionCustomJson) {
      form.setValue("widgetConfig", collectionCustomJson);
    } else {
      form.setValue("widgetConfig", JSON.stringify({ collectionType }));
    }
  };

  const updateAssessmentConfig = () => {
    form.setValue("widgetConfig", JSON.stringify({ assessmentId: selectedAssessmentId }));
  };

  // Sync SEO metadata
  useEffect(() => {
    const seoData = {
      metaTitle,
      metaDescription,
      ogImage,
    };
    form.setValue("seoMetadata", JSON.stringify(seoData));
  }, [metaTitle, metaDescription, ogImage, form]);

  // Sync target pages
  useEffect(() => {
    form.setValue("targetPages", targetPages);
  }, [targetPages, form]);

  // Zone conflict detection
  const { data: zoneConflicts, isLoading: isCheckingConflicts } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns", "conflict-check", currentTargetZone, currentTargetPages],
    enabled: !!currentTargetZone && !!currentTargetPages && currentTargetPages.length > 0 && displayAs === "inline",
    staleTime: 10000, // 10 seconds
  });

  const hasConflict = zoneConflicts && zoneConflicts.length > 0 && zoneConflicts.some(c => {
    // Don't show conflict with the current campaign being edited
    if (isEdit && c.id === params?.id) return false;
    
    // Check if campaign is active and on same zone
    if (!c.isActive || c.targetZone !== currentTargetZone) return false;
    
    // Check if there's page overlap
    const campaignPages = c.targetPages || [];
    return currentTargetPages.some(page => campaignPages.includes(page) || campaignPages.includes("all"));
  });

  const conflictingCampaign = zoneConflicts?.find(c => {
    if (isEdit && c.id === params?.id) return false;
    if (!c.isActive || c.targetZone !== currentTargetZone) return false;
    const campaignPages = c.targetPages || [];
    return currentTargetPages.some(page => campaignPages.includes(page) || campaignPages.includes("all"));
  });

  const handleTargetPageToggle = (page: string) => {
    if (page === "all") {
      if (allPagesChecked) {
        setAllPagesChecked(false);
        setTargetPages(["home"]);
      } else {
        setAllPagesChecked(true);
        setTargetPages(["all"]);
      }
    } else {
      if (allPagesChecked) {
        setAllPagesChecked(false);
        setTargetPages([page]);
      } else {
        if (targetPages.includes(page)) {
          const newPages = targetPages.filter(p => p !== page);
          setTargetPages(newPages.length > 0 ? newPages : ["home"]);
        } else {
          setTargetPages([...targetPages, page]);
        }
      }
    }
  };

  const validateCalculatorJson = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      const result = calculatorConfigSchema.safeParse(parsed);
      
      if (result.success) {
        setCalculatorJsonValid(true);
        setCalculatorJsonErrors([]);
        setCalculatorInputs(result.data.inputs);
        setCalculatorFormula(result.data.formula);
        setCalculatorResultLabel(result.data.resultLabel);
        setCalculatorResultUnit(result.data.resultUnit || "");
        setCalculatorTitle(result.data.title);
        setCalculatorDescription(result.data.description || "");
        form.setValue("widgetConfig", jsonText);
      } else {
        setCalculatorJsonValid(false);
        const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        setCalculatorJsonErrors(errors);
      }
    } catch (e) {
      setCalculatorJsonValid(false);
      setCalculatorJsonErrors(["Invalid JSON syntax"]);
    }
  };

  const validateFormJson = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      const result = formConfigSchema.safeParse(parsed);
      
      if (result.success) {
        setFormJsonValid(true);
        setFormJsonErrors([]);
        setFormFields(result.data.fields);
        setFormTitle(result.data.title);
        setFormDescription(result.data.description || "");
        setFormSubmitButtonText(result.data.submitButtonText);
        setFormSuccessMessage(result.data.successMessage);
        form.setValue("widgetConfig", jsonText);
      } else {
        setFormJsonValid(false);
        const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        setFormJsonErrors(errors);
      }
    } catch (e) {
      setFormJsonValid(false);
      setFormJsonErrors(["Invalid JSON syntax"]);
    }
  };

  const addCalculatorInput = () => {
    setCalculatorInputs([...calculatorInputs, { name: "", label: "", type: "number", defaultValue: 0 }]);
  };

  const removeCalculatorInput = (index: number) => {
    setCalculatorInputs(calculatorInputs.filter((_, i) => i !== index));
  };

  const updateCalculatorInput = (index: number, field: keyof CalculatorInput, value: any) => {
    const updated = [...calculatorInputs];
    updated[index] = { ...updated[index], [field]: value };
    setCalculatorInputs(updated);
  };

  const addFormField = () => {
    setFormFields([...formFields, { name: "", label: "", type: "text", required: false }]);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const updateFormField = (index: number, field: keyof FormFieldType, value: any) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [field]: value };
    setFormFields(updated);
  };

  const addFormFieldOption = (fieldIndex: number) => {
    const updated = [...formFields];
    const options = updated[fieldIndex].options || [];
    updated[fieldIndex].options = [...options, { label: "", value: "" }];
    setFormFields(updated);
  };

  const removeFormFieldOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...formFields];
    const options = updated[fieldIndex].options || [];
    updated[fieldIndex].options = options.filter((_, i) => i !== optionIndex);
    setFormFields(updated);
  };

  const updateFormFieldOption = (fieldIndex: number, optionIndex: number, field: "label" | "value", value: string) => {
    const updated = [...formFields];
    const options = updated[fieldIndex].options || [];
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    updated[fieldIndex].options = options;
    setFormFields(updated);
  };

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      setLocation("/admin/campaigns");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PUT", `/api/campaigns/${params?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", params?.id] });
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
      setLocation("/admin/campaigns");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingCampaign) {
    return (
      <ProtectedRoute>
        <Helmet>
          <title>Loading... | Admin Dashboard</title>
        </Helmet>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center gap-4 p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-xl font-semibold">Loading...</h1>
              </header>
              <main className="flex-1 overflow-auto p-6">
                <div className="flex justify-center items-center py-12" data-testid="loading-form">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Helmet>
        <title>{isEdit ? "Edit Campaign" : "New Campaign"} | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/admin/campaigns")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold" data-testid="text-page-title">
                {isEdit ? "Edit Campaign" : "New Campaign"}
              </h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription>
                      Configure the basic settings for your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="campaignName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter campaign name"
                                  {...field}
                                  data-testid="input-campaign-name"
                                />
                              </FormControl>
                              <FormDescription>
                                A descriptive name for this campaign
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-3"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="calculator" id="calculator" data-testid="radio-calculator" />
                                    <Label htmlFor="calculator">Calculator</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="form" id="form" data-testid="radio-form" />
                                    <Label htmlFor="form">Form</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="collection" id="collection" data-testid="radio-collection" />
                                    <Label htmlFor="collection">Collection</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="embedded-assessment" id="embedded-assessment" data-testid="radio-embedded-assessment" />
                                    <Label htmlFor="embedded-assessment">Embedded Assessment</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormDescription>
                                Type of content to display in this campaign
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="displayAs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display As</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-3"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="inline" id="inline" data-testid="radio-inline" />
                                    <Label htmlFor="inline">Inline</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="popup" id="popup" data-testid="radio-popup" />
                                    <Label htmlFor="popup">Popup</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormDescription>
                                How the campaign content should be displayed
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="targetZone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Zone</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-target-zone">
                                    <SelectValue placeholder="Select a zone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="zone-1" data-testid="option-zone-1">Zone 1</SelectItem>
                                  <SelectItem value="zone-2" data-testid="option-zone-2">Zone 2</SelectItem>
                                  <SelectItem value="zone-3" data-testid="option-zone-3">Zone 3</SelectItem>
                                  <SelectItem value="zone-4" data-testid="option-zone-4">Zone 4</SelectItem>
                                  <SelectItem value="zone-5" data-testid="option-zone-5">Zone 5</SelectItem>
                                  <SelectItem value="zone-6" data-testid="option-zone-6">Zone 6</SelectItem>
                                  <SelectItem value="zone-7" data-testid="option-zone-7">Zone 7</SelectItem>
                                  <SelectItem value="zone-8" data-testid="option-zone-8">Zone 8</SelectItem>
                                  <SelectItem value="zone-9" data-testid="option-zone-9">Zone 9</SelectItem>
                                  <SelectItem value="zone-10" data-testid="option-zone-10">Zone 10</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Select the zone where this campaign should appear
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <FormDescription>
                                  Enable or disable this campaign
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-is-active"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLocation("/admin/campaigns")}
                            disabled={isPending}
                            data-testid="button-cancel"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isPending}
                            data-testid="button-submit"
                          >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? "Update Campaign" : "Create Campaign"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {contentType === "calculator" && (
                  <Card data-testid="calculator-builder">
                    <CardHeader>
                      <CardTitle>Calculator Builder</CardTitle>
                      <CardDescription>
                        Configure your calculator widget
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="magic-prompt">
                          <AccordionTrigger data-testid="accordion-magic-prompt">Magic Prompt Generator</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div>
                              <Label htmlFor="magic-prompt">Describe your calculator in plain English</Label>
                              <Textarea
                                id="magic-prompt"
                                placeholder="e.g., A calculator that computes annual revenue based on deal size, close rate, and sales cycle..."
                                value={magicPrompt}
                                onChange={(e) => setMagicPrompt(e.target.value)}
                                className="mt-2"
                                rows={4}
                                data-testid="textarea-magic-prompt"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "Magic Prompt Generator",
                                  description: "This would call an LLM API to generate calculator config. For now, use the manual builder or paste JSON below.",
                                });
                              }}
                              data-testid="button-generate-config"
                            >
                              Generate Config
                            </Button>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="manual-builder">
                          <AccordionTrigger data-testid="accordion-manual-builder">Manual Builder</AccordionTrigger>
                          <AccordionContent className="space-y-6">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="calc-title">Calculator Title</Label>
                                <Input
                                  id="calc-title"
                                  placeholder="Enter calculator title"
                                  value={calculatorTitle}
                                  onChange={(e) => setCalculatorTitle(e.target.value)}
                                  className="mt-2"
                                  data-testid="input-calculator-title"
                                />
                              </div>
                              <div>
                                <Label htmlFor="calc-description">Description (optional)</Label>
                                <Textarea
                                  id="calc-description"
                                  placeholder="Enter calculator description"
                                  value={calculatorDescription}
                                  onChange={(e) => setCalculatorDescription(e.target.value)}
                                  className="mt-2"
                                  rows={2}
                                  data-testid="textarea-calculator-description"
                                />
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Inputs</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addCalculatorInput}
                                  data-testid="button-add-calculator-input"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Input
                                </Button>
                              </div>

                              {calculatorInputs.map((input, index) => (
                                <Card key={index} data-testid={`calculator-input-${index}`}>
                                  <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Input Name</Label>
                                            <Input
                                              placeholder="e.g., revenue"
                                              value={input.name}
                                              onChange={(e) => updateCalculatorInput(index, "name", e.target.value)}
                                              data-testid={`input-calc-name-${index}`}
                                            />
                                          </div>
                                          <div>
                                            <Label>Input Label</Label>
                                            <Input
                                              placeholder="e.g., Annual Revenue"
                                              value={input.label}
                                              onChange={(e) => updateCalculatorInput(index, "label", e.target.value)}
                                              data-testid={`input-calc-label-${index}`}
                                            />
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Input Type</Label>
                                            <Select
                                              value={input.type}
                                              onValueChange={(value) => updateCalculatorInput(index, "type", value)}
                                            >
                                              <SelectTrigger data-testid={`select-calc-type-${index}`}>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="slider">Slider</SelectItem>
                                                <SelectItem value="toggle">Toggle</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <Label>Default Value</Label>
                                            <Input
                                              type="number"
                                              value={input.defaultValue}
                                              onChange={(e) => updateCalculatorInput(index, "defaultValue", parseFloat(e.target.value) || 0)}
                                              data-testid={`input-calc-default-${index}`}
                                            />
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4">
                                          <div>
                                            <Label>Min (optional)</Label>
                                            <Input
                                              type="number"
                                              value={input.min || ""}
                                              onChange={(e) => updateCalculatorInput(index, "min", e.target.value ? parseFloat(e.target.value) : undefined)}
                                              data-testid={`input-calc-min-${index}`}
                                            />
                                          </div>
                                          <div>
                                            <Label>Max (optional)</Label>
                                            <Input
                                              type="number"
                                              value={input.max || ""}
                                              onChange={(e) => updateCalculatorInput(index, "max", e.target.value ? parseFloat(e.target.value) : undefined)}
                                              data-testid={`input-calc-max-${index}`}
                                            />
                                          </div>
                                          <div>
                                            <Label>Step (optional)</Label>
                                            <Input
                                              type="number"
                                              value={input.step || ""}
                                              onChange={(e) => updateCalculatorInput(index, "step", e.target.value ? parseFloat(e.target.value) : undefined)}
                                              data-testid={`input-calc-step-${index}`}
                                            />
                                          </div>
                                          <div>
                                            <Label>Unit (optional)</Label>
                                            <Input
                                              placeholder="e.g., $, %"
                                              value={input.unit || ""}
                                              onChange={(e) => updateCalculatorInput(index, "unit", e.target.value || undefined)}
                                              data-testid={`input-calc-unit-${index}`}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCalculatorInput(index)}
                                        data-testid={`button-remove-calc-input-${index}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="calc-formula">Formula</Label>
                                <Input
                                  id="calc-formula"
                                  placeholder="e.g., revenue * 0.12"
                                  value={calculatorFormula}
                                  onChange={(e) => setCalculatorFormula(e.target.value)}
                                  className="mt-2"
                                  data-testid="input-calculator-formula"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                  Use input names as variables, e.g. 'revenue * 0.12'
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="calc-result-label">Result Label</Label>
                                  <Input
                                    id="calc-result-label"
                                    placeholder="e.g., Total Revenue"
                                    value={calculatorResultLabel}
                                    onChange={(e) => setCalculatorResultLabel(e.target.value)}
                                    className="mt-2"
                                    data-testid="input-calculator-result-label"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="calc-result-unit">Result Unit (optional)</Label>
                                  <Input
                                    id="calc-result-unit"
                                    placeholder="e.g., $, %"
                                    value={calculatorResultUnit}
                                    onChange={(e) => setCalculatorResultUnit(e.target.value)}
                                    className="mt-2"
                                    data-testid="input-calculator-result-unit"
                                  />
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="json-config">
                          <AccordionTrigger data-testid="accordion-json-config">Paste JSON Config</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div>
                              <Label htmlFor="calc-json">JSON Configuration</Label>
                              <Textarea
                                id="calc-json"
                                placeholder='{"title": "Revenue Calculator", "inputs": [...], "formula": "...", "resultLabel": "Result"}'
                                value={calculatorJsonText}
                                onChange={(e) => {
                                  setCalculatorJsonText(e.target.value);
                                  validateCalculatorJson(e.target.value);
                                }}
                                className={`mt-2 font-mono text-sm ${
                                  calculatorJsonValid === true
                                    ? "border-green-500"
                                    : calculatorJsonValid === false
                                    ? "border-red-500"
                                    : ""
                                }`}
                                rows={10}
                                data-testid="textarea-calculator-json"
                              />
                            </div>

                            {calculatorJsonValid === true && (
                              <Card className="border-green-500" data-testid="calculator-json-valid">
                                <CardContent className="pt-6">
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-medium">Valid configuration</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {calculatorJsonValid === false && (
                              <Card className="border-red-500" data-testid="calculator-json-errors">
                                <CardContent className="pt-6">
                                  <div className="flex items-start gap-2 text-red-600">
                                    <XCircle className="w-5 h-5 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="font-medium">Validation errors:</p>
                                      <ul className="list-disc list-inside mt-2 space-y-1">
                                        {calculatorJsonErrors.map((error, i) => (
                                          <li key={i} className="text-sm">{error}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {contentType === "form" && (
                  <Card data-testid="form-builder">
                    <CardHeader>
                      <CardTitle>Form Builder</CardTitle>
                      <CardDescription>
                        Configure your form widget
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="form-settings">
                          <AccordionTrigger data-testid="accordion-form-settings">Form Settings</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div>
                              <Label htmlFor="form-title">Form Title</Label>
                              <Input
                                id="form-title"
                                placeholder="Enter form title"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="mt-2"
                                data-testid="input-form-title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="form-description">Description (optional)</Label>
                              <Textarea
                                id="form-description"
                                placeholder="Enter form description"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="mt-2"
                                rows={2}
                                data-testid="textarea-form-description"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="form-submit-text">Submit Button Text</Label>
                                <Input
                                  id="form-submit-text"
                                  placeholder="Submit"
                                  value={formSubmitButtonText}
                                  onChange={(e) => setFormSubmitButtonText(e.target.value)}
                                  className="mt-2"
                                  data-testid="input-form-submit-text"
                                />
                              </div>
                              <div>
                                <Label htmlFor="form-success-message">Success Message</Label>
                                <Input
                                  id="form-success-message"
                                  placeholder="Thank you for your submission!"
                                  value={formSuccessMessage}
                                  onChange={(e) => setFormSuccessMessage(e.target.value)}
                                  className="mt-2"
                                  data-testid="input-form-success-message"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="form-fields">
                          <AccordionTrigger data-testid="accordion-form-fields">Form Fields</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Fields</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addFormField}
                                data-testid="button-add-form-field"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Field
                              </Button>
                            </div>

                            {formFields.map((field, index) => (
                              <Card key={index} data-testid={`form-field-${index}`}>
                                <CardContent className="pt-6 space-y-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Field Name</Label>
                                          <Input
                                            placeholder="e.g., email"
                                            value={field.name}
                                            onChange={(e) => updateFormField(index, "name", e.target.value)}
                                            data-testid={`input-field-name-${index}`}
                                          />
                                        </div>
                                        <div>
                                          <Label>Field Label</Label>
                                          <Input
                                            placeholder="e.g., Email Address"
                                            value={field.label}
                                            onChange={(e) => updateFormField(index, "label", e.target.value)}
                                            data-testid={`input-field-label-${index}`}
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Field Type</Label>
                                          <Select
                                            value={field.type}
                                            onValueChange={(value) => updateFormField(index, "type", value)}
                                          >
                                            <SelectTrigger data-testid={`select-field-type-${index}`}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="text">Text</SelectItem>
                                              <SelectItem value="email">Email</SelectItem>
                                              <SelectItem value="tel">Phone</SelectItem>
                                              <SelectItem value="number">Number</SelectItem>
                                              <SelectItem value="textarea">Textarea</SelectItem>
                                              <SelectItem value="select">Select</SelectItem>
                                              <SelectItem value="checkbox">Checkbox</SelectItem>
                                              <SelectItem value="radio">Radio</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Placeholder (optional)</Label>
                                          <Input
                                            placeholder="e.g., Enter your email"
                                            value={field.placeholder || ""}
                                            onChange={(e) => updateFormField(index, "placeholder", e.target.value || undefined)}
                                            data-testid={`input-field-placeholder-${index}`}
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`field-required-${index}`}
                                          checked={field.required}
                                          onCheckedChange={(checked) => updateFormField(index, "required", checked)}
                                          data-testid={`checkbox-field-required-${index}`}
                                        />
                                        <Label htmlFor={`field-required-${index}`}>Required</Label>
                                      </div>

                                      {(field.type === "select" || field.type === "radio") && (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label>Options</Label>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => addFormFieldOption(index)}
                                              data-testid={`button-add-option-${index}`}
                                            >
                                              <Plus className="w-4 h-4 mr-2" />
                                              Add Option
                                            </Button>
                                          </div>
                                          {field.options?.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center gap-2">
                                              <Input
                                                placeholder="Label"
                                                value={option.label}
                                                onChange={(e) => updateFormFieldOption(index, optionIndex, "label", e.target.value)}
                                                data-testid={`input-option-label-${index}-${optionIndex}`}
                                              />
                                              <Input
                                                placeholder="Value"
                                                value={option.value}
                                                onChange={(e) => updateFormFieldOption(index, optionIndex, "value", e.target.value)}
                                                data-testid={`input-option-value-${index}-${optionIndex}`}
                                              />
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFormFieldOption(index, optionIndex)}
                                                data-testid={`button-remove-option-${index}-${optionIndex}`}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeFormField(index)}
                                      data-testid={`button-remove-field-${index}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="form-json">
                          <AccordionTrigger data-testid="accordion-form-json">Paste JSON Config</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div>
                              <Label htmlFor="form-json">JSON Configuration</Label>
                              <Textarea
                                id="form-json"
                                placeholder='{"title": "Contact Form", "fields": [...], "submitButtonText": "Submit"}'
                                value={formJsonText}
                                onChange={(e) => {
                                  setFormJsonText(e.target.value);
                                  validateFormJson(e.target.value);
                                }}
                                className={`mt-2 font-mono text-sm ${
                                  formJsonValid === true
                                    ? "border-green-500"
                                    : formJsonValid === false
                                    ? "border-red-500"
                                    : ""
                                }`}
                                rows={10}
                                data-testid="textarea-form-json"
                              />
                            </div>

                            {formJsonValid === true && (
                              <Card className="border-green-500" data-testid="form-json-valid">
                                <CardContent className="pt-6">
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-medium">Valid configuration</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {formJsonValid === false && (
                              <Card className="border-red-500" data-testid="form-json-errors">
                                <CardContent className="pt-6">
                                  <div className="flex items-start gap-2 text-red-600">
                                    <XCircle className="w-5 h-5 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="font-medium">Validation errors:</p>
                                      <ul className="list-disc list-inside mt-2 space-y-1">
                                        {formJsonErrors.map((error, i) => (
                                          <li key={i} className="text-sm">{error}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {contentType === "collection" && (
                  <Card data-testid="collection-selector">
                    <CardHeader>
                      <CardTitle>Collection Selector</CardTitle>
                      <CardDescription>
                        Choose the type of collection to display
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup
                        value={collectionType}
                        onValueChange={(value) => setCollectionType(value as any)}
                        className="space-y-4"
                      >
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem value="testimonials" id="testimonials" data-testid="radio-testimonials" />
                              <div className="flex-1">
                                <Label htmlFor="testimonials" className="text-base font-medium">
                                  Testimonial Carousel
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Displays featured testimonials in a carousel
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem value="videos" id="videos" data-testid="radio-videos" />
                              <div className="flex-1">
                                <Label htmlFor="videos" className="text-base font-medium">
                                  Video Gallery
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Displays video posts in a gallery grid
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem value="blogs" id="blogs" data-testid="radio-blogs" />
                              <div className="flex-1">
                                <Label htmlFor="blogs" className="text-base font-medium">
                                  Blog Feed
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Displays blog posts in a feed layout
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem value="custom" id="custom" data-testid="radio-custom" />
                              <div className="flex-1">
                                <Label htmlFor="custom" className="text-base font-medium">
                                  Custom
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Advanced JSON configuration for custom collection behavior
                                </p>
                              </div>
                            </div>
                            {collectionType === "custom" && (
                              <div className="ml-7">
                                <Label htmlFor="collection-custom-json">Custom JSON Configuration</Label>
                                <Textarea
                                  id="collection-custom-json"
                                  placeholder='{"collectionType": "custom", "customSettings": {...}}'
                                  value={collectionCustomJson}
                                  onChange={(e) => setCollectionCustomJson(e.target.value)}
                                  className="mt-2 font-mono text-sm"
                                  rows={6}
                                  data-testid="textarea-collection-custom-json"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                )}

                {contentType === "embedded-assessment" && (
                  <Card data-testid="assessment-selector">
                    <CardHeader>
                      <CardTitle>Assessment Embed</CardTitle>
                      <CardDescription>
                        Select an assessment to embed in this campaign
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="assessment-select">Assessment</Label>
                        <Select
                          value={selectedAssessmentId}
                          onValueChange={setSelectedAssessmentId}
                        >
                          <SelectTrigger id="assessment-select" className="mt-2" data-testid="select-assessment">
                            <SelectValue placeholder="Select an assessment" />
                          </SelectTrigger>
                          <SelectContent>
                            {assessments?.map((assessment) => (
                              <SelectItem
                                key={assessment.id}
                                value={assessment.id}
                                data-testid={`option-assessment-${assessment.id}`}
                              >
                                {assessment.title} ({assessment.slug})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-2">
                          Choose which assessment to display in this campaign zone
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SECTION 2: Display Settings */}
                <Card data-testid="display-settings-section">
                  <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>
                      Configure how the campaign content is displayed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="light" id="theme-light" data-testid="radio-theme-light" />
                                <Label htmlFor="theme-light">Light</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="dark" id="theme-dark" data-testid="radio-theme-dark" />
                                <Label htmlFor="theme-dark">Dark</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="auto" id="theme-auto" data-testid="radio-theme-auto" />
                                <Label htmlFor="theme-auto">Auto (adapts to user's system preference)</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            Choose the color theme for the widget
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="small" id="size-small" data-testid="radio-size-small" />
                                <Label htmlFor="size-small">Small</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="size-medium" data-testid="radio-size-medium" />
                                <Label htmlFor="size-medium">Medium</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="large" id="size-large" data-testid="radio-size-large" />
                                <Label htmlFor="size-large">Large</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            Choose the display size for the widget
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {displayAs === "popup" && (
                      <>
                        <Separator />

                        <FormField
                          control={form.control}
                          name="overlayOpacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Backdrop Opacity: {field.value}%</FormLabel>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-overlay-opacity"
                                />
                              </FormControl>
                              <FormDescription>
                                Adjust the opacity of the popup backdrop (0-100%)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dismissible"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Dismissible</FormLabel>
                                <FormDescription>
                                  Allow users to close the popup
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-dismissible"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="animation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Animation</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-animation">
                                    <SelectValue placeholder="Select an animation" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="fade" data-testid="option-animation-fade">Fade</SelectItem>
                                  <SelectItem value="slide-up" data-testid="option-animation-slide-up">Slide Up</SelectItem>
                                  <SelectItem value="slide-down" data-testid="option-animation-slide-down">Slide Down</SelectItem>
                                  <SelectItem value="scale" data-testid="option-animation-scale">Scale</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose the animation effect for the popup
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* SECTION 3: Targeting */}
                <Card data-testid="targeting-section">
                  <CardHeader>
                    <CardTitle>Targeting</CardTitle>
                    <CardDescription>
                      Configure which pages and zones to display this campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base">Target Pages</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select the pages where this campaign should appear
                      </p>
                      <div className="space-y-3">
                        {[
                          { value: "all", label: "All Pages" },
                          { value: "home", label: "Home" },
                          { value: "blog", label: "Blog" },
                          { value: "about", label: "About" },
                          { value: "contact", label: "Contact" },
                          { value: "pricing", label: "Pricing" },
                          { value: "features", label: "Features" },
                          { value: "assessments", label: "Assessments" },
                        ].map((page) => (
                          <div key={page.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`page-${page.value}`}
                              checked={page.value === "all" ? allPagesChecked : targetPages.includes(page.value)}
                              onCheckedChange={() => handleTargetPageToggle(page.value)}
                              disabled={allPagesChecked && page.value !== "all"}
                              data-testid={`checkbox-page-${page.value}`}
                            />
                            <Label
                              htmlFor={`page-${page.value}`}
                              className={allPagesChecked && page.value !== "all" ? "text-muted-foreground" : ""}
                            >
                              {page.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {displayAs === "inline" && (
                      <>
                        <Separator />

                        <FormField
                          control={form.control}
                          name="targetZone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Zone</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-target-zone-targeting">
                                    <SelectValue placeholder="Select a zone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="zone-1" data-testid="option-zone-1-targeting">Zone 1</SelectItem>
                                  <SelectItem value="zone-2" data-testid="option-zone-2-targeting">Zone 2</SelectItem>
                                  <SelectItem value="zone-3" data-testid="option-zone-3-targeting">Zone 3</SelectItem>
                                  <SelectItem value="zone-4" data-testid="option-zone-4-targeting">Zone 4</SelectItem>
                                  <SelectItem value="zone-5" data-testid="option-zone-5-targeting">Zone 5</SelectItem>
                                  <SelectItem value="zone-6" data-testid="option-zone-6-targeting">Zone 6</SelectItem>
                                  <SelectItem value="zone-7" data-testid="option-zone-7-targeting">Zone 7</SelectItem>
                                  <SelectItem value="zone-8" data-testid="option-zone-8-targeting">Zone 8</SelectItem>
                                  <SelectItem value="zone-9" data-testid="option-zone-9-targeting">Zone 9</SelectItem>
                                  <SelectItem value="zone-10" data-testid="option-zone-10-targeting">Zone 10</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose which zone on the page to display this widget
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {isCheckingConflicts && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="checking-conflicts">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking for zone conflicts...
                          </div>
                        )}

                        {hasConflict && conflictingCampaign && (
                          <Alert variant="destructive" data-testid="zone-conflict-alert">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Zone Conflict Detected</AlertTitle>
                            <AlertDescription>
                              Zone {currentTargetZone} is already used by campaign "{conflictingCampaign.campaignName}" on these pages:{" "}
                              {currentTargetPages.filter(page => 
                                (conflictingCampaign.targetPages || []).includes(page) || 
                                (conflictingCampaign.targetPages || []).includes("all")
                              ).join(", ")}. 
                              Saving will deactivate the other campaign or you can choose a different zone.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* SECTION 4: SEO Metadata */}
                {displayAs === "inline" && (
                  <Card data-testid="seo-metadata-section">
                    <CardHeader>
                      <CardTitle>SEO Metadata</CardTitle>
                      <CardDescription>
                        Configure SEO settings for this inline widget
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="meta-title">Meta Title</Label>
                        <Input
                          id="meta-title"
                          placeholder="Enter meta title"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                          maxLength={60}
                          data-testid="input-meta-title"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {metaTitle.length}/60 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="meta-description">Meta Description</Label>
                        <Textarea
                          id="meta-description"
                          placeholder="Enter meta description"
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                          maxLength={160}
                          rows={3}
                          data-testid="textarea-meta-description"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {metaDescription.length}/160 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="og-image">OG Image URL</Label>
                        <Input
                          id="og-image"
                          placeholder="https://example.com/image.jpg"
                          value={ogImage}
                          onChange={(e) => setOgImage(e.target.value)}
                          data-testid="input-og-image"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Recommended size: 1200x630px
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
