# Troubleshooting tests

Normally tests should all pass without errors when running from the root of the project:  
`npm run test`

But when the node version is changed, it cannot find the modules that are imported using `file:../` in the `package.json` file.  
These have to be manually compiled using: `npm i the-missing-module` from the root of the module that could not be build.  
Then, each module can be tested separately by using `npm run test` from the root of the module.
