const path = require('path')
const fs = require('fs')
const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const { FP_ENV, FP_HOST } = process.env
const devPort = 3000
const { getPool } = require(path.resolve('./', 'db'))
const { storage, submissionhandler } = require(path.resolve('helper'))

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const isEnvironmentVariableSet = {
  sendgridApiKey: process.env.SENDGRID_API_KEY !== ''
}

const findQuestionType = (form, qid) => {
  for (const elem of form.props.elements) {
    if (elem.id === qid) {
      return elem.type
    }
  }

  return false
}

module.exports = (app) => {
  // Handle form submission
  app.post('/form/submit/:id/:version?', async (req, res) => {
    const form_id = parseInt(req.params.id)
    let version = parseInt(req.params.version) //either a value or NaN
    const db = await getPool()
    //if preview mode
    if (isNaN(version)) {
      version = 0
    }
    //read out form
    let formResult
    if (version === 0) {
      formResult = await db.query(
        `SELECT * FROM \`form\`
        WHERE id = ?`,
        [form_id]
      )
    } else {
      formResult = await db.query(
        `SELECT * FROM \`form_published\` WHERE form_id = ? AND version = ?`,
        [form_id, version]
      )
    }

    if (formResult.length === 0) {
      return res.status(404).send('Error: form not found')
    }

    const form = formResult[0]
    //preview mode form id = form.id VS published mode form id = form.form_id

    form.props = JSON.parse(form.props)

    //create submission and get id
    const result = await db.query(
      `INSERT INTO \`submission\`
        (form_id, created_at, version)
      VALUES
        (?, NOW(), ?)`,
      [form_id, version]
    )
    const submission_id = result.insertId

    const preformatInputs = []

    let keys = [...Object.keys(req.body)]

    if (req.files !== null) {
      keys = [...keys, ...Object.keys(req.files)]
    }

    const fileUploadEntries = []

    for (const key of keys) {
      const question_id = parseInt(key.split('_')[1])
      const type = findQuestionType(form, question_id)
      let value

      //upload file to GCS
      if (type === 'FileUpload') {
        value = await storage.uploadFile(req.files[key], submission_id)
        fileUploadEntries.push(value)
      } else {
        value = req.body[key]
      }
      preformatInputs.push({ q_id: key, value: value })
    }
    const formattedInput = submissionhandler.formatInput(
      form.props.elements,
      preformatInputs
    )
    try {
      for (const data of formattedInput) {
        //save answer
        const question_id = parseInt(data.q_id)
        let value = data.value
        if (typeof value !== 'string') {
          value = JSON.stringify(value)
        }
        await db.query(
          `INSERT INTO \`entry\`
            (form_id, submission_id, question_id, value)
          VALUES
            (?, ?, ?, ?)`,
          [form_id, submission_id, question_id, value]
        )
      }
    } catch (error) {
      console.error('Error during submission')
      console.error(error)

      res.status(500).send('Error during submission handling')
    }

    for (const key of keys) {
      const question_id = parseInt(key.split('_')[1])
      const type = findQuestionType(form, question_id)

      if (type === 'FileUpload') {
        const uploadPosition = keys.indexOf(key)
        const parsedValue = JSON.parse(fileUploadEntries[uploadPosition - 1])

        const entry_idData = await db.query(
          `SELECT \`id\` FROM \`entry\` WHERE submission_id = ? AND question_id = ?`,
          [submission_id, question_id]
        )

        const user_idData = await db.query(
          `SELECT \`user_id\` FROM \`form\` WHERE id = ?`,
          [form_id]
        )

        const fileSize = parsedValue[0].fileSize
        const uploadName = parsedValue[0].uploadName
        const user_id = user_idData[0].user_id
        const entry_id = entry_idData[0].id

        await db.query(
          `INSERT INTO \`storage_usage\`
            (user_id, form_id, submission_id, entry_id, upload_name, size, created_at)
          VALUES
            (?, ?, ?, ?, ?, ?, NOW())`,
          [user_id, form_id, submission_id, entry_id, uploadName, fileSize]
        )
      }
    }
    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/thankyou.css')
    )

    let tyPageTitle = 'Thank you!'

    let tyPageText = ''
    if (isEnvironmentVariableSet.sendgridApiKey) {
      tyPageText =
        'Your submission has been successful and we informed the form owner about it.'
    } else {
      tyPageText = 'Your submission has been successful.'
    }

    let sendEmailTo = false
    const integrations = form.props.integrations || []
    const emailIntegration = integrations.filter(
      (integration) => integration.type === 'email'
    )

    const tyTitleIntegration = integrations.filter(
      (integration) => integration.type === 'tyPageTitle'
    )

    if (
      tyTitleIntegration.length > 0 &&
      tyTitleIntegration[0].value.length > 0
    ) {
      tyPageTitle = tyTitleIntegration[0].value
    }

    const tyTextIntegration = integrations.filter(
      (integration) => integration.type === 'tyPageText'
    )

    if (tyTextIntegration.length > 0 && tyTextIntegration[0].value.length > 0) {
      tyPageText = tyTextIntegration[0].value
    }

    res.render('submit-success.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      tyTitle: tyPageTitle,
      tyText: tyPageText
    })

    if (emailIntegration.length > 0) {
      sendEmailTo = emailIntegration[0].to
    }

    if (
      sendEmailTo !== false &&
      sendEmailTo !== undefined &&
      sendEmailTo !== '' &&
      isEnvironmentVariableSet.sendgridApiKey !== false
    ) {
      const FRONTEND =
        FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST
      const htmlBody = await ejs
        .renderFile(path.join(__dirname, '../views/submitemailhtml.tpl.ejs'), {
          FRONTEND: FRONTEND,
          FormTitle: form.title,
          Form: form,
          FormattedInput: formattedInput,
          Submission_id: submission_id,
          Email: sendEmailTo
        })
        .catch((err) => {
          console.log('can not render html body', err)
        })

      const textBody = await ejs
        .renderFile(path.join(__dirname, '../views/submitemailtext.tpl.ejs'), {
          FRONTEND: FRONTEND,
          FormTitle: form.title,
          Form: form,
          FormattedInput: formattedInput,
          Submission_id: submission_id,
          Email: sendEmailTo
        })
        .catch((err) => {
          console.log('can not render text body', err)
        })

      const msg = {
        to: sendEmailTo,
        from: 'submission-notifications-noreply@api.formpress.org',
        subject: 'New submission has been received',
        text: textBody,
        html: htmlBody
      }

      try {
        console.log('sending email ', msg)
        sgMail.send(msg)
      } catch (e) {
        console.log('Error while sending email ', e)
      }
    }

    //add submission_usage
    if (version !== 0) {
      const dateObj = new Date()
      const month = dateObj.getUTCMonth() + 1 //months from 1-12
      const year = dateObj.getUTCFullYear()
      const yearMonth = year + '-' + month
      const formOwnerResult = await db.query(
        `SELECT \`user_id\` FROM \`form_published\` WHERE form_id = ? AND version = ?`,
        [form_id, version]
      )
      const formOwner = formOwnerResult[0].user_id
      const checkUsageResult = await db.query(
        `
        SELECT * FROM \`submission_usage\` WHERE user_id = ? AND date = ?`,
        [formOwner, yearMonth]
      )

      if (checkUsageResult.length === 0) {
        await db.query(
          `
          INSERT INTO \`submission_usage\`
            (user_id, date, count)
          VALUES
            (?,?,1)
          `,
          [formOwner, yearMonth]
        )
      } else {
        await db.query(
          `
        UPDATE \`submission_usage\` SET count = count + 1 WHERE user_id = ? AND date = ?
        `,
          [formOwner, yearMonth]
        )
      }
    }
  })
}
