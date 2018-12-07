import React from 'react';
import ReactDOM from 'react-dom';

export default (ref,callback)=>{
    const rect = ReactDOM.findDOMNode(ref).getBoundingClientRect();
    callback(0, 0, rect.width, rect.height, rect.left, rect.top);
}
