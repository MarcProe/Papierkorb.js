<img src="https://github.com/MarcProe/Papierkorb.js/blob/master/public/images/papierkorb-logo.png?raw=true" height="200" align="right">

# Papierkorb.js

[![Coverage Status](https://david-dm.org/marcproe/papierkorb.js.svg)](https://david-dm.org/marcproe/papierkorb.js)

This is a personal development repository.

Papierkorb is a web application used to manage private documents.

Papierkorb uses [Node.js](https://github.com/nodejs/node), [Pug](https://github.com/pugjs/pug), [MaterializeCSS](https://github.com/Dogfalo/materialize) and [MongoDB](https://github.com/mongodb/mongo).

Papierkorb runs on a Raspberry Pi 3 in Docker. It uses [arm32v7/node](https://hub.docker.com/r/arm32v7/node/) and [sumglobal/rpi-mongodb](https://hub.docker.com/r/sumglobal/rpi-mongodb/)

## Prepare Raspberry


### Install Raspbian

Do it.

### Install Docker


(Based on https://sebastianbrosch.blog/2017/docker-auf-einem-raspberry-pi-3-installieren/)

`sudo apt-get update`

`sudo apt-get install -y --no-install-recommends apt-transport-https ca-certificates curl software-properties-common`

`sudo curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -`

`sudo apt-key fingerprint 9DC858229FC7DD38854AE2D88D81803C0EBFCD88`

`sudo nano /etc/apt/sources.list`

Add line `deb https://download.docker.com/linux/debian stretch stable`

`sudo apt-get update`

`sudo apt-get -y install docker-ce docker-compose`

`sudo service docker start`

### Build docker images and start

`docker-compose up -d --build`

### Access the app

<raspberry>:3000
