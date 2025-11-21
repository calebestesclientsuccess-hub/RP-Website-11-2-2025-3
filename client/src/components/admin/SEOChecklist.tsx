
import { validateMetaDescription, validateAltText, extractHeadings } from '../../lib/seo-utils';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

interface SEOChecklistProps {
  title: string;
  description: string;
  content: string;
  images?: Array<{ src: string; alt: string }>;
}

export function SEOChecklist({ title, description, content, images = [] }: SEOChecklistProps) {
  const descValidation = validateMetaDescription(description);
  const titleLength = title.length;
  const wordCount = content.split(/\s+/).length;
  const plainText = content.replace(/<[^>]+>/g, ' ');
  const words = plainText.split(/\s+/).filter(Boolean);
  const first100Words = words.slice(0, 100).join(' ').toLowerCase();
  const candidateKeyword = title
    .toLowerCase()
    .split(/\s+/)
    .find((word) => word.length > 4) || title.toLowerCase();
  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keywordRegex = new RegExp(`\\b${escapeRegExp(candidateKeyword)}\\b`, 'g');
  const keywordMatches = (first100Words.match(keywordRegex) || []).length;
  const keywordValid = keywordMatches >= 1;

  const headings = extractHeadings(content);
  const h1Count = headings.filter((heading) => heading.level === 1).length;
  const headingHierarchyValid = headings.every((heading, index) => {
    if (index === 0) return true;
    const previousLevel = headings[index - 1].level;
    return heading.level - previousLevel <= 1;
  });
  
  const checks = [
    {
      label: 'Title length (50-60 characters)',
      valid: titleLength >= 50 && titleLength <= 60,
      current: `${titleLength} characters`
    },
    {
      label: 'Meta description (120-160 characters)',
      valid: descValidation.valid,
      current: descValidation.warning || `${description.length} characters`
    },
    {
      label: 'Content length (min 1000 words)',
      valid: wordCount >= 1000,
      current: `${wordCount} words`
    },
    {
      label: 'All images have valid alt text',
      valid: images.every(img => validateAltText(img.alt)),
      current: `${images.filter(img => validateAltText(img.alt)).length}/${images.length} valid`
    },
    {
      label: 'Exactly one H1 heading',
      valid: h1Count === 1,
      current: `${h1Count} H1 tags`
    },
    {
      label: 'Heading hierarchy intact',
      valid: headingHierarchyValid,
      current: headingHierarchyValid ? 'No skipped levels' : 'Check heading order'
    },
    {
      label: 'Primary keyword in first 100 words',
      valid: keywordValid,
      current: keywordValid ? 'Keyword present' : 'Missing keyword in intro'
    }
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">SEO Checklist</h3>
      {checks.map((check, index) => (
        <Alert key={index} variant={check.valid ? 'default' : 'destructive'}>
          <div className="flex items-start gap-2">
            {check.valid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <div className="flex-1">
              <AlertDescription>
                <span className="font-medium">{check.label}</span>
                <br />
                <span className="text-xs text-muted-foreground">{check.current}</span>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
