#!/usr/bin/env node


const Utils = require('./libs/Utils');


// show the help
if (process.argv[2] == '-h' || process.argv[2] == '--help') {
    const help = require('./controllers/Utilities').help;

    return help();
}



// display the version
if (process.argv[2] == '-v' || process.argv[2] == '--version') {
    const version = require('./controllers/Utilities').version;

    return version();
}



// compile the markdown files to HTML
if (process.argv[2] == '-b' || process.argv[2] == '--build') {
    const build = require('./controllers/DocsGenerator').build;

    return build(process.argv);

    // @TODO: proper error handling
    // try {
    //     return build(process.argv);
    // } catch (e) {
    //     console.error(e);
    //     return null;
    // }
}



// fallback message
console.log(`
NOTHING WAS EXECUTE. Plese run --help to read the documentation`);
