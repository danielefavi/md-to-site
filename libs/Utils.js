const fs = require('fs');
var path = require('path');


/**
 * @class utility class
 */
class Utils {

    /**
     * Format and log to the console an exception.
     *
     * @param {Object} e      the error thrown by the exception
     * @return {void}
     */
    static logErrorToConsole(e) {
        var msgHeader = `\nMD-TO-SITE exception`;

        if (e.code == 'EACCES') {
            msgHeader += `: ACCESS ERROR`;
        } else if (e.code == 'ENOENT') {
            msgHeader += `: FOLDER ERROR`;
        } else if (e.code == 'ENOTDIR') {
            msgHeader += `: FOLDER ERROR`;
        }

        console.error(msgHeader);
        console.error(e.message || e);
    }

    /**
     * Return the items that can be hidden from the final layout.
     *
     * @return {Array}
     */
    static getHideItems() {
        return [
            'search',
            'toc',
        ];
    }

    /**
     * Transform a string to camel letters.
     * EG: "this is a test string" --> "This Is A Test String"
     *
     * @param  {String} str
     * @return {String}
     */
    static camelize(str) {
        if (!str) return '';

        return str.toLowerCase()
                  .replace(/[_,-]/g, ' ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
                  .replace(/  +/g, ' ');
    }

    /**
     * Create a directory if it does not exist.
     * @param  {String} dirPath     path of the directory
     * @return {void}
     */
    static createDirIfNotExists(dirPath) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    /**
     * Write the fiven content to file.
     *
     * @param  {String} filePath    full path of the file to write
     * @param  {String} content     content of the file
     * @return {void}
     */
    static writeFileSync(filePath, content) {
        fs.writeFileSync(filePath, content);
    }

    /**
     * Copy the files from the this package directory.
     *
     * @param  {String]} source     source file
     * @param  {String]} target     destination file
     * @return {void}
     */
    static copyFileFromPackageDir(source, target) {
        if (source.charAt(0) == '/') {
            source = source.substring(1);
        }

        fs.copyFileSync(path.resolve(__dirname, source), target);
    }

    /**
     * Delete the given file.
     *
     * @param  {String} filePath    path of the file to delete
     * @return {void}
     */
    static deleteFile(filePath) {
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            if (!e.code || (e.code && e.code != 'ENOENT')) throw e;
        }
    }

    /**
     * Check if a file exists.
     *
     * @param  {String} filePath    path of the file
     * @return {Boolean}
     */
    static fileExists(filePath) {
        return fs.existsSync(filePath);
    }

    /**
     * Check if the given path is a directory.
     *
     * @param  {String}  path       path of the element to check
     * @return {Boolean}
     */
    static isDirectory(path) {
        return fs.lstatSync(path).isDirectory();
    }

    /**
     * Check if the path of directory ends properly.
     *
     * @param  {String} path    path of the directory to sanitize
     * @return {String}
     */
    static sanitizePath(path) {
        if (path.substring(path.length-1) != '/' && path.substring(path.length-1) != '\\') {
            path += '/';
        }

        return path;
    }
}



module.exports = Utils;
