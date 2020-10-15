apt install docker docker-compose 
systemctl start docker

chmod -R a+rw ./database/import

docker-compose up --build -d database
docker-compose up --build -d frontend
docker-compose up --build -d backend