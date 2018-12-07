/*** core libs ***/
import React from 'react';
import _ from 'lodash';
import {
    Spin,
    Card,
    Menu,
    Button,
    Input,
    Affix
} from 'antd';
import { autobind } from 'core-decorators';
import { List,fromJS } from 'immutable';

import Flex from '../../components/Flex';

import FileStore from '../../stores/FileStore';
import watch from '../../watch';

import ContextMenu from './ContextMenu';
import exportData from './exportData';
import parseData from './parseData';
import getSelection from './getSelection';
import getTag from './getTag';
import renderTags from './renderTags';
import ColorMap from './ColorMap';

import {ScrollView,Text, View ,TouchableHighlight} from 'react-native'
// import {appServer} from '../../../logic/Config'
// import User from '../../../logic/User'
// import Fetch from '../../../utils/Fetch'

@watch(FileStore)
export default class NLPViewer extends React.Component {

    didReceiveState() {
        const {tags, text,recordId,version} = parseData(FileStore.getState().toJSON());
        this.setState({
            showContextMenu: false,
            contextMenuX: 0,
            contextMenuY: 0,
            recordId,
            version,
            tags,
            text,
            history: [tags],
            historyIndex: 0
        });
    }

    constructor(props) {
        super(props);
        const {tags, text,recordId,version} = parseData(FileStore.getState().toJSON());
        this.state = {
            showContextMenu: false,
            contextMenuX: 0,
            recordId,
            contextMenuY: 0,
            tags,
            text,
            version,
            history: [tags],
            historyIndex: 0
        };

        this.contextMenuListener = (e) => {
            if (e.target.id !== 'context-menu') {
                document.removeEventListener('click', this.contextMenuListener);
                this.setState({
                    showContextMenu: false
                });
            }
        }
    }

    @autobind
    contextMenuHandler(e) {
        e.preventDefault();
        const {start, end, tags} = getSelection(this);
        console.info("info", this.state.text.substr(start, end - start));
        if (start === 0 &&
            end === 0) {
            return;
        }

        const contextMenuX = e.pageX;
        const contextMenuY = e.pageY - 100;

        this.setState({
            showContextMenu: true,
            tagType: '未识别',
            contextMenuX,
            contextMenuY,
            start,
            end
        });
        document.addEventListener('click', this.contextMenuListener);
    }

    @autobind
    onTagClick(e,index) {
       const contextMenuX = e.pageX - 10;
       const contextMenuY = e.pageY - 100;
       const tagIndex = e.target.id.match(/text-[0-9]+-([0-9]+)/)[1];
        console.log(tagIndex,index)
       this.setState({
           showContextMenu: true,
           tagType: '已识别',
           contextMenuX,
           contextMenuY,
           tagIndex
       });
       document.addEventListener('click', this.contextMenuListener);
    }



    putError(error_type,sentence,extend){
        // extend = extend || {};
        // var version = this.state.version || "v1.0.0"
        // var data = {...extend,et:"分词错误",username:User.currentUser.username,name:User.currentUser.name,sentence,version,error_type,recordId:this.state.recordId};
        // Fetch.post(appServer+"/insight/correction/insertCorrection",data,(res)=>{
        //     console.log(res)
        // })
        // console.log(data)
    }

    @autobind
    onMenuClick(e) {
        const keyMatch = e.key.match(/group-\d+-(.+)/);
        const {
            start,
            end,
            text,
            tagType,
            tagIndex
        } = this.state;
        let {
            tags,
            historyIndex,
            history
        } = this.state;
        // tags = tags.sort((a, b) => a.start - b.start)
        history = history.slice(0, historyIndex + 1);
        if (keyMatch) {  // picked key type
            const type = keyMatch[1];
            if (tagType === '未识别') { // new tag
                tags = tags.push({
                    start: start,
                    end: end,
                    type,
                    tagType: '新增',
                    text: text.substr(start, end - start)
                });
                tags = List(_.sortBy(tags.toJSON(),"start"));
                console.log(start,end,text.substr(start, end - start))
                this.putError(type,text.substr(start, end - start),{fromType:tagType,toType:type})
            } else {
                let tag = {...(tags.get(tagIndex))};
                var fromType = tag.type;
                tag.type = type;
                tag.tagType = '新增';
                this.putError(type,tag.text,{fromType,toType:type})
                tags = tags.set(tagIndex, tag);
            }
        } else { // untag
            tags = tags.remove(tagIndex);
        }
        // console.info("info", text.substr(start, end - start),text,start,end);
        // console.log(fromJS(tags).toJSON())
        history.push(tags);
        historyIndex++;

        this.setState({
            tags,
            history,
            historyIndex
        });
    }

    render() {
        const tags = renderTags(this.state, this.onTagClick);
        let colors = [];
        let i = 0;
        for (const key in ColorMap) {
            colors.push(<div
                key={i}
                style={{
                    width: 100,
                    textAlign: 'center',
                    letterSpacing: 2,
                    margin: '5px 0 5px 0',
                    backgroundColor: ColorMap[key],
                    padding: '5px 10px 5px 10px',
                    borderRadius: 2
                }}>{key}</div>);
            i++;
        }

        let {historyIndex, history} = this.state;
        const historyLength = history.length;

        return (

            <Flex
                style={{
                    margin: 10,
                    background: '#fff',
                    borderRadius: 10,
                    padding: 5
                }}
                direction='column'>
                <Affix>
                    <Flex
                        style={{
                            padding: '10px 0 0 0',
                            background: 'white'
                        }}>

                        <Flex
                            direction='column'
                            align='flex-end'>
                            {colors}
                        </Flex>
                    </Flex>
                </Affix>
                <ScrollView>
                <div
                    ref='content'
                    style={{
                        marginBottom: 200
                    }}
                    onContextMenu={this.contextMenuHandler}>
                    {tags}
                </div>
                    <div style={{height:200}}/>
                </ScrollView>
                {/*<div*/}
                    {/*onClick={e => {*/}
                        {/*document.removeEventListener('click', this.contextMenuListener);*/}
                        {/*this.setState({ showContextMenu: false });*/}
                    {/*}}*/}
                    {/*id='context-menu'*/}
                    {/*style={{*/}
                        {/*zIndex: 999,*/}
                        {/*visibility: this.state.showContextMenu ? 'visible' : 'hidden',*/}
                        {/*width: 200,*/}
                        {/*position: 'absolute',*/}
                        {/*top: this.state.contextMenuY,*/}
                        {/*top: 100,*/}
                        {/*left: Math.min(this.state.contextMenuX, screen.width - 600)*/}
                    {/*}}>*/}
                    {/*<ContextMenu*/}
                        {/*onClick={this.onMenuClick}*/}
                        {/*tagType={this.state.tagType}/>*/}
                {/*</div>*/}
            </Flex>

        );
    }
}
