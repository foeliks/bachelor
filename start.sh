apt install docker docker-compose 
systemctl start docker

chmod -R a+rw ./database/import

cp -R ./game/Build ./frontend/public
cp -R ./game/TemplateData ./frontend/public

cp -R ./game/Build ./frontend/build
cp -R ./game/TemplateData ./frontend/build

chmod -R a+rwx ./frontend/public
chmod -R a+rwx ./frontend/build

docker-compose up --build -d