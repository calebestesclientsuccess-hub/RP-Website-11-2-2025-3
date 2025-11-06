import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Card } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  pdfUrl: string;
  showDownload?: boolean;
  className?: string;
}

export function PDFPreview({ pdfUrl, showDownload = true, className = '' }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const context = canvas.getContext('2d');
        
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        } as any;
        await page.render(renderContext).promise;

        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF preview');
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  if (loading) {
    return (
      <Card className={`p-8 flex items-center justify-center ${className}`} data-testid="pdf-preview-loading">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-12 w-12 animate-pulse" />
          <p className="text-sm">Loading PDF preview...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 flex items-center justify-center ${className}`} data-testid="pdf-preview-error">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <FileText className="h-12 w-12" />
          <p className="text-sm">{error}</p>
          {showDownload && (
            <Button variant="outline" size="sm" asChild data-testid="button-download-pdf-error">
              <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} data-testid="pdf-preview-container">
      <Card className="p-4 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto"
          data-testid="pdf-canvas"
        />
      </Card>
      
      {showDownload && (
        <div className="flex justify-center">
          <Button variant="outline" asChild data-testid="button-download-pdf-preview">
            <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download Full PDF
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}