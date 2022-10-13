const fs = require('fs');


/**
 * @class Markdown file loader: get all the information of the markdown
 * files contained in the source folder (if the source is not provided will
 * be the folder where the command has been executed).
 */
class MdLoader {

    /**
     * Read the content of the given file.
     *
     * @param  {String} filePath    path of the file to read
     * @return {String}             content of the file
     */
    getFileContent(filePath) {
        return fs.readFileSync(filePath, 'utf8');
    }

    /**
     * Read the markdown file contents and give back an array of object with
     * all the information of the related markdown file.
     *
     * @param  {String} dir     directory name to read
     * @return {Promise}
     */
    getMdFiles(dir, parentDir=null, indent=0, excludeRegex=null, includeRegex=null) {
        return new Promise((resolve, reject) => {
            // reading the directory
            fs.readdir(dir, async (err, files) => {
                if (err) return reject(err);

                var mdFiles = [];

                // looping the files in the directory
                for (var file of files) {
                    var path = parentDir ? `${dir}/${file}` : `${dir}${file}`;
                    console.log(path)
                    if (fs.lstatSync(path).isDirectory()) {
                        if(excludeRegex && path.match(excludeRegex)){
                            continue;
                        } else if (includeRegex && !path.match(includeRegex)){
                            continue;
                        } else {
                            // if the path is a directory then it will scan all the file contained in that directory
                            try {
                                var subMdFiles = await this.getMdFiles(path, file, indent+1, excludeRegex, includeRegex);
                            } catch (e) {
                                return reject(e);
                            }
                        }

                        mdFiles = [ ...mdFiles, ...subMdFiles ];
                    } else if (file.substring(file.length-3).toLowerCase() == '.md') {
                        // scanning the markdown file
                        var name = file.substring(0, file.length-3); // removing the .md extention
                        var md = this.getFileContent(path); // getting the content of the file

                        mdFiles.push({ path, file, name, md, parentDir, indent });
                    }
                }

                return resolve(mdFiles);
            });
        });
    }

}

module.exports = MdLoader;
