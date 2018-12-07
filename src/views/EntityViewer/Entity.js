import React from 'react';
import ColorMap from './ColorMap';
import _ from 'lodash';
import {
    Input,
    Select
} from 'antd';

import {Text, View ,TouchableOpacity,Animated} from 'react-native'

export default class renderEntity extends React.Component {

    constructor(props) {
      super(props);
      this.setEntity(props);
    }

    componentWillReceiveProps(nextProps){
      this.setEntity(nextProps);
    }

    setEntity(props){
      if(!this.state){
        this.state = {entity:props.entity,active: false,scale: new Animated.Value(1)};
      }else{
        this.setState({entity:props.entity})
      }
    }

    onFocus(){
      this.focus();
      if(this.props.onFocus){
        this.props.onFocus(this,this.state.entity)
      }
    }

    focus(){
      Animated.timing(
        this.state.scale,
        {
          toValue: 1.05,
        }
      ).start();
    }

    unFocus(){
      Animated.timing(
        this.state.scale,
        {
          toValue: 1,
        }
      ).start();
    }

    render () {
        const entity = this.state.entity;
        try {
            if(entity.members[0]['type'] == '基本信息' && entity.members[0]['text'] == '姓名' && entity.members[1]){
                entity.members[1]['text'] = '-';
            }
        }catch (e){
            console.log(entity)
        }
        const members = entity.members.filter(e => e.type !== entity.type).map((entity, i) => {
            return <div
                style={{
                    background: 'white',
                    borderBottom: '1px solid grey'
                }}
                key={'attribute-' + i}>
                <span
                    style={{
                        display: 'inline-block',
                        width: 80,
                        padding: '4px 0 4px 10px',
                        borderRight: '1px solid grey'
                    }}>
                    {entity.type}
                </span>
                <span
                    style={{
                        padding: '4px 0 4px 10px',
                        display: 'inline-block',
                        minWidth: 140
                    }}>
                    {entity.text}
                </span>

            </div>
        });
        if (entity.exist !== undefined) {
            members.push(<div
                key={`toggle-${this.props.id}`}
                style={{
                    background: 'white',
                    borderBottom: '1px solid grey'
                }}>
                <span
                    style={{
                        display: 'inline-block',
                        width: 80,
                        padding: '4px 0 4px 10px',
                        borderRight: '1px solid grey'
                    }}>
                    是否存在
                </span>
                <span
                    style={{
                        padding: '4px 0 4px 10px',
                        display: 'inline-block',
                        borderRight: '1px solid grey',
                        minWidth: 140
                    }}>
                    <Select
                        onChange={e => this.props.onToggleExist(this.props.id, e)}
                        value={entity.exist}>
                        <Select.Option key='有' value='有'>有</Select.Option>
                        <Select.Option key='无' value='无'>无</Select.Option>
                        <Select.Option key='不详' value='不详'>不详</Select.Option>
                    </Select>
                </span>
            </div>);
        }


        return (
          <Animated.View style={{transform:[{scale:this.state.scale}]}}>
            <TouchableOpacity  ref='_view' activeOpacity={1} onPress={this.onFocus.bind(this)}>
              <span
                  style={{
                      margin: 15,
                      fontSize: 14,
                      background: this.state.active ?
                          'darkgrey' : ColorMap[entity.type],
                      padding: '0 0 8px 0',
                      borderRadius: 5,
                      border: '1px solid grey',
                      display: 'inline-block',
                  }}>
                  <div
                      onClick={e => {
                          if (!this.props.onClick()) {
                              return;
                          }
                          const active = !this.state.active;
                          this.setState({
                              active
                          });
                          this.props.setActive(_.range(entity.start, entity.end + 1), active);
                      }}
                      style={{
                          color: 'white',
                          fontSize: 16,
                          textAlign: 'center',
                          padding: '10px 0 5px 0',
                          display: 'flex'
                      }}>

                          <span
                              style={{
                                  display: 'flex',
                                  flex: 1,
                                  justifyContent: 'center'
                              }}>
                              {(()=>{
                                  try {
                                     return _.find(entity.members, {type: entity.type}).text
                                  }catch (e){
                                      console.log(entity)
                                  }
                              })()}
                              {this.props.debug ? `(${this.props.id})` : ''}
                          </span>

                  </div>
                  {members}
                  <div
                      style={{
                          background: 'white',
                          borderBottom: '1px solid grey'
                      }}>
                      <span
                          style={{
                              display: 'inline-block',
                              width: 79,
                              padding: '4px 0 4px 10px'
                          }}>
                          时间
                      </span>
                      <span
                          style={{
                              padding: '4px 10px 4px 10px',
                              display: 'inline-block',
                              minWidth: 140,
                              borderLeft: '1px solid grey'
                          }}>
                          <Input
                              onChange={e => this.props.onChangeDate(
                                          this.props.id, e.target.value)}
                              value={entity.date}/>
                      </span>
                  </div>
                  <div
                      style={{
                          background: 'white'
                      }}>
                      <Input
                          onChange={e => this.props.onChangeComment(
                              this.props.id, e.target.value)}
                          rows={1}
                          value={entity.comment}
                          type='textarea'/>
                  </div>
              </span>
            </TouchableOpacity>
          </Animated.View>
      )
    }
}
