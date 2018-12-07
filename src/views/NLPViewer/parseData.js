import { List } from 'immutable';
export default function(data) {
    if(data.source){
      data = data.source;
    }
    let text = '';
    const items = data['原文位置']
    if (!items) {
        return {
            tags: List([]),
            text: ''
        };
    }
    let tags = [];

    for (const item of items) {
        text += item.word;
        const start = parseInt(item['开始位置']);
        const end = start + item.word.length;
        const type = item.nature.trim();
        if (type !== '未定义' &&
            type !== '未识别') {
            tags.push({
                start,
                end,
                type,
                text: item.word,
                tagType: '已识别'
            });
        }
    }
    tags = List( _.sortBy(tags, 'start'));

    return {
        tags,
        text,
        recordId:data.recordId,
        version:data.version

    };
}
