import { fromJS } from 'immutable';
import _ from 'lodash';
import entityType from './entityType';

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return  decodeURI(unescape(r[2])); return null;
}


export default function(data) {
    var highlight = getQueryString("highlight");
    if(highlight){
        try{
            highlight = JSON.parse(highlight);
        }catch (e){
            console.log(e);
        }
    }
    if(data.source){
      data = data.source;
    }
    var recordId = data.recordId;
    // let text = data['词未定义或未识别'][0]['原文内容'];
    var text ="";
    const typeTags = data['原文位置'];
    const textTypes = [];
    var isName = false;
    var currTitle = '';
    for (const typeTag of typeTags) {
        if(isName && currTitle == '姓名' && typeTag.nature != '段落标题'){
            for (var i = 0;i < typeTag.word.length ;i++ ){
                text += '-';
            }
        }else{
            text += typeTag.word;
        }
        if (typeTag.nature === '段落标题') {
            currTitle = typeTag.word;
            isName = typeTag.word == '姓名';
            const start = parseInt(typeTag['开始位置']);
            const length = typeTag.word.length;
            textTypes.push(...(_.range(start, start + length)));
        }
    }

    console.info('[段落标题]', textTypes);

    let entityKeysArray = [];
    for (const key in entityType) {
        entityKeysArray.push([key, [key].concat(entityType[key])]);
    }

    let tags = [];
    if(data.tags){
      tags = data.tags;
    }else{
          const 检查否定词 = (resultItem,item,type)=>{
              var k = "否定词";
              if(type == "用药"){
                  k="是否使用";
              }
              if(type == "诊断"){
                  k="是否确定";
              }
              if(item[k]){
                  // resultItem[k] = item[k];
                  resultItem.members.push({
                      text:item[k],
                      type: k
                  });
              }

              // if(type =="化验" && item.化验 == "CRP"){
              //     console.log(resultItem)
              // }
          }
          const parser = (keys, items, type) => {
              const indexKeys = keys.map(key => key + '开始位置');
              let result = [];
              items = items || [];
              for (const item of items) {
                  let resultItem = {
                      members: [],
                      type,
                      pos: parseInt(item['位置']),
                      date: item['时间']
                  };
                  if(type == "化验" && (item["化验组"]||item["验项组"])){
                      resultItem.members.push({
                          text:item["化验组"]||item["验项组"],
                          type: type
                      });

                  }
                  resultItem.exist = item['是否存在'];
                  检查否定词(resultItem,item,type);
                  let groupStart = text.length + 1;
                  let groupEnd = 0;

                  for (const key of keys) {
                      const text = item[key];
                      if(text === undefined){
                          continue;
                      }
                      try {
                          if (text.length > 0) {
                              const start = parseInt(item[key + '开始位置']);
                              const end = start + text.length - 1;

                              groupStart = Math.min(start, groupStart);
                              groupEnd = Math.max(end, groupEnd);

                              resultItem.members.push({
                                  start,
                                  end,
                                  text,
                                  type: key
                              });
                          }
                      }catch (e){
                          console.log(e,item,key)
                      }

                  }

                  resultItem.start = groupStart;
                  resultItem.end = groupEnd;
                  resultItem.members = _.sortBy(resultItem.members, 'start');
                  if (resultItem.members.length > 0 /*&&
                      !_.find(result, {start: resultItem.start})*/) {
                      result.push(resultItem);
                  }
              }
              return result;
          }

          for (const entityKeys of entityKeysArray) {
              const key = entityKeys[0];
              const items = entityKeys[1];
              tags = tags.concat(parser(items, data[key], key));
          }

    }

    tags = _.sortBy(tags, 'start');
    for (var i = 0; i < tags.length; i++) {
      tags[i].tagId = "tag_"+i;
    }
    var highlightRange = [];
    if(Array.isArray(highlight) && text){

        var pushRange = function (key) {
            var tmp = text.toLowerCase();
            var highlightStart  = tmp.indexOf(key);
            var lastStart = 0;
            while (highlightStart >= 0){
                highlightStart += lastStart;
                var highlightEnd = highlightStart+key.length;
                highlightRange.push(...(_.range(highlightStart,highlightEnd)));
                tmp = tmp.substring(highlightEnd - lastStart);
                lastStart = highlightEnd;
                highlightStart  = tmp.indexOf(key);
            }
        }
        highlight.forEach(pushRange);
        console.log("---",highlightRange);
    }

    var v = {
        tags: fromJS(tags),
        text,
        textTypes,
        recordId,
        highlightRange,
        version:data.version
    };
    return v;
}
