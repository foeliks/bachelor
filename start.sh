apt install docker docker-compose 
systemctl start docker

chmod -R a+rw ./database/import

docker-compose up --build -d