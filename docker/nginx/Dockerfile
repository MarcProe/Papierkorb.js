FROM balenalib/raspberrypi4-64-ubuntu

WORKDIR /usr/src/app

#install prerequisites
RUN apt-get update 
RUN apt-get upgrade -y
RUN apt-get -y install nginx
RUN apt-get clean

RUN ln -sf /dev/stdout /var/log/nginx/access.log 
RUN ln -sf /dev/stderr /var/log/nginx/error.log

COPY papierkorb.conf /etc/nginx/sites-available/default

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
