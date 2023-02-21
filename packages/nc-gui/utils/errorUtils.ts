export async function extractSdkResponseErrorMsg(e: Error & { response: any }) {
  if (!e || !e.response) return e.message
  let msg
  let errors: any[]
  if (e.response.data instanceof Blob) {
    try {
      const parsedData = JSON.parse(await e.response.data.text())
      msg = parsedData.msg
      errors = parsedData.errors
    } catch {
      msg = 'Some internal error occurred'
    }
  } else {
    msg = e.response.data.msg || e.response.data.message || 'Some internal error occurred'
    errors = e.response.data.errors
  }

  if (errors && errors.length) {
    return errors.map((e: any) => e.message).join(', ')
  }

  return msg || 'Some error occurred'
}
