import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './Button.css'

export default class Button extends Component {
  static weight = 4

  static defaultConfig = {
    id: 0,
    type: 'Button',
    buttonText: 'Submit'
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {mode === 'builder' ? (
          <div>
            <button {...inputProps}>
              <EditableLabel
                className="fl label"
                dataPlaceholder="Type a button text"
                mode={mode}
                labelKey={config.id}
                handleLabelChange={this.props.handleLabelChange}
                value={config.buttonText}
              />
            </button>
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                dataPlaceholder="Click to edit sublabel"
                mode={mode}
                labelKey={`sub_${config.id}`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.sublabelText !== 'undefined' &&
                  config.sublabelText !== ''
                    ? config.sublabelText
                    : ''
                }
              />
            </div>
          </div>
        ) : (
          <div>
            <input type="submit" value={config.buttonText} {...inputProps} />
            <div className="clearfix">
              <EditableLabel
                className="sublabel"
                mode={mode}
                labelKey={`sub_${config.id}`}
                handleLabelChange={this.props.handleLabelChange}
                value={
                  typeof config.sublabelText !== 'undefined' &&
                  config.sublabelText !== ''
                    ? config.sublabelText
                    : ''
                }
              />
            </div>
          </div>
        )}
      </ElementContainer>
    )
  }
}
