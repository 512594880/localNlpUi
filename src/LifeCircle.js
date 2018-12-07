/*** core libs ***/
import React from 'react';
import {
    Collapse,Table,Icon
} from 'antd';
import { AppRegistry, Image, StyleSheet, Text, View,SegmentedControlIOS } from 'react-native';

import Fetch from '../utils/Fetch';
import {lifeServer,appServer} from '../web/Config'

const Panel = Collapse.Panel;

function parserColumns(columns) {
    var arr = [];
    if(Array.isArray(columns)){
        columns.forEach((column)=>{
            arr.push({ title: column, dataIndex: column, key: column})
        })
    }
    return arr;
}

const  columns = parserColumns(["时间","类型",,"PPID","字典版本","分词版本","结构化版本"]);


Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

export default class LifeCircle extends React.Component {

    constructor(props){
        super(props);
        this.state = {recordId:props.recordId,data:[],type:props.type}
        this.getData(props.recordId);
    }

    componentWillReceiveProps(nextProp){
        var state = {type:nextProp.type};
        if(nextProp.recordId != this.state.recordId){
            state.recordId = nextProp.recordId;
        }
        this.setState(state);
        if(nextProp.recordId != this.state.recordId){
            this.getData(nextProp.recordId);
        }else{
            this.sortByType(this.state.data,nextProp.type)
        }
        // console.log(nextProp)
    }

    getData(recordId){
        if(recordId) Fetch.post(appServer+"/insight/getHistory",{recordId},(res)=>{
            // console.log(Array.isArray(res),res)
            var arr = [];
            if(Array.isArray(res)){
                res.forEach((i)=>{
                    // const  columns = parserColumns(["时间","类型","总体状态","PPID","字典版本","分词版本","结构化版本","分词状态","结构化状态"]);
                    var item = {}
                    item.时间 = i.date
                    item.entityTypes = i.entityTypes
                    item.PPID = i.projectProcessId
                    item.字典版本 = i.dict_version
                    item.分词版本 = i.nlp_version
                    item.结构化版本 = i.mds_version
                    arr.push(item)
                })
            }else{
                console.log(res)
            }
            this.sortByType(arr)
        })
        // if(recordId)Fetch.get(lifeServer+recordId,(data)=>{
        //     if(data && Array.isArray(data.processes)){
        //         var projectProcessIds = [];
        //         var processes = data.processes;
        //         var arr = [];
        //         processes.forEach((d,i)=>{
        //             var temp = {};
        //             var date = new Date(d.endTime || d.startTime);
        //             temp["时间"] = date.Format("yyyy-MM-dd hh:mm:ss");
        //             temp["总体状态"] = d.status;
        //             // temp["类型"] = "未知";
        //             var projectProcessId = d.projectProcessId;
        //             temp["PPID"] = projectProcessId;
        //             if(projectProcessId){
        //                 projectProcessIds.push(projectProcessId);
        //             }
        //             temp["字典版本"] = d.dictVersion;
        //             temp["分词版本"] = d.nlpVersion;
        //             temp["结构化版本"] = d.mdsVersion;
        //             if(Array.isArray(d.activities)){
        //                 d.activities.forEach((k)=>{
        //                     var status = k.status;
        //                     if(k.name == "分词"){
        //                         temp["分词状态"] = status;
        //                     }
        //                     if(k.name == "结构化"){
        //                         temp["结构化状态"] = status;
        //                     }
        //                 })
        //             }
        //             if(temp["结构化状态"] = "已成功"){
        //                 arr.push(temp);
        //             }
        //         })
        //
        //         Fetch.post(appServer+"/insight/getType",{recordId,projectProcessIds},(res)=>{
        //             // console.log(Array.isArray(res),res)
        //             if(Array.isArray(res)){
        //                 res.forEach((i)=>{
        //                     var p = i.projectProcessId;
        //                     // var type = toType(i.entityTypes);
        //                     // console.log("---->",p,type)
        //                     arr.forEach((d)=>{
        //                         if(d["PPID"] == p){
        //                             d.entityTypes = i.entityTypes;
        //                             d['时间'] = i.date;
        //                             // d["类型"] = type;
        //                         }
        //                     })
        //                 })
        //             }else{
        //                 console.log(res)
        //             }
        //             this.sortByType(arr)
        //         })
        //     }
        //     console.log(data)
        // })
    }

    sortByType(arr,sortType){
        var type = sortType || this.state.type || '全部';
        var toType = function (array) {
            var r = "";
            if(Array.isArray(array)){
                array.sort((a,b)=>{
                    if(a == type) return -1;
                    if(b == type) return 1;
                    return 0;
                })
                for (var i = 0 ; i < array.length ; i++){
                    if(i == 0){
                        r += array[i];
                    }else {
                        r += "|"+array[i];
                    }
                }
            }
            if(r.indexOf("全部") >= 0 ) return "全部";
            return r;
        }
        arr.forEach((a)=>{
            a["类型"] = toType(a.entityTypes);
        })
        try {
            var firstPPID = arr[0]["PPID"];
            arr.sort((a,b)=>{
                var ai = Math.max(a["类型"].indexOf(type),a["类型"].indexOf("全部"));
                var bi = Math.max(b["类型"].indexOf(type),b["类型"].indexOf("全部"));
                if(ai >= 0 && bi < 0 ) return -1;
                if(ai < 0 && bi >= 0 ) return 1;
                if(a["时间"] > b["时间"]) return -1;
                if(a["时间"] < b["时间"]) return 1;
                return 0;
            })
            if(firstPPID != arr[0]["PPID"]) this.props.onRowClick && this.props.onRowClick(arr[0],0)
        }catch (e){}
        // console.log(arr)
        this.setState({data:arr.concat([])})
    }

    render(){
        return (
            <Collapse style={{flex:1}}>
                <Panel style={{flex:1}} header="结构化历史记录" key="1">
                    <Table onRowClick={(r,i,e)=>{
                        console.log(r)
                        if(this.props.onRowClick)this.props.onRowClick(r,i,e)
                    }} style={{flex:1}} columns={columns} dataSource={this.state.data} pagination={{pageSize:3}} />
                </Panel>
            </Collapse>
        )
    }

}

