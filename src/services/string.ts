/**
 * makes all first letters capitol letters and replaces _ with space
 *
 * @param  text The string you want titlized

 */
 export function titilize(text = "") {
  return text
    .split("_")
    .join(" ")
    .split(" ")
    .map((wordToken) => {
      if (wordToken.length <= 0) {
        return "";
      }
      return (
        wordToken[0].toUpperCase() +
        wordToken.substring(1, wordToken.length)
      );
    })
    .join(" ");
}
