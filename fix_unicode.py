#!/usr/bin/env python3
import os
import glob

# Comprehensive unicode replacement map
replacements = {
    'â‚¹': '₹',           # Rupee symbol
    'ðŸ'‹': '👋',       # Waving hand
    'ðŸ'¡': '💡',       # Light bulb
    'ðŸ"„': '📄',       # Document
    'ðŸ—"ï¸': '📋',     # Clipboard
    'â˜…': '★',         # Filled star
    'â˜†': '☆',         # Empty star
    'â€"': '–',         # En dash
    'â€™': ''',         # Right single quote
    'â€œ': '"',         # Left double quote
    'â€': '"',         # Right double quote
    'âœ…': '✅',        # Check mark
    'âœ"': '✔',        # Check
    'âœ•': '✕',        # X mark
    'âœ—': '✗',        # Heavy X
    'âŒ': '❌',         # Cross mark
    'â†'': '→',        # Right arrow
    'â†—': '↑',        # Up arrow
    'â†''': '↓',       # Down arrow
    'â„¹ï¸': 'ℹ️',      # Info
    'âš ': '⚠',        # Warning
    'âš ï¸': '⚠️',    # Warning emoji
    'â—': '●',         # Bullet
    'â€¢': '•',        # Bullet point
    'âž–': '➖',        # Minus
    'ðŸ'Ž': '👎',       # Thumbs down
    'ðŸ'‰': '👉',       # Pointing
    'ðŸŌ': '🌶',       # Fire/Chili
    'ðŸŽ‰': '🎉',       # Party popper
}

fixed_count = 0
os.chdir('c:\\Users\\yasmi\\OneDrive\\Desktop\\roomhy final')

for html_file in glob.glob('**/*.html', recursive=True):
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for corrupt, correct in replacements.items():
            content = content.replace(corrupt, correct)
        
        if content != original:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Fixed: {html_file}')
            fixed_count += 1
    except Exception as e:
        print(f'Error with {html_file}: {e}')

print(f'\nTotal files fixed: {fixed_count}')
