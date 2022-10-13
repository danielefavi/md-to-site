const marked = require('marked');
const striptags = require('striptags');
const Utils = require('./Utils');


/**
 * @class compile the markdown contained in a folder to a static website.
 */
class HtmlRender {

    /**
     * Add to each entry of the markdown doc file information the HTML
     * translation, title and HTML filename.
     *
     * @param  {Array} mdDocs                  list of the doc files
     * @param  {String} [indexDocName=null]    filename of the index
     * @return {Array}
     */
    appendHtmlInfoToMdDocs(mdDocs, indexDocName=null, search=true) {
        var docs = this.appendGeneralInfoToDocs(mdDocs, indexDocName);

        return mdDocs.map(entry => {
            // transforming the markdown to elements to convert
            const tokens = marked.lexer(entry.md);

            // generating the table of contents
            entry.tableOfContents = this.generateTableOfContents(tokens);

            entry.searchIndex = this.searchIndexElements(tokens);

            // converting the elements to HTML
            entry.html = marked.parser(tokens);

            return entry;
        });
    }

    /**
     * It index the headings text in order to create a search file.
     *
     * @param  {Array} tokens      elements from the markdown parser.
     * @return {Array}             the indexed headings
     */
    searchIndexElements(tokens) {
        var searchIndex = [];

        for (var t of tokens) {
            if (t.type == 'heading') {
                searchIndex.push(t.text);
            }
        }

        return searchIndex;
    }

    /**
     * Generate the table of contents extracting the H1, H2 and H3 tags from
     * the dcoument.
     *
     * @param  {Array} tokens       elements from the markdown parser.
     * @return {Array}              entries of the table of content
     */
    generateTableOfContents(tokens) {
        var toc = [];
        const Slugger = marked.Slugger;
        var slugger = new Slugger();
        var counter = 0;

        for (var t of tokens) {
            // getting only the H1, H2, H3
            if (t.type == 'heading' && t.depth >= 1 && t.depth <= 6) {
                var text = striptags(marked.parse(t.text));

                var depth = !counter ? 1 : t.depth;

                // extracting the ID of the title from the text
                var id = slugger.slug(text.replace('&lt;', '').replace('&gt;', ''));

                toc.push({ depth, id, text, counter });

                counter++;
            }
        }

        return toc;
    }

    /**
     * Add to each entry of the markdown files the information like the title
     * will appear on the menu, the HTML filename, select the file that will be
     * the index and finally sort the array alphaetically by the full title.
     *
     * @param  {Array} mdDocs                  list of the doc files
     * @param  {String} [indexDocName=null]    filename of the index
     * @return {Array}
     */
    appendGeneralInfoToDocs(mdDocs, indexDocName=null) {
        var docs = mdDocs.map(entry => {
            entry.title = Utils.camelize(entry.name); // transforming the name of the file to the title menu
            entry.parentMenuTitle = Utils.camelize(entry.parentDir);
            entry.fullTitle = `${entry.parentMenuTitle} - ${entry.title}`; // full title needed for the ordering
            entry.isIndex = false;

            if (entry.parentDir && entry.parentDir.length) {
                var htmlFileName = entry.parentDir + '_' + entry.name + '.html';
            } else {
                var htmlFileName = entry.name + '.html';
            }

            entry.htmlFileName = htmlFileName;

            return entry;
        });

        return this.selectIndexPage(docs, indexDocName);
    }

    /**
     * Select which document will be the index page of the website. The priority
     * on picking up the index page is:
     * 1) Doc name from the parameter --index (coming from the command line).
     * 2) If the --index is not provided it will search for the README.md.
     * 3) If there is no --index and no README.md it will pick up the first doc in the list.
     *
     * @param  {Array} docs                list of the doc files
     * @param  {String} [indexDoc=null]    filename of the index
     * @return {Array}
     */
    selectIndexPage(docs, indexDoc=null) {
        if (!docs.length) return docs;

        var candidateIndex = 0; // setting the candidate index to the first element of the array
        if (indexDoc) indexDoc = indexDoc.toLowerCase();

        for (var i=0; i<docs.length; i++) {
            if (indexDoc && (indexDoc == docs[i].name.toLowerCase() || indexDoc == docs[i].file.toLowerCase())) {
                candidateIndex = i; // the candidate index found: the name matches with indexDoc
                break;
            } else if (!docs[i].parentDir && ('readme' == docs[i].name.toLowerCase() || 'readme.md' == docs[i].file.toLowerCase())) {
                candidateIndex = i; // found the README.md
            }
        }

        docs[candidateIndex].isIndex = true;

        return docs;
    }

    /**
     * Copy the asset files (CSS) to the target folder.
     * @TODO: this funciton is out of scope. Move from this class
     *
     * @param  {String} target              target folder
     * @return {void}
     */
    copyAssetsToDestinationDir(target) {
        Utils.createDirIfNotExists( target + 'css');
        Utils.createDirIfNotExists( target + 'css/images');
        Utils.createDirIfNotExists( target + 'js');

        Utils.deleteFile(target + 'css/style.css');
        Utils.deleteFile(target + 'css/images/menu-white.svg');
        Utils.deleteFile(target + 'css/images/close-black.svg');
        Utils.deleteFile(target + 'js/jquery.js');
        Utils.deleteFile(target + 'js/scripts.js');

        Utils.copyFileFromPackageDir('/../assets/css/style.css', target + 'css/style.css');
        Utils.copyFileFromPackageDir('/../assets/css/images/menu-white.svg', target + 'css/images/menu-white.svg');
        Utils.copyFileFromPackageDir('/../assets/css/images/close-black.svg', target + 'css/images/close-black.svg');
        Utils.copyFileFromPackageDir('/../assets/css/images/search-black.svg', target + 'css/images/search-black.svg');
        Utils.copyFileFromPackageDir('/../assets/js/jquery-3.4.1.min.js', target + 'js/jquery.js');
        Utils.copyFileFromPackageDir('/../assets/js/scripts.js', target + 'js/scripts.js');
    }

    /**
     * Get the HTML for the given document (currentDoc parameter).
     * This function first selects the theme chosen fromt the user from the folder
     * libs/themes and then it reders the HTML.
     *
     * @param  {[type]} docs                list of all the documents (for building the menu)
     * @param  {[type]} currentDoc          document to be rendered to HMTL
     * @param  {String} [theme='default']   theme selected from the folder libs/themes
     * @param  {Object} [settings={}]       settings (like exluding the search or the toc)
     * @return {String}
     */
    getHtmlPage(docs, currentDoc, theme='default', settings={}) {
        if (theme == 'default') theme = 'DefaultTheme';

        const ThemeClass = require('./themes/' + theme);
        var themeInst = new ThemeClass;

        return themeInst.getHtmlPage(docs, currentDoc, settings);
    }

}



module.exports = HtmlRender;
