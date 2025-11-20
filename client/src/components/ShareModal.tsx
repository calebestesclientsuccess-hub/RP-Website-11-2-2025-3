import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  ExternalLink, 
  Twitter, 
  Linkedin, 
  Check,
  Share2,
  QrCode
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  versionId?: string | null;
  versionLabel?: string;
}

export function ShareModal({ 
  open, 
  onOpenChange, 
  projectId,
  projectTitle,
  versionId,
  versionLabel
}: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (open && projectId) {
      // Generate the preview URL
      const baseUrl = window.location.origin;
      const url = versionId
        ? `${baseUrl}/preview/${projectId}?version=${encodeURIComponent(versionId)}`
        : `${baseUrl}/preview/${projectId}`;
      setPreviewUrl(url);
      
      // Generate QR code using API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [open, projectId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The preview link has been copied to your clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleOpenPreview = () => {
    window.open(previewUrl, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `Check out my portfolio: ${projectTitle}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(previewUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(previewUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: projectTitle,
          text: `Check out my portfolio: ${projectTitle}`,
          url: previewUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Portfolio
          </DialogTitle>
          <DialogDescription>
            {versionLabel
              ? `Share version ${versionLabel} with stakeholders via link or QR code.`
              : "Your portfolio is ready to share! Use the link below or scan the QR code."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Preview Link
            </label>
            <div className="flex items-center gap-2">
              <Card className="flex-1 px-3 py-2 bg-muted/50">
                <code className="text-xs break-all">{previewUrl}</code>
              </Card>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCopyLink}
                variant="default"
                className="flex-1"
                data-testid="button-copy-link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button 
                onClick={handleOpenPreview}
                variant="outline"
                data-testid="button-visit-preview"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Code for Mobile
            </label>
            <Card className="p-4 flex justify-center bg-white dark:bg-white">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-[200px] h-[200px]"
                data-testid="qr-code-image"
              />
            </Card>
            <p className="text-xs text-muted-foreground text-center">
              Scan with your phone to preview on mobile
            </p>
          </div>

          {/* Social Share Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Share on Social Media
            </label>
            <div className="flex gap-2">
              <Button
                onClick={handleShareTwitter}
                variant="outline"
                className="flex-1"
                data-testid="button-share-twitter"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={handleShareLinkedIn}
                variant="outline"
                className="flex-1"
                data-testid="button-share-linkedin"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>
            
            {/* Native Share (if available) */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="w-full"
                data-testid="button-native-share"
              >
                <Share2 className="w-4 h-4 mr-2" />
                More Options
              </Button>
            )}
          </div>

          {/* Preview Meta Information */}
          <Card className="p-3 bg-muted/30 border-dashed">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                How it will appear when shared:
              </p>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{projectTitle}</p>
                <p className="text-xs text-muted-foreground">
                  A stunning portfolio showcase created with Cygnus
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}