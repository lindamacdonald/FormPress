import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './Modal.css'

class Modal extends Component {
  renderDialogue() {
    const { dialogue } = this.props.modalContent
    return (
      <div className={'wrapper-dialogue'}>
        {dialogue.inputOnChange ? (
          <div className={'wrapper-textbox'}>
            <input
              autoFocus={true}
              onFocus={(e) => {
                e.target.select()
              }}
              onChange={(e) => {
                dialogue.inputOnChange(e)
              }}
              type="text"
              value={dialogue.inputValue()}
            />
          </div>
        ) : null}

        <div className={'wrapper-buttons'}>
          {dialogue.abortText ? (
            <button className={'abort'} onClick={dialogue.abortClick}>
              {dialogue.abortText}
            </button>
          ) : null}
          {dialogue.negativeText ? (
            <button className={'negative'} onClick={dialogue.negativeClick}>
              {dialogue.negativeText}
            </button>
          ) : null}
          {dialogue.positiveText ? (
            <button className={'positive'} onClick={dialogue.positiveClick}>
              {dialogue.positiveText}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  render() {
    const modalContent = this.props.modalContent

    if (this.props.isOpen === true) {
      return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={this.props.closeModal}>
          <div
            className="modal-wrapper"
            onClick={(e) => {
              e.stopPropagation()
            }}>
            <div className={`wrapper-header ${modalContent.status}`}>
              {modalContent.header}
              <span className="close-modal" onClick={this.props.closeModal}>
                x
              </span>
            </div>
            <div className="wrapper-body">
              {modalContent.content}
              {modalContent.dialogue ? this.renderDialogue() : null}
            </div>
          </div>
        </div>,
        document.getElementById('portal')
      )
    } else {
      return null
    }
  }
}
export default Modal
