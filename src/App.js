/*** core libs ***/
import React from 'react';
import {
    Tabs,
    Input,
    Button,
    Upload,
    Modal,
    Spin,
    Menu, Dropdown, Icon,
    Collapse,
} from 'antd';

import GlobalStore from './stores/GlobalStore';
import FileStore from './stores/FileStore';
import watch from './watch';

import EntityViewer from './views/EntityViewer';
import NLPView from './views/NLPViewer';

import { AppRegistry, Image, StyleSheet, Text, View,SegmentedControlIOS } from 'react-native';

import Fetch from '../utils/Fetch';
import {appServer} from '../web/Config'

import {filterTypes} from './views/EntityViewer/entityType'

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return  decodeURI(unescape(r[2])); return null;
}

@watch(GlobalStore)
export default class App extends React.Component {

    constructor(props){
        super(props);
        url = props.url;
        var recordId = getQueryString("recordId");
        this.state = {
            selectedType:"全部",
            url:'',
            loading:false,
            selectedIndex:1,
            nlp_version:getQueryString("nlpVersion"),
            dict_version:getQueryString("dictVersion"),
            projectProcessId:getQueryString("projectProcessId"),
            mds_version:getQueryString("mdsVersion"),
        };
        if(recordId && recordId.trim() != "'") {
            this.state.loading = true;
            this.state.recordId = recordId;
            this.loadRecord();
        }
    }

    _onChange = (key) => {
        this.setState({selectedIndex: key});
    };

