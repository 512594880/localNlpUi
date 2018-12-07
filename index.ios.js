/**
 * Created by reason on 16/10/21.
 */

'use strict';

import React,{Component} from 'react';

import {
    Platform,
    AppRegistry,
} from 'react-native'


//关闭警告
console.disableYellowBox = true;

import EntityViewer from './src/views/EntityViewer';
import  App from  './src/App'

export default class Correction extends Component {

    constructor(props) {
        super(props);
    }

    render = () => {
        return (
            <App />
        )
    };


}



AppRegistry.registerComponent('Correction', () => Correction);

if(Platform.OS == 'web'){
    var app = document.createElement('div');
    document.body.appendChild(app);
    AppRegistry.runApplication('Correction', {
        rootTag: app
    })
}