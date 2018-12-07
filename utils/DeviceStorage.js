/**
 * 数据管理工具
 * Created by reason on 16/10/25.
 */

'use strict';

import { AsyncStorage } from '../src/RN';

export default class DeviceStorage {

    /**
     * 保存数据
     * @param key {String}
     * @param value {String}
     */
    static saveStorageData = (key,value) => {
        if(!key || !value)return;
        try{
            AsyncStorage.setItem(key, value);
        }catch(error){
            console.log("--save Storage error-->key:"+key+" error:"+error);
        }
    };

    /**
     * 得到保存的Storage数据
     * @param cb 得到数据的回调函数
     */
    static getStorageData = (key,cb) => {
        if(!key || !cb)return;
        try{
            AsyncStorage.getItem(key).then((result)=>{
                cb(result)
            }).catch(()=>{
                cb(null)
            });
        }catch(error){
            cb(null)
        }
    }
}

DeviceStorage.KEYS = {'RecentLogin':'recent_login_account'};//近期登录用户的账号