export function getInitials(name) {
  if (!name || typeof name !== 'string') return '';
  
  let words = name.trim().split(/[- ]/);
  // Filter out empty strings from multiple spaces
  words = words.filter((word) => word !== "");
  
  if (words.length === 0) return "";

  if (words.length >= 3) {
    return (
      words[0][0].toUpperCase() +
      words[1][0].toUpperCase() +
      words[words.length - 1][0].toUpperCase()
    );
  } else if (words.length === 2) {
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  } else if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  
  return "";
}
