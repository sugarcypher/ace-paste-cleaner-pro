# ACE Paste Cleaner Pro

Professional Unicode text sanitizer with advanced cleaning capabilities, language-aware processing, and enterprise security features.

## 🚀 Features

- **Advanced Unicode Cleaning**: Removes invisible characters, zero-width spaces, bidirectional controls, and more
- **Language-Aware Processing**: Preserves essential characters for Arabic, Thai, Khmer, and Indic scripts
- **Multiple Preset Modes**: Emoji-safe, max-sterile, markup-intact, and language-specific presets
- **Real-time Statistics**: Shows character counts, removal statistics, and cleaning effectiveness
- **Professional UI**: Clean, modern interface with glassmorphism design
- **Export Options**: Copy to clipboard or download as text file

## 🛠️ What Gets Cleaned

### Invisible Characters
- Zero-width characters (ZWSP, ZWNJ, ZWJ)
- Bidirectional controls (LRM, RLM, embedding/override controls)
- Soft hyphens and discretionary breaks
- BOM (Byte Order Mark) characters

### Unicode Categories
- Control characters (Cc)
- Format controls (Cf) 
- Surrogate code points (Cs)
- Non-characters and private use area
- Isolated combining marks

### Special Characters
- TAG characters (U+E0000..U+E007F)
- Variation selectors (except emoji presentation)
- Mongolian vowel separator
- Word joiner and other invisible separators

## 🌍 Language Support

### Arabic/Indic Scripts
- Preserves ZWJ (Zero Width Joiner) and ZWNJ (Zero Width Non-Joiner)
- Essential for proper text shaping in Arabic, Persian, Urdu, Hindi, Bengali, etc.

### Thai/Khmer Scripts  
- Preserves ZWSP (Zero Width Space) for line-break hints
- Maintains proper text flow and readability

### Emoji Support
- Preserves VS15 (text presentation) and VS16 (emoji presentation)
- Removes other variation selectors for cleaner text

## 🎯 Preset Modes

### Emoji Safe (Default)
- Preserves emoji presentation while cleaning invisible characters
- Best for general text cleaning with emoji support

### Max Sterile
- Maximum cleaning for archival and security purposes
- Removes all variation selectors and private use characters
- Uses NFKC normalization for aggressive compatibility

### Markup Intact
- Cleans Unicode while preserving HTML/Markdown formatting
- Ideal for content management systems

### Thai/Khmer
- Preserves ZWSP for proper line-break hints
- Optimized for Southeast Asian scripts

### Arabic/Indic
- Preserves ZWJ/ZWNJ for proper text shaping
- Essential for right-to-left and complex scripts

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) runtime and package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/sugarcypher/ace-paste-cleaner-pro.git
cd ace-paste-cleaner-pro

# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## 🔧 Configuration

The sanitizer uses a JSON profile for configuration. You can customize the cleaning behavior by modifying `sanitizer-profile.json`:

```json
{
  "version": "1.2",
  "normalize": "NFC",
  "strip_variation_selectors": "emoji_safekeep",
  "remove_private_use": "all",
  "language_overrides": {
    "ar": {
      "allow": ["\u200D", "\u200C"]
    }
  }
}
```

## 📊 Usage Statistics

The application provides real-time statistics showing:
- Original character count
- Cleaned character count  
- Number of characters removed
- Percentage reduction
- Count of invisible characters found

## 🎨 UI Features

- **Glassmorphism Design**: Modern, translucent interface elements
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Real-time Processing**: Instant text cleaning with visual feedback
- **Export Options**: Copy to clipboard or download as text file
- **Preset Selection**: Easy switching between cleaning modes
- **Advanced Mode**: Custom configuration options (coming soon)

## 🔒 Security Features

- **XSS Protection**: Removes potentially malicious invisible characters
- **Data Sanitization**: Cleans text for safe storage and transmission
- **Unicode Normalization**: Prevents Unicode-based attacks
- **Control Character Removal**: Eliminates hidden control sequences

## 🌐 Deployment

### GitHub Pages
The application is automatically deployed to GitHub Pages on every push to the main branch.

### Manual Deployment
```bash
# Build the project
bun run build

# The dist folder contains the production files
# Upload contents to your hosting provider
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue on GitHub or contact [SugarCypher](https://github.com/sugarcypher).

---

**ACE Paste Cleaner Pro** - Professional Unicode text sanitization for the modern web.