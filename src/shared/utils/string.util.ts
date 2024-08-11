const extractFileNameFromPhotoUrl = (url: string): string | undefined => {
    return ((url || '').split('/') || []).pop();
  };
  
  const capitalizeFirstLetter = (word: string): string => {
    if (!word) return word;
    if (word.length === 1) return word.toLocaleUpperCase();
  
    return word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();
  };
  
  export { extractFileNameFromPhotoUrl, capitalizeFirstLetter };
  