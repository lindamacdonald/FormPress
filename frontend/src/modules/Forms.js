import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faTrash,
  faPen,
  faPlusCircle,
  faClone
} from '@fortawesome/free-solid-svg-icons'
import Moment from 'react-moment'

import { api } from '../helper'
import Table from './common/Table'
import Modal from './common/Modal'
import AuthContext from '../auth.context'

import './Forms.css'

const BACKEND = process.env.REACT_APP_BACKEND
class Forms extends Component {
  setLoadingState(key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async updateForms() {
    this.setLoadingState('forms', true)

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`
    })
    const forms = data

    this.setLoadingState('forms', false)
    this.setState({ forms })
  }

  componentDidMount() {
    this.updateForms()
  }

  constructor(props) {
    super(props)
    this.state = {
      isModalOpen: false,
      cloneFormName: '',
      modalContent: {},
      forms: [],
      loading: {
        forms: false,
        deletingId: false
      }
    }
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.handleCloneFormTitleChange = this.handleCloneFormTitleChange.bind(this)
  }

  handleFormCloneClick(form, e) {
    e.preventDefault()

    const modalContent = {
      header: 'Clone form',
      status: 'information'
    }

    let cloneFormName = 'Clone of ' + form.title

    if (cloneFormName.length > 256) {
      let excessChars = cloneFormName.length - 256
      cloneFormName = cloneFormName.slice(0, -excessChars)
    }

    this.setState({ cloneFormName })
    modalContent.dialogue = {
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick,
      positiveText: 'Clone',
      positiveClick: this.formClone.bind(this, form),
      inputValue: () => {
        return this.state.cloneFormName
      },
      inputOnChange: (e) => this.handleCloneFormTitleChange(e)
    }

    modalContent.content = (
      <div>
        <span
          style={{
            color: '#719fbd',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all'
          }}>
          {form.title}
        </span>{' '}
        will be cloned.
        <br />
        Please specify a name for new form:
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  handleFormDeleteClick(form, e) {
    e.preventDefault()
    const modalContent = {
      header: 'Delete form?',
      status: 'warning'
    }

    modalContent.dialogue = {
      negativeText: 'Delete',
      negativeClick: this.formDelete.bind(this, form),
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick
    }

    modalContent.content = (
      <div>
        <span
          style={{
            color: '#719fbd',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all'
          }}>
          {form.title}
        </span>{' '}
        will be deleted. Are you sure you want to delete this form?
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  handleCloneFormTitleChange(e) {
    let name = e.target.value
    let limit = 256
    if (name.length >= limit) {
      name = name.substr(0, limit)
      name
        .replace(/<span(.*?)>(.*?)<\/span>/, '')
        .replace(/(<([^>]+)>)/gi, '')
        .trim()
    }
    this.setState({ cloneFormName: name })
  }

  async formDelete(form) {
    this.setState({
      loading: {
        ...this.state.loading,
        deletingId: form.id
      }
    })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form.id}`,
      method: 'delete'
    })

    window.localStorage.removeItem('lastEditedFormId')

    let modalContent = {}

    if (data.message === 'deleted') {
      modalContent = {
        content: 'Form successfully deleted!',
        status: 'success',
        header: 'Success!'
      }
    } else {
      modalContent = {
        content:
          'There has been an error deleting this form. Please contact support.',
        status: 'error',
        header: 'Error'
      }
    }
    this.setState({ modalContent })

    this.updateForms()
  }

  async formClone(form) {
    form.id = null
    form.title = this.state.cloneFormName
    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`,
      method: 'post',
      body: form
    })

    let modalContent = {}

    if (data.status === 'done') {
      modalContent = {
        content: 'Form cloned successfully!',
        status: 'success',
        header: 'Success!'
      }
    } else {
      modalContent = {
        content:
          'There has been an error cloning this form. Please contact support.',
        status: 'error',
        header: 'Error'
      }
    }
    this.setState({ modalContent })

    this.updateForms()
  }

  handlePreviewClick(form) {
    const { id } = form

    window.open(`${BACKEND}/form/view/${id}`, '_blank')
  }

  handleCloseModalClick() {
    this.setState({ isModalOpen: false, modalContent: {} })
  }

  render() {
    const { forms } = this.state
    let roleLimit = 2
    if (this.props.auth.permission.admin) {
      roleLimit = 0
    } else {
      roleLimit = parseInt(this.props.auth.permission.formLimit)
    }

    return (
      <div>
        <div className="forms">
          <Modal
            history={this.props.history}
            isOpen={this.state.isModalOpen}
            modalContent={this.state.modalContent}
            closeModal={this.handleCloseModalClick}
          />
          {roleLimit === 0 || roleLimit > forms.length ? (
            <div className="nav_add_new_form_container">
              <Link to="/editor/new/builder" className="nav_add_new_form_link">
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    title="Add New Form"
                    className="nav_add_new_form_logo"
                  />
                  <div className="popoverText">Create a new form</div>
                </div>
              </Link>
            </div>
          ) : (
            ''
          )}
          <div className="headerContainer"></div>
          <div className="formsContent">
            <Table
              columns={[
                {
                  label: <span> </span>,
                  content: () => <span> </span>,
                  className: 'mw'
                },
                {
                  label: 'Name',
                  content: (form) => (
                    <Link to={`/editor/${form.id}/builder`} title="Go To Form">
                      {form.title}
                    </Link>
                  ),
                  className: 'name',
                  title: ' '
                },
                {
                  label: 'Responses',
                  content: (form) => (
                    <div
                      className={`responseCount${
                        form.responseCount === 0 ? ' zero' : ''
                      }`}>
                      {form.responseCount}
                    </div>
                  ),
                  className: 'responses'
                },
                {
                  label: 'Created At',
                  content: (form) => [
                    <Moment fromNow ago date={form.created_at} key="1" />,
                    <span key="2">{' ago'}</span>
                  ],
                  className: 'createdAt'
                },
                {
                  label: 'Actions',
                  content: (form) => (
                    <div className="actions">
                      <span
                        className={`${
                          form.published_version ? 'view' : 'inactive_view'
                        }`}
                        title={
                          form.published_version
                            ? 'View Form'
                            : 'Form must be published before it can be viewed'
                        }
                        onClick={
                          form.published_version
                            ? this.handlePreviewClick.bind(this, form)
                            : undefined
                        }>
                        <FontAwesomeIcon icon={faEye} />
                      </span>
                      <span
                        title="Delete Form"
                        onClick={this.handleFormDeleteClick.bind(this, form)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </span>
                      <Link to={`/editor/${form.id}/builder`} title="Edit Form">
                        <FontAwesomeIcon icon={faPen} />
                      </Link>
                      {roleLimit === 0 || roleLimit > forms.length ? (
                        <span
                          title="Clone Form"
                          onClick={this.handleFormCloneClick.bind(this, form)}>
                          <FontAwesomeIcon icon={faClone} />
                        </span>
                      ) : (
                        <span
                          className="inactive_clone"
                          title="Form limit reached">
                          <FontAwesomeIcon icon={faClone} />
                        </span>
                      )}
                    </div>
                  )
                }
              ]}
              data={forms}
            />
          </div>
          <div className="newButtonContainer">
            {roleLimit === 0 || roleLimit > forms.length ? (
              <Link to="/editor/new/builder">Create a new form</Link>
            ) : (
              <span className="disabledNewForm" title="Form limit reached">
                Create a new form
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
}

const FormsWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Forms {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default FormsWrapped
