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
MD-TO-SITE version: ${version}`);
}

/**
 * Show the help.
 *
 * @return {void}
 */
function help() {
    return console.log(`
MD-TO-SITE Helps

node mddocs [options]

-b, --build         Builds the website from the markdown code.
--site-title        Title of the website: it will appear on the title tag and
                    on top of the menu; default is "Docs".
-h, --help          Print the help.
--hide              Hide the functionalities or part of the website. Insert
                    the list of items to hide comma separated. Possible
                    values: search, toc.
--include           Include only the files that match the given regex string.
--exclude           Exclude the files that match the given regex string.
--index             File name that will be set as index.html. By default is
                    README.md; if there is no README.md then it will be the
                    first occurrence.
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
