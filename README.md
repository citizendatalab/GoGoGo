
# GoGoGo

## About
The GOGOGO project was a data sprint that was held from 12 – 26 November 2016 in Amsterdam. The aim was to log customer journeys and how they experience the place they are currently at. The experiment took place on the Knowledge Mile: the area that runs from the Nieuwmarkt to the Amstel train station. The data sprint was organized by the Citizen Data Lab, in collaboration with the Media Information and Communication program of the Amsterdam University of Applied Sciences, Calibro (IT). 300+ students participated to collect over 206 routes, more than 94,000 unique data entries and over 98 hours of logged route data.

The results can be viewed [here](http://calib.ro/gogogo-live/#/home) 

## Code
The code consists of an Cordova app and a server to store the data.
The server consists of an API which communicates with the mobile application and a visualization created in AngularJS to show the collected data. The visualization was created by [Calibro](http://calib.ro/). The original code can be found [here](https://github.com/calibro/gogogo-live). In this repository, the visualization is combined with the API. 


## Deploying server

Install [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

Install [Nodejs](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

Install bower using:

    npm install -g bower

Install Forever package (For running the server)
	
    npm install forever -g


Run the following commands in the project root folder:

    npm install
    bower install



## Building App


Install Cordova on your machine via [https://cordova.apache.org/docs/en/latest/guide/cli/](https://cordova.apache.org/docs/en/latest/guide/cli/)


    cordova platform add android


Generate APK using

    cordova build android 

See for more info about building and deploying via Cordova [the official documentation](https://cordova.apache.org/docs/en/latest/)






