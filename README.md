Hier entsteht ein Full-Stack Projekt für eine spielerische JavaScript Lernplattform

Alle Docker Container stoppen
    sudo docker stop $(docker ps -q)

Docker Daemon starten
    sudo systemctl start docker

Benutzer hinzufügen:
INSERT INTO users (email, password) VALUES (
  'johndoe@mail.com',
  crypt('johnspassword', gen_salt('bf'))
);

Clear all docker data
docker kill $(docker ps -q) # stop all containers
docker rm $(docker ps -a -q) # remove all containers 
docker rmi $(docker images -q) # remove all images
docker network prune # remove all networks
docker volume prune # remove all volumes 