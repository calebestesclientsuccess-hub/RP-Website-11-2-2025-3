# Safari Desktop Optimization Plan
**Status:** Tier 1 Applied - Testing Required

---

## Current Changes (Applied)

### ✅ Tier 1: Safari Detection + Modest Reduction
1. **Safari Detection:** Auto-detects Safari browser
2. **Ember Count:**
   - Chrome/Brave/Firefox: 350 embers
   - Safari Desktop: 250 embers (28% reduction)
3. **Scroll Distance:** 600vh for everyone (down from 1190vh)
4. **Scrub Speed:**
   - Chrome: 0.5 (responsive)
   - Safari: 1.0 (slower = less CPU per frame)
5. **GPU Hints:**
   - Added `willChange: 'transform'` to embers
   - Added `transform: 'translate3d(0,0,0)'` to force GPU layers
   - Added `backface-visibility: hidden` for Safari

---

## Testing Checklist

### Test on Safari Desktop
1. Open http://localhost:50005 in Safari
2. Scroll through bridge section
3. Monitor performance:
   - Does it feel smooth?
   - Are embers visible and falling?
   - Any dropped frames or stuttering?

### Performance Metrics
- **Target:** 60fps during scroll
- **Acceptable:** 30-45fps (slight jank OK)
- **Unacceptable:** <30fps (needs Tier 2)

---

## If Still Janky: Tier 2 (Ember Clustering)

### The Concept
Instead of 350 DOM elements (1 per ember), create **50 "cluster" elements** that each contain 7 visual embers.

**Result:** Same 350 embers visually, but only 50 DOM nodes for Safari to track.

### Implementation

**File:** `shared/emberClusters.ts`
```typescript
import { EMBER_PRIMES } from './constants';

export type EmberCluster = {
  id: number;
  left: number;
  top: number;
  embers: Array<{
    offsetX: number;  // Relative to cluster center
    offsetY: number;
    size: number;
    delay: number;
    duration: number;
  }>;
};

export const generateEmberClusters = (
  clusterCount: number, 
  embersPerCluster: number
): EmberCluster[] => {
  return Array.from({ length: clusterCount }, (_, clusterIdx) => {
    const p1 = EMBER_PRIMES[clusterIdx % EMBER_PRIMES.length];
    
    // Cluster position
    const clusterLeft = 45 + ((clusterIdx * p1) % 10); // 45-55% range
    const clusterTop = 4 + ((clusterIdx * 3) % 5); // 4-9vh range
    
    // Generate sub-embers within cluster
    const embers = Array.from({ length: embersPerCluster }, (_, emberIdx) => {
      const p2 = EMBER_PRIMES[(emberIdx + 5) % EMBER_PRIMES.length];
      
      return {
        offsetX: ((emberIdx % 3) - 1) * 15, // -15, 0, or +15px
        offsetY: (emberIdx % 4) * 5, // 0, 5, 10, 15px
        size: 3 + ((emberIdx * p2) % 4),
        delay: -(emberIdx * 3),
        duration: 25 + ((emberIdx * p2) % 20),
      };
    });
    
    return {
      id: clusterIdx,
      left: clusterLeft,
      top: clusterTop,
      embers,
    };
  });
};
```

**Update DesktopBridge.tsx:**
```typescript
import { generateEmberClusters } from './shared/emberClusters';

// Instead of:
const embers = useMemo(() => generateEmbers(isSafari ? 250 : 350), [isSafari]);

// Use:
const useClustering = isSafari; // Can enable for all browsers if needed
const emberData = useMemo(() => {
  if (useClustering) {
    return {
      type: 'clusters',
      data: generateEmberClusters(50, 7) // 50 × 7 = 350 embers, 50 DOM nodes
    };
  } else {
    return {
      type: 'individual',
      data: generateEmbers(350)
    };
  }
}, [useClustering]);

// Render:
{emberData.type === 'clusters' ? (
  // Cluster rendering (50 nodes)
  emberData.data.map(cluster => (
    <div key={cluster.id} className="ember-cluster" style={{
      left: `${cluster.left}%`,
      top: `${cluster.top}vh`,
      position: 'absolute'
    }}>
      {cluster.embers.map((ember, i) => (
        <span 
          key={i} 
          className="sub-ember"
          style={{
            transform: `translate(${ember.offsetX}px, ${ember.offsetY}px)`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            animationDelay: `${ember.delay}s`,
            animationDuration: `${ember.duration}s`,
          }}
        />
      ))}
    </div>
  ))
) : (
  // Current individual rendering (350 nodes)
  emberData.data.map(ember => (/* current code */))
)}
```

**Estimated Effort:** 30-45 minutes  
**Performance Gain:** 85% fewer DOM nodes to track

---

## If Still Janky: Tier 3 (Fallback)

Reduce Safari embers further:
- 250 → 200
- 200 → 150
- 150 → 100

Each step is a 1-line change.

---

## Nuclear Option: Disable Embers on Safari Only

If nothing else works:
```typescript
const embers = useMemo(() => generateEmbers(isSafari ? 0 : 350), [isSafari]);
```

Safari users still get the text animation, atmospheric glow, heat distortion - just no falling embers.

**BUT:** Try Tier 1 first. Safari might handle 250 just fine.

---

## Testing Instructions

1. **Hard refresh** browser (Cmd+Shift+R)
2. Test on **Safari Desktop**
3. Check DevTools → Performance tab → Record during scroll
4. Report back:
   - Smooth? → SUCCESS
   - Still janky? → Try Tier 2 (clustering)
   - Unbearable? → Reduce further (250 → 200 → 150)

---

**Your embers are staying.** We're just being smart about Safari. 🔥

