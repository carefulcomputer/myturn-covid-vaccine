# myturn-covid-vaccine
Puppeteer script to find available slots for covid-19 vaccine at myturn.ca.gov

Steps to run (assuming you have nodejs already installed)

- Manually check the availablibility but carefully note down each value you enter/select on each page (case sensitive). You will use them later in editing the script.
  - On first page note down business/industry and county
  - On second page note down zip code you are entering, and the location it shows relevent to you.
-  Clone this repo in a new folder.
-   Run ```npm install``` . That will install all required libraries
-   Edit index.js and scroll to bottom. Find section which has text like this ```['Healthcare Worker', 'San Luis Obispo', '93433', 'Grover Beach, CA 93433, USA'],```. Each row is one elegibility criteria you want to check. You might qualify under multiple critera so you can enter multiple rows. Few examples of multiple critera is you live in one county but work in another. Or you want to check for your spouse from different industry at same time. Make sure to enter them in exact same format
- Remove any rows you are not interested in. Save and exit
- on command line run ```node index.js```
- It will output for each location.

