import React, { Component } from 'react'

export default class EditableLabel extends Component {
  constructor(props) {
    super(props)

    this.handleOnInput = this.handleOnInput.bind(this)
    this.handleOnBlur = this.handleOnBlur.bind(this)
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this)
    this.handleOnPaste = this.handleOnPaste.bind(this)
  }

  handleOnInput(e) {
    const limit = 256
    const text = e.target.innerText
    if (text.length >= limit) {
      e.target.innerText = text.substr(0, limit)
      this.props.handleLabelChange(
        this.props.labelKey,
        e.target.innerText
          .replace(/<span(.*?)>(.*?)<\/span>/, '')
          .replace(/(<([^>]+)>)/gi, '')
          .trim()
      )

      e.target.focus()
      document.execCommand('selectAll', false, null)
      document.getSelection().collapseToEnd()
    }
  }

  handleOnBlur(e) {
    this.props.handleLabelChange(
      this.props.labelKey,
      e.target.innerText
        .replace(/<span(.*?)>(.*?)<\/span>/, '')
        .replace(/(<([^>]+)>)/gi, '')
        .trim()
    )
  }

  handleOnKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  handleOnPaste(e) {
    e.preventDefault()

    // get text representation of clipboard
    var text = e.clipboardData.getData('text/plain')

    // insert text manually
    document.execCommand('insertHTML', false, text)
  }

  render() {
    const extraProps = {}

    if (this.props.mode === 'builder') {
      extraProps.contentEditable = true
    }

    if (this.props.required === true) {
      extraProps.className = 'required'
    }

    return (
      <div className={this.props.className}>
        <span
          onInput={this.handleOnInput}
          onBlur={this.handleOnBlur}
          onKeyDown={this.handleOnKeyDown}
          onPaste={this.handleOnPaste}
          dataplaceholder={this.props.dataPlaceholder}
          spellCheck={false}
          suppressContentEditableWarning={true}
          className={this.props.value === '' ? 'emptySpan' : null}
          {...extraProps}>
          {this.props.value}
        </span>
      </div>
    )
  }
}
