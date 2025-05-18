export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
  
  return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}]`;
};

export const getFileNameWithoutExtension = (fileName: string): string => {
  return fileName.replace(/\.[^/.]+$/, "");
};

export const compareFileNames = (name1: string, name2: string): number => {
  const cleanName1 = getFileNameWithoutExtension(name1).toLowerCase();
  const cleanName2 = getFileNameWithoutExtension(name2).toLowerCase();
  
  if (cleanName1 === cleanName2) return 1;
  
  if (cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1)) {
    const minLength = Math.min(cleanName1.length, cleanName2.length);
    const maxLength = Math.max(cleanName1.length, cleanName2.length);
    return minLength / maxLength;
  }
  
  let distance = 0;
  const maxLen = Math.max(cleanName1.length, cleanName2.length);
  for (let i = 0; i < Math.min(cleanName1.length, cleanName2.length); i++) {
    if (cleanName1[i] !== cleanName2[i]) distance++;
  }
  distance += Math.abs(cleanName1.length - cleanName2.length);
  
  return 1 - (distance / maxLen);
}; 
