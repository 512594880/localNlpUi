/*** core libs ***/
import React from 'react';
import _ from 'lodash';
import {
    Spin,
    Card,
    Menu,
    Button,
    Checkbox,
    Input,
    Modal,
    Affix
} from 'antd';
import { autobind } from 'core-decorators';
import { List, fromJS } from 'immutable';
import Measure from './Measure'
import ReactDOM from 'react-dom';
import Flex from '../../components/Flex';

import FileStore from '../../stores/FileStore';
import watch from '../../watch';

import ContextMenu from './ContextMenu';
import parseData from './parseData';
import getSelection from './getSelection';
import renderTags from './renderTags';
import ColorMap from './ColorMap';
import Entity from './Entity';
import validateProperty from './validateProperty';
import {existAttribute} from './entityType';


import Fetch from '../../../utils/Fetch'
import {ScrollView,Text, View ,TouchableHighlight} from 'react-native'
import {appServer} from '../../../web/Config'
let entityCache;


@watch(FileStore)
export default class EntityViewer extends React.Component {

    didReceiveState() {
        var source = FileStore.getState().toJSON();
        const {tags, text, textTypes,recordId,version,highlightRange} =  parseData(source);
        var ind = highlightRange[0]
        if(ind > 0){
            setTimeout(()=>{
                this.onTagFocus(ind);
                this.TagScroll(ind)
            },10)
        }
        this.setState({
            source:FileStore.getState().toJSON(),
            showContextMenu: false,
            contextMenuX: 0,
            contextMenuY: 0,
            tags,
            version,
            mds_version:version,
            text,
            recordId,
            highlightRange,
            textTypes,
            history: [tags],
            historyIndex: 0,
            activeCharList: [],
            floatingTag: {
                visible: false,
                text: '',
                entityType: '',
                type: '',
                x: 0,
                y: 0
            }
        });
    }

    caculateType(type,activeEntityTag){
        if(!type) return;
        if(type=="全部"){
            Object.keys(activeEntityTag).forEach((key)=>{
                activeEntityTag[key] =  true;
            })
        }else {
            Object.keys(activeEntityTag).forEach((key)=>{
                if(key == type){
                    activeEntityTag[key] =  true;
                }else {
                    activeEntityTag[key] =  false;
                }
            })
            if(type == "症状&体征"){
                activeEntityTag["症状"] =  true;
                activeEntityTag["症状变化"] =  true;
                activeEntityTag["程度描述"] =  true;
                activeEntityTag["功能描述"] =  true;
            }
        }
    }

    componentWillReceiveProps(props){
        var activeEntityTag = this.state.activeEntityTag;
        this.caculateType(props.type,activeEntityTag);
        var st = {activeEntityTag};
        if(props.type ){
            if(props.type=="全部") st.checked = true;
            else st.checked = false;
        }
        this.setState(st)
    }

    constructor(props) {
        super(props);
        const {tags, text,textTypes,recordId,version,highlightRange} = parseData(FileStore.getState().toJSON());

        global.printTags = () => {
            console.info(this.state.history[this.state.historyIndex].toJSON());
            console.info(this.state.activeCharList);
        };

        global.debug = (val) => {
            this.setState({
                debug: !!val
            });
        };
        var ind = highlightRange[0]
        if(ind > 0){
            setTimeout(()=>{
                this.onTagFocus(ind);
                this.TagScroll(ind);
            },10)
        }
        var checked = false;
        if(props.type && props.type == "全部"){
            checked = true;
        }
        this.state = {
            checked,
            source:{},
            showContextMenu: false,
            contextMenuX: 0,
            contextMenuY: 0,
            textTypes,
            tags,
            text,
            highlightRange,
            version,
            mds_version:version,
            recordId,
            history: [tags],
            historyIndex: 0,
            activeCharList: [],
            floatingTag: {
                visible: false,
                text: '',
                entityType: '',
                type: '',
                x: 0,
                y: 0
            },
            debug: false
        };
        let activeEntityTag = {};
        for (const key in ColorMap) {
            activeEntityTag[key] = true;
        }
        this.caculateType(props.type,activeEntityTag)
        this.state.activeEntityTag = activeEntityTag;

        this.contextMenuListener = (e) => {
            if (e.target.id !== 'context-menu') {
                document.removeEventListener('click', this.contextMenuListener);
                this.setState({
                    showContextMenu: false,
                    __cache: true
                });
            }
        }
    }



