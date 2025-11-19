import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, LayoutTemplate, Palette, Image as ImageIcon, CheckCircle, Trash2, Sparkles, Upload, X, FileVideo } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MediaAsset {
    id: string;
    cloudinaryUrl: string;
    mediaType: 'image' | 'video';
    label?: string;
}

export default function Wizard() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [structure, setStructure] = useState<string[]>(["hero", "features", "testimonials", "cta", "footer"]);
    const [generatedLayout, setGeneratedLayout] = useState<any>(null);
    const [refineSection, setRefineSection] = useState("");
    const [refineInstructions, setRefineInstructions] = useState("");

    const [brandSettings, setBrandSettings] = useState({
        logoUrl: "",
        colors: { primary: "#000000", secondary: "#ffffff", accent: "#3b82f6" },
        componentLibrary: "shadcn"
    });

    // Poll for background refinement
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (generatedLayout?.status === 'draft') {
            interval = setInterval(async () => {
                try {
                    const res = await apiRequest("GET", "/api/admin/layout-draft");
                    if (res.ok) {
                        const data = await res.json();
                        // Check if we have a newer version
                        if (data.draftJson && data.draftJson.version > (generatedLayout.version || 1)) {
                            setGeneratedLayout(data.draftJson);
                            toast({
                                title: "Refinement Complete",
                                description: "Your layout has been automatically refined by AI.",
                                duration: 5000
                            });
                        }
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [generatedLayout, toast]);

    const handleRefineSection = async () => {
        try {
            setIsLoading(true);
            const sectionToRefine = generatedLayout.sections.find((s: any) => s.id === refineSection);
            if (!sectionToRefine) return;

            const res = await apiRequest("POST", "/api/admin/refine-section", {
                section: sectionToRefine,
                instructions: refineInstructions
            });
            const data = await res.json();

            // Update the layout with the refined section
            const newLayout = { ...generatedLayout };
            const index = newLayout.sections.findIndex((s: any) => s.id === refineSection);
            if (index !== -1) {
                newLayout.sections[index] = data.section;
                setGeneratedLayout(newLayout);
                toast({ title: "Success", description: "Section refined successfully." });
                setRefineInstructions(""); // Clear instructions after success
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to refine section.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateLayout = async () => {
        try {
            setIsLoading(true);
            const res = await apiRequest("POST", "/api/admin/generate-layout");
            const data = await res.json();
            setGeneratedLayout(data.layout);
            toast({ title: "Success", description: "Layout generated successfully." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to generate layout.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDraftAndContinue = async () => {
        try {
            setIsLoading(true);
            const draftJson = {
                assets,
                structure
            };
            await apiRequest("POST", "/api/admin/layout-draft", { draftJson });
            setStep(4);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const newAssets: MediaAsset[] = [];
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/media-library/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("Upload failed");

                const asset = await res.json();
                newAssets.push(asset);
            }

            setAssets(prev => [...prev, ...newAssets]);
            toast({ title: "Success", description: `Uploaded ${newAssets.length} assets.` });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to upload assets.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    const handleDeleteAsset = async (id: string) => {
        try {
            await apiRequest("DELETE", `/api/media-library/${id}`);
            setAssets(prev => prev.filter(a => a.id !== id));
            toast({ title: "Success", description: "Asset deleted." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete asset.", variant: "destructive" });
        }
    };

    const handleSaveBrandSettings = async () => {
        try {
            setIsLoading(true);
            await apiRequest("POST", "/api/admin/brand-settings", brandSettings);
            toast({ title: "Success", description: "Brand settings saved." });
            setStep(2);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save brand settings.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">AI Layout Wizard</h1>
                <p className="text-muted-foreground">
                    Create a stunning, conversion-optimized landing page in minutes using AI.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar / Progress */}
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex flex-col gap-2">
                                {[
                                    { id: 1, label: "Brand Settings", icon: Palette },
                                    { id: 2, label: "Assets", icon: ImageIcon },
                                    { id: 3, label: "Structure", icon: LayoutTemplate },
                                    { id: 4, label: "Generate", icon: Wand2 },
                                    { id: 5, label: "Refine", icon: CheckCircle },
                                ].map((s) => (
                                    <div
                                        key={s.id}
                                        className={`flex items - center gap - 3 p - 2 rounded - md text - sm font - medium transition - colors ${step === s.id
                                            ? "bg-primary/10 text-primary"
                                            : step > s.id
                                                ? "text-muted-foreground"
                                                : "text-muted-foreground/60"
                                            } `}
                                    >
                                        <div
                                            className={`flex items - center justify - center w - 8 h - 8 rounded - full border ${step === s.id
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : step > s.id
                                                    ? "border-primary/50 text-primary"
                                                    : "border-muted-foreground/30"
                                                } `}
                                        >
                                            {step > s.id ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                                        </div>
                                        {s.label}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <Card className="min-h-[600px] flex flex-col">
                        <CardHeader>
                            <CardTitle>
                                {step === 1 && "Define Your Brand"}
                                {step === 2 && "Upload Assets"}
                                {step === 3 && "Page Structure"}
                                {step === 4 && "Generate Layout"}
                                {step === 5 && "Refine & Publish"}
                            </CardTitle>
                            <CardDescription>
                                {step === 1 && "Upload your logo and choose your brand colors."}
                                {step === 2 && "Add images and media for the AI to use."}
                                {step === 3 && "Select the sections and features you need."}
                                {step === 4 && "Let the AI build your initial layout."}
                                {step === 5 && "Tweaking the details for perfection."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {/* Step Content Placeholders */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="logoUrl">Logo URL</Label>
                                            <Input
                                                id="logoUrl"
                                                placeholder="https://example.com/logo.png"
                                                value={brandSettings.logoUrl}
                                                onChange={(e) => setBrandSettings({ ...brandSettings, logoUrl: e.target.value })}
                                            />
                                            <p className="text-xs text-muted-foreground">Enter the URL of your logo image.</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Brand Colors</Label>
                                            <div className="flex gap-4">
                                                <div className="space-y-1">
                                                    <Label htmlFor="primaryColor" className="text-xs">Primary</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            id="primaryColor"
                                                            type="color"
                                                            className="w-12 h-10 p-1 cursor-pointer"
                                                            value={brandSettings.colors.primary}
                                                            onChange={(e) => setBrandSettings({
                                                                ...brandSettings,
                                                                colors: { ...brandSettings.colors, primary: e.target.value }
                                                            })}
                                                        />
                                                        <Input
                                                            value={brandSettings.colors.primary}
                                                            onChange={(e) => setBrandSettings({
                                                                ...brandSettings,
                                                                colors: { ...brandSettings.colors, primary: e.target.value }
                                                            })}
                                                            className="w-24"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="secondaryColor" className="text-xs">Secondary</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            id="secondaryColor"
                                                            type="color"
                                                            className="w-12 h-10 p-1 cursor-pointer"
                                                            value={brandSettings.colors.secondary}
                                                            onChange={(e) => setBrandSettings({
                                                                ...brandSettings,
                                                                colors: { ...brandSettings.colors, secondary: e.target.value }
                                                            })}
                                                        />
                                                        <Input
                                                            value={brandSettings.colors.secondary}
                                                            onChange={(e) => setBrandSettings({
                                                                ...brandSettings,
                                                                colors: { ...brandSettings.colors, secondary: e.target.value }
                                                            })}
                                                            className="w-24"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="accentColor" className="text-xs">Accent</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            id="accentColor"
                                                            type="color"
                                                            className="w-12 h-10 p-1 cursor-pointer"
                                                            value={brandSettings.colors.accent}
                                                            onChange={(e) => setBrandSettings({
                                                                ...brandSettings,
                                                                colors: { ...brandSettings.colors, accent: e.target.value }
                                                            })}
                                                        />
                                                        <Input
                                                            value={brandSettings.colors.accent}
                                                            onChange={(e) => setBrandSettings({
                                                                ...brandSettings,
                                                                colors: { ...brandSettings.colors, accent: e.target.value }
                                                            })}
                                                            className="w-24"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="componentLibrary">Component Library</Label>
                                            <Select
                                                value={brandSettings.componentLibrary}
                                                onValueChange={(val) => setBrandSettings({ ...brandSettings, componentLibrary: val })}
                                            >
                                                <SelectTrigger id="componentLibrary">
                                                    <SelectValue placeholder="Select a library" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="shadcn">Shadcn UI (Clean, Modern)</SelectItem>
                                                    <SelectItem value="material">Material Design (Classic)</SelectItem>
                                                    <SelectItem value="brutalist">Brutalist (Bold, Stark)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">Choose the visual style for your components.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={handleSaveBrandSettings} disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Next: Assets
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-4 rounded-full bg-primary/10 text-primary">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                                <h3 className="font-semibold text-lg">Upload Assets</h3>
                                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                                    Drag and drop your images and videos here, or click to browse.
                                                    Supported formats: JPG, PNG, GIF, MP4, WebM.
                                                </p>
                                                <div className="mt-4">
                                                    <Input
                                                        type="file"
                                                        className="hidden"
                                                        id="file-upload"
                                                        multiple
                                                        accept="image/*,video/*"
                                                        onChange={handleFileUpload}
                                                        disabled={isUploading}
                                                    />
                                                    <Label
                                                        htmlFor="file-upload"
                                                        className={`inline - flex items - center justify - center rounded - md text - sm font - medium ring - offset - background transition - colors focus - visible: outline - none focus - visible: ring - 2 focus - visible: ring - ring focus - visible: ring - offset - 2 disabled: pointer - events - none disabled: opacity - 50 bg - primary text - primary - foreground hover: bg - primary / 90 h - 10 px - 4 py - 2 cursor - pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""} `}
                                                    >
                                                        {isUploading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            "Select Files"
                                                        )}
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        {assets.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                {assets.map((asset) => (
                                                    <div key={asset.id} className="group relative aspect-video rounded-lg overflow-hidden border bg-muted">
                                                        {asset.mediaType === "video" ? (
                                                            <video
                                                                src={asset.cloudinaryUrl}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={asset.cloudinaryUrl}
                                                                alt={asset.label}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => handleDeleteAsset(asset.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                        <Button onClick={() => setStep(3)} disabled={assets.length === 0}>
                                            Next: Structure ({assets.length} assets)
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: "hero", label: "Hero Section", description: "Main headline and call to action", required: true },
                                                { id: "features", label: "Features", description: "Highlight key product features" },
                                                { id: "how-it-works", label: "How It Works", description: "Step-by-step explanation" },
                                                { id: "testimonials", label: "Testimonials", description: "Social proof from customers" },
                                                { id: "pricing", label: "Pricing", description: "Pricing plans and comparison" },
                                                { id: "faq", label: "FAQ", description: "Frequently asked questions" },
                                                { id: "cta", label: "Final CTA", description: "Bottom call to action" },
                                                { id: "footer", label: "Footer", description: "Links and copyright", required: true },
                                            ].map((section) => (
                                                <div
                                                    key={section.id}
                                                    className={`flex items - start gap - 3 p - 4 rounded - lg border transition - colors cursor - pointer ${structure.includes(section.id)
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:bg-muted/50"
                                                        } `}
                                                    onClick={() => {
                                                        if (section.required) return;
                                                        setStructure(prev =>
                                                            prev.includes(section.id)
                                                                ? prev.filter(id => id !== section.id)
                                                                : [...prev, section.id]
                                                        );
                                                    }}
                                                >
                                                    <div className={`mt - 1 w - 4 h - 4 rounded border flex items - center justify - center ${structure.includes(section.id)
                                                        ? "bg-primary border-primary text-primary-foreground"
                                                        : "border-muted-foreground"
                                                        } `}>
                                                        {structure.includes(section.id) && <CheckCircle className="w-3 h-3" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm">{section.label}</h4>
                                                        <p className="text-xs text-muted-foreground">{section.description}</p>
                                                        {section.required && <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Required</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                        <Button onClick={handleSaveDraftAndContinue} disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Next: Generate Layout
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-4 py-8">
                                        {!generatedLayout ? (
                                            <>
                                                <div className="p-6 rounded-full bg-primary/10 text-primary w-20 h-20 mx-auto flex items-center justify-center">
                                                    <Wand2 className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-xl font-semibold">Ready to Generate</h3>
                                                <p className="text-muted-foreground max-w-md mx-auto">
                                                    We have everything we need. Click the button below to let the AI generate your landing page layout based on your brand and assets.
                                                </p>
                                                <Button size="lg" onClick={handleGenerateLayout} disabled={isLoading}>
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                            Generating Layout...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Wand2 className="mr-2 h-5 w-5" />
                                                            Generate Layout
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="space-y-6 text-left">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                        Layout Generated Successfully
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {generatedLayout.status === 'draft' && (
                                                            <Badge variant="secondary" className="animate-pulse">
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                Refining (v1)
                                                            </Badge>
                                                        )}
                                                        {generatedLayout.status === 'refined' && (
                                                            <Badge variant="default" className="bg-green-600">
                                                                <Sparkles className="w-3 h-3 mr-1" />
                                                                Refined (v2)
                                                            </Badge>
                                                        )}
                                                        <Button variant="outline" size="sm" onClick={() => {
                                                            navigator.clipboard.writeText(JSON.stringify(generatedLayout, null, 2));
                                                            toast({ title: "Copied", description: "Layout JSON copied to clipboard." });
                                                        }}>
                                                            Copy JSON
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-xs font-mono">
                                                    <pre>{JSON.stringify(generatedLayout, null, 2)}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                                        <Button onClick={() => setStep(5)} disabled={!generatedLayout}>
                                            Next: Refine
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Select Section to Refine</Label>
                                                <Select value={refineSection} onValueChange={setRefineSection}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a section..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {generatedLayout?.sections?.map((section: any) => (
                                                            <SelectItem key={section.id} value={section.id}>
                                                                {section.type.charAt(0).toUpperCase() + section.type.slice(1)} ({section.id})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Refinement Instructions</Label>
                                                <Textarea
                                                    placeholder="e.g., Make the headline punchier, add more contrast to the buttons..."
                                                    value={refineInstructions}
                                                    onChange={(e) => setRefineInstructions(e.target.value)}
                                                    rows={5}
                                                />
                                            </div>

                                            <Button
                                                className="w-full"
                                                onClick={handleRefineSection}
                                                disabled={isLoading || !refineSection || !refineInstructions}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Refining...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        Refine Section
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <div className="md:col-span-2 bg-muted rounded-lg p-4 overflow-auto max-h-[600px] border">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium text-sm text-muted-foreground">Live Preview (JSON)</h4>
                                                <div className="flex items-center gap-2">
                                                    {generatedLayout?.status === 'draft' && (
                                                        <Badge variant="secondary" className="animate-pulse">
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            Refining...
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">v{generatedLayout?.version || "1.0"}</Badge>
                                                </div>
                                            </div>
                                            <pre className="text-xs font-mono">{JSON.stringify(generatedLayout, null, 2)}</pre>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t">
                                        <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
                                        <Button onClick={() => {
                                            toast({ title: "Success", description: "Wizard completed! Layout saved." });
                                            // In a real app, this would redirect to the editor or dashboard
                                        }}>
                                            Finish & Save
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
