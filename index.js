const packageJson = require('./package.json')
let config = null
const projectPlaceholder = 'PROJECT_ID'
const thisPackageVersion = packageJson.version

export function configure(opts) {
  if (!opts.projectId) {
    throw new Error(`You must supply the "projectId"`)
  }
  if (!opts.key) {
    throw new Error(`You must supply an API key: the "key" attribute`)
  }
  config = Object.assign(
    {
      baseUrl: `https://clouderrorreporting.googleapis.com/v1beta1/projects/${projectPlaceholder}/events:report`,
      enabled: true,
      // same key names as the official NodeJS client from here on
      projectId: 'my-project-id',
      key: '{your api key}',
      // serviceContext: { // optional
      //   service: 'my-service',
      //   version: 'my-service-version',
      // },
    },
    opts,
  )
}

export function report({
  message,
  user,
  // Example reportLocation:
  // {
  //  filePath: '/fake.js',
  //  lineNumber: 1,
  //  functionName: 'synthetic()',
  // }
  reportLocation,
  eventTime,
  httpRequestMethod,
  httpRequestUrl,
  httpRequestUserAgent,
  httpRequestReferrer,
  httpRequestResponseStatusCode,
  httpRequestRemoteIp,
}) {
  if (!config) {
    throw new Error('Not configured, you must call configure() first')
  }
  if (!config.enabled) {
    return
  }
  const url =
    config.baseUrl.replace(projectPlaceholder, config.projectId) +
    '?key=' +
    config.key
  const httpRequest = (() => {
    const result = {
      httpRequestMethod,
      httpRequestUrl,
      httpRequestUserAgent,
      httpRequestReferrer,
      httpRequestResponseStatusCode,
      httpRequestRemoteIp,
    }
    if (!Object.keys(result).length) {
      return undefined
    }
    return result
  })()
  const processedMsg = (() => {
    // The API mandates that we provide a location either via reportLocation or
    // by a stacktrace in the message. The latter is recommended because you
    // get a nicer display in the UI for really long messages. To make it easy,
    // we'll append a fake stack trace to trigger the better display.
    if (reportLocation) {
      return message
    }
    const fakeStacktrace = 'at Object.<anonymous> (/fake.js:13)'
    return `${message}\n${fakeStacktrace}`
  })()
  const body = JSON.stringify({
    eventTime: eventTime || new Date().toISOString(),
    serviceContext: config.serviceContext,
    message: processedMsg,
    context: {
      httpRequest,
      user: user,
      reportLocation,
    },
  })
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': `https://github.com/ternandsparrow/stackdriver-error-reporting-clientside-js-client#${thisPackageVersion}`,
      'x-goog-api-client': `https://github.com/ternandsparrow/stackdriver-error-reporting-clientside-js-client#${thisPackageVersion}`,
    },
    body,
  })
}
