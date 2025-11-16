
/**
 * Touch Target Audit Utility
 * Identifies interactive elements that don't meet 44x44px minimum
 */

export interface TouchTargetIssue {
  element: HTMLElement;
  width: number;
  height: number;
  selector: string;
  hasProperSpacing: boolean;
}

export function auditTouchTargets(): TouchTargetIssue[] {
  const MIN_SIZE = 44;
  const MIN_SPACING = 8;
  const issues: TouchTargetIssue[] = [];

  // Find all interactive elements
  const interactiveSelectors = [
    'button',
    'a',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[onclick]',
  ];

  interactiveSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el as HTMLElement);
      
      // Check if element is visible
      if (rect.width === 0 || rect.height === 0) return;
      
      const width = rect.width;
      const height = rect.height;
      
      // Check spacing to next interactive element
      const hasProperSpacing = checkSpacing(el as HTMLElement, MIN_SPACING);
      
      if (width < MIN_SIZE || height < MIN_SIZE || !hasProperSpacing) {
        issues.push({
          element: el as HTMLElement,
          width: Math.round(width),
          height: Math.round(height),
          selector: getSelector(el as HTMLElement),
          hasProperSpacing,
        });
      }
    });
  });

  return issues;
}

function checkSpacing(element: HTMLElement, minSpacing: number): boolean {
  const rect = element.getBoundingClientRect();
  const siblings = Array.from(element.parentElement?.children || [])
    .filter(el => el !== element && el instanceof HTMLElement);
  
  for (const sibling of siblings) {
    const siblingRect = sibling.getBoundingClientRect();
    const horizontalGap = Math.min(
      Math.abs(rect.left - siblingRect.right),
      Math.abs(rect.right - siblingRect.left)
    );
    const verticalGap = Math.min(
      Math.abs(rect.top - siblingRect.bottom),
      Math.abs(rect.bottom - siblingRect.top)
    );
    
    if (horizontalGap < minSpacing || verticalGap < minSpacing) {
      return false;
    }
  }
  
  return true;
}

function getSelector(element: HTMLElement): string {
  if (element.id) return `#${element.id}`;
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c).slice(0, 2).join('.');
    return `${element.tagName.toLowerCase()}.${classes}`;
  }
  return element.tagName.toLowerCase();
}

// Export function to run audit and log results
export function runTouchTargetAudit() {
  const issues = auditTouchTargets();
  
  if (issues.length === 0) {
    console.log('✅ All touch targets meet 44x44px minimum with proper spacing');
    return;
  }
  
  console.warn(`⚠️ Found ${issues.length} touch target issues:`);
  issues.forEach(issue => {
    console.warn(
      `${issue.selector}: ${issue.width}x${issue.height}px` +
      (issue.hasProperSpacing ? '' : ' (insufficient spacing)')
    );
  });
  
  return issues;
}