    @autobind
    contextMenuHandler(e) {
        e.preventDefault();
        const {start, end} = getSelection(this);
        if (start === 0 &&
            end === 0) {
            return;
        }



        const contextMenuX = e.pageX + 10;
        const contextMenuY = e.pageY;

        const x = e.pageX;
        const y = e.pageY;

        if (start === 0 &&
            end === 0) {
            return;
        }


        const text = this.state.text.substr(start, end - start + 1);

        console.info('[SELECTION]', `${start}, ${end}, ${text}`);

        this.setState({
            showContextMenu: false,
            contextMenuX,
            contextMenuY,
            start,
            end,
            __cache: true,
            floatingTag: {
                visible: false,
                text,
                x,
                y
            }
        });
        document.addEventListener('click', this.contextMenuListener);
    }


    @autobind
    removeFloatingTag(e) {
        e && e.preventDefault && e.preventDefault();
        document.removeEventListener('contextmenu', this.removeFloatingTag);
        document.removeEventListener('mousemove', this.moveFloatingTag);
        let {
            floatingTag
        } = this.state;
        floatingTag.visible = false;
        this.setState({
            floatingTag,
            __cache: true
         });
    }

    @autobind
    moveFloatingTag(e) {
        let {
            floatingTag
        } = this.state;
        floatingTag.x = e.pageX;
        floatingTag.y = e.pageY;
        this.setState({
            floatingTag,
            __cache: true
        });
    }

    @autobind
    onMenuClick(e) {
        const key = e.key;
        const match = key.match(/(.+)\-(.+)/);
        if (match) { // 创建标签
            let {
                floatingTag
            } = this.state;
            floatingTag.visible = true;
            floatingTag.entityType = match[1];
            floatingTag.type = match[2];
            this.setState({
                floatingTag,
                __cache: true
            });

            console.info('NEW-ENTITY', `${floatingTag.type},${floatingTag.entityType}`);

            document.addEventListener('mousemove', this.moveFloatingTag)
            document.addEventListener('contextmenu', this.removeFloatingTag);

        } else { //创建实体
            const {
                start,
                end,
                floatingTag
            } = this.state;



            const type = key;
            const exist = existAttribute.indexOf(type) !== -1 ? '无': undefined;

            console.info('[ATTRIBUTE]', `${type}`,floatingTag.text);

            this.putError(type,floatingTag.text);
        }
    }

    toggleEntityTag(key) {
        return e => {
            console.info(`[TOGGLE-COLOR], ${key}`);
            let activeEntityTag = this.state.activeEntityTag;
            activeEntityTag[key] = !activeEntityTag[key];
            this.setState({
                activeEntityTag,
                __cache: false
            });
        }
    }

    deleteEntityProperty(key, type) {
        let {
            history,
            historyIndex
        }  = this.state;

        console.info('[DELETE-ENTITY]', `${key}, ${type}`);

        let tag = history[historyIndex]
                .get(key)

        let members = tag
                .get('members')

        members = members.remove(_.findIndex(members.toJSON(), {
            type
        }));

        tag = tag.set('members', members).toJSON();

        tag.start = 99999;
        tag.end = 0;

        for (const m of tag.members) {
            tag.start = Math.min(tag.start, m.start);
            tag.end = Math.max(tag.start, m.end);
        }


        const tags = history[historyIndex]
            .set(key, fromJS(tag));

        history = history.slice(0, historyIndex + 1);
        historyIndex++;
        history.push(tags);
        this.setState({
            history,
            historyIndex,
            activeCharList: [],
            __cache: false
        });
    }

    onChangeEntityDate(key, value) {
        let {
            history,
            historyIndex
        }  = this.state;
        console.info('[DATE]', `${key}, ${value}`);
        let tag = history[historyIndex]
                .get(key)
                .toJSON();
        tag.date = value;
        const tags = history[historyIndex]
            .set(key, fromJS(tag));
        history[historyIndex] = tags;
        this.setState({
            history,
            __cache: true
        });
    }

