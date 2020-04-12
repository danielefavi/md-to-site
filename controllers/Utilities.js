/**
 * @file
 * Collection of generic funcitons.
 */

 const Utils = require('../libs/Utils');

 /**
  * Show the version of the package.
  *
  * @return {void}
  */
function version() {
    const version = require('../package.json').version;

    return console.log(`
MD-DOCS version: ${version}`);
}

/**
 * Show the help.
 *
 * @return {void}
 */
function help() {
    var themeList = '"'+ Utils.getThemes().join('", "') +'"';

    return console.log(`
MD-DOCS Helps

node mddocs [options]

-b, --build         Build the website from the markdown code
--site-title        Title of the site that will appear on the title tag and
                    on top of the menu; default is "Docs".
-h, --help          Print the help.
--index             File name that will be set as index.html
--source            Directory of the source folder containing the markdown
                    files; the default is the folder where the command is run.
--target            Directory where the compiled HTML are going to be stored;
                    the default directory is ./build
-v, --version       Print the version.

NOTE: if the arguments --site-title, --index, --source or --target contains
spaces then wrap the string in quotes. EG: --site-title "My Docs Title"

EXAMPLE:
$ md-to-site -b --index my_doc_file.md --source "/home/user/Desktop/doc files" --target "/home/user/Desktop/static_docs" --site-title "My Docs Title"
`);
}


module.exports = { help, version };
