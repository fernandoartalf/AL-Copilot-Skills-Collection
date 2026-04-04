export let language = ["en", "zh"];
export let removeDefaultStopWordFilter = [];
export const searchIndexUrl = "search-index{dir}.json?_=abc";
export const searchResultLimits = 8;
export let fuzzyMatchingDistance = 0;
export function __setLanguage(value) {
    language = value;
}
export function __setRemoveDefaultStopWordFilter(value) {
    removeDefaultStopWordFilter = value;
}
export function __setFuzzyMatchingDistance(value) {
    fuzzyMatchingDistance = value;
}
