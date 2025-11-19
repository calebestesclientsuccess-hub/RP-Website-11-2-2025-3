// Brand Archetype Configurations
export interface BrandArchetype {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  preview: {
    gradient: string;
    icon: string;
  };
}

export const BRAND_ARCHETYPES: Record<string, BrandArchetype> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon colors, tech aesthetic, futuristic vibes',
    colors: {
      primary: '#00FFFF',   // Cyan
      secondary: '#FF00FF', // Magenta
      accent: '#FFD700',    // Gold
      background: '#0A0A0F', // Dark purple-black
      text: '#E0E0FF'       // Light purple-white
    },
    fonts: {
      heading: 'Orbitron, monospace',
      body: 'Inter, sans-serif'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #00FFFF 0%, #FF00FF 100%)',
      icon: '⚡'
    }
  },
  
  swissMinimal: {
    id: 'swissMinimal',
    name: 'Swiss Minimal',
    description: 'Clean lines, white space, typography-focused design',
    colors: {
      primary: '#000000',   // Black
      secondary: '#666666', // Gray
      accent: '#FF3333',    // Red accent
      background: '#FFFFFF', // White
      text: '#1A1A1A'       // Near black
    },
    fonts: {
      heading: 'Helvetica Neue, Arial, sans-serif',
      body: 'Inter, system-ui, sans-serif'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
      icon: '◯'
    }
  },
  
  corporateBlue: {
    id: 'corporateBlue',
    name: 'Corporate Blue',
    description: 'Professional, trustworthy, enterprise-ready',
    colors: {
      primary: '#003B71',   // Deep blue
      secondary: '#0066CC', // Bright blue
      accent: '#40E0D0',    // Turquoise
      background: '#F8F9FA', // Light gray
      text: '#2C3E50'       // Dark gray-blue
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Open Sans, sans-serif'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #003B71 0%, #0066CC 100%)',
      icon: '📊'
    }
  },
  
  warmEarth: {
    id: 'warmEarth',
    name: 'Warm Earth',
    description: 'Natural, organic, sustainable aesthetic',
    colors: {
      primary: '#8B4513',   // Saddle brown
      secondary: '#DEB887', // Burlywood
      accent: '#228B22',    // Forest green
      background: '#FAF6F2', // Warm white
      text: '#3E2723'       // Dark brown
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Lora, Georgia, serif'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #8B4513 0%, #DEB887 100%)',
      icon: '🌿'
    }
  },
  
  boldCreative: {
    id: 'boldCreative',
    name: 'Bold Creative',
    description: 'Vibrant, artistic, expressive design',
    colors: {
      primary: '#FF006E',   // Hot pink
      secondary: '#FB5607', // Orange
      accent: '#FFBE0B',    // Yellow
      background: '#FFFFF0', // Ivory
      text: '#2A2A2A'       // Dark gray
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Poppins, sans-serif'
    },
    preview: {
      gradient: 'linear-gradient(135deg, #FF006E 0%, #FB5607 50%, #FFBE0B 100%)',
      icon: '🎨'
    }
  }
};

export const SAMPLE_CONTENT = `I'm Sarah Chen, a product designer who transforms complex problems into elegant digital experiences. Over the past 5 years, I've led design initiatives at three fast-growing startups, where I pioneered user-centered design systems that increased engagement by 40%.

My journey began at a small fintech startup where I was the sole designer. There, I learned to balance user needs with business constraints, shipping features that delighted customers while meeting aggressive deadlines. This experience taught me the importance of pragmatic design decisions and rapid iteration.

At my current role as Senior Product Designer at TechCorp, I lead a team of four designers working on our flagship SaaS platform. My proudest achievement was redesigning our onboarding flow, which reduced time-to-value from 3 days to 30 minutes and improved trial-to-paid conversion by 25%.

I believe great design happens at the intersection of empathy and strategy. Every pixel should serve a purpose, every interaction should feel intuitive, and every product should tell a story that resonates with its users.

When I'm not designing, you'll find me mentoring junior designers, speaking at design conferences, or exploring new creative mediums. I'm passionate about building inclusive products that make technology accessible to everyone.

Let's create something extraordinary together.`;

export const BUSINESS_TYPES = [
  { value: 'agency', label: 'Agency' },
  { value: 'startup', label: 'Startup' },
  { value: 'personal', label: 'Personal Brand' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'creative', label: 'Creative Studio' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'other', label: 'Other' }
];