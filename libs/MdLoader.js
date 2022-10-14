const fs = require("fs");
const util = require("util");

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
        return fs.readFileSync(filePath, "utf8");
    }

    /**
     * Read the markdown file contents and give back an array of object with
     * all the information of the related markdown file.
     *
     * @param  {String} dir     directory name to read
     * @return {Promise}
     */
    getMdFiles(
        dir,
        parentDir = null,
        indent = 0,
        excludeRegex = null,
        includeRegex = null,
        parent,
        graph
    ) {
        return new Promise((resolve, reject) => {
            // reading the directory
            fs.readdir(dir, async (err, files) => {
                if (err) return reject(err);
                // looping the files in the directory
                for (var file of files) {
                    var path = parentDir ? `${dir}/${file}` : `${dir}${file}`;
                    // console.log(path)
                    if (fs.lstatSync(path).isDirectory()) {
                        if (excludeRegex && path.match(excludeRegex)) {
                            continue;
                        } else if (includeRegex && !path.match(includeRegex)) {
                            continue;
                        } else {
                            // if the path is a directory then it will scan all the file contained in that directory
                            try {
                                var isMD = false;
                                var name = file;
                                var md = undefined;
                                var current = new Node(
                                    path.replace(graph.getRoot().id, ""),
                                    parent,
                                    new Data(
                                        path,
                                        file,
                                        name,
                                        parentDir,
                                        indent
                                    )
                                );
                                parent.addChild(current);
                                var nodes = await this.getMdFiles(
                                    path,
                                    file,
                                    indent + 1,
                                    excludeRegex,
                                    includeRegex,
                                    current,
                                    graph
                                );
                                current.addChildren(nodes);
                                graph.addNode(current);
                            } catch (e) {
                                return reject(e);
                            }
                        }
                    } else if (
                        file.substring(file.length - 3).toLowerCase() == ".md"
                    ) {
                        // scanning the markdown file
                        var name = file.substring(0, file.length - 3); // removing the .md extention
                        var md = this.getFileContent(path); // getting the content of the file
                        var isMD = true;
                        var newNode = new Node(
                            path.replace(graph.getRoot().id, ""),
                            parent,
                            new Data(
                                path,
                                file,
                                name,
                                parentDir,
                                indent,
                                this.getFileContent(path),
                                true
                            ),
                            true
                        );
                        parent.addChild(newNode);
                        graph.addNode(newNode);
                    }
                }

                // console.log(node);

                resolve([]);
            });
        });
    }
}

class Graph {
    constructor(root) {
        this.nodes = [];
        this.root = new Node(root, null, {}, false);
    }

    addNode(node) {
        this.nodes.push(node);
    }

    getRoot() {
        return this.root;
    }

    removeNode(node) {
        this.nodes = this.nodes.filter((n) => n.id !== node.id);
    }

    filterNonLeafNodes(node = null, depth = 0) {
        if (node) {
            if (node.children.length > 0) {
                for (var child of node.children) {
                    node.setLeaf(this.filterNonLeafNodes(child, depth + 1));
                }
                return node.leaf;
            } else {
                return node.leaf;
            }
        }
        return this.filterNonLeafNodes(this.root, depth + 1);
    }

    cleanNonLeafNodes() {
        this.nodes = this.nodes.filter((n) => n.leaf);
    }

    getNodes(node = null) {
        if (node) {
            if (node.leaf){
                var nodes = node == this.root ? [] : [node];
                for (var child of node.children) {
                    nodes = nodes.concat(this.getNodes(child));
                }
                return nodes;
            }
            return [];
        }
        return this.getNodes(this.root);
    }

}

class Node {
    constructor(id, parent = null, data, leaf = false) {
        this.id = id.toLowerCase();
        this.parent = parent;
        this.data = data;
        this.children = [];
        this.leaf = leaf;
    }

    getChildren() {
        return this.children;
    }

    addChild(child) {
        this.children.push(child);
        this.sortChildren();
    }

    addChildren(children) {
        this.children = this.children.concat(children);
        this.sortChildren();
    }

    sortChildren() {
        this.children.sort((a, b) => {
            if (a.data.isMD && !b.data.isMD) return -1;
            if (b.data.isMD && !a.data.isMD) return 1;
            if (b.data.isMD && a.data.isMD) return a.id == b.id ? 0 : a.id < b.id ? -1 : 0;
            return a.id == b.id ? 0 : a.id < b.id ? -1 : 1;
        });
    }

    removeChild(child) {
        this.children = this.children.filter((c) => c.id != child.id);
    }

    setLeaf(value) {
        this.leaf ||= value;
    }

    [require("util").inspect.custom](depth, opts) {
        if (this.parent) {
            return (
                "{ Node: " +
                this.id +
                ", leaf: " +
                this.leaf +
                ", parent: " +
                this.parent.id +
                ", children " +
                this.children.length +
                " }"
            );
        } else {
            return "{ Node: " + this.id + " }";
        }
    }
}

module.exports = { MdLoader, Node, Graph };

class Data {
    constructor(path, file, name, parentDir, indent, md = "", isMD = false) {
        this.path = path;
        this.file = file;
        this.name = name;
        this.md = md;
        this.parentDir = parentDir;
        this.indent = indent;
        this.isMD = isMD;
        this.pathPieces = path.split("/");
    }
}
