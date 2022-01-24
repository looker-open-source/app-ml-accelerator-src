/**
 * Removes all exact matches of sourceArray[i] === toMatch from the array.
 *
 * @param {[*]} sourceArray The array to search through
 * @param {*} toMatch A single object to test === equivalency against
 * @returns {[*]} A shallow copy of the original array with all exact matches removed
 */
 export function removeExactMatches(sourceArray: any[], toMatch: any, useKey = false) {
  if (useKey) {
      return sourceArray.filter(
          (item) => item.key !== toMatch.key || item === toMatch
      );
  }
  return sourceArray.filter((item) => item !== toMatch);
}

/**
* If toMatch is present in sourceArray it will remove it. If toMatch is not present it will add it.
*
* @param {[*]} sourceArray The array to search through
* @param {*} toMatch A single object to test === equivalency against
* @returns {[*]} A shallow copy of the original array with items removed or one item added
*/
export function toggleArrayEntry(sourceArray: any[], toMatch: any, useKey = false) {
  if (sourceArray.includes(toMatch)) {
      return removeExactMatches(sourceArray, toMatch, useKey);
  } else {
      return [...sourceArray, toMatch];
  }
}
