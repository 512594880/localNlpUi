import {
    createStore
} from 'redux';

import {
    fromJS
} from 'immutable';

import {
    success,
    error
} from '../libs/display';

import entityType from '../views/EntityViewer/entityType';

import http from '../http';
import logger from '../logger';

let defaultStateRaw = {
    '词未定义或未识别': [{
        '原文内容': ''
    }],
    '原文位置': [],
    '段落标题': [],
};

for (const key in entityType) {
    defaultStateRaw[key] = [];
}


const defaultState = fromJS(defaultStateRaw);

//const defaultState = fromJS(data);


const FileStore = createStore(function(state = defaultState, action) {
    switch (action.type) {
        case 'LoadURL':
            action.url = action.url + '?t=' + Date.now();
            http
                .get(action.url)
                .then(res => {
                    success('加载完成')
                    FileStore.dispatch({
                        type: 'ReceiveURL',
                        data: res
                    });
                })
                .catch(err => {
                    logger.error(err);
                    error(err);
                });
            return state
                .set('__lastAction', 'Load');
        case 'ReceiveURL':
            return fromJS(action.data);
        default:
            return state;
    }
});

export default FileStore;
