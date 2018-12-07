import _ from 'lodash';
import entityType from './entityType';

const checkAll = function(shouldBe, toBeCheck) {
    for (const key of toBeCheck) {
        if (shouldBe.indexOf(key) === -1) {
            return false;
        }
    }
    return true;
}

export default function(type, items) {
    const keys = _.map(items, i => i.type);
    for (const key in entityType) {
        if (type == key) {
            const items = [key].concat(entityType[key]);
            return checkAll(items, keys)
        }
    }
    return false;
    switch (type) {
        case '诊断':
            return checkAll(['诊断'], keys);
        case '用药':
            return checkAll(['用药', '剂量', '频次'], keys);
        case '症状':
            return checkAll(['症状', '部位'], keys);
        case '化验':
            return checkAll(['化验', '数值', '异常', '数值单位'], keys);
        case '检查':
            return checkAll(['检查', '所示'], keys);
        case '个往史':
            return checkAll(['个往史', '个往史有无的判断词', '个往史结束词'], keys);

    }
    return false;
}
