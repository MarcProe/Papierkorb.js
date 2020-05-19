sudo docker-compose down
sudo rm mnt/papierkorb.js/* -rf
sudo rm data/* -rf
sudo docker-compose up -d papierkorb-nginx
