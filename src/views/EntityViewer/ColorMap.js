import entityType from './entityType';

const keys = Object.keys(entityType);
const length = keys.length;

let map = {
    // '未识别': 'white'
};

let i = 0;
for (const key of keys) {
    map[key] = `hsl(${parseInt(360 * i / length)}, 50%, 50%)`;
    i++;
}

export default map;
