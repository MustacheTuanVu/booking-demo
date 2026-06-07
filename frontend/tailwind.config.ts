/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
			sans: ['var(--font-roboto-condensed)', 'system-ui', 'sans-serif'],
            roboto: ['var(--font-roboto-condensed)', 'system-ui', 'sans-serif'],
  		},
  		colors: {
  			gold: {
  				'50': '#f9f6f0',
  				'100': '#f3ede1',
  				'200': '#e7dbc3',
  				'300': '#dbc9a5',
  				'400': '#bda476',
  				'500': '#ab8d59',
  				'600': '#987947',
  				'700': '#806439',
  				'800': '#674e2d',
  				'900': '#4e3921'
  			},
  			gray: {
  				'50': '#F9FAFB',
  				'100': '#F3F4F6',
  				'200': '#E5E7EB',
  				'300': '#D1D5DB',
  				'400': '#9CA3AF',
  				'500': '#6B7280',
  				'600': '#4B5563',
  				'700': '#374151',
  				'800': '#1F2937',
  				'900': '#111827'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'fadeIn': 'fadeIn 0.2s ease-out forwards'
  		},
        keyframes: {
            fadeIn: {
                '0%': { opacity: '0', transform: 'scale(0.95)' },
                '100%': { opacity: '1', transform: 'scale(1)' }
            }
        },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--gray-600)',
            '--tw-prose-headings': 'var(--gray-800)',
            '--tw-prose-links': 'var(--gold-600)',
            '--tw-prose-bold': 'var(--gray-900)',
            maxWidth: '100%',
            a: {
              color: 'var(--tw-prose-links)',
              '&:hover': {
                color: '#806439',
              },
            },
            'h1, h2, h3': {
              fontFamily: 'var(--font-roboto-condensed)',
              fontWeight: '600',
            },
            li: {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            'ul > li': {
              paddingLeft: '0.25em',
            }
          },
        },
      }
  	}
  },
    plugins: [
      require("tailwindcss-animate"), 
      require('@tailwindcss/typography')
    ]
}
