import { BrandSettings } from '../models/brandSettings';
import { LayoutDraft } from '../models/layoutDraft';

/**
 * Build the LLM prompt string based on the wizard configuration.
 *
 * @param brand - brand settings (logo URL, colors, component library)
 * @param draft - current layout draft (sections, selected features, etc.)
 * @returns Prompt string ready to be sent to the LLM.
 */
export function buildLayoutPrompt(brand: BrandSettings, draft: LayoutDraft): string {
    const { logoUrl, colors, componentLibrary } = brand;
    const { draftJson } = draft;

    const brandInfo = [];
    if (logoUrl) brandInfo.push(`Logo URL: ${logoUrl}`);
    if (colors) brandInfo.push(`Brand colors: ${JSON.stringify(colors)}`);
    if (componentLibrary) brandInfo.push(`Component library: ${componentLibrary}`);

    const config = typeof draftJson === 'object' ? JSON.stringify(draftJson, null, 2) : draftJson;

    return `You are an AI assistant that generates a JSON layout configuration for a SaaS landing page.

Brand information:
${brandInfo.join('\n')}

Current wizard configuration (sections, features, CTA, etc.):
${config}

Generate a complete JSON layout that includes:
- All sections in order
- UI components based on the chosen component library
- Apply the brand colors and logo where appropriate
- Include placeholders for assets (images, videos) referenced in the draft

Return ONLY the JSON object, no extra text.`;
}

export function buildRefineSectionPrompt(section: any, instructions: string): string {
    return `
    You are an expert UI/UX designer. Refine the following section configuration based on the user's instructions.
    
    Current Section Configuration:
    ${JSON.stringify(section, null, 2)}
    
    User Instructions:
    "${instructions}"
    
    Output ONLY the updated JSON object for this specific section. Do not wrap in markdown.
    `;
}
