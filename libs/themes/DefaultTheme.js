class DefaultTheme {

    /**
     * Return the full HTML page for a doc file.
     *
     * @param  {Array}  docs                    list of all the doc files
     * @param  {Object} currentDoc              doc file that is going to be compiled to HTML
     * @param  {Object} [settings={}]           general site settings (like title)
     * @return {String}
     */
    getHtmlPage(docs, currentDoc, settings={})
    {
        var siteTile = settings.title || 'Docs';
        var search = settings.hide && settings.hide.includes('search') ? false : true;
        var toc = settings.hide && settings.hide.includes('toc') ? false : true;

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
                    <a class="push-right hide-large menu-btn" href="javascript:void(0)" onclick="openSidebarMenu()"><img src="css/images/menu-white.svg" alt=""></a>`;

                    if (search) html += this.getSearchBarHtml();

                    html += `
                    <a href="index.html" class="site-title">${siteTile}</a>
                </header>

                `+ this.getMenu(docs, currentDoc.fullTitle, siteTile) +`
                <div class="main-content">
                    <div class="markdown-body" id="markdown-body">
                        `+ currentDoc.html +`
                    </div>`;

                    if (search) html += this.getSearchBoxResultHtml();
                    if (toc) html += this.getToc(currentDoc);

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

    /**
     * Return the HTML of the search input.
     *
     * @return {String}
     */
    getSearchBarHtml() {
        return `
            <div class="search-container">
                <input type="text" id="search-text" name="search-text" placeholder="Search" class="search-text">
                <button class="search-btn" onclick="javascript:search()">
                    <img src="css/images/search-black.svg" alt="">
                </button>
            </div>
        `;
    }

    /**
     * Return the HTML where the search result will be displayed.
     *
     * @return {String}
     */
    getSearchBoxResultHtml() {
        return `
            <div class="search-result-container" id="search-result-container">
                <h2 class="push-left">
                    Search result for <i id="strToSearch"></i><br>
                    <small>Total found: <span id="totFound"></span></small>
                </h2>
                <button class="close" onclick="closeSearchResult()">Close</button>
                <div class="clear"></div>

                <div id="search-result"></div>
            </div>
        `;
    }

    /**
     * Return HTML for the table of content.
     *
     * @param  {Object} doc     the document on which the toc has to be generated
     * @return {String}
     */
    getToc(doc) {
        var html = '';

        if (doc.tableOfContents && doc.tableOfContents.length) {
            html += `<div class="toc-container" id="toc"><ul class="table-of-contents">`;

            for (var tocEntry of doc.tableOfContents) {
                html += `<li class="toc-depth-${tocEntry.depth}"><a href="#${tocEntry.id}">${tocEntry.text}</a></li>`;
            }

            html += `</ul></div>`;
        }

        return html;
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
                // console.log("---------------------");
                for (var doc of docs) {
                    // adding the submenu title only when the parent menu title changes
                    if (!doc.isMD) {
                        // console.log(doc);
                        // if (prevDoc && prevDoc.parentMenuTitle != doc.parentMenuTitle) {
                            var indentClassParent = doc.indent > 0 ? 'submenu-item depth-' + doc.indent : '';
                            html += `<h4 class="submenu-title ${indentClassParent}">${doc.title}</h4>`;
                        // }
                    } else {
                        // class for indenting the menu entries for sub folders
                        var indentClass = doc.indent > 0 ? 'submenu-item depth-' + doc.indent : '';
    
                        var entryClass = doc.fullTitle == activeEntryFtitle ? 'active' : '';
                        html += `<div><a href="${doc.htmlFileName}" class="menu-item ${entryClass} ${indentClass}">${doc.title}</a></div>`;
    
                        var prevDoc = doc;
                    }
                }
                html += `
                <div class="filler"></div>
            </nav>
        `;

        return html;
    }

}

module.exports = DefaultTheme;
