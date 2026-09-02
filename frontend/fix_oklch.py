import re

file_path = 'src/index.css'
with open(file_path, 'r') as f:
    content = f.read()

# Replace oklch with HSL in :root
root_replacements = {
    '--background: oklch(1 0 0)': '--background: 0 0% 100%',
    '--foreground: oklch(0.145 0 0)': '--foreground: 222.2 84% 4.9%',
    '--card: oklch(1 0 0)': '--card: 0 0% 100%',
    '--card-foreground: oklch(0.145 0 0)': '--card-foreground: 222.2 84% 4.9%',
    '--popover: oklch(1 0 0)': '--popover: 0 0% 100%',
    '--popover-foreground: oklch(0.145 0 0)': '--popover-foreground: 222.2 84% 4.9%',
    '--primary: oklch(0.205 0 0)': '--primary: 222.2 47.4% 11.2%',
    '--primary-foreground: oklch(0.985 0 0)': '--primary-foreground: 210 40% 98%',
    '--secondary: oklch(0.97 0 0)': '--secondary: 210 40% 96.1%',
    '--secondary-foreground: oklch(0.205 0 0)': '--secondary-foreground: 222.2 47.4% 11.2%',
    '--muted: oklch(0.97 0 0)': '--muted: 210 40% 96.1%',
    '--muted-foreground: oklch(0.556 0 0)': '--muted-foreground: 215.4 16.3% 46.9%',
    '--accent: oklch(0.97 0 0)': '--accent: 210 40% 96.1%',
    '--accent-foreground: oklch(0.205 0 0)': '--accent-foreground: 222.2 47.4% 11.2%',
    '--destructive: oklch(0.577 0.245 27.325)': '--destructive: 0 84.2% 60.2%',
    '--border: oklch(0.922 0 0)': '--border: 214.3 31.8% 91.4%',
    '--input: oklch(0.922 0 0)': '--input: 214.3 31.8% 91.4%',
    '--ring: oklch(0.708 0 0)': '--ring: 222.2 84% 4.9%',
    '--chart-1: oklch(0.87 0 0)': '--chart-1: 12 76% 61%',
    '--chart-2: oklch(0.556 0 0)': '--chart-2: 173 58% 39%',
    '--chart-3: oklch(0.439 0 0)': '--chart-3: 197 37% 24%',
    '--chart-4: oklch(0.371 0 0)': '--chart-4: 43 74% 66%',
    '--chart-5: oklch(0.269 0 0)': '--chart-5: 27 87% 67%',
    '--sidebar: oklch(0.985 0 0)': '--sidebar: 0 0% 98%',
    '--sidebar-foreground: oklch(0.145 0 0)': '--sidebar-foreground: 240 5.3% 26.1%',
    '--sidebar-primary: oklch(0.205 0 0)': '--sidebar-primary: 240 5.9% 10%',
    '--sidebar-primary-foreground: oklch(0.985 0 0)': '--sidebar-primary-foreground: 0 0% 98%',
    '--sidebar-accent: oklch(0.97 0 0)': '--sidebar-accent: 240 4.8% 95.9%',
    '--sidebar-accent-foreground: oklch(0.205 0 0)': '--sidebar-accent-foreground: 240 5.9% 10%',
    '--sidebar-border: oklch(0.922 0 0)': '--sidebar-border: 220 13% 91%',
    '--sidebar-ring: oklch(0.708 0 0)': '--sidebar-ring: 217.2 91.2% 59.8%'
}