    loadRecord(notUseType){
        if(this.state.recordId && this.state.recordId.trim() != "'"){
            var recordId =  this.state.recordId.trim();
            this.setState({loading:true});
            var params = {recordId:recordId,mds_version:this.state.mds_version,nlp_version:this.state.nlp_version,dict_version:this.state.dict_version};
            params.type = this.state.selectedType;
            if(this.state.projectProcessId){
                try {
                    params.projectProcessId = parseInt(this.state.projectProcessId);
                }catch (e){
                    Modal.info({title:"提示",content:"projectProcessId 只能是数值",onOk() {}});
                }
            }
            if(!notUseType){
                params =  {recordId:recordId}
            }
            // console.log(params,this.state.selectedType)
            Fetch.post(appServer+"/insight/nlpData",params,(res)=>{
                this.setState({loading:false});
                console.log(res)
                if(res.error){
                    var e = res.error.toString();
                    if(e.startsWith("没找到")){
                        Modal.info({title:"提示",content:"RID："+recordId+"\n 没有 "+this.state.selectedType+" 类型的结构化数据",onOk() {}});
                    }else{
                        Modal.info({title:"提示",content:res.error.toString(),onOk() {}});
                    }
                }else{
                    res.msdata.recordId = res.recordid;
                    res.msdata.version = res.mds_version;

                    this.setState({SDS_Version:res.SDS_Version,date:res.date,mds_version:res.mds_version,nlp_version:res.nlp_version,recordId:res.recordid,dict_version:res.dict_version,projectProcessId:res.projectProcessId})
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

    onRowClick(r){
        this.state.projectProcessId = r.PPID;
        this.loadRecord(true);
    }


    onSelectType(e){
        var type = e.key;
        if(this.state.selectedType != type){
            this.setState({selectedType:type});
        }
    }

    render() {
        var enWidth = 0;
        var nlpWidth = "100%";
        if(this.state.selectedIndex == 0){
            enWidth = "100%";
            nlpWidth = 0;
        }

        var types = [];
        filterTypes.forEach((k)=>{
            types.push(<Menu.Item key={k}>{k}</Menu.Item>)
        })

        const menu = (
            <Menu onClick={this.onSelectType.bind(this)}>
                {types}
            </Menu>
        );

        return (
            <View style={styles.full}>
                <View style={styles.content}>
                    <SegmentedControlIOS
                        style={styles.segmented}
                        values={['语义分析', '实体提取分析']}
                        selectedIndex={this.state.selectedIndex}
                        onChange={(event) => {
                            this.setState({selectedIndex: event.nativeEvent.selectedSegmentIndex});
                        }}
                    />
                    <View style={{flexDirection:'column'}}>
                        {/*<LifeCircle onRowClick={this.onRowClick.bind(this)} recordId={this.state.recordId} type={this.state.selectedType}/>*/}
                    </View>
                    <View style={{flexDirection:"row",alignItems:"center"}}>
                        {/*<View>*/}
                            {/*RecordId:*/}
                        {/*</View>*/}
                        {/*<View*/}
                            {/*style={{width:300}}>*/}
                            {/*<Input*/}
                                {/*value={this.state.recordId}*/}
                                {/*onChange={e => this.setState({*/}
                                    {/*recordId: e.target.value*/}
                                {/*})}/>*/}
                        {/*</View>*/}
                        <View style={{margin:10}}>
                            {/*<Upload {...props}>*/}
                                {/*<Button>*/}
                                    {/*<Icon type="upload" /> Select File*/}
                                {/*</Button>*/}
                            {/*</Upload>*/}
                            <input
                                onChange={e => {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    this.setState({
                                        url: file.name
                                    });
                                    reader.onload = e  => {
                                        FileStore.dispatch({
                                            type: 'ReceiveURL',
                                            data: JSON.parse(e.target.result)
                                        });
                                    }
                                    reader.readAsText(file);
                                }}
                                type='file'/>
                        </View>

                        <View style={{marginLeft:20}}>
                            类型:
                        </View>
                        <Dropdown overlay={menu}>
                            <Button style={{ marginLeft: 8 }}>
                                {this.state.selectedType} <Icon type="down" />
                            </Button>
                        </Dropdown>

                        {/*<View style={{marginLeft:20}}>*/}
                            {/*<Button*/}
                                {/*onClick={()=>{this.state.projectProcessId = null;this.state.dict_version = null;this.state.nlp_version = null;this.state.mds_version = null;this.loadRecord(false)}}>*/}
                                {/*加载*/}
                            {/*</Button>*/}
                        {/*</View>*/}

                        <View style={{marginLeft:20}}>
                            {this.state.date}
                        </View>

                        {/*<View style={{marginLeft:20}}>*/}
                            {/*PPID:{this.state.projectProcessId}*/}
                        {/*</View>*/}

                        <View style={{marginLeft:20}}>
                           {this.state.SDS_Version}
                        </View>

                        {/*<View style={{marginLeft:20}}>*/}
                            {/*ProjectProcessId:*/}
                        {/*</View>*/}
                        {/*<View*/}
                            {/*style={{width:100}}>*/}
                            {/*<Input*/}
                                {/*value={this.state.projectProcessId}*/}
                                {/*onChange={e => this.setState({*/}
                                    {/*projectProcessId: e.target.value*/}
                                {/*})}/>*/}
                        {/*</View>*/}
                        {/*<View style={{marginLeft:20}}>*/}
                            {/*分词版本:*/}
                        {/*</View>*/}
                        {/*<View*/}
                            {/*style={{width:100}}>*/}
                            {/*<Input*/}
                                {/*value={this.state.nlp_version}*/}
                                {/*onChange={e => this.setState({*/}
                                    {/*nlp_version: e.target.value*/}
                                {/*})}/>*/}
                        {/*</View>*/}

                        {/*<View style={{marginLeft:20}}>*/}
                            {/*结构化版本:*/}
                        {/*</View>*/}
                        {/*<View*/}
                            {/*style={{width:100}}>*/}
                            {/*<Input*/}
                                {/*value={this.state.mds_version}*/}
                                {/*onChange={e => this.setState({*/}
                                    {/*mds_version: e.target.value*/}
                                {/*})}/>*/}
                        {/*</View>*/}

                        {/*<View style={{marginLeft:20}}>*/}
                            {/*字典版本:*/}
                        {/*</View>*/}
                        {/*<View*/}
                            {/*style={{width:100}}>*/}
                            {/*<Input*/}
                                {/*value={this.state.dict_version}*/}
                                {/*onChange={e => this.setState({*/}
                                    {/*dict_version: e.target.value*/}
                                {/*})}/>*/}
                        {/*</View>*/}

                    </View>
                    <View style={{flex:1,flexDirection: 'row'}}>
                        <View style={{width:enWidth}}>
                            <NLPView url={this.state.url} type={this.state.selectedType}/>
                        </View>
                        <View style={{width:nlpWidth}}>
                            <EntityViewer  url={this.state.url} type={this.state.selectedType}/>
                        </View>

                    {/*{*/}
                        {/*(()=>{*/}
                            {/*if(this.state.selectedIndex == 0){*/}
                                {/*return <NLPView  url={this.state.url}/>*/}
                            {/*}else{*/}
                                {/*return <EntityViewer url={this.state.url}/>*/}
                            {/*}*/}
                        {/*})()*/}
                    {/*}*/}
                    </View>
                </View>

                {/*<Spin style={styles.spin} spinning={GlobalStore.getState().get('loading') !== 0} />*/}
                {this._renderLoading()}

            </View>
        )
    }

    _renderLoading = () => {
        if(this.state.loading){
            return <Spin style={styles.spin} size="large"/>
        }
    };



}

const styles = StyleSheet.create({
    full: {
        flex: 1,
        paddingTop:10
        // backgroundColor:'#444'
    },
    content:{
        flex: 1
    },
    // tabs:{
    //   flex:1
    // },
    // empty:{
    //     marginLeft: 10,
    //     marginTop:10,
    //     backgroundColor:'#fff',
    //     borderRadius: 10,
    //     padding: 10
    // },
    // spinContainer:{
    //     flex:1,
    //     position:'absolute',
    //     top:0,left:0,
    //     textAlign:'center'
    // },
    segmented:{
        width:400,
        marginLeft:10,
        alignSelf:'center'
    },
    spin:{
        zIndex:5,
        position:'absolute',
        top:'50%',left:'50%'
    },
    submitButton:{
        position:'absolute',
        bottom:50,right:50,
        width:50,height:50
    },
    backButton:{
        position:'absolute',
        bottom:120,right:50,
        width:50,height:50,
        backgroundColor:'#f00'
    }
});