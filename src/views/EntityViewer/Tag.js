import React from 'react';
import ColorMap from './ColorMap';
import Mapping from './Mapping';

import {Text} from '../../RN'

export default class Tag extends React.Component {

    render() {
        const key = this.props.id;
        const node = this.props.node;
        const activeCharList = this.props.activeCharList;
        const text = this.props.text;
        const textTypes = this.props.textTypes;

        //let text = node;
        let type = '未识别';
        let selectable = '';

        if (typeof node !== 'string') {
            //text = node.text;
            type = node.type;
            //selectable = 'none';
        }

        const flag = Mapping.indexOf(text) !== -1;

        let debug = this.props.debug;


        let result = text.split('').map((char ,i) => {
            let padding = '';
            let borderRadius = '';
            let margin = '';
            // if (i == 0) {
            //     padding = '0 0 0 3px',
            //     margin = ' 0 0 0 2px',
            //     borderRadius = '2px 0 2px 0';
            // } else if (i === text.length - 1) {
            //     padding = '0 3px 0 0 ';
            //     margin = '0 2px 0 0',
            //     borderRadius = '0 2px 0 2px';
            // }
            padding = '0 5px 0 5px'
            return <span
            key={'char-' + (key + i)}
            id={'char-' + (key + i)}
            style={{
                fontSize: 16,
                display: 'inline-block',
                margin: '5px 0 5px 0',
                fontWeight: ~textTypes.indexOf(key + i) ? 700 : null,
                textShadow: ~textTypes.indexOf(key + i) ? '0px 0px 5px #ccc' : '',
                padding,
                userSelect: selectable,
                WebkitUserSelect: selectable,
                MozUserSelect: selectable,
                borderRadius,
                color: ~textTypes.indexOf(key + i) ?
                    'black' :
                        type === '未识别' ? 'black' : 'white',
                background: activeCharList.indexOf(key + i) != -1 ?
                        'darkgrey' : ColorMap[type],
            }}>
                {char}
                {debug ?
                    <p
                        style={{
                            fontSize: 12,
                            background: 'rgb(32, 29, 29)',
                            color: '#fff',
                            margin: '0 1px 0 1px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none'
                        }}>
                        {(key + i)}
                    </p>
                : ''}
            </span>})
        if (flag) {
            result.unshift(<br key={'crlf-' + key + text.length}/>);
        }
        return (
          <Text onPress={()=>{
            if(this.props.onPress && this.props.tagId){
              this.props.onPress(this.props.tagId);
            }
          }}
              key={'tag-' + key}>
              {result}
          </Text>
        )
    }
}