    onChangeEntityComment(key, value) {
        let {
            history,
            historyIndex
        }  = this.state;
        console.info('[COMMENT]', `${key}, ${value}`);
        let tag = history[historyIndex]
                .get(key)
                .toJSON();
        tag.comment = value;
        const tags = history[historyIndex]
            .set(key, fromJS(tag));
        history[historyIndex] = tags;
        this.setState({
            history,
            __cache: true
        });
    }

    onToggleEntityExist(key, value) {
        let {
            history,
            historyIndex
        }  = this.state;
        let tag = history[historyIndex]
                .get(key)
                .toJSON();
        tag.exist = value;
        const tags = history[historyIndex]
            .set(key, fromJS(tag));
        history[historyIndex] = tags;
        this.setState({
            history,
            __cache: true
        });
    }

    deleteEntity(key) {
        return e => {
            e.stopPropagation();
            let {
                history,
                historyIndex
            }  = this.state;

            console.info('[DELETE_ENTITY]', `${key}`);

            const tags = history[historyIndex]
                        .remove(key)
                        .sort((a, b) => a.get('start') - b.get('start'));
            history = history.slice(0, historyIndex + 1);
            historyIndex++;
            history.push(tags);
            this.setState({
                history,
                historyIndex,
                activeCharList: [],
                __cache: false
            });
            return false;
        }
    }

    addEntityProperty(key) {
        return e => {
            const {
                floatingTag,
                start,
                end
            } = this.state;
            let {
                historyIndex,
                history
            } = this.state;
            if (!floatingTag.visible) {
                return true;
            }

            console.info('[ADD_ATTRIBUTE]', `${key},${floatingTag.text},${floatingTag.type}`);

            const tags = history[historyIndex];
            const tag = tags.get(key).toJSON();
            floatingTag.visible = false;

            if (!_.find(tag.members, {type: floatingTag.type})) {

                tag.members.push({
                    start,
                    end,
                    text: floatingTag.text,
                    type: floatingTag.type
                });
                for (const m of tag.members) {
                    tag.start = Math.min(tag.start, m.start);
                    tag.end = Math.max(tag.end, m.end);
                }


                if (validateProperty(tag.type, tag.members)) {
                    history = history.slice(0, historyIndex + 1);
                    historyIndex++;
                    history.push(tags.set(key, fromJS(tag)));
                }
            }


            this.setState({
                history,
                historyIndex,
                activeCharList: [],
                __cache: false
            }, () => {
                this.removeFloatingTag();
            });
            return false;
        }
    }

    setActiveList(list, flag) {
        console.info('[TOGGLE]', `${list}`);

        let activeCharList = this.state.activeCharList;
        if (flag) {
            activeCharList = _.uniq(activeCharList.concat(list));
        } else {
            activeCharList = activeCharList.filter(v => list.indexOf(v) == -1);
        }
        this.setState({
            activeCharList,
            __cache: false
        });
    }

    onEntityFocus(focusView,tag){
        if(this.entityView && focusView !== this.entityView){
            this.entityView.unFocus();
        }
        this.entityView = focusView;
        var _tagView = this.refs["tag_"+tag.start];
        if(_tagView){
            Measure(this.refs._tagScrollView.refs.ScrollView,(sx,xy,sw,sh,spx,spy)=>{
                Measure(_tagView,(x,y,w,h,px,py)=>{
                    var offsetY = this.tagScrollViewOffsetY||0;
                    this.refs._tagScrollView.scrollTo(py-spy+offsetY-10,0);
                })
            })
        }
    }


    TagScroll(charIndex){
        var _tagView = this.refs["tag_"+charIndex];
        if(_tagView){
            Measure(this.refs._tagScrollView.refs.ScrollView,(sx,xy,sw,sh,spx,spy)=>{
                Measure(_tagView,(x,y,w,h,px,py)=>{
                    var offsetY = this.tagScrollViewOffsetY||0;
                    this.refs._tagScrollView.scrollTo(py-spy+offsetY-10,0);
                })
            })
        }
    }

