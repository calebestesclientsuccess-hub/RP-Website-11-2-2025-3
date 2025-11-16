/**
 * ESM Loader Hook registered programmatically
 * Intercepts vite module and patches createServer
 */

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  
  // Intercept the vite chunk that contains createServer
  if (url.includes('node_modules/vite/dist/node/chunks/dep-') && url.endsWith('.js')) {
    console.log('[register-loader] Checking Vite chunk for createServer:', url);
    
    let source = result.source.toString();
    
    // Find and wrap the createServer function
    // Look for various patterns it might use
    const patterns = [
      /(async function createServer\([^)]*\)\s*{)/,
      /(function createServer\([^)]*\)\s*{)/,
      /(const createServer\s*=\s*async\s*\([^)]*\)\s*=>\s*{)/,
      /(createServer:\s*async\s*\([^)]*\)\s*=>\s*{)/,
    ];
    
    let patched = false;
    for (const pattern of patterns) {
      if (pattern.test(source)) {
        source = source.replace(
          pattern,
          `$1
  // PATCHED: Inject allowedHosts for Replit domains
  console.log('[vite-patch] Injecting allowedHosts: true into server config');
  if (!inlineConfig) inlineConfig = {};
  if (!inlineConfig.server) inlineConfig.server = {};
  inlineConfig.server.allowedHosts = true;
`
        );
        console.log('[register-loader] Successfully patched createServer function');
        patched = true;
        break;
      }
    }
    
    if (!patched && source.includes('createServer')) {
      console.log('[register-loader] Found createServer but could not patch - checking for export pattern');
    }
    
    return {
      format: 'module',
      shortCircuit: true,
      source,
    };
  }
  
  return result;
}
