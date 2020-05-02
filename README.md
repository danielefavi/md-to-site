Markdown to Site
================

**Markdown to Site** is a NPM package that converts a folder containing markdown files to a static website.

It automatically creates the **menu**, **search engine** and the **table of contents**. If there are **subfolders** with markdown files it will create the **submenus** accordingly.

# Demo

On the link below you can find an example of website generated with **md-to-site**:  
[https://danielefavi.github.io/md-to-site/](https://danielefavi.github.io/md-to-site/)

[![Example Screenshot](https://danielefavi.github.io/md-to-site/images/md-to-site_screenshot_example.png)](https://danielefavi.github.io/md-to-site/)

# Installation

```
npm install -g md-to-site
```

# How to convert markdown files to a website

Run the command below in the directory that contains your markdown files:

```
md-to-site -b
```

It creates a new folder called `build` that will contains the HTML website.

Optionally, you can specify a source folder and/or a target folder:

```
md-to-site -b --source ~/Desktop/markdown --target ~/Desktop/docs_site
```

For more information please type `md-to-site -h` for the help.

# Links

- **NPM package**: [https://www.npmjs.com/package/md-to-site](https://www.npmjs.com/package/md-to-site)# List of parameters
- **Github Repo**: [https://github.com/danielefavi/md-to-site/](https://github.com/danielefavi/md-to-site/)
- **Demo**: [https://danielefavi.github.io/md-to-site/](https://danielefavi.github.io/md-to-site/)

```
-b, --build         Builds the website from the markdown code.
--site-title        Title of the website: it will appear on the title tag and
                    on top of the menu; default is "Docs".
-h, --help          Print the help.
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
```

---

### Notes

If you have images or other assets in your markdown folder, then you have to transfer them manually into the folder where you compiled the files.  
The author of this package did not want to copy other asset files automatically because you might not want to copy personal files.