    onTagFocus(charIndex){
        if(this.tags){
            for(var index in this.tags){
                var tag = this.tags[index];
                var range = _.range(tag.start,tag.end+1);
                if(_.indexOf(range,charIndex) >= 0){
                    if(this.refs["entity_"+tag.start]){
                        // console.log(tag)
                        var entityView = this.refs["entity_"+tag.start];
                        if(this.entityView && entityView !== this.entityView){
                            this.entityView.unFocus();
                            this.entityView = null;
                        }
                        if(entityView){
                            entityView.focus();
                            this.entityView = entityView;
                            var entityView_view = entityView.refs._view;
                            if(entityView_view){
                                Measure(this.refs._entityScrollView.refs.ScrollView,(sx,xy,sw,sh,spx,spy)=>{
                                    Measure(entityView_view,(x,y,w,h,px,py)=>{
                                        var offsetY = this.entityScrollViewOffsetY||0;
                                        this.refs._entityScrollView.scrollTo(py-spy+offsetY,0);
                                    })
                                })
                            }
                        }
                    }
                }
            }
        }
    }

    putError(error_type,sentence){
    }

    loadRecord(){
        if(this.state.recordId && this.state.recordId.trim() != "'"){
            var recordId =  this.state.recordId.trim();
            this.setState({loading:true});
            Fetch.post(appServer+"/insight/nlpData",{recordId:recordId,mds_version:this.state.mds_version},(res)=>{
                this.setState({loading:false});
                console.log(res)
                if(res.error){
                    Modal.info({title:"提示",content:res.error.toString(),onOk() {}});
                }else{
                    res.msdata.recordId = res.recordid;
                    res.msdata.version = res.mds_version;
                    FileStore.dispatch({
                        type: 'ReceiveURL',
                        data: res.msdata
                    });
                }
            })
        }else{
            Modal.info({title:"提示",content:"recordId不能为空",onOk() {

            }});
        }
    }

    reportError(entity){
        var sentence = "";
        for(var i = 0;i<entity.members.length;i++){
            sentence = sentence+entity.members[i].text;
        }
        this.putError(entity.type,sentence)
    }

    onChange(e){
        // e.target.checked
        let activeEntityTag = this.state.activeEntityTag;
        Object.keys(activeEntityTag).forEach((key)=>{
            activeEntityTag[key] =  e.target.checked;
        })
        this.setState({
            checked: e.target.checked,
            activeEntityTag,
            __cache: false
        });
    }

