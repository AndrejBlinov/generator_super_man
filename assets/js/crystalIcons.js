// SVG-иконки для кристаллов уровней 1-10

export function getCrystalIcon(level) {
    const icons = {
        1: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#e0f7fa;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#80deea;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,8 44,24 32,56 20,24" fill="url(#crystal1)" stroke="#00acc1" stroke-width="2"/>
            <polygon points="32,8 38,24 32,56 26,24" fill="#b2ebf2" opacity="0.6"/>
            <line x1="26" y1="24" x2="38" y2="24" stroke="#00acc1" stroke-width="1.5" opacity="0.5"/>
        </svg>`,
        
        2: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#b3e5fc;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#4fc3f7;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,6 46,22 38,32 46,42 32,58 18,42 26,32 18,22" fill="url(#crystal2)" stroke="#0288d1" stroke-width="2"/>
            <polygon points="32,6 39,22 32,58 25,22" fill="#81d4fa" opacity="0.5"/>
            <line x1="25" y1="22" x2="39" y2="22" stroke="#0288d1" stroke-width="1.5" opacity="0.4"/>
            <line x1="25" y1="42" x2="39" y2="42" stroke="#0288d1" stroke-width="1.5" opacity="0.4"/>
        </svg>`,
        
        3: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#c8e6c9;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#66bb6a;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,4 48,20 42,32 48,44 32,60 16,44 22,32 16,20" fill="url(#crystal3)" stroke="#388e3c" stroke-width="2"/>
            <polygon points="32,4 40,20 32,60 24,20" fill="#a5d6a7" opacity="0.5"/>
            <line x1="22" y1="20" x2="42" y2="20" stroke="#388e3c" stroke-width="1.5" opacity="0.4"/>
            <line x1="22" y1="44" x2="42" y2="44" stroke="#388e3c" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="4" fill="#fff" opacity="0.6"/>
        </svg>`,
        
        4: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#fff9c4;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#fdd835;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,2 50,18 44,32 50,46 32,62 14,46 20,32 14,18" fill="url(#crystal4)" stroke="#f9a825" stroke-width="2"/>
            <polygon points="32,2 41,18 32,62 23,18" fill="#fff59d" opacity="0.5"/>
            <line x1="20" y1="18" x2="44" y2="18" stroke="#f9a825" stroke-width="1.5" opacity="0.4"/>
            <line x1="20" y1="46" x2="44" y2="46" stroke="#f9a825" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="5" fill="#fff" opacity="0.7"/>
            <circle cx="32" cy="32" r="2" fill="#ffeb3b"/>
        </svg>`,
        
        5: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal5" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffe0b2;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,2 52,16 46,32 52,48 32,62 12,48 18,32 12,16" fill="url(#crystal5)" stroke="#ef6c00" stroke-width="2"/>
            <polygon points="32,2 42,16 32,62 22,16" fill="#ffcc80" opacity="0.5"/>
            <line x1="18" y1="16" x2="46" y2="16" stroke="#ef6c00" stroke-width="1.5" opacity="0.4"/>
            <line x1="18" y1="48" x2="46" y2="48" stroke="#ef6c00" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="6" fill="#fff" opacity="0.7"/>
            <circle cx="32" cy="32" r="3" fill="#ffb74d"/>
            <polygon points="32,10 36,20 32,30 28,20" fill="#fff" opacity="0.4"/>
        </svg>`,
        
        6: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal6" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f8bbd0;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ec407a;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,2 54,14 48,32 54,50 32,62 10,50 16,32 10,14" fill="url(#crystal6)" stroke="#c2185b" stroke-width="2"/>
            <polygon points="32,2 43,14 32,62 21,14" fill="#f48fb1" opacity="0.5"/>
            <line x1="16" y1="14" x2="48" y2="14" stroke="#c2185b" stroke-width="1.5" opacity="0.4"/>
            <line x1="16" y1="50" x2="48" y2="50" stroke="#c2185b" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="7" fill="#fff" opacity="0.7"/>
            <circle cx="32" cy="32" r="4" fill="#f06292"/>
            <polygon points="32,8 37,20 32,32 27,20" fill="#fff" opacity="0.4"/>
            <circle cx="28" cy="28" r="2" fill="#fff" opacity="0.6"/>
        </svg>`,
        
        7: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal7" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#e1bee7;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ab47bc;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,2 56,12 50,32 56,52 32,62 8,52 14,32 8,12" fill="url(#crystal7)" stroke="#8e24aa" stroke-width="2"/>
            <polygon points="32,2 44,12 32,62 20,12" fill="#ce93d8" opacity="0.5"/>
            <line x1="14" y1="12" x2="50" y2="12" stroke="#8e24aa" stroke-width="1.5" opacity="0.4"/>
            <line x1="14" y1="52" x2="50" y2="52" stroke="#8e24aa" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="8" fill="#fff" opacity="0.7"/>
            <circle cx="32" cy="32" r="5" fill="#ba68c8"/>
            <polygon points="32,6 38,18 32,30 26,18" fill="#fff" opacity="0.4"/>
            <circle cx="26" cy="26" r="2.5" fill="#fff" opacity="0.6"/>
            <circle cx="38" cy="26" r="2.5" fill="#fff" opacity="0.6"/>
        </svg>`,
        
        8: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal8" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#b39ddb;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#7e57c2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,2 58,10 52,32 58,54 32,62 6,54 12,32 6,10" fill="url(#crystal8)" stroke="#5e35b1" stroke-width="2"/>
            <polygon points="32,2 45,10 32,62 19,10" fill="#9575cd" opacity="0.5"/>
            <line x1="12" y1="10" x2="52" y2="10" stroke="#5e35b1" stroke-width="1.5" opacity="0.4"/>
            <line x1="12" y1="54" x2="52" y2="54" stroke="#5e35b1" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="9" fill="#fff" opacity="0.7"/>
            <circle cx="32" cy="32" r="6" fill="#9575cd"/>
            <polygon points="32,4 39,16 32,28 25,16" fill="#fff" opacity="0.4"/>
            <circle cx="24" cy="24" r="3" fill="#fff" opacity="0.6"/>
            <circle cx="40" cy="24" r="3" fill="#fff" opacity="0.6"/>
            <circle cx="32" cy="20" r="2" fill="#fff" opacity="0.8"/>
        </svg>`,
        
        9: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal9" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#90caf9;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#42a5f5;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1e88e5;stop-opacity:1" />
                </linearGradient>
            </defs>
            <polygon points="32,2 60,8 54,32 60,56 32,62 4,56 10,32 4,8" fill="url(#crystal9)" stroke="#1565c0" stroke-width="2"/>
            <polygon points="32,2 46,8 32,62 18,8" fill="#64b5f6" opacity="0.5"/>
            <line x1="10" y1="8" x2="54" y2="8" stroke="#1565c0" stroke-width="1.5" opacity="0.4"/>
            <line x1="10" y1="56" x2="54" y2="56" stroke="#1565c0" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="10" fill="#fff" opacity="0.7"/>
            <circle cx="32" cy="32" r="7" fill="#42a5f5"/>
            <polygon points="32,4 40,14 32,26 24,14" fill="#fff" opacity="0.4"/>
            <circle cx="22" cy="22" r="3.5" fill="#fff" opacity="0.6"/>
            <circle cx="42" cy="22" r="3.5" fill="#fff" opacity="0.6"/>
            <circle cx="32" cy="18" r="2.5" fill="#fff" opacity="0.8"/>
            <circle cx="32" cy="42" r="2" fill="#fff" opacity="0.6"/>
        </svg>`,
        
        10: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="crystal10" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffd54f;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#ffb300;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ff8f00;stop-opacity:1" />
                </linearGradient>
                <radialGradient id="glow10" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style="stop-color:#fff59d;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#ffd54f;stop-opacity:0" />
                </radialGradient>
            </defs>
            <circle cx="32" cy="32" r="28" fill="url(#glow10)"/>
            <polygon points="32,2 62,6 56,32 62,58 32,62 2,58 8,32 2,6" fill="url(#crystal10)" stroke="#e65100" stroke-width="2"/>
            <polygon points="32,2 47,6 32,62 17,6" fill="#ffca28" opacity="0.5"/>
            <line x1="8" y1="6" x2="56" y2="6" stroke="#e65100" stroke-width="1.5" opacity="0.4"/>
            <line x1="8" y1="58" x2="56" y2="58" stroke="#e65100" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="11" fill="#fff" opacity="0.8"/>
            <circle cx="32" cy="32" r="8" fill="#ffb300"/>
            <polygon points="32,4 41,12 32,24 23,12" fill="#fff" opacity="0.5"/>
            <circle cx="20" cy="20" r="4" fill="#fff" opacity="0.7"/>
            <circle cx="44" cy="20" r="4" fill="#fff" opacity="0.7"/>
            <circle cx="32" cy="16" r="3" fill="#fff" opacity="0.9"/>
            <circle cx="32" cy="44" r="2.5" fill="#fff" opacity="0.7"/>
            <circle cx="18" cy="32" r="2" fill="#fff" opacity="0.6"/>
            <circle cx="46" cy="32" r="2" fill="#fff" opacity="0.6"/>
            <polygon points="32,10 36,18 32,26 28,18" fill="#fff59d" opacity="0.8"/>
        </svg>`
    };
    
    return icons[level] || icons[1];
}