FROM balenalib/raspberrypi4-64-ubuntu-node

WORKDIR /usr/src/app

#install prerequisites
RUN apt-get update 
RUN apt-get -y install ghostscript python3 build-essential
RUN apt-get clean

RUN node -v
RUN npm -v

COPY package*.json ./

RUN npm install

RUN  apt-get remove --purge --auto-remove -y python3 build-essential

COPY . .

VOLUME ["/opt/papierkorb"]

EXPOSE 3000

CMD [ "node", "bin/www" ]