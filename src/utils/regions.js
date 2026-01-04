// Mapping of CHMI region codes to full names
const REGION_NAMES = {
    'A': 'Hlavní město Praha',
    'S': 'Středočeský kraj',
    'C': 'Jihočeský kraj',
    'P': 'Plzeňský kraj',
    'K': 'Karlovarský kraj',
    'U': 'Ústecký kraj',
    'L': 'Liberecký kraj',
    'H': 'Královéhradecký kraj',
    'E': 'Pardubický kraj',
    'M': 'Olomoucký kraj',
    'T': 'Moravskoslezský kraj',
    'B': 'Jihomoravský kraj',
    'Z': 'Zlínský kraj',
    'J': 'Kraj Vysočina'
};

export const getRegionName = (code) => {
    return REGION_NAMES[code] || code;
};
