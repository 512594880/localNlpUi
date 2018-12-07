import React from 'react';
import WordType from './WordType';
import {
    Menu
} from 'antd';
export default function(props) {
    const items = [...WordType];
    let groups = [];
    let activeGroup = [];
    let activeGroupTitle = items.shift().substr(1);
    for (const item of items) {
        if (item[0] === '#') {
            groups.push({
                title: activeGroupTitle,
                items: activeGroup
            });
            activeGroupTitle = item.substr(1);
            activeGroup = [];
        } else {
            activeGroup.push(item)
        }
    }
    groups.push({
        title: activeGroupTitle,
        items: activeGroup
    });

    let menuItems = [
        <Menu.SubMenu
            key='tag'
            title={
                props.tagType === '未识别' ?
                '识别' :
                '更改'
            }>
            {groups.map((group, groupIndex) =>  <Menu.SubMenu
                    key={`group-${groupIndex}`}
                    title={group.title}>
                    {group.items.map(item => <Menu.Item
                        key={`group-${groupIndex}-${item}`}>
                        {item}
                    </Menu.Item>)}
                </Menu.SubMenu>
            )}
        </Menu.SubMenu>
    ];
    if (props.tagType !== '未识别') {
        menuItems.push(
            <Menu.Item
                key='unTag'>
                取消识别
            </Menu.Item>
        );
    }

    return <div
        style={{
            border: '1px solid grey'
        }}>
        <Menu
            onClick={props.onClick}
            mode='vertical'>
            {menuItems}
        </Menu>
    </div>
}
