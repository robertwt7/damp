# DAMP

DAMP is a [MAMP](https://www.mamp.info/)-like development environment powered by [Docker](https://www.docker.com/). 
More specifically DAMP is a CLI that wraps Docker commands to make it easy to setup and run development sites
on your local machine (ala [Vagrant](https://www.vagrantup.com/)).

## Prerequisites

To be able to use DAMP you must have the following installed on your system:

* [Node.js](https://nodejs.org/)
* [Docker Toolbox](https://www.docker.com/docker-toolbox)

## Install

Installation is a simple as running:

```
npm install -g damp-cli
```

## Usage

The first time you run DAMP it will setup and configure the Docker machine for you so all you need to do is run:

```
damp up
```

and you will have a working Docker environment setup already. Once `damp up` has finished you can test
that it works by visiting [http://damp.dev](http://damp.dev). DAMP also comes with phpMyAdmin
pre-installed at [http://phpmyadmin.damp.dev](http://phpmyadmin.damp.dev).

You can control the virtual machine using other damp commands such as `status`, `halt`, `destroy` etc. For more
information on available commands run `damp --help`.

## Sites

To create a site using DAMP you simply need to run:

```
damp create-site
```

You will be asked to give the site a name (used as it's subdomain e.g. [http://myapp.damp.dev](http://myapp.damp.dev)) and
what type of site you would like to create (Static, WordPress etc.). DAMP will then create the site, add the relevant information
to your hosts file and attach a volume for your files in your home directory at `{HOME}/damp` (e.g. `{HOME}/damp/myapp`).

Removing a site is as simple as running:

```
damp remove-site
```

and selecting the site to remove. 

## Contribute

So you want to help out? That's awesome. Here is how you can do it:

* [Report a bug](https://github.com/gilbitron/damp/labels/bug)
* [Ask for a feature](https://github.com/gilbitron/damp/labels/enhancement)
* [Submit a pull request](https://github.com/gilbitron/damp/pulls)

If you are submitting a pull request please adhere to the existing coding standards used throughout the code
and only submit **1 feature/fix per pull request**. Pull requests containing multiple changes will be rejected.

## Credits

DAMP was Originally created by [Gilbert Pellegrom](http://gilbert.pellegrom.me) from
[Dev7studios](http://dev7studios.com). Released under the MIT license.

This project is now maintained by [Robert Tirta](https://roberttirtasentana.me)
