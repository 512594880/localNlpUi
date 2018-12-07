import getTag from './getTag';
export default function(state, onTagClick) {
    let content = [];
    const {
        text,
        history,
        historyIndex
    } = state;

    const tags = _.sortBy(history[historyIndex].toJSON(), 'start');

    let i = 0;
    let key = 0;
    let activeTag = tags.shift();
    let activeText = '';
    let tagIndex = 0;
    while (i < text.length) {
        if (activeTag && i === activeTag.start) {
            if (activeText != '') {
                content.push(getTag(
                    i-activeText.length,
                    activeText));
                activeText = '';
                key++;
            }
            content.push(getTag(i-activeText.length, activeTag, tagIndex, onTagClick));
            i = activeTag.end;
            key++;
            tagIndex++;
            activeTag = tags.shift();
        } else {
            activeText += text[i];
            i++;
        }
    }
    if (activeText != '') {
        content.push(getTag(i, activeText));
    }
    return content;
}
