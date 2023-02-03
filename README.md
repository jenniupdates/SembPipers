# is483-sembpipers
## Table of Contents
1. [Project Information](#Project-Information)
2. [Proposed Business Value](#Proposed-Business-Value)
3. [Important Information](#Important-Information)
4. [Future Steps](#Future-Steps)
5. [Installation / Set-up manual](#Installation-or-Set-up-manual)
	- [Manual Setup](#Manual-Setup) -- best for debugging
	- [Docker Setup](#Docker-Setup) -- best for easy setup
	- [Kubernetes Setup](#Kubernetes-Setup) -- TBC
6. [Running the Application](#Running-the-Application)
7. [Looking for Support?](#looking-for-support-)

## Project Information
Sembcorp has raised 3 pain points:
1.  The process of creating new pipelines and UI for every new project is **time-consuming**  
2.  Time is wasted having to navigate to different web applications for data entry and validation    
3.  Labelling of the current time-series data is slow, and Data Analysts do not have time to create better supervised ML algorithms

Upon subsequent interviews with Sembcorp, we have identified 3 key issues that led to these pain points:
1.  Non-reusable code is used during projects but discarded post-project 
2.  Hard-coded UI is inflexible and not customizable    
3.  Unlabeled time series data is currently being manually labelled by Data Analysts, which is a rather inefficient and time-consuming process

In order to help Sembcorp to streamline existing processes of setting up project specific pipelines and UI with supervised machine learning capabilities, we intend to provide value in 2 ways:
1.  Create a reusable data entry platform to accommodate data from different sources, with customizable validation rules    
2.  Incorporate an interactive annotation tool to semi-automate the annotation of incoming data

## Proposed Business Value
Through our proposed solution of creating a reusable data entry platform and incorporating an interactive annotation tool we aim to provide business value to Sembcorp in 3 different ways:

1.  Increase process efficiency from Sembcorp’s existing processes by introducing  reusable templates and modules that can continuously be reused across different project domains. This implies that lesser time is required to create new UI and pipelines for new projects, since templates and modules can be reused from past projects with minor tweaks and adjustments.

2.  Refine the existing data entry process in Sembcorp to be more flexible in scope, thus allowing users to easily customise rules to validate entered data. This saves data analysts / other users time that is otherwise wasted on having to navigate to different web applications and pages for data entry and validation.  
      
    
3.  Provide Sembcorp with the ability to semi-automate the annotation of incoming data. This added feature reduces the time spent required for pre-processing unlabeled data, thus allowing more time to be reallocated to tasks of greater importance, such as improving the existing supervised ML algorithms.

## Important Information
- single point database called `sembcorp`
- **you need to have these preinstalled**:
    1. Docker Desktop (to run Grafana or setup via Docker)
    2. MySQL service / WAMP (if you install via Manual Setup)
    3. Postman (for backend testing purposes)
    4. Visual Studio Code (debugging, Manual Setup, etc)
    5. Git (to clone GitHub, optional)
    6. NodeJS (for Manual Setup to start the react frontend
    7. Python (for Manual Setup to start the backend services)

## Future Steps
- Conversion from MySQL to SQL Server
- Further	Code Refactoring 
- Improved Docker fixes for integration and Kubernetes setup
- Deployment

## Installation or Set-up manual
*Please refer to the user guide and report for installation help photos.*
**Your Mode**
- if you want to setup manually, head to section [Manual Setup](#Manual-Setup) -- best for debugging
- if you want to setup via docker, head to section [Docker Setup](#Docker-Setup) -- best for easy setup
- if you want to setup via kubernetes, head to section [Kubernetes Setup](#Kubernetes-Setup)

### Manual Setup
1. **Files Retrieval**: Make sure you are in "main" branch and then clone this repo to retrieve files 
	- via terminal: `git clone https://github.com/jonjonnyjonjon/is483-sembpipers.git` or 
	- choose download zip file option from GitHub or 
	- download the zip file named "is483-sembpipers.zip" in our SMU-Sembcorp Teams channel and extract
2. **Enter the correct directory**: enter the directory you created/downloaded/extracted and make sure you're in `is483-sembpipers` folder
3. **Env variables**: duplicate the .env.example and rename the new file to ".env"
4. **Env variables**: enter the newly created ".env" file and edit the details **according to your own MySQL setup** but do not change the DB_ENDPOINT: e.g `DB_USER="root"`
5. **Start MySQL via WAMP**: Turn on Wamp Server, make sure your MySQL is up and working.
6. **Database Setup and Data Ingestion**: Running SQL files to **insert data into local database**:
    - via Terminal:
        - make sure you're in the directory `is483-sembpipers`
        - go to directory containing the sql files `cd data_demo/sql`
        - start MySQL service locally `mysql -h localhost -u root` (if you have password to enter MySQL pls edit accordingly)
        - run "monolith.sql" to create the database structure `source monolith.sql`
        - run "dummy_data.sql" to insert data into the database sembcorp `source dummy_data.sql`
        - by now you should have all the relevant database and data imported, you can check via `show databases;` and then `use sembcorp;` and then `show tables;`
    - via Workbench:
        - make sure you're in the directory `is483-sembpipers`
        - open 2 scripts from the directory "is483-sembpipers/data_demo/sql"
        - run both scripts: "monolith.sql" first then "dummy_data.sql"
        - by now you should have all the relevant database and data imported, you can check via refreshing your workbench and double clicking the database `sembcorp`
7. After database setup and data import, time to start up the services (do not stop your MySQL or wamp services!) 
8. **Start Up and run App**:
    - Backend:
        - make sure you're in the directory `is483-sembpipers`
        - install all the required libraries `pip install -r requirements.txt`
        - now that you have all libraries, time to start microservices:
            - if you're **Windows**: `./start_microservices.bat`
	            - to kill processes, simply `ctrl + c` the respective flask microservice
		            - note that you can do the above ^ to kill and restart an erroneous service
            - if you're **MacOS**:  `sh` then drag the "start_microservices.sh" file into the sh terminal
                - to kill processes after you're done on MacOS, `kill -9 $(lsof -ti:5001,5002,5003,5004,5005,5006,5007,5010,5011,5020,5021,5022,5031)` in terminal
                - note that you can do the above ^ to kill and restart an erroneous service
        - check to make sure 13 microservices/flask py files are running
        - you should be able to *Postman* into the services through their respective ports e.g `GET http://localhost:5001/getUsers`
    - Frontend:
        - once your backend running, time to start frontend, make sure you're in the directory `is483-sembpipers`
        - install node modules via `npm install`
        - start service `npm run start`
        - you should be able to go to http://localhost:3000 and see the site up
    - Grafana:
        - this is only when you want to see data annotation pages aka need grafana setup --> **you need docker desktop here**
        - start docker desktop/engine and make sure your docker is up and running
        - open the file "docker-compose.yml" in Visual Studio Code, **comment out everything except lines 1-7 and lines 150-159**, this is so that you will only be building and starting up containers for grafana service only
        - run the edited file via `docker-compose up`, this should start the grafana service
        - you should be able to go to http://localhost:5040 to see the grafana dashboard
9. **To run the application**: Head over to section [Running the Application](#Running-the-Application)

### Docker Setup 
*you need docker desktop here!!!* Do note we intend to push out a special branch called "docker-setup" soon, to optimise certain routes and with updated fixes. Once it is pushed out, we will re-edit this readme again.
1. **Files Retrieval**: Make sure you are in "main" branch and then clone this repo to retrieve files
	- via your terminal `git clone https://github.com/jonjonnyjonjon/is483-sembpipers.git` or 
	- choose download zip file option from GitHub or 
	- download the zip file named "is483-sembpipers.zip" in Teams and extract
	- **make sure you edit each microservices' DB endpoints to suit the docker env**
		- `app.config["SQLALCHEMY_DATABASE_URI"] =  f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{MySQL_Docker_Container_Name}:3306/{DB_ENDPOINT}"`
			- DB_User most likely "root"
			- Docker_Container_Name most likely "db"
			- DB_Endpoint is database name "sembcorp"
2. **Enter the correct directory**: enter the directory you created/downloaded/extracted and make sure you're in `is483-sembpipers`
3. **Start Docker**: start docker desktop/engine and make sure your docker is up and running
4. **Docker Compose**: 
	- the current docker-compose.yml file is for local setup, please use the docker-compose.example.yml file
	- rename the "docker-compose.yml" file to "docker-compose-local.yml"
	- rename the "docker-compose.example.yml" file to "docker-compose.yml" 
	- docker compose everything, it helps to automatically start your frontend and backend services for you via `docker-compose up`
5. it would automatically build the images and spin up containers for you, wait till you see all the containers under "is483-sembcorp" green and running on your docker desktop dashboard
6. you should be able to go to http://localhost:3000 and see the site up and http://localhost:5040 to view the grafana service
7. **Database Setup and Data Ingestion**: currently manual.
    - Your data files are located at directory `data_demo/sql`
    - once the containers up and running, `docker ps` in your terminal and get the id of the mysql container (your database location)
    - Enter the container env via `docker exec -it <mysql_container_id> /bin/bash` 
    - Enter MySQL server via `mysql -h localhost -u root`
    - Copy (ctrl/cmd a + ctrl/cmd c) the "monolith.sql" to insert database structure and then do the same for `dummy_data.sql` to insert data (rn these files are not inside the container yet so you cant `source file.sql` and you need to manually copy paste (i will try fix this soon)
    - by now you should have all the relevant database and data imported, you can check via refreshing your workbench and double clicking the database `sembcorp` 
8. **To run the application**: Head over to section [Running the Application](#Running-the-Application)
   
### Kubernetes Setup 
<!-- *(you need docker desktop here!!!)* -->
> To be continued...
<!-- > to kill restart-always pods: `Kubectl delete pods` -->
<!-- 1. take note that kubernetes setup may not be as accurate, please contact me directly for this
2. run kubernetes yml files to build images and start pods deployment via `kubectl apply -f kubernetes`
3. it helps to deploy your frontend and backend services, wait till you see all the k8 pods green and running
4. you should be able to go to http://localhost:3000 and see the site up -->

## Running the Application
1. once you have setup the app via manual/Docker/Kubernetes, you should be at the http://localhost:3000, a **Login page**
<!-- 2. right now we only cater to backend manual import user so:
    - if you want to create an engineer account:
        - go to Postman and `POST http://localhost:5001/createUser`and select Body>raw>JSON and type in `{ "email": "<your email>", "password": "<your password>", "role": "engineer" }`
    - if you want to create an Admin account:
        - go to Postman and `POST http://localhost:5001/createUser`and select Body>raw>JSON and type in `{ "email": "<your email>", "password": "<your password>", "role": "admin" }`
    - refresh the site and key in the details you entered ^, you should be able to log in and access the site now -->
    
## Looking for Support ?
10. Email yinshan.lim.2019@smu.edu.sg or DM us on Teams if you need further help!
