/**
 * PostCSS plugin to scope global selectors to #prompt-stock-root
 * This ensures no styles leak to the host page
 * Only processes content.css, not popup styles
 */
export default function scopePlugin() {
  return {
    postcssPlugin: 'postcss-scope-plugin',
    Once(root, { result }) {
      // Only scope content.css, not popup styles
      const from = result.opts.from || '';
      if (!from.includes('content.css')) {
        return;
      }
      
      const scopeSelector = '#prompt-stock-root';
      
      // Process all rules
      root.walkRules((rule) => {
        const selector = rule.selector;
        
        // Skip @keyframes - they don't need scoping
        if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') {
          return;
        }
        
        // Skip if already scoped with #prompt-stock-root
        if (selector.includes('#prompt-stock-root')) {
          return;
        }
        
        // Don't wrap @rules
        if (selector.startsWith('@')) {
          return;
        }
        
        // Only scope universal selectors and pseudo-elements that could affect the page
        // Tailwind utility classes are already scoped by the "important" config
        if (selector.match(/^(\*|::?before|::?after|html|body|:root)/)) {
          // Replace these with scoped versions
          rule.selector = selector.replace(/^(\*|html|body|:root)/, `${scopeSelector} $1`);
        }
      });
    },
  };
}

scopePlugin.postcss = true;

