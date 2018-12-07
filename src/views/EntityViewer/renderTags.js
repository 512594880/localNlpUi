import _ from 'lodash';
import Char from './Char';
import React from 'react';

let cachedRenderedChars = [];

export default function (highlightRange,tags, text, activeEntityTag, activeEntities, cache, debug, textTypes,onClick,addRef) {
    if (cache) return cachedRenderedChars;
    let chars = text.split('').map(char => ({
        char,
        types: [],
        paragraphTitle: false,
        active: false,
    }));

    // console.log(activeEntities)
    tags = _.sortBy(tags, 'start');
    for (const tag of tags) {
        if (!activeEntityTag[tag.type]) {
            continue;
        }
        for (const member of tag.members) {
            for (let i = member.start; i <= member.end; i++) {
                chars[i].types.push(tag.type);
            }
        }
    }

    for (const index of (textTypes || [])) {
        chars[index].paragraphTitle = true;
    }

    for (const tag of activeEntities) {
        chars[tag].active = true;
    }
    cachedRenderedChars = chars.map((ch, i) =>{
        var hieght = _.indexOf(highlightRange,i)>=0;
          return <Char
            {...ch}
            onClick={onClick}
            addRef={addRef}
            hieght = {hieght}
            debug={debug}
            index={i}
            key={i}/>
    });
    return cachedRenderedChars;

}