    render() {

        let colors = [];
        let i = 0;
        const {
            activeEntityTag,
            floatingTag,
            text,
            activeCharList,
            showContextMenu,
            __cache
        } = this.state;

        let index = 0;
        for (const key in ColorMap) {
            colors.push(<div
                key={i}
                onClick={this.toggleEntityTag(key)}
                style={{
                    width: 100,
                    color: 'white',
                    textAlign: 'center',
                    letterSpacing: 2,
                    margin: '0 5px 0 5px',
                    backgroundColor: activeEntityTag[key] ? ColorMap[key] : 'grey',
                    padding: '5px 10px 5px 10px',
                    borderRadius: 2
                }}>{key}</div>);
            i++;
        }

        let {
            historyIndex,
            history
        } = this.state;
        const historyLength = history.length;
        let currentTags = history[historyIndex];

        const tags = _.sortBy(currentTags.toJSON(), 'start');
        this.tags = tags;
        const cacheFlag = floatingTag.visible || showContextMenu;

        let entityTags = entityCache;

        if (!cacheFlag) {
            entityTags = [];
            let key = 0;

            for (const entity of _.sortBy(tags, 'start')) {
                if (activeEntityTag[entity.type]) {
                    entityTags.push(<Entity
                        ref={"entity_"+entity.start}
                        onFocus={this.onEntityFocus.bind(this)}
                        onClick={this.addEntityProperty(key)}
                        onDelete={this.reportError.bind(this)}
                        onDeleteItem={this.deleteEntityProperty.bind(this)}
                        onChangeDate={this.onChangeEntityDate.bind(this)}
                        onChangeComment={this.onChangeEntityComment.bind(this)}
                        onToggleExist={this.onToggleEntityExist.bind(this)}
                        id={key}
                        key={key}
                        entity={entity}
                        debug={this.state.debug}
                        setActive={this.setActiveList.bind(this)}/>);
                }
                key++;
            }
            entityCache = entityTags;
        }


        return (
            <View
                style={{
                    flex:1,
                    witdh:'100%',
                    height:'100%',
                    margin: 10,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    padding: 5
                }}
                >

                <Affix>
                    <Flex
                        style={{
                            padding: '10px 0 0 0',
                            background: 'white'
                        }}>
                        <Flex/>
                        <Checkbox checked={this.state.checked} onChange={this.onChange.bind(this)}>全选</Checkbox>
                        <Flex
                            direction='colors'
                            width={colors.length * 50}
                            align='flex-end'>
                            {colors}
                        </Flex>
                    </Flex>
                </Affix>

                <ScrollView
                    contentContainerStyle={{ flex:1,
                        width:'100%',
                        height:'100%',}}>
                <View style={{flex:1,flexDirection:'row'}}>
                  <View style={{flex:1,marginRight:'5px',flexDirection:'column'}} >
                    <ScrollView
                        contentContainerStyle={{width:'100%'}}
                        scrollEventThrottle={16}
                        onScroll={(e)=>{
                          let node = ReactDOM.findDOMNode(this.refs._tagScrollView.refs.ScrollView);
                          this.tagScrollViewOffsetY = node.scrollTop;
                        }}
                        onContextMenu={this.contextMenuHandler.bind(this)}
                        ref='_tagScrollView'
                        style={{width:'100%'}}
                        >
                        <Text>
                        {renderTags(this.state.highlightRange,tags, text, activeEntityTag, activeCharList, cacheFlag || __cache, this.state.debug, this.state.textTypes,this.onTagFocus.bind(this),(com,i)=>{
                            this.refs['tag_'+i] = com;
                        })}
                      </Text></ScrollView>
                  </View>
                  <View style={{width:'50%',marginLeft:'5px'}}>
                    <ScrollView
                      onScroll={(e)=>{
                        let node = ReactDOM.findDOMNode(this.refs._entityScrollView.refs.ScrollView);
                        this.entityScrollViewOffsetY = node.scrollTop;
                      }}
                      scrollEventThrottle={16}
                      ref='_entityScrollView'
                      contentContainerStyle={{width:'100%',flexDirection: 'row',flexWrap: 'wrap'}}
                    >
                      {entityTags}
                    </ScrollView>
                  </View>
                </View>

                </ScrollView>

                <div
                    onClick={e => {
                        document.removeEventListener('click', this.contextMenuListener);
                        this.setState({
                            showContextMenu: false,
                            __cache: false
                        });
                    }}
                    id='context-menu'
                    style={{
                        zIndex: 999,
                        visibility: this.state.showContextMenu ? 'visible' : 'hidden',
                        width: 200,
                        position: 'absolute',
                        top: this.state.contextMenuY-100,
                        top: 0,
                        left: Math.min(this.state.contextMenuX - 10, screen.width - 600)
                    }}>
                    <ContextMenu
                        onClick={this.onMenuClick}/>
                </div>
                <div
                    style={{
                        visibility: floatingTag.visible ? 'visible' : 'hidden',
                        zIndex: 1000,
                        color: 'white',
                        position: 'absolute',
                        top: floatingTag.y - 100,
                        left: floatingTag.x - 10,
                        padding: '5px 10px 5px 10px',
                        borderRadius: 3,
                        background: 'blue'
                    }}>
                    {floatingTag.text}
                </div>
                <Spin  size="large" style={{position:'absolute',top:'45%',left:'50%'}}  spinning={this.state.loading?true:false} />
            </View>
        );
    }
}

// <Flex>
//     <Flex>
//         <div
//             ref='content'
//             style={{
//                 marginBottom: 200,
//                 height: 500,
//                 padding: 10,
//                 overflowY: 'scroll'
//             }}
//             onContextMenu={this.contextMenuHandler}>
//             {renderTags(tags, text, activeEntityTag, activeCharList, cacheFlag || __cache, this.state.debug, this.state.textTypes)}
//         </div>
//     </Flex>
//     <Flex>
//         <div
//             style={{
//                 height: 500,
//                 padding: 10,
//                 marginTop: 10,
//                 overflowY: 'scroll'
//             }}
//             ref='list'>
//             {entityTags}
//         </div>
//     </Flex>
// </Flex>
