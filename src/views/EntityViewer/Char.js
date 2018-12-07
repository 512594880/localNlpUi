import React from 'react';
import ColorMap from './ColorMap';

import { AppRegistry, Image, StyleSheet, Text, View,SegmentedControlIOS } from 'react-web'
export default class Char extends React.Component {

    render() {
        const {
            char,
            types,
            index,
            active,
            paragraphTitle,
            debug,
            hieght
        } = this.props;
        let style = {
            display: 'inline-block',
            fontSize: 16,
            margin: '5px 0',
            padding: '2px 5px',
            textAlign: 'center',
        };
        let color = 'black';
        if (types.length > 0) {
            let background = '-webkit-linear-gradient(top,';
            const step = parseInt(100 / types.length);
            let arr = [];
            let i = 0;
            for (const type of types) {
                const color = ColorMap[type];
                arr.push(`${color} ${i * step}%, ${color} ${(i + 1) * step}%`);
                i++;
            }
            background += arr.join(',') + ')';
            style.background = background;
            style.color = 'white';
        }

        if (paragraphTitle) {
            style.color = 'black';
            style.textShadow = '0 0 5px #ccc';
            style.fontWeight = 700;
        }

        if (active) {
            style.background = 'rgb(175, 175, 175)';
            style.textShadow = '0 0 5px black';
            style.color = 'white';
        }

        if(hieght){
            style.background = 'rgb(255, 0, 0)';
            style.color = 'white';
        }
        let d = '';
        if (debug) {
            d = <span
                style={{
                    background: 'black',
                    color: 'white',
                    display: 'block',
                    fontSize: 10,
                    textShadow: '',
                    textAlign: 'center',
                    marginTop: 10,
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                }}>
                {index}
            </span>;
        }
        return <span
            ref={(com)=>{
                this.props.addRef && this.props.addRef(com,index);
            }}
            onClick={()=>{
                this.props.onClick && this.props.onClick(index);
            }}
            id={`char-${index}`}
            style={style}>
            {char}
            {d}
        </span>
    }
}
