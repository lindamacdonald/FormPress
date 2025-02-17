import React, { Component } from 'react'
import { api } from '../../helper'
import { LoginPicture } from '../../svg'
import Renderer from '../Renderer'
import AuthContext from '../../auth.context'

import './ForgotPassword.css'

class ForgotPassword extends Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      message: '',
      success: false,
      state: 'initial' // one of, initial, loading, done
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleForgotPasswordButtonClick = this.handleForgotPasswordButtonClick.bind(
      this
    )
  }

  handleFieldChange(elem, e) {
    this.setState({ email: e.target.value })
  }

  async handleForgotPasswordButtonClick(e) {
    e.preventDefault()

    const { email } = this.state
    const simpleEmailRegex = /^\S{1,}@\S{2,}\.\S{2,}$/
    if (email === '') {
      this.setState({ message: 'Please use a valid email' })

      return
    } else if (simpleEmailRegex.exec(email) === null) {
      this.setState({ message: 'Please use a valid email' })

      return
    }

    const { success, data } = await api({
      resource: `/api/users/forgotpassword/`,
      method: 'post',
      body: { email }
    })

    if (success === true) {
      this.setState({ success: true, state: 'done', message: data.message })
    } else {
      this.setState({ state: 'done', message: data.message })
    }
  }

  render() {
    const { message, success, email } = this.state
    const forgotSucces = (
      <div>
        <div className="reset-success">
          We have send an e-mail to{' '}
          <span className="reset-email">
            <i>{email}</i>
          </span>{' '}
          address. Reset your password by following the e-mail. (If you
          didn&apos;t recieve please check spam folder)
        </div>
      </div>
    )

    return (
      <div className="login-wrapper">
        <div className="loginForm">
          <div className="picture-bg">
            <div className="login-picture">
              <LoginPicture />
            </div>
          </div>
          <div className="pale-border">
            <div>
              <div className="form-header">FORGOT PASSWORD</div>
              {success ? (
                forgotSucces
              ) : (
                <form onSubmit={this.handleForgotPasswordButtonClick}>
                  <Renderer
                    className="form"
                    theme="infernal"
                    allowInternal={true}
                    handleFieldChange={this.handleFieldChange}
                    form={{
                      props: {
                        elements: [
                          {
                            id: 1,
                            type: 'TextBox',
                            label: 'Email',
                            value: this.state.email
                          },
                          {
                            id: 2,
                            type: 'Button',
                            buttonText: 'Forgot Password'
                          }
                        ]
                      }
                    }}
                  />
                </form>
              )}
              <p className="message-back">{message}</p>
              <div className="have-trouble">
                Having trouble?
                <span className="wip-placeholder" title="WIP">
                  Contact Us
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer cw center grid">
          <div className="col-8-16">Copyright © 2021 formpress.org</div>
          <div className="col-8-16 tr">
            <a href="mailto:support@formpress.org">Contact</a>
          </div>
        </div>
      </div>
    )
  }
}

const ForgotPasswordWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <ForgotPassword {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default ForgotPasswordWrapped
