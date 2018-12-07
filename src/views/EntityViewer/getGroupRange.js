
function getTagId(tags,startIndex){
  for (const tag of tags) {
      if(tag.start >= startIndex && tag.end > startIndex){
        return tag.tagId;
      }
  }
  return null;
}

export default function(tags, type, text) {
    let activeIndexes = [];
    for (const tag of tags) {
        activeIndexes = activeIndexes.concat(_.range(tag.start, tag.end + 1));
    }

    activeIndexes = _.sortedUniq(_.sortBy(activeIndexes));

    let activeRanges = [];
    let currentRange = {
        start: activeIndexes[0],
        end: activeIndexes[0],
        type
    };
    let lastIndex = activeIndexes[0];
    activeIndexes.shift();

    let count = 0;

    for (const index of activeIndexes) {
        if (index === lastIndex + 1) {
            lastIndex = index;
            currentRange.end = index;
        } else {
            currentRange.end++;
            currentRange.text = text.substr(
                            currentRange.start,
                            currentRange.end - currentRange.start);
            currentRange.tagId = getTagId(tags,currentRange.start);
            activeRanges.push(currentRange);
            lastIndex = index;
            currentRange = {
                start: index,
                end: index,
                type
            };
        }
    }
    currentRange.end++;
    currentRange.text = text.substr(
                    currentRange.start,
                    currentRange.end - currentRange.start);
    currentRange.tagId = getTagId(tags,currentRange.start);
    activeRanges.push(currentRange);
    return activeRanges;
};
