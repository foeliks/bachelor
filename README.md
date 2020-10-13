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