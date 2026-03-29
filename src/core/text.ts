// core/text.ts

export const getTextStats = (text: string) => {
  const characters = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lines = text.split(/\r\n|\r|\n/).length;
  
  // Basic byte size (UTF-8)
  const bytes = typeof Blob !== 'undefined' 
    ? new Blob([text]).size 
    : Buffer.byteLength(text, 'utf8');

  // Average reading speed ~ 225 words per minute
  const readingTimeMinutes = words / 225;

  return {
    characters,
    charactersWithoutSpaces,
    words,
    lines,
    bytes,
    readingTimeMinutes: Math.ceil(readingTimeMinutes)
  };
};

const LOREM_WORDS = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];

export const generateLoremIpsum = (paragraphs: number = 1, wordsPerParagraph: number = 50): string => {
  const result: string[] = [];
  
  for (let p = 0; p < paragraphs; p++) {
    let paragraph = [];
    for (let w = 0; w < wordsPerParagraph; w++) {
      let word = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]!;
      if (w === 0) word = word.charAt(0).toUpperCase() + word.slice(1);
      paragraph.push(word);
    }
    result.push(paragraph.join(' ') + '.');
  }
  
  return result.join('\n\n');
};
