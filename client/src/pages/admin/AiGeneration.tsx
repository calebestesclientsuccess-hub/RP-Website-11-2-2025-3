import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Copy, Save, ImageIcon, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AiGenerationPage() {
  const { toast } = useToast();
  
  // Text Gen State
  const [brandVoice, setBrandVoice] = useState("");
  const [topic, setTopic] = useState("");
  const [textResult, setTextResult] = useState("");

  // Image Gen State
  const [imagePrompt, setImagePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [stylize, setStylize] = useState(100);
  const [count, setCount] = useState(4);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]); // Placeholder for result URLs
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Text Mutation
  const textMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/text", {
        brandVoice,
        topic,
        type: "blog-outline" // or make selectable
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to generate text");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setTextResult(data.text);
      toast({ title: "Text Generated", description: "Your outline is ready." });
    },
    onError: (error: any) => {
      toast({
        title: "Text generation failed",
        description: error?.message || "Failed to generate text.",
        variant: "destructive"
      });
    }
  });

  // Image Mutation
  const imageMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingImage(true);
      // 1. Initiate generation
      const res = await apiRequest("POST", "/api/ai/image", {
        prompt: imagePrompt,
        aspectRatio,
        stylize,
        count,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to start generation");
      }

      const { predictions } = await res.json(); // Expect array of predictions
      
      // 2. Poll for results (simplified for MVP)
      // Wait for ALL to complete
      const results = await Promise.all(predictions.map(async (p: any) => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const pollRes = await apiRequest("GET", `/api/ai/image/${p.id}`);
              const status = await pollRes.json();
              if (status.status === "succeeded") {
                clearInterval(interval);
                resolve(status.output); // Replicate usually returns array of URLs or single string
              } else if (status.status === "failed" || status.status === "canceled") {
                clearInterval(interval);
                resolve(null); // Handle failure gracefully
              }
            } catch (e) {
              clearInterval(interval);
              resolve(null);
            }
          }, 2000);
        });
      }));

      // Flatten results (Replicate output might be string or string[])
      const flatImages = results
        .filter(Boolean)
        .flatMap(r => Array.isArray(r) ? r : [r])
        .filter(url => typeof url === 'string');
      
      return flatImages;
    },
    onSuccess: (data: any[]) => {
      setIsGeneratingImage(false);
      const images = Array.isArray(data) ? data : [data];
      setGeneratedImages(images);
      if (images.length === 0) {
        toast({ title: "No images returned", description: "Try adjusting your prompt and settings." });
      } else {
        toast({ title: "Images Generated", description: "Select an image to save." });
      }
    },
    onError: (error: any) => {
      setIsGeneratingImage(false);
      toast({
        title: "Image generation failed",
        description: error?.message || "Failed to generate images.",
        variant: "destructive"
      });
    }
  });

  const saveImage = async (url: string) => {
    // Mock saving to assets
    toast({ title: "Saved", description: "Image saved to project assets." });
    // TODO: Implement actual save logic (POST /api/media-library)
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nano Banna AI Studio</h1>
        <p className="text-muted-foreground">Generate high-quality text and images for your portfolio.</p>
      </div>

      <Tabs defaultValue="text" className="w-full h-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="text" className="flex gap-2 items-center"><FileText size={16} /> Text Generation</TabsTrigger>
          <TabsTrigger value="image" className="flex gap-2 items-center"><ImageIcon size={16} /> Image Generation</TabsTrigger>
        </TabsList>

        {/* TEXT GENERATION TAB */}
        <TabsContent value="text" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Input</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Brand Voice</Label>
                  <Textarea 
                    placeholder="e.g. Professional, Witty, Authoritative..." 
                    value={brandVoice}
                    onChange={e => setBrandVoice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Topic / Keyword</Label>
                  <Input 
                    placeholder="e.g. The Future of B2B Sales" 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => textMutation.mutate()} 
                  disabled={textMutation.isPending || !brandVoice || !topic}
                  className="w-full"
                >
                  {textMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Text
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Result</CardTitle>
                {textResult && (
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(textResult)}>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {textResult ? (
                  <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    {textResult}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Generated text will appear here...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* IMAGE GENERATION TAB */}
        <TabsContent value="image" className="space-y-4">
          <div className="grid md:grid-cols-[350px_1fr] gap-6">
            {/* Sidebar Controls */}
            <Card>
              <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Textarea 
                    placeholder="A futuristic corporate office with neon accents..." 
                    className="h-32"
                    value={imagePrompt}
                    onChange={e => setImagePrompt(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Aspect Ratio ({aspectRatio})</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["1:1", "16:9", "4:3", "3:4", "9:16"].map(ratio => (
                      <Button 
                        key={ratio} 
                        variant={aspectRatio === ratio ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setAspectRatio(ratio)}
                      >
                        {ratio}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Stylize ({stylize})</Label>
                  <Slider 
                    value={[stylize]} 
                    onValueChange={vals => setStylize(vals[0])} 
                    min={0} max={1000} step={10} 
                  />
                  <p className="text-xs text-muted-foreground">Higher values = more artistic</p>
                </div>

                <div className="space-y-4">
                  <Label>Number of Images ({count})</Label>
                  <Slider 
                    value={[count]} 
                    onValueChange={vals => setCount(vals[0])} 
                    min={1} max={4} step={1} 
                  />
                </div>

                <Button 
                  onClick={() => imageMutation.mutate()} 
                  disabled={imageMutation.isPending || isGeneratingImage || !imagePrompt}
                  className="w-full"
                >
                  {imageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Images
                </Button>
              </CardContent>
            </Card>

            {/* Results Grid */}
            <Card className="h-full">
              <CardHeader><CardTitle>Gallery</CardTitle></CardHeader>
              <CardContent>
                {imageMutation.isPending ? (
                   <div className="flex flex-col items-center justify-center h-96 space-y-4">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <p className="text-muted-foreground">Generating masterpieces...</p>
                   </div>
                ) : generatedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((url, i) => (
                      <div key={i} className="group relative rounded-lg overflow-hidden border bg-muted aspect-video">
                        <img src={url} alt={`Generated ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => saveImage(url)}>
                            <Save className="h-4 w-4 mr-2" /> Save Asset
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
                            Full Size
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground border-2 border-dashed rounded-lg">
                    Enter a prompt to start generating images
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