dark_replacements = {
    '--background: oklch(0.145 0 0)': '--background: 222.2 84% 4.9%',
    '--foreground: oklch(0.985 0 0)': '--foreground: 210 40% 98%',
    '--card: oklch(0.205 0 0)': '--card: 222.2 84% 4.9%',
    '--card-foreground: oklch(0.985 0 0)': '--card-foreground: 210 40% 98%',
    '--popover: oklch(0.205 0 0)': '--popover: 222.2 84% 4.9%',
    '--popover-foreground: oklch(0.985 0 0)': '--popover-foreground: 210 40% 98%',
    '--primary: oklch(0.922 0 0)': '--primary: 210 40% 98%',
    '--primary-foreground: oklch(0.205 0 0)': '--primary-foreground: 222.2 47.4% 11.2%',
    '--secondary: oklch(0.269 0 0)': '--secondary: 217.2 32.6% 17.5%',
    '--secondary-foreground: oklch(0.985 0 0)': '--secondary-foreground: 210 40% 98%',
    '--muted: oklch(0.269 0 0)': '--muted: 217.2 32.6% 17.5%',
    '--muted-foreground: oklch(0.708 0 0)': '--muted-foreground: 215 20.2% 65.1%',
    '--accent: oklch(0.269 0 0)': '--accent: 217.2 32.6% 17.5%',
    '--accent-foreground: oklch(0.985 0 0)': '--accent-foreground: 210 40% 98%',
    '--destructive: oklch(0.704 0.191 22.216)': '--destructive: 0 62.8% 30.6%',
    '--border: oklch(1 0 0 / 10%)': '--border: 217.2 32.6% 17.5%',
    '--input: oklch(1 0 0 / 15%)': '--input: 217.2 32.6% 17.5%',
    '--ring: oklch(0.556 0 0)': '--ring: 212.7 26.8% 83.9%',
    '--sidebar: oklch(0.205 0 0)': '--sidebar: 240 5.9% 10%',
    '--sidebar-foreground: oklch(0.985 0 0)': '--sidebar-foreground: 240 4.8% 95.9%',
    '--sidebar-primary: oklch(0.488 0.243 264.376)': '--sidebar-primary: 224.3 76.3% 48%',
    '--sidebar-primary-foreground: oklch(0.985 0 0)': '--sidebar-primary-foreground: 0 0% 100%',
    '--sidebar-accent: oklch(0.269 0 0)': '--sidebar-accent: 240 3.7% 15.9%',
    '--sidebar-accent-foreground: oklch(0.985 0 0)': '--sidebar-accent-foreground: 240 4.8% 95.9%',
    '--sidebar-border: oklch(1 0 0 / 10%)': '--sidebar-border: 240 3.7% 15.9%',
    '--sidebar-ring: oklch(0.556 0 0)': '--sidebar-ring: 217.2 91.2% 59.8%'
}

for k, v in root_replacements.items():
    content = content.replace(k, v)

for k, v in dark_replacements.items():
    content = content.replace(k, v)

# Add custom theme colors for tailwind to override oklch for specific used colors
custom_theme = """
    --color-slate-200: #e2e8f0;
    --color-slate-400: #94a3b8;
    --color-slate-500: #64748b;
    --color-slate-700: #334155;
    --color-slate-800: #1e293b;
    --color-slate-900: #0f172a;
    --color-slate-950: #020617;
    
    --color-amber-100: #fef3c7;
    --color-amber-200: #fde68a;
    --color-amber-300: #fcd34d;
    --color-amber-400: #fbbf24;
    --color-amber-500: #f59e0b;
    --color-amber-600: #d97706;
    --color-amber-800: #92400e;
    --color-amber-900: #78350f;
    
    --color-blue-200: #bfdbfe;
    --color-blue-400: #60a5fa;
    --color-blue-500: #3b82f6;
    --color-blue-700: #1d4ed8;
    --color-blue-900: #1e3a8a;
    
    --color-pink-200: #fbcfe8;
    --color-pink-400: #f472b6;
    --color-pink-500: #ec4899;
    --color-pink-700: #be185d;
    --color-pink-900: #831843;
    
    --color-red-500: #ef4444;
"""

content = content.replace('    --radius-4xl: calc(var(--radius) * 2.6);\n}', f'    --radius-4xl: calc(var(--radius) * 2.6);{custom_theme}\n}}')

with open(file_path, 'w') as f:
    f.write(content)

