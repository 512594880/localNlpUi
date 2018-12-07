/**
 * 访问网络工具类
 * Created by reason on 16/10/25.
 */

import fetch from 'isomorphic-fetch';

export default class Fetch {

    static post(url,parameters,cb){
        fetch(url,{
            method: "POST",
            mode : 'cors',  //实现跨域
            body: JSON.stringify(parameters)
        })
            .then((response) => response.json())
            .then((data)=>{
                if(!data){
                    data = {error:'服务器异常'};
                }
                cb(data);
            }).catch((e)=>{
                cb({error:'服务器异常'});
                console.log(e)
            })
    }

    // headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json;charset=utf-8'
    //     },

    static get(url,cb){
        fetch(url,{
            method: "GET",
            mode : 'cors'
        })
            .then((response) => response.json())
            .then((data)=>{
                if(!data){
                    data = {error:'服务器异常'};
                }
                cb(data);
            }).catch((e)=>{
            console.error(e)
            cb({error:'服务器异常'})
        })
    }

    /**
     *
     * @param obj  {url:xxx,fileName:xxx}
     */
    static downloadFile(obj){
        if(obj && obj.url && obj.fileName){
            var a = document.createElement('a');
            var url = obj.url;
            var filename = obj.fileName;
            a.href = url;
            a.download = filename;
            a.click();
        }
    }

}