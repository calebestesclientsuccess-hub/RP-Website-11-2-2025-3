
import { describe, it, expect } from 'vitest';
import { filterCampaigns, getZoneFallback } from '../../client/src/lib/filterCampaigns';
import type { Campaign } from '@shared/schema';

describe('Campaign Filtering', () => {
  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      tenantId: 'test',
      campaignName: 'Hero Calculator',
      displayAs: 'inline',
      targetZone: 'hero-top',
      targetPages: ['home'],
      isActive: true,
      contentType: 'calculator',
      createdAt: new Date(),
      updatedAt: new Date(),
      contentPayload: null,
      startDate: null,
      endDate: null,
      priority: 0,
    },
    {
      id: '2',
      tenantId: 'test',
      campaignName: 'Popup Form',
      displayAs: 'popup',
      targetZone: null,
      targetPages: [],
      isActive: true,
      contentType: 'form',
      createdAt: new Date(),
      updatedAt: new Date(),
      contentPayload: null,
      startDate: null,
      endDate: null,
      priority: 0,
    },
    {
      id: '3',
      tenantId: 'test',
      campaignName: 'Sidebar Widget',
      displayAs: 'inline',
      targetZone: 'sidebar-top',
      targetPages: ['blog', 'resources'],
      isActive: false,
      contentType: 'testimonial',
      createdAt: new Date(),
      updatedAt: new Date(),
      contentPayload: null,
      startDate: null,
      endDate: null,
      priority: 0,
    },
  ];

  it('should filter by displayAs', () => {
    const result = filterCampaigns(mockCampaigns, { displayAs: 'inline' });
    expect(result).toHaveLength(2);
    expect(result.every(c => c.displayAs === 'inline')).toBe(true);
  });

  it('should filter by zone', () => {
    const result = filterCampaigns(mockCampaigns, { zone: 'hero-top' });
    expect(result).toHaveLength(1);
    expect(result[0].targetZone).toBe('hero-top');
  });

  it('should filter by page names', () => {
    const result = filterCampaigns(mockCampaigns, { pageNames: ['blog'] });
    expect(result).toHaveLength(1);
    expect(result[0].targetPages).toContain('blog');
  });

  it('should include campaigns with empty targetPages (wildcard)', () => {
    const result = filterCampaigns(mockCampaigns, { pageNames: ['home'] });
    expect(result.some(c => c.id === '2')).toBe(true);
  });

  it('should exclude inactive campaigns', () => {
    const result = filterCampaigns(mockCampaigns, {});
    expect(result.every(c => c.isActive)).toBe(true);
  });

  it('should filter by date range', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 86400000);
    
    const campaignWithFutureStart: Campaign = {
      ...mockCampaigns[0],
      id: '4',
      startDate: future,
    };

    const result = filterCampaigns([...mockCampaigns, campaignWithFutureStart], {});
    expect(result.some(c => c.id === '4')).toBe(false);
  });

  describe('getZoneFallback', () => {
    it('should return hero size for hero zones', () => {
      const fallback = getZoneFallback('hero-top');
      expect(fallback.displaySize).toBe('hero');
    });

    it('should return default for unknown zones', () => {
      const fallback = getZoneFallback('unknown-zone');
      expect(fallback.displaySize).toBe('standard');
    });
  });
});
