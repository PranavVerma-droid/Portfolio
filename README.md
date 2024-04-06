# 🌏 Portfolio 🌏

![image](https://github.com/PranavVerma-droid/Portfolio/assets/73458565/8f1deed6-d801-4ef4-96f6-8bef8fd19153)

https://pranavv.site <br>

All Main Code is in Inside [main](main). <br>
This Code is [Licensed](LICENSE)!


## Docker Deploy 🐋
To run this code via **docker**, pull the repository via:

```bash
git clone https://github.com/PranavVerma-droid/Portfolio.git

cd Portfolio/docker
```


and then run this to deploy via docker:
```bash
docker compose up -d
```
After that, you can access the website via:
 ```
 http://127.0.0.1:8081
 ```

 ### Change Port
 You can change the [.env](docker/.env) file to change the web host port of the website.

 ### Update Portfolio
 Run these commands:
 ```bash
 cd Portfolio

 git pull

 cd docker
 
 docker compose pull && docker compose up -d
 ```

## Manual Deploy 💪
To deploy without Docker, first pull the repository via:
```bash
git clone https://github.com/PranavVerma-droid/Portfolio.git

cd Portfolio
```

After That, Run the following commands to deploy the website:

```bash
npm install
npm start
```

Now, you can access the website via:
 ```
 http://127.0.0.1:8080
 ```


