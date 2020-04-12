Markdown to Site
================

**Markdown to Site** converts a folder containing markdown files to a static website. It automatically creates the **menu**, **search engine** and the **table of contents** for each document. If there are **subfolders** with markdown files it will create the **submenus** accordingly.

Check it out the example on the link below:
[]()

# Installation

```
npm install -g md-to-site
```

# How to convert markdown files to a website

Run the command below in the directory that contains your markdown files:

```
md-to-site -b
```

It will create automatically a new folder called `build`.

Optionally, you can specify a source folder and/or a target folder.

```
md-to-site -b --source ~/Desktop/markdown --target ~/Desktop/docs_site
```

For more information please type `md-to-site -h` for the help.

# List of parameters

```
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
```
