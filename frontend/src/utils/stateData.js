// State names, abbreviations, and populations for recall data processing

export const stateArray = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico"
];

export const initialsArray = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
  "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
  "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
  "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
  "WV", "WI", "WY", "PR"
];

export const statePopulation = [
  4779736, 710231, 6392017, 2915918, 37254523, 5029196, 3574097, 897934,
  601723, 18801310, 9687653, 1360301, 1567582, 12830632, 6483802, 3046355,
  2853118, 4339367, 4533372, 1328361, 5773552, 6547629, 9883640, 5303925,
  2967297, 5988927, 989415, 1826341, 2700551, 1316470, 8791894, 2059179,
  19378102, 9535483, 672591, 11536504, 3751351, 3831074, 12702379, 1052567,
  4625364, 814180, 6346105, 25145561, 2763885, 625741, 8001024, 6724540,
  1852994, 5686986, 563626, 3725789
];

/**
 * Parse a distribution_pattern string and count recalls per state.
 * Returns an array of counts indexed by stateArray position.
 */
export function countRecallsByState(recalls) {
  const stateRecallCount = new Array(stateArray.length).fill(0);

  for (const recall of recalls) {
    const distPattern = (recall.distribution_pattern || "").replace(/,/g, "");
    const distPatternArray = distPattern.split(" ");

    const isNationwide = distPatternArray.includes("nationwide") || distPatternArray.includes("Nationwide");

    for (let j = 0; j < stateArray.length; j++) {
      if (isNationwide || distPatternArray.includes(stateArray[j]) || distPatternArray.includes(initialsArray[j])) {
        stateRecallCount[j] += 1;
      }
    }
  }

  return stateRecallCount;
}

/**
 * Parse recall data to get states data, firm names, and firm counts.
 * Optionally include recall details per state (for Current Recalls popups).
 */
export function buildRecallData(recalls, includeDetails = false) {
  const stateRecallCount = new Array(stateArray.length).fill(0);
  const stateRecallDetails = includeDetails ? stateArray.map(() => []) : null;

  const firmMap = new Map();

  for (const recall of recalls) {
    // Count firms
    const firm = recall.recalling_firm;
    firmMap.set(firm, (firmMap.get(firm) || 0) + 1);

    // Count by state
    const distPattern = (recall.distribution_pattern || "").replace(/,/g, "");
    const distPatternArray = distPattern.split(" ");
    const isNationwide = distPatternArray.includes("nationwide") || distPatternArray.includes("Nationwide");

    for (let j = 0; j < stateArray.length; j++) {
      if (isNationwide || distPatternArray.includes(stateArray[j]) || distPatternArray.includes(initialsArray[j])) {
        stateRecallCount[j] += 1;
        if (includeDetails) {
          stateRecallDetails[j].push({
            recalling_firm: recall.recalling_firm,
            product_description: recall.product_description,
            reason_for_recall: recall.reason_for_recall,
            classification: recall.classification,
          });
        }
      }
    }
  }

  // Sort firms by count descending, take top 10
  const sorted = [...firmMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const firmName = sorted.map(([name]) => name);
  const firmCount = sorted.map(([, count]) => count);

  return {
    stateRecallCount,
    stateRecallDetails,
    firmName,
    firmCount,
  };
}

/**
 * Filter recalls by classification.
 */
export function filterByClassification(recalls, class1, class2, class3) {
  if (!class1 && !class2 && !class3) {
    return recalls;
  }

  return recalls.filter((r) => {
    if (class1 && r.classification === "Class I") return true;
    if (class2 && r.classification === "Class II") return true;
    if (class3 && r.classification === "Class III") return true;
    return false;
  });
}
