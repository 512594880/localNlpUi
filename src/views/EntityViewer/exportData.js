import _ from 'lodash';
import entityType from './entityType';

export default function(stateTags,source) {
    const tags = _.sortBy(stateTags.toJSON(), 'start');
    if(source){
        source.tags = tags;
    }
    let result = {};
    for (const tag of tags) {
        let item = {
            '时间': tag.date || ''
        };
        for (const key in entityType) {
            if (key === tag.type) {
                item[key] = '';
                item[`${key}开始位置`] = '';
                for (const k of entityType[key]) {
                    item[k] = '';
                    item[`${key}开始位置`] = '';
                }
            }
        }
        if (tag.comment) {
            item['备注'] = tag.comment;
        }
        for (const m of tag.members) {
            item[m.type] = m.text;
            item[m.type + '开始位置'] = m.start;
        }
        result[tag.type] = result[tag.type] || [];
        if (tag.exist !== undefined) {
            item['是否存在'] = tag.exist;
        }

        result[tag.type].push(item)
    }
    if(source){
      result.source = source;
    }
    return result;
}
