// ENUM AND TYPE 
enum Color {
    Red = 'RED',
    Green = 'GREEN',
    Blue = 'BLUE',
  }
  
  type ColorKey = keyof typeof Color; // 'Red' | 'Green' | 'Blue'
  type ColorValue = typeof Color[ColorKey]; // 'RED' | 'GREEN' | 'BLUE'
  
  const colorKey: ColorKey = 'Red';
  const colorValue: ColorValue = Color[colorKey];