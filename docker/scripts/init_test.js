process.env.NODE_ENV = "test";

let conf = require("config").get("conf");
let fse = require("fs-extra");
const { exec } = require("child_process");

exec("docker-compose down", (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);

  conf.test.dirs.forEach((dir) => {
    if (dir.startsWith("./")) {
      fse.removeSync(dir);
      fse.ensureDirSync(dir);
    } else {
      throw new Error("Only relative Dir allowed");
    }
  });

  exec("docker-compose up -d papierkorb-nginx", (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
});
