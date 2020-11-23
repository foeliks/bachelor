# build
FROM node:latest
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app/
CMD ["npm", "start"]


# RUN npm run build  

# # production
# FROM nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]