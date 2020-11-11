import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './FileUpload.css'

export default class FileUpload extends Component {
  static weight = 8

  static defaultConfig = {
    id: 0,
    type: 'FileUpload',
    label: 'File Upload'
  }

  static configurableSettings = {
    required: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required?'
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      uploadedFile: null,
      uploadState: 0 //0-no file, 1-file upload in progress, 2-file upload success, 3-file upload error
    }
    this.addFileButtonClicked = this.addFileButtonClicked.bind(this)
  }

  handleFileSelect = (e) => {
    e.preventDefault()
    this.buildFileSelector().click()
  }

  buildFileSelector() {
    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.addEventListener('change', this.addFileButtonClicked, false)
    return fileSelector
  }

  addFileButtonClicked(e) {
    var file = e.target.files[0]
    this.setState({ uploadedFile: file })
    console.log('FILENAME: ', file.name)
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    var display
    if (this.state.uploadState === 0) {
      display = (
        <div id="file-not-uploaded">
          <i class="fa fa-cloud-upload"></i>
          <p id="click-here-text">
            Click to the button below or <br></br>drag&drop your file here to
            upload
          </p>
          <button
            id="add-file-btn"
            class="btn add-file-btn"
            onClick={this.handleFileSelect}>
            Add File
          </button>
        </div>
      )
    } else if (this.state.uploadState === 1) {
    } else if (this.state.uploadState === 2) {
    } else if (this.state.uploadState === 3) {
    }
    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <form class="file-form">
          <input type="file" id={`q_${config.id}`} name={`q_${config.id}`} />

          <label for="file-input">
            <img id="file-image" class="hidden" src="#" alt="Preview"></img>
            {display}
          </label>
        </form>
      </ElementContainer>
    )
  }
}
