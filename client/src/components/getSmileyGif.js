const getSmileyGif = (rank) => {
    if (!rank) return "/smileyGifs/512-5.gif"; // Default neutral
  
    if (rank === 1) {
      return "/smileyGifs/512-2.gif"; // Happy
    } else if (rank <= 3) {
      return "/smileyGifs/512-4.gif"; // Content
    } else if (rank <= 10) {
      return "/smileyGifs/512-3.gif"; // Neutral
    } else {
      return "/smileyGifs/512.gif"; // Sad
    }
  };
  
export default getSmileyGif;
  