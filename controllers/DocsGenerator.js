/**
 * @file
 * It contains the functions to build the static website from
 * a folder containing the markdown files.
 */

const Utils = require('../libs/Utils');
const MdLoader = require('../libs/MdLoader');
const HtmlRender = require('../libs/HtmlRender');


/**
 * Holds the keywords for building the searching index.
 * @type {Array}
 */
var searchIndex = [];



/**
 * Compile the markdown files to HTML.
 *
 * @param {Object} argv     list of arguments coming from process.argv
 * @returns {void}
 */
function build(argv) {
    try {
        var params = validateArguments(argv);
    } catch (e) {
        Utils.logErrorToConsole(e);
        return;
    }

    const mdLoader = new MdLoader;
    const htmlRender = new HtmlRender;

    // loading the markdown files information from the source directory
    mdLoader.getMdFiles(params.sourceDir)
        .then(arr => {
            if (!arr.length) {
                throw(`The source folder "${params.sourceDir}" has no markdown files.`);
            }

            // add to the array of markdown file the HTML translation, page title and html filename
            var docs = htmlRender.appendHtmlInfoToMdDocs(arr, params.indexFile);

            // sort the array by parent dir name and full title
            docs.sort((a, b) => (a.fullTitle.toLowerCase() > b.fullTitle.toLowerCase()) ? 1 : -1);

            // creating the target directory if it does not exist
            Utils.createDirIfNotExists(params.targetDir);

            // copy the assets (CSS files) to the target directory
            htmlRender.copyAssetsToDestinationDir(params.targetDir);

            // looping the DOCS
            for (var doc of docs) {
                // if the search is hidden then it exludes building the search index
                if (!params.hide || !params.hide.includes('search')) appendToSearchIndex(doc);

                // getting the HTML of the page
                var html = htmlRender.getHtmlPage(docs, doc, 'default', {
                    title: params.siteTitle,
                    hide: params.hide,
                });

                // writing the HTML page content to the target file
                Utils.writeFileSync(params.targetDir + doc.htmlFileName, html);

                // if the current doc in the loop is signed as index then the HTML
                // content will be placed in the index as well
                if (doc.isIndex) {
                    Utils.writeFileSync(params.targetDir + 'index.html', html);
                }

                console.log('The file "' + doc.file + '" has been compiled.');
            }

            createIndexSearchFile(params.targetDir);

            console.log('The docs are been compile successfully');
        })
        .catch(e => Utils.logErrorToConsole(e));
}

/**
 * Creates the JS file that index the data for the search.
 *
 * @param {Object} params     directory where to store the file
 * @returns void
 */
function createIndexSearchFile(targetDir) {
    var js = `\nvar searchIndex = [];\n`;

    for (var i=0; i<searchIndex.length; i++) {
        var file = searchIndex[i].file.replace(/'/g, "\\'"); // escaping the single quote
        var title = searchIndex[i].title.replace(/'/g, "\\'"); // escaping the single quote
        js += `searchIndex[${i}]={f:'${file}',t:'${title}',c:[`;

        var strSearches = '';
        if (searchIndex[i].searches.length) {
            for (var search of searchIndex[i].searches) {
                strSearches += `'`+ search.replace(/'/g, "\\'") +`',`
            }
        }
        js += strSearches + `]};\n`;
    }

    Utils.writeFileSync(targetDir + 'js/searchIndex.js', js);
}

/**
 * Append to the searchIndex variable the elements to index for the search
 * related to the given doc.
 *
 * @param {Object} doc     the document to index for the search
 * @returns void
 */
function appendToSearchIndex(doc) {
    if (doc && doc.searchIndex && doc.searchIndex.length) {
        var searches = [];

        for (var text of doc.searchIndex) {
            if (text) searches.push(text);
        }

        searchIndex.push({
            file: doc.htmlFileName,
            title: doc.title || '',
            searches
        });
    }
}

/**
 * Validate the data coming from the command.
 *
 * @param {Object} argv     list of arguments coming from process.argv
 * @returns {Object}        data validated
 */
function  validateArguments(argv) {
    // setting the default arguments
    var retArgs = {
        sourceDir: './',
        targetDir: './build',
        indexFile: null,
        siteTitle: 'Docs',
        hide: null,
    };

    // map of the variable with the argument key
    var keyArgMap = {
        siteTitle: 'site-title',
        indexFile: 'index',
        sourceDir: 'source',
        targetDir: 'target',
        hide: 'hide',
    };

    for (var key in keyArgMap) {
        var indexArg = argv.indexOf(`--${keyArgMap[key]}`);

        if (indexArg && indexArg > 1) {
            // VALIDATION ERROR: the value of the argument is missing
            if (!argv[indexArg + 1] || (argv[indexArg + 1] && !argv[indexArg + 1].length)) {
                throw(`The value for the argument --${searchArg} is not provided.`);
            }

            retArgs[key] = argv[indexArg + 1];
        }
    }

    if (retArgs.hide) {
        retArgs.hide = retArgs.hide.split(',');

        for(var hideElem of retArgs.hide) {
            if (!Utils.getHideItems().includes(hideElem)) {
                throw(`The argument "${hideElem}" of the parameter --hide is not valid. The values allowed are: ` + Utils.getHideItems().join(','));
            }
        }
    }

    retArgs.sourceDir = Utils.sanitizePath(retArgs.sourceDir);
    retArgs.targetDir = Utils.sanitizePath(retArgs.targetDir);

    return retArgs;
}


module.exports = { build };
