import React from 'react';
import {
    Menu
} from 'antd';
import entityType from './entityType';

import {ScrollView} from 'react-web'

export default function(props) {
    const keys = Object.keys(entityType);
    const subMenu = keys
        .map(key => <Menu.Item
            key={key}>
            {key}</Menu.Item>);

    const propMenu = [];
    for (const key of keys) {
        if (entityType[key].length === 0) {
            continue;
        }
        propMenu.push(<Menu.SubMenu
            key={key}
            title={key}>
            {entityType[key].map(item => <Menu.Item
                key={`${key}-${item}`}>
                {item}</Menu.Item>)}
        </Menu.SubMenu>)
    }

    return <div
        style={{
            border: '1px solid grey'
        }}>
        <Menu
            onClick={props.onClick}
            mode='vertical'>
            <Menu.SubMenu
                key='new'
                title='报错'>
                {subMenu}
            </Menu.SubMenu>
        </Menu>
    </div>
}
