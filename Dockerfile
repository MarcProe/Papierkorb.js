FROM arm32v7/node

WORKDIR /usr/src/app

#install prerequisites
RUN apt-get update && apt-get -y install ghostscript && apt-get clean

COPY package*.json ./

RUN npm install

COPY . .

VOLUME ["/opt/papierkorb"]

EXPOSE 3000

CMD [ "node", "bin/www" ]