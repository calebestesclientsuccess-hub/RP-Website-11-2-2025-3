
import { describe, it, expect } from 'vitest';
import {
  validateAltText,
  generateSlug,
  validateMetaDescription,
  extractHeadings,
} from '../../client/src/lib/seo-utils';

describe('SEO Utils', () => {
  describe('validateAltText', () => {
    it('should reject empty alt text', () => {
      expect(validateAltText('')).toBe(false);
      expect(validateAltText('   ')).toBe(false);
    });

    it('should reject alt text that is too short', () => {
      expect(validateAltText('img')).toBe(false);
    });

    it('should reject alt text that is too long', () => {
      const longText = 'a'.repeat(126);
      expect(validateAltText(longText)).toBe(false);
    });

    it('should reject keyword-stuffed alt text', () => {
      expect(validateAltText('gtm gtm gtm gtm gtm')).toBe(false);
    });

    it('should accept valid alt text', () => {
      expect(validateAltText('Professional GTM team in action')).toBe(true);
      expect(validateAltText('Revenue Party office building')).toBe(true);
    });
  });

  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Hello! @World#')).toBe('hello-world');
    });

    it('should replace multiple spaces with single hyphen', () => {
      expect(generateSlug('Hello    World')).toBe('hello-world');
    });

    it('should trim leading and trailing hyphens', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });
  });

  describe('validateMetaDescription', () => {
    it('should reject descriptions that are too short', () => {
      const result = validateMetaDescription('Short');
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('too short');
    });

    it('should reject descriptions that are too long', () => {
      const longDesc = 'a'.repeat(161);
      const result = validateMetaDescription(longDesc);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('too long');
    });

    it('should accept valid descriptions', () => {
      const validDesc = 'a'.repeat(130);
      const result = validateMetaDescription(validDesc);
      expect(result.valid).toBe(true);
    });

    it('should treat boundary lengths as valid', () => {
      expect(validateMetaDescription('a'.repeat(120)).valid).toBe(true);
      expect(validateMetaDescription('a'.repeat(160)).valid).toBe(true);
    });
  });

  describe('extractHeadings', () => {
    it('should extract h1-h6 headings', () => {
      const content = '<h1>Title</h1><h2>Section</h2><h3>Subsection</h3>';
      const headings = extractHeadings(content);
      
      expect(headings).toHaveLength(3);
      expect(headings[0]).toMatchObject({ level: 1, text: 'Title' });
      expect(headings[1]).toMatchObject({ level: 2, text: 'Section' });
      expect(headings[2]).toMatchObject({ level: 3, text: 'Subsection' });
    });

    it('should strip HTML tags from heading text', () => {
      const content = '<h1>Title with <em>emphasis</em></h1>';
      const headings = extractHeadings(content);
      
      expect(headings[0].text).toBe('Title with emphasis');
    });

    it('should generate slugs for headings', () => {
      const content = '<h1>Hello World</h1>';
      const headings = extractHeadings(content);
      
      expect(headings[0].id).toBe('hello-world');
    });
  });
});
