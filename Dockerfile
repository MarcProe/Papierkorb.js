FROM arm32v7/node

WORKDIR /usr/src/app

#install prerequisites
RUN apt-get update && apt-get -y install ghostscript pdftk poppler-utils && apt-get clean

#build tesseract 4
RUN apt-get -y install automake g++ libtool pkg-config autoconf-archive

RUN git clone https://github.com/DanBloomberg/leptonica.git leptonica
RUN cd leptonica && ./autobuild && ./configure && make && make install && ldconfig
RUN git clone https://github.com/tesseract-ocr/tesseract.git tesseract-ocr
RUN cd tesseract-ocr && ./autogen.sh && ./configure && make && make install && ldconfig

ENV TESSDATA_PREFIX /usr/local/share/tesseract-ocr/tessdata/

RUN tesseract -v
RUN which tesseract

RUN wget -P $TESSDATA_PREFIX https://raw.githubusercontent.com/tesseract-ocr/tessdata/master/eng.traineddata
RUN wget -P $TESSDATA_PREFIX https://raw.githubusercontent.com/tesseract-ocr/tessdata/master/deu.traineddata
RUN wget -P $TESSDATA_PREFIX https://raw.githubusercontent.com/tesseract-ocr/tessdata/master/nld.traineddata

COPY package*.json ./

RUN npm install

COPY . .

#patch pdf-extract
RUN cp share/ocr.js node_modules/pdf-extract/lib/

VOLUME ["/opt/papierkorb"]

EXPOSE 3000

CMD [ "node", "bin/www" ]