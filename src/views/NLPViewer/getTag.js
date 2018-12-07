import React from 'react';
import ColorMap from './ColorMap';
export default function(key, node, index, onClick) {
    let text = node;
    let type = '未识别';
    let tagType = '未识别';
    if (typeof node !== 'string') {
        text = node.text;
        tagType = node.tagType;
        type = node.type;
    }
    const nodeTypeEle = type === '标点符号' ?
            '' :
            <p
                style={{
                    fontSize: 10,
                    color: '#b2b6b5',
                    padding: '5px 7px 0 7px',
                    borderTop: '1px solid black',
                    borderRadius: '0 0 5px 5px',
                    background: 'white'
                }}>
                {type}
            </p>;

    const ele = <span
        id={`block-${key}-${index}`}
        ref={`block-${key}`}
        style={{
            display: 'inline-block',
            backgroundColor: type === '标点符号' ?
                        'white' :
                        ColorMap[tagType],
            fontSize: 24,
            borderRadius: 5,
            border: type === '标点符号' ? '' : '1px solid black',
            margin: '5px 5px 5px 5px',
            textAlign: 'center',
            userSelect: 'none',
            WebkitUserSelect:  'none',
            MozUserSelect:  'none'
        }}
        onClick={(e)=>{
            onClick && onClick(e,index)
        }}
        key={key}>
            <p
                style={{
                    borderBottom: type === '标点符号' ? '' : '1px solid black',
                    fontWeight: 700,
                    marginBottom: -1,
                    padding: '0 7px 0 7px',
                    userSelect: tagType === '未识别' ? 'text' : 'none',
                    WebkitUserSelect: tagType === '未识别' ? 'text' : 'none',
                    MozUserSelect: tagType === '未识别' ? 'text' : 'none',
                    cursor: tagType === '未识别' ? 'text' : 'pointer',
                }}
                id={`text-${key}-${index}`}
                ref={`text-${key}`}>
                {text.trim()}
            </p>
            {nodeTypeEle}
    </span>;
    if (node.type === '段落标题') {
        return [<br
            style={{
                textAlign: 'center',
                userSelect: 'none',
                WebkitUserSelect:  'none',
                MozUserSelect:  'none'
            }}
            key={`paragraph-${key}`}/>, ele];
    }
    return ele;
}
