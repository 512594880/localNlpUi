import _ from 'lodash';
export default function(stateTags, text) {
    const tags = _.sortBy(stateTags.toJSON(), 'start');
    let result = [];
    let i = 0;
    let activeTag = tags.shift();
    let activeText = '';
    while (i < text.length) {
        if (activeTag && i === activeTag.start) {
            if (activeTag.tagType === '新增') {
                result.push({
                    nature: activeTag.type,
                    '开始位置': i,
                    word: activeTag.text
                });
            }
            i = activeTag.end;
            activeTag = tags.shift();
        } else {
            i++;
        }
    }
    return result;
}
