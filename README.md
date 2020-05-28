> Unofficial client for Google Cloud's Stackdriver Error Reporting that will
> run from client-side JS.

The [official NodeJS
client](https://github.com/googleapis/nodejs-error-reporting) doesn't run in a
client-side JS context (a browser). That's ok, the whole Stackdriver Error
Reporting is geared towards server-side. But they expose a HTTP API and if you
want to send error reports from your PWAs, this is the way to do it.

The use case this library solves for us is we can send a larger payload than is
allowed via other bug reporting services, like Sentry.io. It's useful for
dumping the local state of complex PWAs to aid in remote troubleshooting.

**Warning**: this is being used in production but it's pretty minimally
featured. No point gold plating something that never gets used but if more
people in the community need this, we can all put the effort into making it
nicer to use.

# How to use
  1. install
      ```bash
      yarn add 'https://github.com/ternandsparrow/stackdriver-error-reporting-clientside-js-client#v0.1.0'
      ```
  1. import
      ```javascript
      import * as gcpError from 'stackdriver-error-reporting-clientside-js-client'
      ```
  1. configure the library, you only need to do this once but subsequent calls
     will override previous ones. At a minimum, you must provide a Google Cloud
     API key that has access to call the "Stackdriver Error Reporting API"
     (AKA `clouderrorreporting.googleapis.com`) and your project ID (grab it
     from the URL in the web console)
      ```javascript
      gcpError.configure({
        projectId: 'some-project-id', // required
        key: 'AIbaSaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // required
        // enabled: true, // default true, easily disable this in some circumstances
        // serviceContext: { // optional, add more context
        //   service: 'my-awesome-pwa.dev',
        //   version: '9b9484d',
        // },
      })
      ```
  1. log a simple error
      ```javascript
      await gcpError.report({
        message: 'some message',
      })
      ```
  1. get more advanced with error logging by using the optional params
      ```javascript
      await gcpError.report({
        message: {blah: 'objects are fine too, they will be stringified'},
        user: 'admin@localhost',
        reportLocation: {
         filePath: '/some/file.js',
         lineNumber: 123,
         functionName: 'synthetic()',
        },
        eventTime: new Date().toISOString(),
        httpRequestMethod: 'POST',
        httpRequestUrl: 'https://example.com/blah',
        httpRequestUserAgent: 'some-agent/1.0',
        httpRequestReferrer: 'https://locahost',
        httpRequestResponseStatusCode: 500,
        httpRequestRemoteIp: '11.22.33.44',
      })
      ```
  1. read the code more details. It's almmost shorter than this README.
