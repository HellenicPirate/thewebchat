FROM nginx:alpine

# Copy YOUR static files to nginx html directory
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
#COPY welcome-sound.mp3 /usr/share/nginx/html/welcome-sound.mp3 2>/dev/null || TRUE

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]