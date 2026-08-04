FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY certs/localhost.crt /etc/nginx/certs/localhost.crt
COPY certs/localhost.key /etc/nginx/certs/localhost.key


EXPOSE 443
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]