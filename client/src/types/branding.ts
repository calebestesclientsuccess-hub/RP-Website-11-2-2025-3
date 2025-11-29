export interface BrandingProject {
  id: string;
  slug: string;
  clientName: string;
  projectTitle: string;
  thumbnailImage: string;
  categories: string[];
  challenge: string;
  solution: string;
  outcome: string;
  modalMediaAssets?: Array<{
    id: string;
    url: string;
    type: string;
    order: number;
  }> | null;
  modalMediaUrls?: string[] | null;
  modalMediaType?: string | null;
  galleryImages?: string[];
  testimonial?: {
    text: string;
    author: string;
  };
}

