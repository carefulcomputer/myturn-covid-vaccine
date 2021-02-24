# myturn-covid-vaccine
Puppeteer script to find available slots for covid-19 vaccine at myturn.ca.gov

Steps to run (assuming you have nodejs already installed)

1. Manually check the availablibility but carefully note down exact values you enter/select on each page (case sensitive). You will use them later in editing the script.
  1. On first page note down age group (e.g. '16 - 49'), business/industry(e.g. 'Communications and IT') and county ('San Luis Obispo')
  1. On second page note down zip code you are entering, and the location it shows relevent to you.
1.  Clone this repo in a new folder.
1.   Run ```npm install``` . That will install all required libraries
1.   Edit index.js and scroll to bottom. Find section which has text like this ```['Healthcare Worker', 'San Luis Obispo', '93433', 'Grover Beach, CA 93433, USA'],```. Each row is one elegibility criteria you want to check. You might qualify under multiple critera so you can enter multiple rows. Few examples of multiple critera is you live in one county but work in another. Or you want to check for your spouse from different industry at same time. Make sure to enter them in exact same format
1. Remove any rows you are not interested in. Save and exit
1. on command line run ```node index.js```
1. It will output for each location.

(Apologies for caps) **PLEASE DO NOT ABUSE THIS SCRIPT OTHERWISE YOU AND EVERYONE ELSE WILL BE SHUT DOWN. 
1. DO NOT ENTER MORE THAN 2-3 ROWS
1. DO NOT RUN THIS SCRIPT MORE THAN ONCE IN 6 HOURS. (MYTURN SITE IS UPDATED JUST COUPLE OF TIMES A DAY. SO BY RUNNING FREQUENTLY YOU ARE NOT GETTING MUCH).**

