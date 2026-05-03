const fs = require('fs');

const html = fs.readFileSync('frontend/stitch_login.html', 'utf-8');
const match = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*</);
if (!match) {
    console.error("Could not find config in HTML");
    process.exit(1);
}

// Evaluate the string to an object (since it's a JS object literal)
const configStr = match[1];
const config = eval(`(${configStr})`);
const theme = config.theme.extend;

let css = `
@import "tailwindcss";
@plugin "tailwindcss-animate";
@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: 'Inter', sans-serif;
  --font-body-lg: 'Inter', sans-serif;
  --font-body-md: 'Inter', sans-serif;
  --font-label-sm: 'Inter', sans-serif;
  --font-headline-md: 'Inter', sans-serif;
  --font-display-xl: 'Inter', sans-serif;
  --font-headline-lg: 'Inter', sans-serif;

`;

// Colors
if (theme.colors) {
    for (const [key, val] of Object.entries(theme.colors)) {
        css += `  --color-${key}: ${val};\n`;
    }
}

// Spacing
if (theme.spacing) {
    for (const [key, val] of Object.entries(theme.spacing)) {
        css += `  --spacing-${key}: ${val};\n`;
    }
}

// Border Radius
if (theme.borderRadius) {
    for (const [key, val] of Object.entries(theme.borderRadius)) {
        if (key === 'DEFAULT') {
            css += `  --radius: ${val};\n`;
        } else {
            css += `  --radius-${key}: ${val};\n`;
        }
    }
}

// Font sizes
if (theme.fontSize) {
    for (const [key, val] of Object.entries(theme.fontSize)) {
        css += `  --text-${key}: ${val[0]};\n`;
        if (val[1]) {
            if (val[1].lineHeight) css += `  --text-${key}--line-height: ${val[1].lineHeight};\n`;
            if (val[1].letterSpacing) css += `  --text-${key}--letter-spacing: ${val[1].letterSpacing};\n`;
            if (val[1].fontWeight) css += `  --text-${key}--font-weight: ${val[1].fontWeight};\n`;
        }
    }
}

css += `}

/*
  The default border color has changed to \`currentColor\` in Tailwind CSS v4,
  so we've added these compatibility styles to make sure everything still
  looks the same as it did with Tailwind CSS v3.
*/
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}

@layer utilities {
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: 'liga';
  }
}
`;

fs.writeFileSync('frontend/src/app/globals.css', css);
console.log("Updated globals.css successfully!");
