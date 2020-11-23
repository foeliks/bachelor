apt install docker docker-compose 
systemctl start docker

chmod -R a+rw ./database/import
chmod -R a+rwx ./frontend/game

cp -R ./game/Build ./frontend/public
cp -R ./game/TemplateData ./frontend/TemplateData

docker-compose up --build -d