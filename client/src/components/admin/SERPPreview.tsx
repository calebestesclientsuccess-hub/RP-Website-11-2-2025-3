import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface SERPPreviewProps {
  title: string;
  description: string;
  url: string;
  slug: string;
}

export function SERPPreview({ title, description, url, slug }: SERPPreviewProps) {
  // Google typically truncates titles at ~60 chars and descriptions at ~160 chars
  const displayTitle = title || "Your Page Title Goes Here";
  const displayDesc =
    description ||
    "This is how your page description will appear in search results. Make sure it is compelling and includes your keywords.";
  
  const isTitleTruncated = displayTitle.length > 60;
  const isDescTruncated = displayDesc.length > 160;

  const truncate = (str: string, max: number) => {
    return str.length > max ? str.substring(0, max) + "..." : str;
  };

  const previewUrl = url
    ? url.startsWith("http")
      ? url
      : `https://${url.replace(/^https?:\/\//, "")}`
    : `https://revenueparty.com/blog/${slug || "your-url-slug"}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Search Result Preview</h3>
        <span className="text-xs text-muted-foreground">Google Desktop Preview</span>
      </div>
      
      <Card className="border-muted bg-white dark:bg-[#1f1f1f] shadow-sm">
        <CardContent className="p-4">
          <div className="font-sans space-y-1">
            <div className="flex items-center gap-2 text-sm text-[#202124] dark:text-[#bdc1c6] mb-1">
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] overflow-hidden">
                <img
                  src="/favicon.png"
                  alt=""
                  className="w-4 h-4 opacity-60"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col leading-snug">
                <span className="text-[14px]">Revenue Party</span>
                <span className="text-[12px] text-[#4d5156] dark:text-[#9aa0a6]">
                  {previewUrl.replace(/^https?:\/\//, "")}
                </span>
              </div>
            </div>

            <a href="#" onClick={(e) => e.preventDefault()} className="block group">
              <h3 className={`text-[20px] leading-[1.3] text-[#1a0dab] dark:text-[#8ab4f8] group-hover:underline ${isTitleTruncated ? 'text-red-600 dark:text-red-400' : ''}`}>
                {truncate(displayTitle, 60)}
              </h3>
            </a>

            <div className={`text-[14px] leading-[1.58] text-[#4d5156] dark:text-[#bdc1c6] ${isDescTruncated ? 'text-red-600 dark:text-red-400' : ''}`}>
              {truncate(displayDesc, 160)}
            </div>
          </div>
        </CardContent>
      </Card>

      {(isTitleTruncated || isDescTruncated) && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <div>
            <p className="font-medium">SEO Issues Detected</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs opacity-90">
              {isTitleTruncated && <li>Title exceeds 60 characters (truncation likely)</li>}
              {isDescTruncated && <li>Description exceeds 160 characters (truncation likely)</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

