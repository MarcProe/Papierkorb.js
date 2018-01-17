FROM arm32v7/node

WORKDIR /usr/src/app

#install prerequisites
RUN apt-get update && apt-get -y install ghostscript pdftk poppler-utils tesseract-ocr tesseract-ocr-eng tesseract-ocr-deu tesseract-ocr-nld && apt-get clean

#todo: download current tesseract trained data

COPY package*.json ./

RUN npm install

COPY . .

#patch pdf-extract
RUN cp share/ocr.js node_modules/pdf-extract/lib/

#add testdata
RUN mkdir -p /opt/papierkorb/docs/new/
RUN cp share/Test.pdf /opt/papierkorb/docs/new/

EXPOSE 3000

CMD [ "node", "bin/www" ]