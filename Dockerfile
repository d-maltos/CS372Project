# While in CS372Project directory:
# docker build -t site-docker .
# docker run -p 8080:8080 site-docker

FROM node:20.11.0

# Set the working directory
WORKDIR /app

# Copy the contents of the 372site directory into the container
COPY ./372site /app/372site

# Copy the contents of the public directory into the container
COPY ./372site/public /app/public

# Install dependencies
COPY ./372site/package*.json /app/
RUN npm install

# Expose port 8080
EXPOSE 8080

# Command to run the server
CMD ["node", "372site/server.js"]
