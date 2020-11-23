apt install docker docker-compose 
systemctl start docker

chmod -R a+rw ./database/import
chmod -R a+rwx ./game

cp -R ./game/Build ./frontend/public
cp -R ./game/TemplateData ./frontend/public

docker-compose up --build -d