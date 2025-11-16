
import { describe, it, expect } from 'vitest';

describe('Director Config Completeness', () => {
  const REQUIRED_FIELDS = [
    "entryEffect", "exitEffect", "entryDuration", "exitDuration",
    "entryDelay", "exitDelay", "animationDuration", "entryEasing",
    "exitEasing", "staggerChildren", "backgroundColor", "textColor",
    "alignment", "headingSize", "bodySize", "fontWeight",
    "textShadow", "textGlow", "paddingTop", "paddingBottom",
    "parallaxIntensity", "fadeOnScroll", "scaleOnScroll",
    "blurOnScroll", "scrollSpeed", "transformOrigin",
    "overflowBehavior", "backdropBlur", "mixBlendMode",
    "enablePerspective", "customCSSClasses", "layerDepth",
    "mediaOpacity"
  ];

  it('should have exactly 33 required fields', () => {
    expect(REQUIRED_FIELDS.length).toBe(33);
  });

  it('should validate all required fields are present in a scene', () => {
    const mockScene = {
      type: 'text',
      content: { heading: 'Test' },
      director: {
        entryEffect: 'fade',
        exitEffect: 'fade',
        entryDuration: 1.2,
        exitDuration: 1.0,
        entryDelay: 0,
        exitDelay: 0,
        animationDuration: 1.0,
        entryEasing: 'ease-out',
        exitEasing: 'ease-in',
        staggerChildren: 0,
        backgroundColor: '#000000',
        textColor: '#ffffff',
        alignment: 'center',
        headingSize: '4xl',
        bodySize: 'base',
        fontWeight: 'normal',
        textShadow: false,
        textGlow: false,
        paddingTop: 'md',
        paddingBottom: 'md',
        parallaxIntensity: 0,
        fadeOnScroll: false,
        scaleOnScroll: false,
        blurOnScroll: false,
        scrollSpeed: 'normal',
        transformOrigin: 'center center',
        overflowBehavior: 'visible',
        backdropBlur: 'none',
        mixBlendMode: 'normal',
        enablePerspective: false,
        customCSSClasses: '',
        layerDepth: 5,
        mediaOpacity: 1.0
      }
    };

    const missingFields = REQUIRED_FIELDS.filter(
      field => mockScene.director[field] === undefined
    );

    expect(missingFields).toEqual([]);
  });

  it('should detect missing fields', () => {
    const incompleteScene = {
      type: 'text',
      director: {
        entryEffect: 'fade',
        backgroundColor: '#000000'
        // Missing 31 other fields
      }
    };

    const missingFields = REQUIRED_FIELDS.filter(
      field => incompleteScene.director[field] === undefined
    );

    expect(missingFields.length).toBeGreaterThan(30);
  });
});
