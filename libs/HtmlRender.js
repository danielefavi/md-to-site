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

            // creating the table of contents
            entry.tableOfContents = this.createTableOfContents(tokens);

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
     * Create the HTML code for the table of contents.
     *
     * @param  {Array} tokens       elements from the markdown parser.
     * @return {String}             the HTML of the table of contents.
     */
    createTableOfContents(tokens) {
        var html = '';
        const Slugger = marked.Slugger;
        var slugger = new Slugger();
        var counter = 0;

        for (var t of tokens) {
            // getting only the H1, H2, H3
            if (t.type == 'heading' && t.depth >= 1 && t.depth <= 6) {
                var tocText = striptags(marked(t.text));

                var depth = !counter ? 1 : t.depth;

                // extracting the ID of the title from the text
                var id = slugger.slug(tocText.replace('&lt;', '').replace('&gt;', ''));
                html += `<li class="toc-depth-${depth}"><a href="#${id}">${tocText}</a></li>`;

                counter++;
            }
        }

        if (html.length) return '<ul class="table-of-contents">' + html + '</ul>';

        return '';
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
     * @TODO: this funciton is out of scope. Move from here
     *
     * @param  {String} target              target folder
     * @param  {String} [theme='github']    theme
     * @return {void}
     */
    copyAssetsToDestinationDir(target, theme='github') {
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
     * Return the HTML of the side menu.
     *
     * @param  {Array}  docs                      list of all the doc files
     * @param  {String} [activeEntryFtitle=null]  determine wich entry in the menu is active
     * @param  {String} [siteTile='Docs']         title that will appear on the menu header and the title tag
     * @return {String}
     */
    getMenu(docs, activeEntryFtitle=null, siteTile='Docs') {
        var prevDoc = null;


        var html = `
            <nav class="sidebar collapse animate-left" id="menuSidebar">
                <div class="text-right">
                    <a href="javascript:void(0)" onclick="closeSidebarMenu()" class="close-menu hide-large">
                        <img src="css/images/close-black.svg" alt="">
                    </a>
                </div>`;
                for (var doc of docs) {
                    // adding the submenu title only when the parent menu title changes
                    if (prevDoc && prevDoc.parentMenuTitle != doc.parentMenuTitle) {
                        var indentClassParent = doc.indent > 0 ? 'submenu-item depth-' + doc.indent : '';
                        html += `<h4 class="submenu-title ${indentClassParent}">${doc.parentMenuTitle}</h4>`;
                    }

                    // class for indenting the menu entries for sub folders
                    var indentClass = doc.indent > 0 ? 'submenu-item depth-' + doc.indent : '';

                    var entryClass = doc.fullTitle == activeEntryFtitle ? 'active' : '';
                    html += `<a href="${doc.htmlFileName}" class="menu-item ${entryClass} ${indentClass}">${doc.title}</a>`;

                    var prevDoc = doc;
                }
                html += `
            </nav>
        `;

        return html;
    }

    /**
     * Return the full HTML page for a doc file.
     *
     * @param  {Array}  docs                    list of all the doc files
     * @param  {Object} currentDoc              doc file that is going to be compiled to HTML
     * @param  {String} [siteTile='Docs']       title that will appear on the menu header and the title tag
     * @return {String}
     */
    getHtmlPage(docs, currentDoc, siteTile='Docs')
    {
        var html = `<!DOCTYPE html>
        <html lang="en" dir="ltr">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="css/style.css">
                <title>${siteTile} | ${currentDoc.title}</title>
            </head>
            <body>
                <header>
                    <a class="push-right hide-large menu-btn" href="javascript:void(0)" onclick="openSidebarMenu()"><img src="css/images/menu-white.svg" alt=""></a>
                    <div class="search-container">
                        <input type="text" id="search-text" name="search-text" placeholder="Search" class="search-text">
                        <button class="search-btn" onclick="javascript:search()">
                            <img src="css/images/search-black.svg" alt="">
                        </button>
                    </div>
                    <a href="index.html" class="site-title">${siteTile}</a>
                </header>

                `+ this.getMenu(docs, currentDoc.fullTitle, siteTile) +`
                <div class="main-content">
                    <div class="markdown-body" id="markdown-body">
                        `+ currentDoc.html +`
                    </div>
                    <div class="search-result-container" id="search-result-container">
                        <h2 class="push-left">
                            Search result for <i id="strToSearch"></i><br>
                            <small>Total found: <span id="totFound"></span></small>
                        </h2>
                        <button class="close" onclick="closeSearchResult()">Close</button>
                        <div class="clear"></div>

                        <div id="search-result"></div>
                    </div>`;
                    if (currentDoc.tableOfContents && currentDoc.tableOfContents.length) {
                        html += `<div class="toc-container" id="toc">`+ currentDoc.tableOfContents +`</div>`;
                    }
                    html += `
                </div>
                <div class="overlay hide-large" onclick="closeSidebarMenu()" id="overlayLayer"></div>

                <script src="js/jquery.js"></script>
                <script src="js/scripts.js"></script>
                <script src="js/searchIndex.js"></script>
            </body>
        </html>`;

        return html;
    }

}



module.exports = HtmlRender;
